[**always-panic v0.8.2**](../README.md)

***

[always-panic](../globals.md) / ResultErrTypes

# Type Alias: ResultErrTypes\<T\>

> **ResultErrTypes**\<`T`\> = `{ [key in keyof T]: T[key] extends Result<unknown, unknown> ? ErrContent<T[key]> : never }`

Defined in: [src/result/result/type.ts:30](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L30)

## Type Parameters

### T

`T` *extends* [`Result`](Result.md)\<`unknown`, `unknown`\>[]
