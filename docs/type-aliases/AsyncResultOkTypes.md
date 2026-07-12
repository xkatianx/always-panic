[**always-panic v0.8.1**](../README.md)

***

[always-panic](../globals.md) / AsyncResultOkTypes

# Type Alias: AsyncResultOkTypes\<T\>

> **AsyncResultOkTypes**\<`T`\> = `{ -readonly [key in keyof T]: T[key] extends PromiseLike<Result<unknown, unknown>> ? OkContent<Awaited<T[key]>> : never }`

Defined in: [src/result/result/type.ts:36](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/type.ts#L36)

## Type Parameters

### T

`T` *extends* `ReadonlyArray`\<`PromiseLike`\<[`Result`](Result.md)\<`unknown`, `unknown`\>\>\>
