[**always-panic v0.8.3**](../README.md)

***

[always-panic](../globals.md) / ResultErrTypes

# Type Alias: ResultErrTypes\<T\>

> **ResultErrTypes**\<`T`\> = `{ [key in keyof T]: T[key] extends Result<unknown, unknown> ? ErrContent<T[key]> : never }`

Defined in: [src/result/result/type.ts:30](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/type.ts#L30)

## Type Parameters

### T

`T` *extends* [`Result`](Result.md)\<`unknown`, `unknown`\>[]
