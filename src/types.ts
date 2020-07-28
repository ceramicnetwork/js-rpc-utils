export type RPCID = string | number | null

export interface RPCRequest<T = any> {
  jsonrpc: string
  method: string
  id?: RPCID
  params?: T | undefined
}

export interface RPCErrorObject<T = any> {
  code: number
  message?: string | undefined
  data?: T
}

export interface RPCResponse<T = any, E = any> {
  jsonrpc: string
  id?: RPCID
  result?: T
  error?: RPCErrorObject<E>
}

export type SendRequestFunc = <P = any, R = any, E = any>(
  request: RPCRequest<P>
) => Promise<RPCResponse<R, E> | null>

export interface RPCConnection {
  send: SendRequestFunc
}
