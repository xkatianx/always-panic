[**always-panic v0.8.3**](../README.md)

***

[always-panic](../globals.md) / ResultOkTypes

# Type Alias: ResultOkTypes\<T\>

> **ResultOkTypes**\<`T`\> = `{ [key in keyof T]: T[key] extends Result<unknown, unknown> ? OkContent<T[key]> : never }`

Defined in: [src/result/result/type.ts:25](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/type.ts#L25)

## Type Parameters

### T

`T` *extends* [`Result`](Result.md)\<`unknown`, `unknown`\>[]
