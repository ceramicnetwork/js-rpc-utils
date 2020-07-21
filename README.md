# RPC utils

JSON-RPC 2.0 utilities

## Installation

```sh
npm install rpc-utils
```

## Types and interfaces

### RPCID

```ts
type RPCID = string | number | null
```

### RPCRequest

```ts
interface RPCRequest<T = any> {
  jsonrpc: string
  method: string
  id?: RPCID
  params?: T | undefined
}
```

### RPCErrorObject

```ts
interface RPCErrorObject<T = any> {
  code: number
  message?: string | undefined
  data?: T
}
```

### RPCResponse

```ts
interface RPCResponse<T = any, E = any> {
  jsonrpc: string
  id?: RPCID
  result?: T
  error?: RPCErrorObject<E>
}
```

### SendRequestFunc

```ts
type SendRequestFunc = <P = any, R = any, E = any>(
  request: RPCRequest<P>,
) => Promise<RPCResponse<R, E>>
```

### RPCConnection

```ts
interface RPCConnection {
  send: SendRequestFunc
}
```

### ErrorHandler

```ts
type ErrorHandler = <C = any, P = any>(
  ctx: C,
  req: RPCRequest<P>,
  error: Error,
) => void
```

### MethodHandler

```ts
type MethodHandler = <C = any, P = any, R = any>(
  ctx: C,
  params: P,
) => R | Promise<R>
```

### NotificationHandler

```ts
type NotificationHandler = <C = any, P = any>(
  ctx: C,
  req: RPCRequest<P>,
) => void
```

### HandlerMethods

```ts
type HandlerMethods = Record<string, MethodHandler>
```

### HandlerOptions

```ts
interface HandlerOptions {
  onHandlerError?: ErrorHandler
  onInvalidMessage?: NotificationHandler
  onNotification?: NotificationHandler
}
```

### RequestHandler

```ts
type RequestHandler = <C = any, P = any, R = any, E = any>(
  ctx: C,
  msg: RPCRequest<P>,
) => Promise<RPCResponse<R, E> | null>
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

1. `T = any`: the type of the `data` attached to the error

#### new RPCError()

**Arguments**

1. `code: number`
1. `message?: string | undefined`: if not set, will use `getErrorMessage()`
1. `data?: T | undefined`

#### .code

**Returns** `number`

#### .message

**Returns** `string`

#### .data

**Returns** `T | undefined`

#### .toObject()

**Returns** `RPCErrorObject<T>`

#### RPCError.fromObject()

**Type parameters**

1. `D = any`: the type of the `data` attached to the error

**Arguments**

1. `error: RPCErrorObject<D>`

**Returns** `RPCError<D>`

## Client APIs

### RPCClient class

#### new RPCClient()

**Arguments**

1. `connection: RPCConnection`

#### .send()

**Type parameters**

1. `P = any`: the request parameters
1. `R = any`: the response result
1. `E = any`: the response error

**Arguments**

1. `request: RPCRequest<P>`

**Returns** `Promise<RPCResponse<R, E>>`

#### .request()

**Type parameters**

1. `P = any`: the request parameters
1. `R = any`: the response result

**Arguments**

1. `method: string`
1. `params: P`

**Returns** `Promise<R>` or throws a `RPCError` instance if the request fails

## Server APIs

### parseJSON()

**Type parameters**

1. `T = any`: the expected data type

**Arguments**

1. `input: string`

**Returns** `T` or throws a `RPCError` instance if parsing fails

### createHandler()

**Arguments**

1. `methods: HandlerMethods`
1. `options: HandlerOptions = {}`

**Returns** `RequestHandler`
