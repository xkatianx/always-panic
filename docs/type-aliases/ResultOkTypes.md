[**always-panic v0.8.1**](../README.md)

***

[always-panic](../globals.md) / ResultOkTypes

# Type Alias: ResultOkTypes\<T\>

> **ResultOkTypes**\<`T`\> = `{ [key in keyof T]: T[key] extends Result<unknown, unknown> ? OkContent<T[key]> : never }`

Defined in: [src/result/result/type.ts:25](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/type.ts#L25)

## Type Parameters

### T

`T` *extends* [`Result`](Result.md)\<`unknown`, `unknown`\>[]
