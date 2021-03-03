import { nanoid } from 'nanoid'

import { RPCError } from './error'
import type { RPCConnection, RPCMethods, RPCRequest } from './types'

export class RPCClient<Methods extends RPCMethods> {
  connection: RPCConnection<Methods>

  constructor(connection: RPCConnection<Methods>) {
    this.connection = connection
  }

  createID(): string {
    return nanoid()
  }

  async request<MethodName extends keyof Methods>(
    method: MethodName,
    params: Methods[MethodName]['params'] = undefined
  ): Promise<Methods[MethodName]['result']> {
    const res = await this.connection.send({
      jsonrpc: '2.0',
      id: this.createID(),
      method,
      params,
    } as RPCRequest<Methods, MethodName>)
    if (res == null) {
      throw new Error('Missing response')
    }
    if (res.error != null) {
      throw RPCError.fromObject<Methods[MethodName]['error']>(res.error)
    }
    return res.result
  }
}
