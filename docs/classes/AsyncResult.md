[**always-panic v0.8.1**](../README.md)

***

[always-panic](../globals.md) / AsyncResult

# Class: AsyncResult\<T, E\>

Defined in: [src/result/result/asyncResult.ts:13](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L13)

## Type Parameters

### T

`T`

### E

`E`

## Constructors

### Constructor

> **new AsyncResult**\<`T`, `E`\>(`promise`): `AsyncResult`\<`T`, `E`\>

Defined in: [src/result/result/asyncResult.ts:14](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L14)

#### Parameters

##### promise

`Promise`\<[`Result`](../type-aliases/Result.md)\<`T`, `E`\>\>

#### Returns

`AsyncResult`\<`T`, `E`\>

## Properties

### promise

> `protected` `readonly` **promise**: `Promise`\<[`Result`](../type-aliases/Result.md)\<`T`, `E`\>\>

Defined in: [src/result/result/asyncResult.ts:14](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L14)

## Methods

### and()

> **and**\<`R2`\>(`res`): `AsyncResult`\<[`OkContent`](../type-aliases/OkContent.md)\<`R2`\>, `E` \| [`ErrContent`](../type-aliases/ErrContent.md)\<`R2`\>\>

Defined in: [src/result/result/asyncResult.ts:46](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L46)

#### Type Parameters

##### R2

`R2` *extends* [`ResultLike`](../type-aliases/ResultLike.md)\<`R2`\>

#### Parameters

##### res

`R2` \| `PromiseLike`\<`R2`\>

#### Returns

`AsyncResult`\<[`OkContent`](../type-aliases/OkContent.md)\<`R2`\>, `E` \| [`ErrContent`](../type-aliases/ErrContent.md)\<`R2`\>\>

***

### andThen()

> **andThen**\<`R2`\>(`fn`): `AsyncResult`\<[`OkContent`](../type-aliases/OkContent.md)\<`R2`\>, `E` \| [`ErrContent`](../type-aliases/ErrContent.md)\<`R2`\>\>

Defined in: [src/result/result/asyncResult.ts:52](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L52)

#### Type Parameters

##### R2

`R2` *extends* [`ResultLike`](../type-aliases/ResultLike.md)\<`R2`\>

#### Parameters

##### fn

(`value`) => `R2` \| `PromiseLike`\<`R2`\>

#### Returns

`AsyncResult`\<[`OkContent`](../type-aliases/OkContent.md)\<`R2`\>, `E` \| [`ErrContent`](../type-aliases/ErrContent.md)\<`R2`\>\>

***

### inspect()

> **inspect**(`fn`): `AsyncResult`\<`T`, `E`\>

Defined in: [src/result/result/asyncResult.ts:80](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L80)

#### Parameters

##### fn

(`value`) => `void` \| `Promise`\<`void`\>

#### Returns

`AsyncResult`\<`T`, `E`\>

***

### inspectErr()

> **inspectErr**(`fn`): `AsyncResult`\<`T`, `E`\>

Defined in: [src/result/result/asyncResult.ts:87](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L87)

#### Parameters

##### fn

(`error`) => `void` \| `Promise`\<`void`\>

#### Returns

`AsyncResult`\<`T`, `E`\>

***

### map()

> **map**\<`T2`\>(`fn`): `AsyncResult`\<`T2`, `E`\>

Defined in: [src/result/result/asyncResult.ts:38](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L38)

#### Type Parameters

##### T2

`T2`

#### Parameters

##### fn

(`value`) => `T2` \| `Promise`\<`T2`\>

#### Returns

`AsyncResult`\<`T2`, `E`\>

***

### mapErr()

> **mapErr**\<`E2`\>(`fn`): `AsyncResult`\<`T`, `E2`\>

Defined in: [src/result/result/asyncResult.ts:42](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L42)

#### Type Parameters

##### E2

`E2`

#### Parameters

##### fn

(`error`) => `E2` \| `Promise`\<`E2`\>

#### Returns

`AsyncResult`\<`T`, `E2`\>

***

### or()

> **or**\<`R2`\>(`res`): `AsyncResult`\<`T` \| [`OkContent`](../type-aliases/OkContent.md)\<`R2`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R2`\>\>

Defined in: [src/result/result/asyncResult.ts:58](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L58)

#### Type Parameters

##### R2

`R2` *extends* [`ResultLike`](../type-aliases/ResultLike.md)\<`R2`\>

#### Parameters

##### res

`R2` \| `PromiseLike`\<`R2`\>

#### Returns

`AsyncResult`\<`T` \| [`OkContent`](../type-aliases/OkContent.md)\<`R2`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R2`\>\>

***

### orElse()

> **orElse**\<`R2`\>(`fn`): `AsyncResult`\<`T` \| [`OkContent`](../type-aliases/OkContent.md)\<`R2`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R2`\>\>

Defined in: [src/result/result/asyncResult.ts:64](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L64)

#### Type Parameters

##### R2

`R2` *extends* [`ResultLike`](../type-aliases/ResultLike.md)\<`R2`\>

#### Parameters

##### fn

(`error`) => `R2` \| `PromiseLike`\<`R2`\>

#### Returns

`AsyncResult`\<`T` \| [`OkContent`](../type-aliases/OkContent.md)\<`R2`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R2`\>\>

***

### then()

> **then**\<`TResult1`, `TResult2`\>(`onfulfilled?`, `onrejected?`): `Promise`\<`TResult1` \| `TResult2`\>

Defined in: [src/result/result/asyncResult.ts:71](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L71)

#### Type Parameters

##### TResult1

