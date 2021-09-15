# Class: RPCClient<Methods\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `Methods` | extends [`RPCMethods`](../README.md#rpcmethods) |

## Table of contents

### Constructors

- [constructor](RPCClient.md#constructor)

### Methods

- [createID](RPCClient.md#createid)
- [notify](RPCClient.md#notify)
- [request](RPCClient.md#request)

## Constructors

### constructor

• **new RPCClient**<`Methods`\>(`connection`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Methods` | extends [`RPCMethods`](../README.md#rpcmethods) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `connection` | [`RPCConnection`](../README.md#rpcconnection)<`Methods`, []\> |

## Methods

### createID

▸ **createID**(): `string`

#### Returns

`string`

___

### notify

▸ **notify**<`MethodName`\>(`method`, `params?`): `Promise`<`void`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `MethodName` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `method` | `MethodName` |
| `params` | `Methods`[`MethodName`][``"params"``] |

#### Returns

`Promise`<`void`\>

___

### request

▸ **request**<`MethodName`\>(`method`, `params?`, `__namedParameters?`): `Promise`<`Methods`[`MethodName`][``"result"``]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `MethodName` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `method` | `MethodName` |
| `params` | `Methods`[`MethodName`][``"params"``] |
| `__namedParameters` | [`RequestOptions`](../README.md#requestoptions) |

#### Returns

`Promise`<`Methods`[`MethodName`][``"result"``]\>
