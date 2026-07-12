[**always-panic v0.8.1**](../README.md)

***

[always-panic](../globals.md) / AsyncResultErrTypes

# Type Alias: AsyncResultErrTypes\<T\>

> **AsyncResultErrTypes**\<`T`\> = `{ -readonly [key in keyof T]: T[key] extends PromiseLike<Result<unknown, unknown>> ? ErrContent<Awaited<T[key]>> : never }`

Defined in: [src/result/result/type.ts:45](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/type.ts#L45)

## Type Parameters

### T

`T` *extends* `ReadonlyArray`\<`PromiseLike`\<[`Result`](Result.md)\<`unknown`, `unknown`\>\>\>
