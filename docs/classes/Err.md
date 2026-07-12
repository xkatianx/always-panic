[**always-panic v0.8.1**](../README.md)

***

[always-panic](../globals.md) / Err

# Class: Err\<E\>

Defined in: [src/result/result/err.ts:9](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L9)

Method contract shared by [Ok](Ok.md) and Err, aligned with Rust
[`std::result::Result`](https://doc.rust-lang.org/std/result/enum.Result.html).

`Result<T, E>` is either success (`Ok(T)`) or failure (`Err(E)`). Implementations
mirror the Rust combinator names and semantics; on failure, `expect` / `unwrap` /
`unwrapErr` throw a JavaScript `Error` instead of panicking.

## See

https://doc.rust-lang.org/std/result/enum.Result.html

## Type Parameters

### E

`E`

Success (Ok) payload type.

## Implements

- [`ResultBase`](../interfaces/ResultBase.md)\<`never`, `E`\>

## Constructors

### Constructor

> **new Err**\<`E`\>(`error`): `Err`\<`E`\>

Defined in: [src/result/result/err.ts:10](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L10)

#### Parameters

##### error

`E`

#### Returns

`Err`\<`E`\>

## Properties

### error

> `readonly` **error**: `E`

Defined in: [src/result/result/err.ts:10](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L10)

## Methods

### and()

> **and**(`_res`): `this`

Defined in: [src/result/result/err.ts:74](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L74)

Returns `res` if this result is `Ok`, otherwise returns this `Err`.

`res` is evaluated eagerly; prefer [andThen](../interfaces/ResultBase.md#andthen) when it comes from a function
call that should run only after `Ok`.

#### Parameters

##### \_res

`unknown`

#### Returns

`this`

`res` on `Ok`, or `this` on `Err`.

#### See

[Result::and](https://doc.rust-lang.org/std/result/enum.Result.html#method.and)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`and`](../interfaces/ResultBase.md#and)

***

### andThen()

> **andThen**(`_fn`): `this`

Defined in: [src/result/result/err.ts:78](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L78)

Calls `fn` if this result is `Ok`, otherwise returns this `Err`.

Use to chain fallible steps that return another `Result`.

#### Parameters

##### \_fn

`unknown`

#### Returns

`this`

The `Result` from `fn`, or `this` on `Err`.

#### See

[Result::and\_then](https://doc.rust-lang.org/std/result/enum.Result.html#method.and_then)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`andThen`](../interfaces/ResultBase.md#andthen)

***

### expect()

> **expect**(`message`): `never`

Defined in: [src/result/result/err.ts:20](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L20)

Returns the contained `Ok` value.

Prefer narrowing (`isOk` / `isErr`) or non-throwing helpers (`unwrapOr`,
`unwrapOrElse`) when the `Err` case is expected.

#### Parameters

##### message

`string`

Included in the thrown `Error` when this result is `Err`
  (describe why you expected `Ok`, as in Rust's `expect` docs).

#### Returns

`never`

The success value.

#### Throws

When the result is `Err`.

#### See

[Result::expect](https://doc.rust-lang.org/std/result/enum.Result.html#method.expect)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`expect`](../interfaces/ResultBase.md#expect)

***

### inspect()

> **inspect**(`_fn`): `this`

Defined in: [src/result/result/err.ts:92](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L92)

Calls `fn` with the contained `Ok` value, then returns `this` unchanged.

Callbacks receive [DeepReadonly](../type-aliases/DeepReadonly.md) views (compile-time only; no runtime freeze).

#### Parameters

##### \_fn

`unknown`

#### Returns

`this`

`this` (for chaining).

#### See

[Result::inspect](https://doc.rust-lang.org/std/result/enum.Result.html#method.inspect)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`inspect`](../interfaces/ResultBase.md#inspect)

***

### inspectErr()

> **inspectErr**(`fn`): `this`

Defined in: [src/result/result/err.ts:96](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L96)

Calls `fn` with the contained `Err` value, then returns `this` unchanged.

#### Parameters

##### fn

(`error`) => `void`

Side effect for the error value; not called on `Ok`.

#### Returns

`this`

`this` (for chaining).

#### See

[Result::inspect\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.inspect_err)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`inspectErr`](../interfaces/ResultBase.md#inspecterr)

***

### isErr()

> **isErr**(): `this is Err<E>`

Defined in: [src/result/result/err.ts:16](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L16)

Returns `true` if the result is `Err`.

#### Returns

`this is Err<E>`

#### See

[Result::is\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.is_err)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`isErr`](../interfaces/ResultBase.md#iserr)

***

### isOk()

> **isOk**(): `this is never`

Defined in: [src/result/result/err.ts:12](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L12)

Returns `true` if the result is `Ok`.

#### Returns

`this is never`

#### See

[Result::is\_ok](https://doc.rust-lang.org/std/result/enum.Result.html#method.is_ok)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`isOk`](../interfaces/ResultBase.md#isok)

***

### map()

> **map**\<`_`\>(`_fn`): `this`

Defined in: [src/result/result/err.ts:58](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L58)

Maps `Result<T, E>` to `Result<U, E>` by applying `fn` to the contained `Ok`
value, leaving an `Err` untouched.

#### Type Parameters

##### _

`_`

#### Parameters

##### \_fn

`unknown`

#### Returns

`this`

A new `Result` with the mapped `Ok` value, or the original `Err`.

#### See

[Result::map](https://doc.rust-lang.org/std/result/enum.Result.html#method.map)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`map`](../interfaces/ResultBase.md#map)

***

### mapErr()

> **mapErr**\<`E2`\>(`fn`): `Err`\<`E2`\>

Defined in: [src/result/result/err.ts:62](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L62)

Maps `Result<T, E>` to `Result<T, F>` by applying `fn` to the contained `Err`
value, leaving an `Ok` untouched.

#### Type Parameters

##### E2

`E2`

#### Parameters

##### fn

(`error`) => `E2`

Transforms the error value.

#### Returns

`Err`\<`E2`\>

A new `Result` with the mapped `Err` value, or the original `Ok`.

#### See

[Result::map\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_err)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`mapErr`](../interfaces/ResultBase.md#maperr)

***

### mapOr()

> **mapOr**\<`U1`, `_`\>(`defaultValue`, `_fn`): `U1`

Defined in: [src/result/result/err.ts:66](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L66)

Returns `defaultValue` if `Err`, or applies `fn` to the contained `Ok` value.

Both arguments are evaluated eagerly; prefer [mapOrElse](../interfaces/ResultBase.md#maporelse) when the fallback
should run only on `Err`.

#### Type Parameters

##### U1

`U1`

##### _

`_`

#### Parameters

##### defaultValue

`U1`

Value returned when this result is `Err`.

##### \_fn

`unknown`

#### Returns

`U1`

#### See

[Result::map\_or](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_or)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`mapOr`](../interfaces/ResultBase.md#mapor)

***

### mapOrElse()

> **mapOrElse**\<`U1`, `_`\>(`defaultValue`, `_fn`): `U1`

Defined in: [src/result/result/err.ts:70](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L70)

Maps a `Result` to `U` by applying `onErr` to a contained `Err` value, or `onOk`
to a contained `Ok` value.

#### Type Parameters

##### U1

`U1`

##### _

`_`

#### Parameters

##### defaultValue

(`error`) => `U1`

##### \_fn

`unknown`

#### Returns

`U1`

#### See

[Result::map\_or\_else](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_or_else)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`mapOrElse`](../interfaces/ResultBase.md#maporelse)

***

### or()

> **or**\<`R`\>(`res`): `R`

Defined in: [src/result/result/err.ts:82](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L82)

Returns `res` if this result is `Err`, otherwise returns this `Ok`.

`res` is evaluated eagerly; prefer [orElse](../interfaces/ResultBase.md#orelse) for lazy fallbacks.

#### Type Parameters

##### R

`R` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

#### Parameters

##### res

`R`

Alternate result when this result is `Err`.

#### Returns

`R`

`this` on `Ok`, or `res` on `Err`.

#### See

[Result::or](https://doc.rust-lang.org/std/result/enum.Result.html#method.or)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`or`](../interfaces/ResultBase.md#or)

***

### orElse()

> **orElse**\<`R`\>(`fn`): `R`

Defined in: [src/result/result/err.ts:86](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L86)

Calls `fn` if this result is `Err`, otherwise returns this `Ok`.

#### Type Parameters

##### R

`R` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

#### Parameters

##### fn

(`error`) => `R`

Called with the error when this result is `Err`.

#### Returns

`R`

The `Result` from `fn`, or `this` on `Ok`.

#### See

[Result::or\_else](https://doc.rust-lang.org/std/result/enum.Result.html#method.or_else)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`orElse`](../interfaces/ResultBase.md#orelse)

***

### unwrap()

> **unwrap**(): `never`

Defined in: [src/result/result/err.ts:32](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L32)

Returns the contained `Ok` value.

#### Returns

`never`

The success value.

#### Throws

When the result is `Err` (message derived from the error).

#### See

[Result::unwrap](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`unwrap`](../interfaces/ResultBase.md#unwrap)

***

### unwrapErr()

> **unwrapErr**(): `E`

Defined in: [src/result/result/err.ts:46](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L46)

Returns the contained `Err` value.

#### Returns

`E`

The error value.

#### Throws

When the result is `Ok`.

#### See

[Result::unwrap\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_err)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`unwrapErr`](../interfaces/ResultBase.md#unwraperr)

***

### unwrapOr()

> **unwrapOr**\<`T2`\>(`defaultValue`): `T2`

Defined in: [src/result/result/err.ts:50](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L50)

Returns the contained `Ok` value, or `defaultValue` if the result is `Err`.

#### Type Parameters

##### T2

`T2`

#### Parameters

##### defaultValue

`T2`

Value to return when this result is `Err` (evaluated eagerly).

#### Returns

`T2`

`T` on `Ok`, otherwise `defaultValue`.

#### See

[Result::unwrap\_or](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`unwrapOr`](../interfaces/ResultBase.md#unwrapor)

***

### unwrapOrElse()

> **unwrapOrElse**\<`T2`\>(`fn`): `T2`

Defined in: [src/result/result/err.ts:54](https://github.com/xkatianx/always-panic/blob/79458d64d8e2e3679ec37376589fe154effb79a1/src/result/result/err.ts#L54)

Returns the contained `Ok` value, or computes it from the `Err` value.

#### Type Parameters

##### T2

`T2`

#### Parameters

##### fn

(`error`) => `T2`

Called with the error when this result is `Err`.

#### Returns

`T2`

`T` on `Ok`, otherwise the value returned by `fn`.

#### See

[Result::unwrap\_or\_else](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or_else)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`unwrapOrElse`](../interfaces/ResultBase.md#unwraporelse)
