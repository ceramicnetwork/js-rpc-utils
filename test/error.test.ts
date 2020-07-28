import {
  ERROR_MESSAGE,
  RPCError,
  createInternalError,
  createInvalidParams,
  createInvalidRequest,
  createMethodNotFound,
  createParseError,
  isServerError,
  getErrorMessage
} from '../src'

describe('error', () => {
  test('sets the code, message and data', () => {
    const err = new RPCError(1000, 'test', 'error')
    expect(err instanceof Error).toBe(true)
    expect(err.code).toBe(1000)
    expect(err.message).toBe('test')
    expect(err.data).toBe('error')
  })

  test('creates an instance using the static fromObject function', () => {
    const err = RPCError.fromObject({ code: 1000, data: 0 })
    expect(err).toBeInstanceOf(RPCError)
    expect(err.code).toBe(1000)
    expect(err.message).toBe('Application error')
    expect(err.data).toBe(0)
  })

  test('isServerError() returns whether the code matches a server error or not', () => {
    expect(isServerError(0)).toBe(false)
    expect(isServerError(-32000)).toBe(true)
    expect(isServerError(-32034)).toBe(true)
    expect(isServerError(-32099)).toBe(true)
    expect(isServerError(-33000)).toBe(false)
  })

  test('getErrorMessage() returns the error message for the provided code', () => {
    Object.keys(ERROR_MESSAGE).forEach(code => {
      expect(getErrorMessage(parseInt(code, 10))).toBe(ERROR_MESSAGE[code])
    })
    expect(getErrorMessage(-32067)).toBe('Server error')
    expect(getErrorMessage(-30000)).toBe('Application error')
  })

  test('provides factory function for protocol errors', () => {
    expect(createParseError().code).toBe(-32700)
    expect(createInvalidRequest().code).toBe(-32600)
    expect(createMethodNotFound().code).toBe(-32601)
    expect(createInvalidParams().code).toBe(-32602)
    expect(createInternalError().code).toBe(-32603)
  })
})
