[**always-panic v0.8.3**](../README.md)

***

[always-panic](../globals.md) / AsyncResultOkTypes

# Type Alias: AsyncResultOkTypes\<T\>

> **AsyncResultOkTypes**\<`T`\> = `{ -readonly [key in keyof T]: T[key] extends PromiseLike<Result<unknown, unknown>> ? OkContent<Awaited<T[key]>> : never }`

Defined in: [src/result/result/type.ts:36](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/type.ts#L36)

## Type Parameters

### T

`T` *extends* `ReadonlyArray`\<`PromiseLike`\<[`Result`](Result.md)\<`unknown`, `unknown`\>\>\>
