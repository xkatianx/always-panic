[**always-panic v0.8.3**](../README.md)

***

[always-panic](../globals.md) / AsyncResultErrTypes

# Type Alias: AsyncResultErrTypes\<T\>

> **AsyncResultErrTypes**\<`T`\> = `{ -readonly [key in keyof T]: T[key] extends PromiseLike<Result<unknown, unknown>> ? ErrContent<Awaited<T[key]>> : never }`

Defined in: [src/result/result/type.ts:45](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/type.ts#L45)

## Type Parameters

### T

`T` *extends* `ReadonlyArray`\<`PromiseLike`\<[`Result`](Result.md)\<`unknown`, `unknown`\>\>\>
