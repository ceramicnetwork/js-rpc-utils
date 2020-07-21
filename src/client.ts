import { nanoid } from 'nanoid'

import { RPCError } from './error'
import { SendRequestFunc } from './types'

export class RPCClient {
  public send: SendRequestFunc

  constructor(send: SendRequestFunc) {
    this.send = send
  }

  public createID(): string {
    return nanoid()
  }

  public async request<P = any, R = any>(
    method: string,
    params?: P,
  ): Promise<R> {
    const res = await this.send<P, R>({
      jsonrpc: '2.0',
      id: this.createID(),
      method,
      params,
    })
    if (res.error != null) {
      throw RPCError.fromObject(res.error)
    }
    return res.result as R
  }
}
