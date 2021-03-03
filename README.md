# RPC utils

JSON-RPC 2.0 utilities

## Installation

```sh
npm install rpc-utils
```

## Types

### RPCID

```ts
type RPCID = string | number | null
```

### RPCParams

```ts
type RPCParams = Record<string, unknown> | Array<unknown>
```

### RPCMethodTypes

```ts
type RPCMethodTypes = {
  params?: RPCParams
  result?: unknown
  error?: undefined
}
```

### RPCMethods

```ts
type RPCMethods = Record<string, RPCMethodTypes>
```

### RPCRequest

```ts
type RPCRequest<Methods extends RPCMethods, MethodName extends keyof Methods> = {
  jsonrpc: string
  method: MethodName
  params?: Methods[MethodName]['params']
  id?: RPCID
}
```

### RPCErrorObject

```ts
type RPCErrorObject<Data = undefined> = {
  code: number
  data?: Data
  message?: string
}
```

### RPCErrorResponse

```ts
type RPCErrorResponse<ErrorData = undefined> = {
  jsonrpc: string
  id: RPCID
  result?: never
  error: RPCErrorObject<ErrorData>
}
```

### RPCResultResponse

```ts
type RPCResultResponse<Result = unknown> = {
  jsonrpc: string
  id: RPCID
  result: Result
  error?: never
}
```

### RPCResponse

```ts
type RPCResponse<Methods extends RPCMethods, K extends keyof Methods> =
  | RPCResultResponse<Methods[K]['result']>
  | RPCErrorResponse<Methods[K]['error']>
```

### SendRequestFunc

```ts
type SendRequestFunc<Methods extends RPCMethods> = <K extends keyof Methods>(
  request: RPCRequest<Methods, K>
) => Promise<RPCResponse<Methods, K> | null>
```

### RPCConnection

```ts
type RPCConnection<Methods extends RPCMethods> = {
  send: SendRequestFunc<Methods>
}
```

### ErrorHandler

```ts
type ErrorHandler<Context, Methods extends RPCMethods> = <K extends keyof Methods>(
  ctx: Context,
  req: RPCRequest<Methods, K>,
  error: Error
) => void
```

### MethodHandler

```ts
type MethodHandler<Context, Params, Result> = (
  ctx: Context,
  params?: Params
) => Result | Promise<Result>
```

### NotificationHandler

```ts
type NotificationHandler<Context, Methods extends RPCMethods> = <K extends keyof Methods>(
  ctx: Context,
  req: RPCRequest<Methods, K>
) => void
```

### HandlerMethods

```ts
type HandlerMethods<Context, Methods extends RPCMethods> = {
  [K in keyof Methods]: MethodHandler<Context, Methods[K]['params'], Methods[K]['result']>
}
```

### HandlerOptions

```ts
type HandlerOptions<Context, Methods extends RPCMethods> = {
  onHandlerError?: ErrorHandler<Context, Methods>
  onInvalidMessage?: NotificationHandler<Context, Methods>
  onNotification?: NotificationHandler<Context, Methods>
}
```

## Error APIs

### isServerError()

**Arguments**

1. `code: number`

**Returns** `boolean`

### getErrorMessage()

**Arguments**

1. `code: number`

**Returns** `string`

### RPCError class

Extends built-in `Error` class

**Type parameters**

1. `Data = any`: the type of the `data` attached to the error

#### new RPCError()

**Arguments**

1. `code: number`
1. `message?: string | undefined`: if not set, will use `getErrorMessage()`
1. `data?: Data | undefined`

#### .code

**Returns** `number`

#### .message

**Returns** `string`

#### .data

**Returns** `Data | undefined`

#### .toObject()

**Returns** `RPCErrorObject<Data>`

#### RPCError.fromObject()

**Type parameters**

1. `Data = unknown`: the type of the `data` attached to the error

**Arguments**

1. `error: RPCErrorObject<Data>`

**Returns** `RPCError<Data>`

## Client APIs

### RPCClient class

**Type parameters**

1. `Methods extends RPCMethods`: the methods supported by the RPC server

#### new RPCClient()

**Arguments**

1. `connection: RPCConnection<Methods>`

#### .send()

**Type parameters**

1. `MethodName extends keyof Methods`: the request `method`

**Arguments**

1. `request: RPCRequest<Methods, MethodName>`

**Returns** `Promise<RPCResponse<Methods, MethodName> | null>`

#### .request()

**Type parameters**

1. `MethodName extends keyof Methods`: the request `method`

**Arguments**

1. `method: MethodName`
1. `params: Methods[MethodName]['params']`

**Returns** `Promise<Methods[MethodName]['result']>` or throws a `RPCError` instance if the request fails

## Server APIs

### parseJSON()

**Type parameters**

1. `T = any`: the expected data type

**Arguments**

1. `input: string`

**Returns** `T` or throws a `RPCError` instance if parsing fails

### createHandler()

**Type parameters**

1. `Context`: the context type
1. `Methods extends RPCMethods`: the methods and APIs types

**Arguments**

1. `methods: HandlerMethods<Context, Methods>`
1. `options: HandlerOptions<Context, Methods> = {}`

**Returns** `<K extends keyof Methods>(ctx: Context, msg: RPCRequest<Methods, K>): Promise<RPCResponse<Methods, K> | null>` request handler function

**Options**

- `onHandlerError: ErrorHandler<Context, Methods>`: callback used when a method handler throws an `Error` other than `RPCError`.
- `onInvalidMessage: NotificationHandler<Context, Methods>`: callback used when receiving an invalid message, such as not having the `jsonrpc` field as `2.0` or missing the `method`.
- `onNotification: NotificationHandler<Context, Methods>`: callback used when receiving a JSON-RPC notification (no `id` present).

When these options are not provided, fallbacks using `console.warn` will be called instead.

## License

Apache-2.0 OR MIT
