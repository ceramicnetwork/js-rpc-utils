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

### RPCParams

```ts
type RPCParams = Record<string, unknown> | Array<unknown>
```

### RPCRequest

```ts
type RPCRequest<M = string, P extends RPCParams | undefined = undefined> = {
  jsonrpc: string
  method: M
  id?: RPCID
} & (P extends undefined ? { params?: any } : { params: P })
```

### RPCErrorObject

```ts
type RPCErrorObject<D = undefined> = {
  code: number
  message?: string
} & (D extends undefined ? { data?: undefined } : { data: D })
```

### RPCErrorResponse

```ts
type RPCErrorResponse<E = undefined> = {
  jsonrpc: string
  id: RPCID
  result?: never
  error: RPCErrorObject<E>
}
```

### RPCResultResponse

```ts
type RPCResultResponse<R = unknown> = {
  jsonrpc: string
  id: RPCID
  result: R
  error?: never
}
```

### RPCResponse

```ts
type RPCResponse<R = unknown, E = undefined> = RPCResultResponse<R> | RPCErrorResponse<E>
```

### SendRequestFunc

```ts
type SendRequestFunc = <
  M = string,
  P extends RPCParams | undefined = undefined,
  R = undefined,
  E = undefined
>(
  request: RPCRequest<M, P>
) => Promise<RPCResponse<R, E> | null>
```

### RPCConnection

```ts
interface RPCConnection {
  send: SendRequestFunc
}
```

### ErrorHandler

```ts
type ErrorHandler<C = unknown, M = string> = <P extends RPCParams | undefined>(
  ctx: C,
  req: RPCRequest<M, P>,
  error: Error
) => void
```

### MethodHandler

```ts
type MethodHandler<C = unknown, P extends RPCParams | undefined = undefined, R = unknown> = (
  ctx: C,
  params?: P
) => R | Promise<R>
```

### NotificationHandler

```ts
type NotificationHandler<C = unknown, M = string> = <P extends RPCParams | undefined>(
  ctx: C,
  req: RPCRequest<M, P>
) => void
```

### HandlerMethods

```ts
type HandlerMethods<C = any> = Record<string, MethodHandler<C>>
```

### HandlerOptions

```ts
interface HandlerOptions<C = any> {
  onHandlerError?: ErrorHandler<C>
  onInvalidMessage?: NotificationHandler<C>
  onNotification?: NotificationHandler<C>
}
```

### RequestHandler

```ts
type RequestHandler<C = any, M = string> = <P extends RPCParams | undefined, R, E>(
  ctx: C,
  msg: RPCRequest<M, P | undefined>
) => Promise<RPCResponse<R, E | undefined> | null>
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

1. `D = unknown`: the type of the `data` attached to the error

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

1. `M = string`: the request `method`
1. `P extends RPCParams | undefined = undefined`: the request `params`
1. `R = unknown`: the response `result`
1. `E = undefined`: the response error `data`

**Arguments**

1. `request: RPCRequest<M, P>`

**Returns** `Promise<RPCResponse<R, E | undefined> | null>`

#### .request()

**Type parameters**

1. `M = string`: the request `method`
1. `P extends RPCParams | undefined = undefined`: the request `params`
1. `R = unknown`: the response `result`
1. `E = undefined`: the response error `data`

**Arguments**

1. `method: M`
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

**Type parameters**

1. `C = unknown`: the context type
1. `M = string`: the `methods` keys

**Arguments**

1. `methods: HandlerMethods<C>`
1. `options: HandlerOptions<C> = {}`

**Returns** `RequestHandler<C, M>`

**Options**

- `onHandlerError: ErrorHandler<C>`: callback used when a method handler throws an `Error` other than `RPCError`.
- `onInvalidMessage: NotificationHandler<C, M>`: callback used when receiving an invalid message, such as not having the `jsonrpc` field as `2.0` or missing the `method`.
- `onNotification: NotificationHandler<C, M>`: callback used when receiving a JSON-RPC notification (no `id` present).

When these options are not provided, fallbacks using `console.warn` will be called instead.

## License

Apache-2.0 OR MIT
