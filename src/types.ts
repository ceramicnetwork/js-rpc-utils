export type RPCID = string | number | null

export type RPCParams = Record<string, unknown> | Array<unknown>

export type RPCRequest<M = string, P extends RPCParams | undefined = undefined> = {
  jsonrpc: string
  method: M
  id?: RPCID
} & (P extends undefined ? { params?: any } : { params: P })

export type RPCErrorObject<D = undefined> = {
  code: number
  message?: string
} & (D extends undefined ? { data?: undefined } : { data: D })

export type RPCErrorResponse<E = undefined> = {
  jsonrpc: string
  id: RPCID
  result?: never
  error: RPCErrorObject<E>
}

export type RPCResultResponse<R = unknown> = {
  jsonrpc: string
  id: RPCID
  result: R
  error?: never
}

export type RPCResponse<R = unknown, E = undefined> = RPCResultResponse<R> | RPCErrorResponse<E>

export type SendRequestFunc = <
  M = string,
  P extends RPCParams | undefined = undefined,
  R = undefined,
  E = undefined
>(
  request: RPCRequest<M, P>
) => Promise<RPCResponse<R, E> | null>

export interface RPCConnection {
  send: SendRequestFunc
}
