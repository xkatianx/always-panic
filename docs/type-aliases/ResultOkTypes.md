[**always-panic v0.8.2**](../README.md)

***

[always-panic](../globals.md) / ResultOkTypes

# Type Alias: ResultOkTypes\<T\>

> **ResultOkTypes**\<`T`\> = `{ [key in keyof T]: T[key] extends Result<unknown, unknown> ? OkContent<T[key]> : never }`

Defined in: [src/result/result/type.ts:25](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L25)

## Type Parameters

### T

`T` *extends* [`Result`](Result.md)\<`unknown`, `unknown`\>[]
