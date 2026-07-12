[**always-panic v0.8.2**](../README.md)

***

[always-panic](../globals.md) / DeepReadonly

# Type Alias: DeepReadonly\<T\>

> **DeepReadonly**\<`T`\> = `T` *extends* `Date` \| `RegExp` \| `Error` ? `T` : `T` *extends* (...`args`) => infer R ? (...`args`) => `R` : `T` *extends* readonly infer U[] ? readonly `DeepReadonly`\<`U`\>[] : `T` *extends* `object` ? `{ readonly [K in keyof T]: DeepReadonly<T[K]> }` : `T`

Defined in: [src/result/result/type.ts:7](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L7)

Recursive readonly view of `T` for inspect callbacks (compile-time only).

## Type Parameters

### T

`T`
