[**always-panic v0.8.1**](../README.md)

***

[always-panic](../globals.md) / ResultErrTypes

# Type Alias: ResultErrTypes\<T\>

> **ResultErrTypes**\<`T`\> = `{ [key in keyof T]: T[key] extends Result<unknown, unknown> ? ErrContent<T[key]> : never }`

Defined in: [src/result/result/type.ts:30](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/type.ts#L30)

## Type Parameters

### T

`T` *extends* [`Result`](Result.md)\<`unknown`, `unknown`\>[]
