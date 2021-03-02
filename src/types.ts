export type RPCID = string | number | null

export type RPCParams = Record<string, unknown> | Array<unknown>

export type RPCMethodTypes = {
  params?: RPCParams
  result?: unknown
  error?: undefined
}
export type RPCMethods = Record<string, RPCMethodTypes>

export type RPCRequest<Methods extends RPCMethods, MethodName extends keyof Methods> = {
  jsonrpc: string
  method: MethodName
  params: Methods[MethodName]['params']
  id?: RPCID
}

export type RPCErrorObject<Data = undefined> = {
  code: number
  data?: Data
  message?: string
}

export type RPCErrorResponse<ErrorData = undefined> = {
  jsonrpc: string
  id: RPCID
  result?: never
  error: RPCErrorObject<ErrorData>
}

export type RPCResultResponse<Result = unknown> = {
  jsonrpc: string
  id: RPCID
  result: Result
  error?: never
}

export type RPCResponse<Methods extends RPCMethods, K extends keyof Methods> =
  | RPCResultResponse<Methods[K]['result']>
  | RPCErrorResponse<Methods[K]['error']>

export type SendRequestFunc<Methods extends RPCMethods> = <K extends keyof Methods>(
  request: RPCRequest<Methods, K>
) => Promise<RPCResponse<Methods, K> | null>

export type RPCConnection<Methods extends RPCMethods> = {
  send: SendRequestFunc<Methods>
}
