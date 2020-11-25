import { nanoid } from 'nanoid'

import { RPCError } from './error'
import { RPCConnection, RPCParams } from './types'

export class RPCClient {
  public connection: RPCConnection

  constructor(connection: RPCConnection) {
    this.connection = connection
  }

  public createID(): string {
    return nanoid()
  }

  public async request<
    M = string,
    P extends RPCParams | undefined = undefined,
    R = unknown,
    E = undefined
  >(method: M, params?: P): Promise<R> {
    const res = await this.connection.send<M, P | undefined, R, E>({
      jsonrpc: '2.0',
      id: this.createID(),
      method,
      params
    })
    if (res == null) {
      throw new Error('Missing response')
    }
    if (res.error != null) {
      throw RPCError.fromObject<E>(res.error)
    }
    return res.result as R
  }
}
