/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as polyfill from 'abort-controller'

if (!globalThis.AbortController) {
  globalThis.AbortController = polyfill.AbortController
}
if (!globalThis.AbortSignal) {
  globalThis.AbortSignal = polyfill.AbortSignal
}

import { ABORT_REQUEST_METHOD, RPCClient, RPCError, abortedReasonSymbol } from '../src'
import type { SendRequestFunc } from '../src'

describe('client', () => {
  test('exposes the connection getter', () => {
    const connection = { send: jest.fn() }
    const client = new RPCClient(connection)
    expect(client.connection).toBe(connection)
  })

  test('has a createID() method generating a random string', () => {
    const client = new RPCClient({ send: jest.fn() })
    const id1 = client.createID()
    const id2 = client.createID()
    expect(typeof id1).toBe('string')
    expect(id1).not.toBe(id2)
  })

  test('calls the send() function with the required parameters, client.request', async () => {
    const send = jest.fn(() => {
      return Promise.resolve({
        jsonrpc: '2.0',
        id: 'test',
        result: 'OK',
      })
    }) as SendRequestFunc<any>
    const client = new RPCClient({ send })
    const res = await client.request('test_method', ['hello'])
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({
      id: expect.any(String),
      jsonrpc: '2.0',
      method: 'test_method',
      params: ['hello'],
    })
    expect(res).toBe('OK')
  })

  test('calls the send() function with the required parameters on client.notify', async () => {
    const send = jest.fn(() => {
      return Promise.resolve({
        jsonrpc: '2.0',
        result: 'OK',
      })
    }) as SendRequestFunc<any>
    const client = new RPCClient({ send })
    const res = await client.notify('test_method', ['hello'])
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      method: 'test_method',
      params: ['hello'],
    })
    expect(res).toBe(undefined)
  })

  test('throws a RPCError if the response payload contains an error', async () => {
    const send = jest.fn(() => {
      return Promise.resolve({
        id: 'test',
        jsonrpc: '2.0',
        error: { code: 1, message: 'failed' },
      })
    }) as SendRequestFunc<any>
    const client = new RPCClient({ send })
    await expect(client.request('test_method', ['hello'])).rejects.toThrow(RPCError)
  })

  describe('abort signal', () => {
    test('rejects without sending the request if already aborted', async () => {
      const send = jest.fn()
      const client = new RPCClient({ send })
      const controller = new AbortController()
      controller.abort()
      await expect(
        client.request('test_method', ['hello'], { signal: controller.signal })
      ).rejects.toBe(abortedReasonSymbol)
      expect(send).not.toBeCalled()
    })

    test('rejects and notify server when aborted', async () => {
      const send = jest.fn(() => Promise.resolve())
      const client = new RPCClient({ send: send as unknown as SendRequestFunc<any> })

      const controller = new AbortController()
      const req = client.request('test_method', ['hello'], { signal: controller.signal })
      controller.abort()

      await expect(req).rejects.toBe(abortedReasonSymbol)
      expect(send).toHaveBeenCalledTimes(2)
      expect(send).toHaveBeenLastCalledWith({
        jsonrpc: '2.0',
        method: ABORT_REQUEST_METHOD,
        params: { id: send.mock.calls[0]?.[0]?.id as string },
      })
    })
  })
})
