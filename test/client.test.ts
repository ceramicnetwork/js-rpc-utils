import { RPCClient, RPCError, SendRequestFunc } from '../src'

describe('client', () => {
  test('has a createID() method generating a random string', () => {
    const client = new RPCClient({ send: jest.fn() })
    const id1 = client.createID()
    const id2 = client.createID()
    expect(typeof id1).toBe('string')
    expect(id1).not.toBe(id2)
  })

  test('calls the send() function with the required parameters', async () => {
    const send = jest.fn(async () => ({
      jsonrpc: '2.0',
      result: 'OK',
    })) as SendRequestFunc
    const client = new RPCClient({ send })
    const res = await client.request('test_method', 'hello')
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({
      id: expect.any(String),
      jsonrpc: '2.0',
      method: 'test_method',
      params: 'hello',
    })
    expect(res).toBe('OK')
  })

  test('throws a RPCError if the response payload contains an error', async () => {
    const send = jest.fn(async () => ({
      jsonrpc: '2.0',
      error: { code: 1, message: 'failed' },
    })) as SendRequestFunc
    const client = new RPCClient({ send })
    await expect(client.request('test_method', 'hello')).rejects.toThrow(
      RPCError,
    )
  })
})
