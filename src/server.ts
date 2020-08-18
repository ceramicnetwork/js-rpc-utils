import { ERROR_CODE, RPCError, createParseError, getErrorMessage } from './error'
import { RPCRequest, RPCResponse } from './types'

export type ErrorHandler<C = any> = <P = any>(ctx: C, req: RPCRequest<P>, error: Error) => void

export type MethodHandler<C = any, P = any, R = any> = (ctx: C, params: P) => R | Promise<R>

export type NotificationHandler<C = any> = <P = any>(ctx: C, req: RPCRequest<P>) => void

export type HandlerMethods<C = any> = Record<string, MethodHandler<C>>

export interface HandlerOptions<C = any> {
  onHandlerError?: ErrorHandler<C>
  onInvalidMessage?: NotificationHandler<C>
  onNotification?: NotificationHandler<C>
}

export type RequestHandler<C = any> = <P = any, R = any, E = any>(
  ctx: C,
  msg: RPCRequest<P>
) => Promise<RPCResponse<R, E> | null>

export function parseJSON<T = any>(input: string): T {
  try {
    return JSON.parse(input)
  } catch (err) {
    throw createParseError()
  }
}

export function createErrorResponse<R, E>(id: number | string, code: number): RPCResponse<R, E> {
  return {
    jsonrpc: '2.0',
    id,
    error: { code, message: getErrorMessage(code) }
  }
}

function fallbackOnHandlerError<C = any, P = any>(_ctx: C, msg: RPCRequest<P>, error: Error): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled handler error', msg, error)
}

function fallbackOnInvalidMessage<C = any, P = any>(_ctx: C, msg: RPCRequest<P>): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled invalid message', msg)
}

function fallbackOnNotification<C = any, P = any>(_ctx: C, msg: RPCRequest<P>): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled notification', msg)
}

export function createHandler<C = any>(
  methods: HandlerMethods<C>,
  options: HandlerOptions<C> = {}
): RequestHandler<C> {
  const onHandlerError = options.onHandlerError ?? fallbackOnHandlerError
  const onInvalidMessage = options.onInvalidMessage ?? fallbackOnInvalidMessage
  const onNotification = options.onNotification ?? fallbackOnNotification

  return async function handleRequest<P = any, R = any, E = any>(
    ctx: C,
    msg: RPCRequest<P>
  ): Promise<RPCResponse<R, E> | null> {
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
      const handled = handler(ctx, msg.params ?? {})
      const result = typeof handled.then === 'function' ? await handled : handled
      return { jsonrpc: '2.0', id, result }
    } catch (err) {
      let error
      if (err instanceof RPCError) {
        error = err.toObject()
      } else {
        onHandlerError(ctx, msg, err)
        const code = err.code ?? -32000 // Server error
        error = { code, message: err.message || getErrorMessage(code) }
      }
      return { jsonrpc: '2.0', id, error }
    }
  }
}
