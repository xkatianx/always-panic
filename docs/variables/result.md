[**always-panic v0.8.3**](../README.md)

***

[always-panic](../globals.md) / result

# Variable: result

> **result**: `object`

Defined in: [src/result/result/util.ts:96](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/util.ts#L96)

## Type Declaration

### all

> **all**: \<`T`\>(`results`) => [`Result`](../type-aliases/Result.md)\<[`ResultOkTypes`](../type-aliases/ResultOkTypes.md)\<`T`\>, [`ResultErrTypes`](../type-aliases/ResultErrTypes.md)\<`T`\>\[`number`\]\>

Parse a set of `Result`s, returning an array of all `Ok` values.
Short circuits with the first `Err` found, if any

#### Type Parameters

##### T

`T` *extends* [`Result`](../type-aliases/Result.md)\<`unknown`, `unknown`\>[]

#### Parameters

##### results

`T`

#### Returns

[`Result`](../type-aliases/Result.md)\<[`ResultOkTypes`](../type-aliases/ResultOkTypes.md)\<`T`\>, [`ResultErrTypes`](../type-aliases/ResultErrTypes.md)\<`T`\>\[`number`\]\>

### asIs

> **asIs**: \<`T`\>(`res`) => [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`T`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`T`\>\>

#### Type Parameters

##### T

`T` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`T`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`T`\>\>

#### Parameters

##### res

`T`

#### Returns

[`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`T`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`T`\>\>

### err

> **err**: \<`E`\>(`error`) => [`Result`](../type-aliases/Result.md)\<`never`, `E`\>

#### Type Parameters

##### E

`E`

#### Parameters

##### error

`E`

#### Returns

[`Result`](../type-aliases/Result.md)\<`never`, `E`\>

### isResult

> **isResult**: \<`T`, `E`\>(`value`) => `value is Result<T, E>`

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### value

`unknown`

#### Returns

`value is Result<T, E>`

### ok

> **ok**: \<`T`\>(`value`) => [`Result`](../type-aliases/Result.md)\<`T`, `never`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### value

`T`

#### Returns

[`Result`](../type-aliases/Result.md)\<`T`, `never`\>

### panic

> **panic**: \{\<`R`\>(`res`): [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, `Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>; \<`R`\>(`res`): [`AsyncResult`](../classes/AsyncResult.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, `Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>; \}

#### Call Signature

> \<`R`\>(`res`): [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, `Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>

Panic on remaining `UnexpectedError` before exporting to callers.

Accepts a `Result` or a `PromiseLike<Result>` (including an `AsyncResult`) and
stays in that world: sync in, sync out; async in, `AsyncResult` out.

If `res` is `Err(UnexpectedError)`, calls `unwrap()` — the thrown `Error`
attaches the `UnexpectedError` as `cause` (via `causeForUnwrap`). Otherwise
returns `res` with `UnexpectedError` removed from the error union. In the async
case that throw surfaces as a rejection of the returned `AsyncResult`.

##### Type Parameters

###### R

`R` *extends* [`ResultLike`](../type-aliases/ResultLike.md)\<`R`\>

##### Parameters

###### res

`R`

The `Result` (or promise of one) to panic on.

##### Returns

[`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, `Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>

`res` with `UnexpectedError` removed from the error union.

##### Throws

When `res` is `Err(UnexpectedError)`.

##### Example

```ts
// sync
const r = result.panic(mayBeUnexpected())
// async — rejects instead of throwing synchronously
const r = await result.panic(mayBeUnexpectedAsync())
```

#### Call Signature

> \<`R`\>(`res`): [`AsyncResult`](../classes/AsyncResult.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, `Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>

Panic on remaining `UnexpectedError` before exporting to callers.

Accepts a `Result` or a `PromiseLike<Result>` (including an `AsyncResult`) and
stays in that world: sync in, sync out; async in, `AsyncResult` out.

If `res` is `Err(UnexpectedError)`, calls `unwrap()` — the thrown `Error`
attaches the `UnexpectedError` as `cause` (via `causeForUnwrap`). Otherwise
returns `res` with `UnexpectedError` removed from the error union. In the async
case that throw surfaces as a rejection of the returned `AsyncResult`.

##### Type Parameters

###### R

`R` *extends* [`ResultLike`](../type-aliases/ResultLike.md)\<`R`\>

##### Parameters

###### res

`PromiseLike`\<`R`\>

The `Result` (or promise of one) to panic on.

##### Returns

[`AsyncResult`](../classes/AsyncResult.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, `Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>

`res` with `UnexpectedError` removed from the error union.

##### Throws

When `res` is `Err(UnexpectedError)`.

##### Example

```ts
// sync
const r = result.panic(mayBeUnexpected())
// async — rejects instead of throwing synchronously
const r = await result.panic(mayBeUnexpectedAsync())
```

### panicAsync

> **panicAsync**: \<`R`\>(`res`) => [`AsyncResult`](../classes/AsyncResult.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, `Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>

The async part of `panic`. Just use `panic` instead.

#### Type Parameters

##### R

`R` *extends* [`ResultLike`](../type-aliases/ResultLike.md)\<`R`\>

#### Parameters

##### res

`PromiseLike`\<`R`\>

#### Returns

[`AsyncResult`](../classes/AsyncResult.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, `Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>

### panicSync

> **panicSync**: \<`R`\>(`res`) => [`Ok`](../classes/Ok.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>\> \| [`Err`](../classes/Err.md)\<`Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>

The sync part of `panic`. Just use `panic` instead.

#### Type Parameters

##### R

`R` *extends* [`ResultLike`](../type-aliases/ResultLike.md)\<`R`\>

#### Parameters

##### res

`R`

#### Returns

[`Ok`](../classes/Ok.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>\> \| [`Err`](../classes/Err.md)\<`Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>
