import { abortableHandlerSymbol } from './abortable'
import { ABORT_REQUEST_METHOD } from './constants'
import { ERROR_CODE, RPCError, createParseError, getErrorMessage } from './error'
import type {
  RPCErrorResponse,
  RPCMethods,
  RPCRequest,
  RPCResponse,
  RPCResultResponse,
} from './types'

export type ErrorHandler<Context, Methods extends RPCMethods> = <K extends keyof Methods>(
  ctx: Context,
  req: RPCRequest<Methods, K>,
  error: Error
) => void

export type MethodHandlerOptions = { signal?: AbortSignal }

export type MethodHandler<Context, Params = undefined, Result = undefined> = ((
  ctx: Context,
  params: Params,
  options: MethodHandlerOptions
) => Result | Promise<Result>) & {
  [abortableHandlerSymbol]?: boolean
}

export function abortableHandler<Handler extends MethodHandler<any>>(handler: Handler): Handler {
  handler[abortableHandlerSymbol] = true
  return handler
}

export type NotificationHandler<Context, Methods extends RPCMethods> = <K extends keyof Methods>(
  ctx: Context,
  req: RPCRequest<Methods, K>
) => void

export type HandlerMethods<Context, Methods extends RPCMethods> = {
  [K in keyof Methods]: MethodHandler<Context, Methods[K]['params'], Methods[K]['result']>
}

export type HandlerOptions<Context, Methods extends RPCMethods> = {
  onHandlerError?: ErrorHandler<Context, Methods>
  onInvalidMessage?: NotificationHandler<Context, Methods>
  onNotification?: NotificationHandler<Context, Methods>
}

export function parseJSON<T = any>(input: string): T {
  try {
    return JSON.parse(input) as T
  } catch (err) {
    throw createParseError()
  }
}

export function createErrorResponse(id: number | string, code: number): RPCErrorResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: { code, message: getErrorMessage(code) },
  }
}

function fallbackOnHandlerError<Context, Methods extends RPCMethods, K extends keyof Methods>(
  _ctx: Context,
  msg: RPCRequest<Methods, K>,
  error: Error
): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled handler error', msg, error)
}

function fallbackOnInvalidMessage<Context, Methods extends RPCMethods, K extends keyof Methods>(
  _ctx: Context,
  msg: RPCRequest<Methods, K>
): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled invalid message', msg)
}

function fallbackOnNotification<Context, Methods extends RPCMethods, K extends keyof Methods>(
  _ctx: Context,
  msg: RPCRequest<Methods, K>
): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled notification', msg)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createHandler<Context, Methods extends RPCMethods>(
  methods: HandlerMethods<Context, Methods>,
  options: HandlerOptions<Context, Methods> = {}
) {
  const onHandlerError = options.onHandlerError ?? fallbackOnHandlerError
  const onInvalidMessage = options.onInvalidMessage ?? fallbackOnInvalidMessage
  const onNotification = options.onNotification ?? fallbackOnNotification

  const inflight: Record<string | number, AbortController> = {}

  function handleNotification(ctx: Context, msg: RPCRequest<Methods, keyof Methods>) {
    // If this is an abort notification, check if inflight and keep track of it
    // Also propagate the abortion to the handler if supported
    if (msg.method === ABORT_REQUEST_METHOD) {
      const requestID = (msg.params as { id: string | number } | void)?.id
      if (requestID != null) {
        inflight[requestID]?.abort()
      }
    } else {
      onNotification(ctx, msg)
    }
  }

  return async function handleRequest<K extends keyof Methods>(
    ctx: Context,
    msg: RPCRequest<Methods, K>
  ): Promise<RPCResponse<Methods, K> | null> {
    const id = msg.id

    if (msg.jsonrpc !== '2.0' || msg.method == null) {
      if (id == null) {
        onInvalidMessage(ctx, msg)
        return null
      }
      return createErrorResponse(id, ERROR_CODE.INVALID_REQUEST)
    }

    const handler = methods[msg.method]
    if (handler == null) {
      if (id == null) {
        handleNotification(ctx, msg)
        return null
      }
      return createErrorResponse(id, ERROR_CODE.METHOD_NOT_FOUND)
    }

    try {
      let handled: Methods[K]['result'] | Promise<Methods[K]['result']>
      if (id != null && handler[abortableHandlerSymbol]) {
        const controller = new AbortController()
        inflight[id] = controller
        handled = handler(ctx, msg.params, { signal: controller.signal })
      } else {
        handled = handler(ctx, msg.params, {})
      }

      const result =
        handled == null // Perform null check before checking existence of .then() method
          ? handled
          : typeof (handled as Promise<Methods[K]['result']>).then === 'function'
          ? await handled
          : handled

      return id == null || inflight[id]?.signal.aborted // Don't send response if aborted
        ? null
        : ({ jsonrpc: '2.0', id, result } as RPCResultResponse<Methods[K]['result']>)
    } catch (err) {
      // Don't send response if aborted
      if (id == null || inflight[id]?.signal.aborted) {
        onHandlerError(ctx, msg, err as Error)
        return null
      }

      let error
      if (err instanceof RPCError) {
        error = err.toObject()
      } else {
        onHandlerError(ctx, msg, err as Error)
        const code = (err as { code?: number }).code ?? -32000 // Server error
        error = { code, message: (err as { message?: string }).message || getErrorMessage(code) }
      }
      return { jsonrpc: '2.0', id, error } as RPCErrorResponse<Methods[K]['error']>
    } finally {
      if (id != null) {
        delete inflight[id]
      }
    }
  }
}
