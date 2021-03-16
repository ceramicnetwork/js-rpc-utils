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

export type MethodHandler<
  Context,
  Params = undefined,
  Result = undefined
> = Params extends undefined
  ? (ctx: Context, params?: undefined) => Result | Promise<Result>
  : (ctx: Context, params: Params) => Result | Promise<Result>

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
    if (id == null) {
      onNotification(ctx, msg)
      return null
    }
    const handler = methods[msg.method]
    if (handler == null) {
      return createErrorResponse(id, ERROR_CODE.METHOD_NOT_FOUND)
    }
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore params can be undefined
      const handled = handler(ctx, msg.params)
      const result =
        handled == null
          ? handled
          : typeof (handled as Promise<Methods[K]['result']>).then === 'function'
          ? await handled
          : handled
      return { jsonrpc: '2.0', id, result } as RPCResultResponse<Methods[K]['result']>
    } catch (err) {
      let error
      if (err instanceof RPCError) {
        error = err.toObject()
      } else {
        onHandlerError(ctx, msg, err)
        const code = (err as { code?: number }).code ?? -32000 // Server error
        error = { code, message: (err as { message?: string }).message || getErrorMessage(code) }
      }
      return { jsonrpc: '2.0', id, error } as RPCErrorResponse<Methods[K]['error']>
    }
  }
}
