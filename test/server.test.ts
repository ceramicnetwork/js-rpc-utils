/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  ERROR_CODE,
  ERROR_MESSAGE,
  RPCError,
  createErrorResponse,
  createHandler,
  parseJSON,
} from '../src'

describe('server', () => {
  test('parseJSON() returns the parsed object', () => {
    expect(parseJSON('{"ok":true}')).toEqual({ ok: true })
  })

  test('parseJSON() throws a parse error RPCError if parsing fails', () => {
    let error: RPCError
    try {
      parseJSON('{"ok":false')
    } catch (err) {
      error = err as RPCError
    }
    const code = ERROR_CODE.PARSE_ERROR
    expect(error instanceof RPCError).toBe(true)
    expect(error.code).toBe(code)
    expect(error.message).toBe(ERROR_MESSAGE[code])
  })

  test('createErrorResponse() returns a RPCResponse object with the error message', () => {
    const code = ERROR_CODE.INVALID_PARAMS
    expect(createErrorResponse('test', code)).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      error: {
        code,
        message: ERROR_MESSAGE[code],
      },
    })
  })

  test('createHandler() handles invalid "jsonrpc" key', async () => {
    const code = ERROR_CODE.INVALID_REQUEST
    const onInvalidMessage = jest.fn()
    const handle = createHandler({}, { onInvalidMessage })

    // @ts-expect-error missing jsonrpc
    const res1 = await handle({ ctx: true }, { method: 'test' })
    expect(res1).toBeNull()

    // @ts-expect-error invalid jsonrpc
    const res2 = await handle({}, { jsonrpc: '2', id: 'test', method: 'test' })
    expect(res2).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      error: { code, message: ERROR_MESSAGE[code] },
    })

    expect(onInvalidMessage).toHaveBeenCalledTimes(1)
    expect(onInvalidMessage).toHaveBeenCalledWith({ ctx: true }, { method: 'test' })
  })

  test('createHandler() handles invalid "method" key', async () => {
    const code = ERROR_CODE.INVALID_REQUEST
    const onInvalidMessage = jest.fn()
    const handle = createHandler({}, { onInvalidMessage })

    // @ts-expect-error missing method
    const res1 = await handle({ ctx: true }, { jsonrpc: '2.0' })
    expect(res1).toBeNull()

    // @ts-expect-error missing method
    const res2 = await handle({}, { jsonrpc: '2.0', id: 'test' })
    expect(res2).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      error: { code, message: ERROR_MESSAGE[code] },
    })

    expect(onInvalidMessage).toHaveBeenCalledTimes(1)
    expect(onInvalidMessage).toHaveBeenCalledWith({ ctx: true }, { jsonrpc: '2.0' })
  })

  test('createHandler() supports notifications handlers', async () => {
    const onNotification = jest.fn()
    const test = jest.fn()
    const handle = createHandler({ test }, { onNotification })
    const res = await handle(
      { ctx: true },
      {
        jsonrpc: '2.0',
        method: 'test',
        params: { foo: 'bar' },
      }
    )
    expect(res).toBeNull()
    expect(test).toHaveBeenCalledTimes(1)
    expect(test).toHaveBeenCalledWith({ ctx: true }, { foo: 'bar' })
    expect(onNotification).not.toHaveBeenCalled()
  })

  test('createHandler() uses onNotification() when no handler is present', async () => {
    const onNotification = jest.fn()
    const handle = createHandler({}, { onNotification })
    const res = await handle({ ctx: true }, { jsonrpc: '2.0', method: 'test' } as any)
    expect(res).toBeNull()
    expect(onNotification).toHaveBeenCalledTimes(1)
    expect(onNotification).toHaveBeenCalledWith(
      { ctx: true },
      {
        jsonrpc: '2.0',
        method: 'test',
      }
    )
  })

  test('createHandler() uses onHandlerError() when a notification handler throws', async () => {
    const onHandlerError = jest.fn()
    const test = jest.fn(() => {
      throw new Error('Test error')
    })
    const handle = createHandler({ test }, { onHandlerError })
    const res = await handle({ ctx: true }, { jsonrpc: '2.0', method: 'test' } as any)
    expect(res).toBeNull()
    expect(onHandlerError).toHaveBeenCalledTimes(1)
    expect(onHandlerError).toHaveBeenCalledWith(
      { ctx: true },
      {
        jsonrpc: '2.0',
        method: 'test',
      },
      expect.any(Error)
    )
  })

  test('createHandler() handles not found methods', async () => {
    const code = ERROR_CODE.METHOD_NOT_FOUND
    const handle = createHandler({})
    const res = await handle({ ctx: true }, {
      jsonrpc: '2.0',
      id: 'test',
      method: 'test',
    } as any)
    expect(res).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      error: { code, message: ERROR_MESSAGE[code] },
    })
  })

  test('createHandler() handles successful handler return', async () => {
    const handle = createHandler<any, any>({
      testAsync: jest.fn((ctx, { name }: { name: string }) => Promise.resolve(`hello ${name}`)),
      testSync: jest.fn((ctx, { name }: { name: string }) => `hello ${name}`),
      testEmpty: jest.fn(() => {
        // don't return anything
      }),
    })

    const resAsync = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'test', method: 'testAsync', params: { name: 'alice' } }
    )
    expect(resAsync).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      result: 'hello alice',
    })

    const resSync = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'test', method: 'testSync', params: { name: 'bob' } }
    )
    expect(resSync).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      result: 'hello bob',
    })

    const resEmpty = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'test', method: 'testEmpty', params: { name: 'bob' } }
    )
    expect(resEmpty).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      result: undefined,
    })
  })

  test('createHandler() handles errors from method handlers', async () => {
    const onHandlerError = jest.fn()
    const handle = createHandler(
      {
        rpcError: () => {
          throw new RPCError(1000, 'Custom error message')
        },
        jsErrorNoCode: () => {
          throw new Error('Error message')
        },
        jsErrorWithCode: () => {
          const err = new Error('Error message')
          // @ts-ignore
          err.code = 1000
          throw err
        },
        jsErrorNoMessage: () => {
          throw new Error()
        },
      },
      { onHandlerError }
    )

    const rpcErrorRes = await handle({ ctx: true }, {
      jsonrpc: '2.0',
      id: 'rpc',
      method: 'rpcError',
    } as any)
    expect(rpcErrorRes).toEqual({
      jsonrpc: '2.0',
      id: 'rpc',
      error: {
        code: 1000,
        message: 'Custom error message',
      },
    })

    // Throwing RPCError should not trigger onHandlerError
    expect(onHandlerError).not.toHaveBeenCalled()

    const jsNoCodeErrorRes = await handle({ ctx: true }, {
      jsonrpc: '2.0',
      id: 'js_no_code',
      method: 'jsErrorNoCode',
    } as any)
    expect(jsNoCodeErrorRes).toEqual({
      jsonrpc: '2.0',
      id: 'js_no_code',
      error: {
        code: -32000,
        message: 'Error message',
      },
    })

    const jsWithCodeErrorRes = await handle({ ctx: true }, {
      jsonrpc: '2.0',
      id: 'js_with_code',
      method: 'jsErrorWithCode',
    } as any)
    expect(jsWithCodeErrorRes).toEqual({
      jsonrpc: '2.0',
      id: 'js_with_code',
      error: {
        code: 1000,
        message: 'Error message',
      },
    })

    const jsNoMessageErrorRes = await handle({ ctx: true }, {
      jsonrpc: '2.0',
      id: 'js_no_message',
      method: 'jsErrorNoMessage',
    } as any)
    expect(jsNoMessageErrorRes).toEqual({
      jsonrpc: '2.0',
      id: 'js_no_message',
      error: {
        code: -32000,
        message: 'Server error',
      },
    })

    expect(onHandlerError).toHaveBeenCalledTimes(3)
  })
})
