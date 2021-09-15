import { nanoid } from 'nanoid'

import { abortable, abortedReasonSymbol } from './abortable'
import { ABORT_REQUEST_METHOD } from './constants'
import { RPCError } from './error'
import type { RPCConnection, RPCMethods, RPCRequest } from './types'

export type RequestOptions = { signal?: AbortSignal }

export class RPCClient<Methods extends RPCMethods> {
  #connection: RPCConnection<Methods>

  constructor(connection: RPCConnection<Methods>) {
    this.#connection = connection
  }

  createID(): string {
    return nanoid()
  }

  request<MethodName extends keyof Methods>(
    method: MethodName,
    params: Methods[MethodName]['params'] = undefined,
    { signal }: RequestOptions = {}
  ): Promise<Methods[MethodName]['result']> {
    if (signal?.aborted) {
      return Promise.reject(abortedReasonSymbol)
    }

    const id = this.createID()

    const responsePromise = this.#connection
      .send({ jsonrpc: '2.0', id, method, params } as RPCRequest<Methods, MethodName>)
      .then((res) => {
        if (res == null) {
          throw new Error('Missing response')
        }
        if (res.error != null) {
          throw RPCError.fromObject<Methods[MethodName]['error']>(res.error)
        }
        return res.result as Methods[MethodName]['result']
      })

    if (signal == null) {
      return responsePromise
    }

    signal.addEventListener('abort', () => {
      void this.notify(ABORT_REQUEST_METHOD, { id })
    })
    return abortable(responsePromise, signal)
  }

  async notify<MethodName extends keyof Methods>(
    method: MethodName,
    params: Methods[MethodName]['params'] = undefined
  ): Promise<void> {
    await this.#connection.send({
      jsonrpc: '2.0',
      method,
      params,
    } as RPCRequest<Methods, MethodName>)
  }
}
