import {
  ERROR_CODE,
  RPCError,
  createParseError,
  getErrorMessage,
} from './error'
import { RPCRequest, RPCResponse } from './types'

export type ErrorHandler = <C = any, P = any>(
  ctx: C,
  req: RPCRequest<P>,
  error: Error,
) => void

export type MethodHandler = <C = any, P = any, R = any>(
  ctx: C,
  params: P,
) => R | Promise<R>

export type NotificationHandler = <C = any, P = any>(
  ctx: C,
  req: RPCRequest<P>,
) => void

export type HandlerMethods = Record<string, MethodHandler>

export interface HandlerOptions {
  onHandlerError?: ErrorHandler
  onInvalidMessage?: NotificationHandler
  onNotification?: NotificationHandler
}

export type RequestHandler = <C = any, P = any, R = any, E = any>(
  ctx: C,
  msg: RPCRequest<P>,
) => Promise<RPCResponse<R, E> | null>

export function parseJSON<T = any>(input: string): T {
  try {
    return JSON.parse(input)
  } catch (err) {
    throw createParseError()
  }
}

export function createErrorResponse<R, E>(
  id: number | string,
  code: number,
): RPCResponse<R, E> {
  return {
    jsonrpc: '2.0',
    id,
    error: { code, message: getErrorMessage(code) },
  }
}

function fallbackOnHandlerError<C = any, P = any>(
  _ctx: C,
  msg: RPCRequest<P>,
  error: Error,
): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled handler error', msg, error)
}

function fallbackOnInvalidMessage<C = any, P = any>(
  _ctx: C,
  msg: RPCRequest<P>,
): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled invalid message', msg)
}

function fallbackOnNotification<C = any, P = any>(
  _ctx: C,
  msg: RPCRequest<P>,
): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled notification', msg)
}

export function createHandler(
  methods: HandlerMethods,
  options: HandlerOptions = {},
): RequestHandler {
  const onHandlerError = options.onHandlerError ?? fallbackOnHandlerError
  const onInvalidMessage = options.onInvalidMessage ?? fallbackOnInvalidMessage
  const onNotification = options.onNotification ?? fallbackOnNotification

  return async function handleRequest<C = any, P = any, R = any, E = any>(
    ctx: C,
    msg: RPCRequest<P>,
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
      const result = await handler(ctx, msg.params ?? {})
      return { jsonrpc: '2.0', id, result }
    } catch (err) {
      onHandlerError(ctx, msg, err)
      let error
      if (err instanceof RPCError) {
        error = err.toObject()
      } else {
        const code = err.code ?? -32000 // Server error
        error = { code, message: err.message || getErrorMessage(code) }
      }
      return { jsonrpc: '2.0', id, error }
    }
  }
}
