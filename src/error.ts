import type { RPCErrorObject } from './types'

export enum ERROR_CODE {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}

export const ERROR_MESSAGE: Record<string, string> = {
  [ERROR_CODE.PARSE_ERROR]: 'Parse error',
  [ERROR_CODE.INVALID_REQUEST]: 'Invalid request',
  [ERROR_CODE.METHOD_NOT_FOUND]: 'Method not found',
  [ERROR_CODE.INVALID_PARAMS]: 'Invalid params',
  [ERROR_CODE.INTERNAL_ERROR]: 'Internal error',
}

export function isServerError(code: number): boolean {
  return -32000 >= code && code >= -32099
}

export function getErrorMessage(code: number): string {
  return (
    ERROR_MESSAGE[code.toString()] ?? (isServerError(code) ? 'Server error' : 'Application error')
  )
}

export class RPCError<T = undefined> extends Error {
  static fromObject<D = any>(err: RPCErrorObject<D>): RPCError<D> {
    return new RPCError<D>(err.code, err.message, err.data)
  }

  code: number
  data: T | undefined
  message: string

  constructor(code: number, message?: string, data?: T) {
    super()
    Object.setPrototypeOf(this, RPCError.prototype)

    this.code = code
    this.data = data
    this.message = message ?? getErrorMessage(code)
  }

  toObject<U = T>(): RPCErrorObject<U | undefined> {
    return {
      code: this.code,
      data: this.data,
      message: this.message,
    } as RPCErrorObject<U | undefined>
  }
}

function createErrorFactory(code: ERROR_CODE): <T>(data?: T) => RPCError<T> {
  const message = ERROR_MESSAGE[code]
  return function createError<T = any>(data?: T): RPCError<T> {
    return new RPCError<T>(code, message, data)
  }
}

export const createParseError = createErrorFactory(ERROR_CODE.PARSE_ERROR)
export const createInvalidRequest = createErrorFactory(ERROR_CODE.INVALID_REQUEST)
export const createMethodNotFound = createErrorFactory(ERROR_CODE.METHOD_NOT_FOUND)
export const createInvalidParams = createErrorFactory(ERROR_CODE.INVALID_PARAMS)
export const createInternalError = createErrorFactory(ERROR_CODE.INTERNAL_ERROR)
