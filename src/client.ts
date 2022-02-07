import { nanoid } from 'nanoid'

import { abortable, abortedReasonSymbol } from './abortable.js'
import { ABORT_REQUEST_METHOD } from './constants.js'
import { RPCError } from './error.js'
import type { RPCConnection, RPCMethods, RPCRequest } from './types.js'

export type RequestOptions = { signal?: AbortSignal }

export class RPCClient<Methods extends RPCMethods> {
  #connection: RPCConnection<Methods>

  constructor(connection: RPCConnection<Methods>) {
    this.#connection = connection
  }

  get connection(): RPCConnection<Methods> {
    return this.#connection
  }

  createID(): string {
    return nanoid()
  }

  request<MethodName extends keyof Methods>(
    method: MethodName,
    params: Methods[MethodName]['params'] = undefined,
    options: RequestOptions = {}
  ): Promise<Methods[MethodName]['result']> {
    const { signal } = options
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
