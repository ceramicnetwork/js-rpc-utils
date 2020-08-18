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
  request: RPCRequest<P>
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
type ErrorHandler<C = any> = <P = any>(ctx: C, req: RPCRequest<P>, error: Error) => void
```

### MethodHandler

```ts
type MethodHandler<C = any, P = any, R = any> = (ctx: C, params: P) => R | Promise<R>
```

### NotificationHandler

```ts
type NotificationHandler<C = any> = <P = any>(ctx: C, req: RPCRequest<P>) => void
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
type RequestHandler<C = any> = <P = any, R = any, E = any>(
  ctx: C,
  msg: RPCRequest<P>
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

**Returns** `Promise<RPCResponse<R, E> | null>`

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

**Type parameters**

1. `C = any`: the context type

**Arguments**

1. `methods: HandlerMethods<C>`
1. `options: HandlerOptions<C> = {}`

**Returns** `RequestHandler<C>`

**Options**

- `onHandlerError: ErrorHandler<C>`: callback used when a method handler throws an `Error` other than `RPCError`.
- `onInvalidMessage: NotificationHandler<C>`: callback used when receiving an invalid message, such as not having the `jsonrpc` field as `2.0` or missing the `method`.
- `onNotification: NotificationHandler<C>`: callback used when receiving a JSON-RPC notification (no `id` present).

When these options are not provided, fallbacks using `console.warn` will be called instead.

## License

MIT
