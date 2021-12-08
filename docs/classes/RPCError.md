# Class: RPCError<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `undefined` |

## Hierarchy

- `Error`

  ↳ **`RPCError`**

## Table of contents

### Constructors

- [constructor](RPCError.md#constructor)

### Properties

- [code](RPCError.md#code)
- [data](RPCError.md#data)
- [message](RPCError.md#message)

### Methods

- [toObject](RPCError.md#toobject)
- [fromObject](RPCError.md#fromobject)

## Constructors

### constructor

• **new RPCError**<`T`\>(`code`, `message?`, `data?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `undefined` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `code` | `number` |
| `message?` | `string` |
| `data?` | `T` |

#### Overrides

Error.constructor

## Properties

### code

• **code**: `number`

___

### data

• **data**: `undefined` \| `T`

___

### message

• **message**: `string`

#### Overrides

Error.message

## Methods

### toObject

▸ **toObject**<`U`\>(): { `code`: `number` ; `data?`: `undefined` ; `message?`: `string`  } \| [`RPCErrorObject`](../README.md#rpcerrorobject)<`U`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | `T` |

#### Returns

{ `code`: `number` ; `data?`: `undefined` ; `message?`: `string`  } \| [`RPCErrorObject`](../README.md#rpcerrorobject)<`U`\>

___

### fromObject

▸ `Static` **fromObject**<`D`\>(`err`): [`RPCError`](RPCError.md)<`D`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `err` | [`RPCErrorObject`](../README.md#rpcerrorobject)<`D`\> |

#### Returns

[`RPCError`](RPCError.md)<`D`\>
