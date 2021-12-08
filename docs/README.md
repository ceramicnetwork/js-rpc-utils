# JSON-RPC utilities

## Table of contents

### Enumerations

- [ERROR_CODE](enums/ERROR_CODE.md)

### Classes

- [RPCClient](classes/RPCClient.md)
- [RPCError](classes/RPCError.md)

### Type aliases

- [ErrorHandler](README.md#errorhandler)
- [HandlerMethods](README.md#handlermethods)
- [HandlerOptions](README.md#handleroptions)
- [MethodHandler](README.md#methodhandler)
- [MethodHandlerOptions](README.md#methodhandleroptions)
- [NotificationHandler](README.md#notificationhandler)
- [RPCConnection](README.md#rpcconnection)
- [RPCErrorObject](README.md#rpcerrorobject)
- [RPCErrorResponse](README.md#rpcerrorresponse)
- [RPCID](README.md#rpcid)
- [RPCMethodTypes](README.md#rpcmethodtypes)
- [RPCMethods](README.md#rpcmethods)
- [RPCParams](README.md#rpcparams)
- [RPCRequest](README.md#rpcrequest)
- [RPCResponse](README.md#rpcresponse)
- [RPCResultResponse](README.md#rpcresultresponse)
- [RequestOptions](README.md#requestoptions)
- [SendRequestFunc](README.md#sendrequestfunc)

### Variables

- [ABORT_REQUEST_METHOD](README.md#abort_request_method)
- [ERROR_MESSAGE](README.md#error_message)
- [abortableHandler](README.md#abortablehandler)
- [abortedReason](README.md#abortedreason)

### Functions

- [abortable](README.md#abortable)
- [createErrorResponse](README.md#createerrorresponse)
- [createHandler](README.md#createhandler)
- [createInternalError](README.md#createinternalerror)
- [createInvalidParams](README.md#createinvalidparams)
- [createInvalidRequest](README.md#createinvalidrequest)
- [createMethodNotFound](README.md#createmethodnotfound)
- [createParseError](README.md#createparseerror)
- [getErrorMessage](README.md#geterrormessage)
- [isServerError](README.md#isservererror)
- [parseJSON](README.md#parsejson)

## Type aliases

### ErrorHandler

Ƭ **ErrorHandler**<`Context`, `Methods`\>: <K\>(`ctx`: `Context`, `req`: [`RPCRequest`](README.md#rpcrequest)<`Methods`, `K`\>, `error`: `Error`) => `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Context` | `Context` |
| `Methods` | extends [`RPCMethods`](README.md#rpcmethods) |

#### Type declaration

▸ <`K`\>(`ctx`, `req`, `error`): `void`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof `Methods` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | `Context` |
| `req` | [`RPCRequest`](README.md#rpcrequest)<`Methods`, `K`\> |
| `error` | `Error` |

##### Returns

`void`

___

### HandlerMethods

Ƭ **HandlerMethods**<`Context`, `Methods`\>: { [K in keyof Methods]: MethodHandler<Context, Methods[K]["params"], Methods[K]["result"]\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Context` | `Context` |
| `Methods` | extends [`RPCMethods`](README.md#rpcmethods) |

___

### HandlerOptions

Ƭ **HandlerOptions**<`Context`, `Methods`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Context` | `Context` |
| `Methods` | extends [`RPCMethods`](README.md#rpcmethods) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `onHandlerError?` | [`ErrorHandler`](README.md#errorhandler)<`Context`, `Methods`\> |
| `onInvalidMessage?` | [`NotificationHandler`](README.md#notificationhandler)<`Context`, `Methods`\> |
| `onNotification?` | [`NotificationHandler`](README.md#notificationhandler)<`Context`, `Methods`\> |

___

### MethodHandler

Ƭ **MethodHandler**<`Context`, `Params`, `Result`\>: (`ctx`: `Context`, `params`: `Params`, `options`: [`MethodHandlerOptions`](README.md#methodhandleroptions)) => `Result` \| `Promise`<`Result`\> & { `[abortableHandler]?`: `boolean`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Context` | `Context` |
| `Params` | `undefined` |
| `Result` | `undefined` |

___

### MethodHandlerOptions

Ƭ **MethodHandlerOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `signal?` | `AbortSignal` |

___

### NotificationHandler

Ƭ **NotificationHandler**<`Context`, `Methods`\>: <K\>(`ctx`: `Context`, `req`: [`RPCRequest`](README.md#rpcrequest)<`Methods`, `K`\>) => `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Context` | `Context` |
| `Methods` | extends [`RPCMethods`](README.md#rpcmethods) |

#### Type declaration

▸ <`K`\>(`ctx`, `req`): `void`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof `Methods` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | `Context` |
| `req` | [`RPCRequest`](README.md#rpcrequest)<`Methods`, `K`\> |

##### Returns

`void`

___

### RPCConnection

Ƭ **RPCConnection**<`Methods`, `SendArgs`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Methods` | extends [`RPCMethods`](README.md#rpcmethods) |
| `SendArgs` | extends `any`[][] |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `send` | [`SendRequestFunc`](README.md#sendrequestfunc)<`Methods`, `SendArgs`\> |

___

### RPCErrorObject

Ƭ **RPCErrorObject**<`Data`\>: `Data` extends `undefined` ? { `code`: `number` ; `data?`: `undefined` ; `message?`: `string`  } : { `code`: `number` ; `data`: `Data` ; `message?`: `string`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Data` | `undefined` |

___

### RPCErrorResponse

Ƭ **RPCErrorResponse**<`ErrorData`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ErrorData` | `undefined` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error` | [`RPCErrorObject`](README.md#rpcerrorobject)<`ErrorData`\> |
| `id` | [`RPCID`](README.md#rpcid) |
| `jsonrpc` | `string` |
| `result?` | `never` |

___

### RPCID

Ƭ **RPCID**: `string` \| `number` \| ``null``

___

### RPCMethodTypes

Ƭ **RPCMethodTypes**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error?` | `undefined` |
| `params?` | [`RPCParams`](README.md#rpcparams) |
| `result?` | `unknown` |

___

### RPCMethods

Ƭ **RPCMethods**: `Record`<`string`, [`RPCMethodTypes`](README.md#rpcmethodtypes)\>

___

### RPCParams

Ƭ **RPCParams**: `Record`<`string`, `unknown`\> \| `unknown`[]

___

### RPCRequest

Ƭ **RPCRequest**<`Methods`, `MethodName`\>: `Methods`[`MethodName`][``"params"``] extends `undefined` ? { `id?`: [`RPCID`](README.md#rpcid) ; `jsonrpc`: `string` ; `method`: `MethodName` ; `params?`: `undefined`  } : { `id?`: [`RPCID`](README.md#rpcid) ; `jsonrpc`: `string` ; `method`: `MethodName` ; `params`: `Methods`[`MethodName`][``"params"``]  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Methods` | extends [`RPCMethods`](README.md#rpcmethods) |
| `MethodName` | extends keyof `Methods` |

___

### RPCResponse

Ƭ **RPCResponse**<`Methods`, `K`\>: [`RPCResultResponse`](README.md#rpcresultresponse)<`Methods`[`K`][``"result"``]\> \| [`RPCErrorResponse`](README.md#rpcerrorresponse)<`Methods`[`K`][``"error"``]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Methods` | extends [`RPCMethods`](README.md#rpcmethods) |
| `K` | extends keyof `Methods` |

___

### RPCResultResponse

Ƭ **RPCResultResponse**<`Result`\>: `Result` extends `undefined` ? { `error?`: `never` ; `id`: [`RPCID`](README.md#rpcid) ; `jsonrpc`: `string` ; `result?`: `undefined`  } : { `error?`: `never` ; `id`: [`RPCID`](README.md#rpcid) ; `jsonrpc`: `string` ; `result`: `Result`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Result` | `undefined` |

___

### RequestOptions

Ƭ **RequestOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `signal?` | `AbortSignal` |

___

### SendRequestFunc

Ƭ **SendRequestFunc**<`Methods`, `Args`\>: <K\>(`request`: [`RPCRequest`](README.md#rpcrequest)<`Methods`, `K`\>, ...`args`: `Args`) => `Promise`<[`RPCResponse`](README.md#rpcresponse)<`Methods`, `K`\> \| ``null``\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Methods` | extends [`RPCMethods`](README.md#rpcmethods) |
| `Args` | extends `any`[][] |

#### Type declaration

▸ <`K`\>(`request`, ...`args`): `Promise`<[`RPCResponse`](README.md#rpcresponse)<`Methods`, `K`\> \| ``null``\>

##### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof `Methods` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`RPCRequest`](README.md#rpcrequest)<`Methods`, `K`\> |
| `...args` | `Args` |

##### Returns

`Promise`<[`RPCResponse`](README.md#rpcresponse)<`Methods`, `K`\> \| ``null``\>

## Variables

### ABORT\_REQUEST\_METHOD

• **ABORT\_REQUEST\_METHOD**: ``"utils_abort_request"``

___

### ERROR\_MESSAGE

• **ERROR\_MESSAGE**: `Record`<`string`, `string`\>

___

### abortableHandler

• **abortableHandler**: typeof [`abortableHandler`](README.md#abortablehandler)

___

### abortedReason

• **abortedReason**: typeof [`abortedReason`](README.md#abortedreason)

## Functions

### abortable

▸ **abortable**<`T`\>(`source`, `signal`): `Promise`<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | `Promise`<`T`\> |
| `signal` | `AbortSignal` |

#### Returns

`Promise`<`T`\>

___

### createErrorResponse

▸ **createErrorResponse**(`id`, `code`): [`RPCErrorResponse`](README.md#rpcerrorresponse)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `number` |
| `code` | `number` |

#### Returns

[`RPCErrorResponse`](README.md#rpcerrorresponse)

___

### createHandler

▸ **createHandler**<`Context`, `Methods`\>(`methods`, `options?`): <K\>(`ctx`: `Context`, `msg`: [`RPCRequest`](README.md#rpcrequest)<`Methods`, `K`\>) => `Promise`<``null`` \| [`RPCResponse`](README.md#rpcresponse)<`Methods`, `K`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Context` | `Context` |
| `Methods` | extends [`RPCMethods`](README.md#rpcmethods) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `methods` | [`HandlerMethods`](README.md#handlermethods)<`Context`, `Methods`\> |
| `options` | [`HandlerOptions`](README.md#handleroptions)<`Context`, `Methods`\> |

#### Returns

`fn`

▸ <`K`\>(`ctx`, `msg`): `Promise`<``null`` \| [`RPCResponse`](README.md#rpcresponse)<`Methods`, `K`\>\>

##### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `number` \| `symbol` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | `Context` |
| `msg` | [`RPCRequest`](README.md#rpcrequest)<`Methods`, `K`\> |

##### Returns

`Promise`<``null`` \| [`RPCResponse`](README.md#rpcresponse)<`Methods`, `K`\>\>

___

### createInternalError

▸ `Const` **createInternalError**<`T`\>(`data?`): [`RPCError`](classes/RPCError.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | `T` |

#### Returns

[`RPCError`](classes/RPCError.md)<`T`\>

___

### createInvalidParams

▸ `Const` **createInvalidParams**<`T`\>(`data?`): [`RPCError`](classes/RPCError.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | `T` |

#### Returns

[`RPCError`](classes/RPCError.md)<`T`\>

___

### createInvalidRequest

▸ `Const` **createInvalidRequest**<`T`\>(`data?`): [`RPCError`](classes/RPCError.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | `T` |

#### Returns

[`RPCError`](classes/RPCError.md)<`T`\>

___

### createMethodNotFound

▸ `Const` **createMethodNotFound**<`T`\>(`data?`): [`RPCError`](classes/RPCError.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | `T` |

#### Returns

[`RPCError`](classes/RPCError.md)<`T`\>

___

### createParseError

▸ `Const` **createParseError**<`T`\>(`data?`): [`RPCError`](classes/RPCError.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | `T` |

#### Returns

[`RPCError`](classes/RPCError.md)<`T`\>

___

### getErrorMessage

▸ **getErrorMessage**(`code`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `code` | `number` |

#### Returns

`string`

___

### isServerError

▸ **isServerError**(`code`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `code` | `number` |

#### Returns

`boolean`

___

### parseJSON

▸ **parseJSON**<`T`\>(`input`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

`T`