`TResult1` = [`Result`](../type-aliases/Result.md)\<`T`, `E`\>

##### TResult2

`TResult2` = `never`

#### Parameters

##### onfulfilled?

((`value`) => `TResult1` \| `PromiseLike`\<`TResult1`\>) \| `null`

##### onrejected?

((`reason`) => `TResult2` \| `PromiseLike`\<`TResult2`\>) \| `null`

#### Returns

`Promise`\<`TResult1` \| `TResult2`\>

***

### transform()

> `protected` **transform**\<`R`\>(`fn`): `AsyncResult`\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

Defined in: [src/result/result/asyncResult.ts:32](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L32)

#### Type Parameters

##### R

`R` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

#### Parameters

##### fn

(`r`) => `Promise`\<`R`\>

#### Returns

`AsyncResult`\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

***

### all()

> `static` **all**\<`T`\>(`results`): `AsyncResult`\<[`AsyncResultOkTypes`](../type-aliases/AsyncResultOkTypes.md)\<`T`\>, [`AsyncResultErrTypes`](../type-aliases/AsyncResultErrTypes.md)\<`T`\>\[`number`\]\>

Defined in: [src/result/result/asyncResult.ts:146](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L146)

AsyncResult version of `Promise.all` with **fail-fast** semantics.

- Resolves to `Ok([...])` once **all** inputs resolve to `Ok`
  (values preserved in input order).
- Resolves to `Err(e)` as soon as the **first** input (in time, not array
  order) resolves to `Err`, without waiting for the rest to settle.
- Rejects if any input's underlying Promise rejects.

#### Type Parameters

##### T

`T` *extends* readonly `PromiseLike`\<[`Result`](../type-aliases/Result.md)\<`unknown`, `unknown`\>\>[]

#### Parameters

##### results

`T`

#### Returns

`AsyncResult`\<[`AsyncResultOkTypes`](../type-aliases/AsyncResultOkTypes.md)\<`T`\>, [`AsyncResultErrTypes`](../type-aliases/AsyncResultErrTypes.md)\<`T`\>\[`number`\]\>

#### See

[AsyncResult.merge](#merge) for the variant that waits for every input
before picking the first `Err` by array order.

#### Example

```ts
const slow = AsyncResult.from(
  new Promise(r => setTimeout(() => r(ok(1)), 1000)),
)
const fast = AsyncResult.from(err('boom'))
const result = await AsyncResult.all([slow, fast])
expect(result.unwrapErr()).toBe('boom') // resolves ~immediately
```

***

### from()

> `static` **from**\<`R`\>(`input`): `AsyncResult`\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

Defined in: [src/result/result/asyncResult.ts:22](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L22)

Create an AsyncResult from a Result, a PromiseLike, or a function returning a Result or a PromiseLike.
Does not throw synchronously; rejections from the input promise propagate through the returned thenable.

#### Type Parameters

##### R

`R` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

#### Parameters

##### input

`R` \| `PromiseLike`\<`R`\> \| (() => `R` \| `PromiseLike`\<`R`\>)

A Result, a PromiseLike, or a function returning a Result or a PromiseLike.

#### Returns

`AsyncResult`\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

An AsyncResult.

***

### merge()

> `static` **merge**\<`T`\>(`results`): `AsyncResult`\<[`ResultOkTypes`](../type-aliases/ResultOkTypes.md)\<\{ -readonly \[P in string \| number \| symbol\]: Awaited\<T\[P\]\> \}\>, [`ResultErrTypes`](../type-aliases/ResultErrTypes.md)\<\{ -readonly \[P in string \| number \| symbol\]: Awaited\<T\[P\]\> \}\>\[`number`\]\>

Defined in: [src/result/result/asyncResult.ts:120](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/asyncResult.ts#L120)

Waits for **every** input to settle as a `Result`, then returns the first
`Err` by **array order** (or `Ok([...])` if none errored).

Unlike [AsyncResult.all](#all), an early `Err` does not short-circuit the
wait. Underlying promise **rejections** still reject via `Promise.all`
(rejections are not converted to `Err` values).

#### Type Parameters

##### T

`T` *extends* readonly `PromiseLike`\<[`Result`](../type-aliases/Result.md)\<`unknown`, `unknown`\>\>[]

#### Parameters

##### results

`T`

An array of AsyncResults to merge.

#### Returns

`AsyncResult`\<[`ResultOkTypes`](../type-aliases/ResultOkTypes.md)\<\{ -readonly \[P in string \| number \| symbol\]: Awaited\<T\[P\]\> \}\>, [`ResultErrTypes`](../type-aliases/ResultErrTypes.md)\<\{ -readonly \[P in string \| number \| symbol\]: Awaited\<T\[P\]\> \}\>\[`number`\]\>

An AsyncResult that is either an array of all Ok values
or the first Err value (by array order).

#### See

[AsyncResult.all](#all) for fail-fast-on-`Err` semantics.

#### Example

```ts
// ok
const asyncResult1 = AsyncResult.from(ok(1))
const asyncResult2 = AsyncResult.from(ok("2"))
const asyncResult3 = AsyncResult.from(ok(3n))
const merged = await AsyncResult.merge([asyncResult1, asyncResult2, asyncResult3])
expect(merged.unwrap()).toEqual([1, "2", 3n])
// err
const asyncResult1 = AsyncResult.from(ok(1))
const asyncResult2 = AsyncResult.from(err("2"))
const asyncResult3 = AsyncResult.from(err(3n))
const merged = await AsyncResult.merge([asyncResult1, asyncResult2, asyncResult3])
expect(merged.unwrapErr()).toBe("2")
```
