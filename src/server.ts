import { ERROR_CODE, RPCError, createParseError, getErrorMessage } from './error'
import { RPCErrorResponse, RPCParams, RPCRequest, RPCResponse } from './types'

export type ErrorHandler<C = unknown, M = string> = <P extends RPCParams | undefined>(
  ctx: C,
  req: RPCRequest<M, P>,
  error: Error
) => void

export type MethodHandler<C = unknown, P extends RPCParams | undefined = undefined, R = unknown> = (
  ctx: C,
  params?: P
) => R | Promise<R>

export type NotificationHandler<C = unknown, M = string> = <P extends RPCParams | undefined>(
  ctx: C,
  req: RPCRequest<M, P>
) => void

export type HandlerMethods<C = unknown> = Record<string, MethodHandler<C>>

export interface HandlerOptions<C = any> {
  onHandlerError?: ErrorHandler<C>
  onInvalidMessage?: NotificationHandler<C>
  onNotification?: NotificationHandler<C>
}

export type RequestHandler<C = any, M = string> = <P extends RPCParams | undefined, R, E>(
  ctx: C,
  msg: RPCRequest<M, P | undefined>
) => Promise<RPCResponse<R, E | undefined> | null>

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
    error: { code, message: getErrorMessage(code) }
  }
}

function fallbackOnHandlerError<
  C = unknown,
  M = string,
  P extends RPCParams | undefined = undefined
>(_ctx: C, msg: RPCRequest<M, P>, error: Error): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled handler error', msg, error)
}

function fallbackOnInvalidMessage<
  C = unknown,
  M = string,
  P extends RPCParams | undefined = undefined
>(_ctx: C, msg: RPCRequest<M, P>): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled invalid message', msg)
}

function fallbackOnNotification<
  C = unknown,
  M = string,
  P extends RPCParams | undefined = undefined
>(_ctx: C, msg: RPCRequest<M, P>): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled notification', msg)
}

export function createHandler<C = unknown>(
  methods: HandlerMethods<C>,
  options: HandlerOptions<C> = {}
): RequestHandler<C, keyof typeof methods> {
  const onHandlerError = options.onHandlerError ?? fallbackOnHandlerError
  const onInvalidMessage = options.onInvalidMessage ?? fallbackOnInvalidMessage
  const onNotification = options.onNotification ?? fallbackOnNotification

  return async function handleRequest<P extends RPCParams | undefined, R, E>(
    ctx: C,
    msg: RPCRequest<keyof typeof methods, P>
  ): Promise<RPCResponse<R, E | undefined> | null> {
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
      const handled = handler(ctx, msg.params) as R | Promise<R>
      const result = typeof (handled as Promise<R>).then === 'function' ? await handled : handled
      return { jsonrpc: '2.0', id, result } as RPCResponse<R>
    } catch (err) {
      let error
      if (err instanceof RPCError) {
        error = err.toObject<E>()
      } else {
        onHandlerError(ctx, msg, err)
        const code = (err as { code?: number }).code ?? -32000 // Server error
        error = { code, message: (err as { message?: string }).message || getErrorMessage(code) }
      }
      return { jsonrpc: '2.0', id, error }
    }
  }
}
