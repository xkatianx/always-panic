[**always-panic v0.8.1**](../README.md)

***

[always-panic](../globals.md) / result

# Variable: result

> **result**: `object`

Defined in: [src/result/result/util.ts:64](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/util.ts#L64)

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

> **panic**: \<`R`\>(`res`) => [`Ok`](../classes/Ok.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>\> \| [`Err`](../classes/Err.md)\<`Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>

Panic on remaining `UnexpectedError` before exporting to callers.

If `res` is `Err(UnexpectedError)`, calls `unwrap()` — the thrown `Error`
attaches the `UnexpectedError` as `cause` (via `causeForUnwrap`). Otherwise
returns `res` with `UnexpectedError` removed from the error union.

#### Type Parameters

##### R

`R` *extends* [`ResultLike`](../type-aliases/ResultLike.md)\<`R`\>

#### Parameters

##### res

`R`

#### Returns

[`Ok`](../classes/Ok.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>\> \| [`Err`](../classes/Err.md)\<`Exclude`\<[`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>, [`UnexpectedError`](../classes/UnexpectedError.md)\<`number`\>\>\>
