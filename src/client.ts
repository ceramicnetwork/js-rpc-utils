import { nanoid } from 'nanoid'

import { RPCError } from './error'
import { RPCConnection } from './types'

export class RPCClient {
  public connection: RPCConnection

  constructor(connection: RPCConnection) {
    this.connection = connection
  }

  public createID(): string {
    return nanoid()
  }

  public async request<P = any, R = any>(method: string, params?: P): Promise<R> {
    const res = await this.connection.send<P, R>({
      jsonrpc: '2.0',
      id: this.createID(),
      method,
      params
    })
    if (res == null) {
      throw new Error('Missing response')
    }
    if (res.error != null) {
      throw RPCError.fromObject(res.error)
    }
    return res.result as R
  }
}
