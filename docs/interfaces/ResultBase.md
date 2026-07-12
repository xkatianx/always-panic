[**always-panic v0.8.2**](../README.md)

***

[always-panic](../globals.md) / ResultBase

# Interface: ResultBase\<T, E\>

Defined in: [src/result/result/type.ts:67](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L67)

Method contract shared by [Ok](../classes/Ok.md) and [Err](../classes/Err.md), aligned with Rust
[`std::result::Result`](https://doc.rust-lang.org/std/result/enum.Result.html).

`Result<T, E>` is either success (`Ok(T)`) or failure (`Err(E)`). Implementations
mirror the Rust combinator names and semantics; on failure, `expect` / `unwrap` /
`unwrapErr` throw a JavaScript `Error` instead of panicking.

## See

https://doc.rust-lang.org/std/result/enum.Result.html

## Type Parameters

### T

`T`

Success (Ok) payload type.

### E

`E`

Error (Err) payload type.

## Methods

### and()

> **and**\<`R`\>(`res`): `ResultBase`\<`T`, `E`\> \| `R`

Defined in: [src/result/result/type.ts:184](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L184)

Returns `res` if this result is `Ok`, otherwise returns this `Err`.

`res` is evaluated eagerly; prefer [andThen](#andthen) when it comes from a function
call that should run only after `Ok`.

#### Type Parameters

##### R

`R` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

#### Parameters

##### res

`R`

Second result to return when this result is `Ok`.

#### Returns

`ResultBase`\<`T`, `E`\> \| `R`

`res` on `Ok`, or `this` on `Err`.

#### See

[Result::and](https://doc.rust-lang.org/std/result/enum.Result.html#method.and)

***

### andThen()

> **andThen**\<`R`\>(`fn`): `ResultBase`\<`T`, `E`\> \| `R`

Defined in: [src/result/result/type.ts:195](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L195)

Calls `fn` if this result is `Ok`, otherwise returns this `Err`.

Use to chain fallible steps that return another `Result`.

#### Type Parameters

##### R

`R` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

#### Parameters

##### fn

(`value`) => `R`

Called with the success value when this result is `Ok`.

#### Returns

`ResultBase`\<`T`, `E`\> \| `R`

The `Result` from `fn`, or `this` on `Err`.

#### See

[Result::and\_then](https://doc.rust-lang.org/std/result/enum.Result.html#method.and_then)

***

### expect()

> **expect**(`message`): `T`

Defined in: [src/result/result/type.ts:94](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L94)

Returns the contained `Ok` value.

Prefer narrowing (`isOk` / `isErr`) or non-throwing helpers (`unwrapOr`,
`unwrapOrElse`) when the `Err` case is expected.

#### Parameters

##### message

`string`

Included in the thrown `Error` when this result is `Err`
  (describe why you expected `Ok`, as in Rust's `expect` docs).

#### Returns

`T`

The success value.

#### Throws

When the result is `Err`.

#### See

[Result::expect](https://doc.rust-lang.org/std/result/enum.Result.html#method.expect)

***

### inspect()

> **inspect**(`fn`): `this`

Defined in: [src/result/result/type.ts:230](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L230)

Calls `fn` with the contained `Ok` value, then returns `this` unchanged.

Callbacks receive [DeepReadonly](../type-aliases/DeepReadonly.md) views (compile-time only; no runtime freeze).

#### Parameters

##### fn

(`value`) => `void`

Side effect for the success value; not called on `Err`.

#### Returns

`this`

`this` (for chaining).

#### See

[Result::inspect](https://doc.rust-lang.org/std/result/enum.Result.html#method.inspect)

***

### inspectErr()

> **inspectErr**(`fn`): `this`

Defined in: [src/result/result/type.ts:239](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L239)

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

***

### isErr()

> **isErr**(): `boolean`

Defined in: [src/result/result/type.ts:80](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L80)

Returns `true` if the result is `Err`.

#### Returns

`boolean`

#### See

[Result::is\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.is_err)

***

### isOk()

> **isOk**(): `boolean`

Defined in: [src/result/result/type.ts:73](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L73)

Returns `true` if the result is `Ok`.

#### Returns

`boolean`

#### See

[Result::is\_ok](https://doc.rust-lang.org/std/result/enum.Result.html#method.is_ok)

***

### map()

> **map**\<`T2`\>(`fn`): [`Result`](../type-aliases/Result.md)\<`T2`, `E`\>

Defined in: [src/result/result/type.ts:140](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L140)

Maps `Result<T, E>` to `Result<U, E>` by applying `fn` to the contained `Ok`
value, leaving an `Err` untouched.

#### Type Parameters

##### T2

`T2`

#### Parameters

##### fn

(`value`) => `T2`

Transforms the success value.

#### Returns

[`Result`](../type-aliases/Result.md)\<`T2`, `E`\>

A new `Result` with the mapped `Ok` value, or the original `Err`.

#### See

[Result::map](https://doc.rust-lang.org/std/result/enum.Result.html#method.map)

***

### mapErr()

> **mapErr**\<`E2`\>(`fn`): [`Result`](../type-aliases/Result.md)\<`T`, `E2`\>

Defined in: [src/result/result/type.ts:150](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L150)

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

[`Result`](../type-aliases/Result.md)\<`T`, `E2`\>

A new `Result` with the mapped `Err` value, or the original `Ok`.

#### See

[Result::map\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_err)

***

### mapOr()

> **mapOr**\<`T2`\>(`defaultValue`, `fn`): `T2`

Defined in: [src/result/result/type.ts:162](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L162)

Returns `defaultValue` if `Err`, or applies `fn` to the contained `Ok` value.

Both arguments are evaluated eagerly; prefer [mapOrElse](#maporelse) when the fallback
should run only on `Err`.

#### Type Parameters

##### T2

`T2`

#### Parameters

##### defaultValue

`T2`

Value returned when this result is `Err`.

##### fn

(`value`) => `T2`

Applied to the success value when this result is `Ok`.

#### Returns

`T2`

#### See

[Result::map\_or](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_or)

***

### mapOrElse()

> **mapOrElse**\<`T2`\>(`onErr`, `onOk`): `T2`

Defined in: [src/result/result/type.ts:172](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L172)

Maps a `Result` to `U` by applying `onErr` to a contained `Err` value, or `onOk`
to a contained `Ok` value.

#### Type Parameters

##### T2

`T2`

#### Parameters

##### onErr

(`error`) => `T2`

Called with the error when this result is `Err`.

##### onOk

(`value`) => `T2`

Called with the success value when this result is `Ok`.

#### Returns

`T2`

#### See

[Result::map\_or\_else](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_or_else)

***

### or()

> **or**\<`R`\>(`res`): `ResultBase`\<`T`, `E`\> \| `R`

Defined in: [src/result/result/type.ts:208](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L208)

Returns `res` if this result is `Err`, otherwise returns this `Ok`.

`res` is evaluated eagerly; prefer [orElse](#orelse) for lazy fallbacks.

#### Type Parameters

##### R

`R` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

#### Parameters

##### res

`R`

Alternate result when this result is `Err`.

#### Returns

`ResultBase`\<`T`, `E`\> \| `R`

`this` on `Ok`, or `res` on `Err`.

#### See

[Result::or](https://doc.rust-lang.org/std/result/enum.Result.html#method.or)

***

### orElse()

> **orElse**\<`R`\>(`fn`): `ResultBase`\<`T`, `E`\> \| `R`

Defined in: [src/result/result/type.ts:217](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L217)

Calls `fn` if this result is `Err`, otherwise returns this `Ok`.

#### Type Parameters

##### R

`R` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

#### Parameters

##### fn

(`error`) => `R`

Called with the error when this result is `Err`.

#### Returns

`ResultBase`\<`T`, `E`\> \| `R`

The `Result` from `fn`, or `this` on `Ok`.

#### See

[Result::or\_else](https://doc.rust-lang.org/std/result/enum.Result.html#method.or_else)

***

### unwrap()

> **unwrap**(): `T`

Defined in: [src/result/result/type.ts:103](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L103)

Returns the contained `Ok` value.

#### Returns

`T`

The success value.

#### Throws

When the result is `Err` (message derived from the error).

#### See

[Result::unwrap](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap)

***

### unwrapErr()

> **unwrapErr**(): `E`

Defined in: [src/result/result/type.ts:112](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L112)

Returns the contained `Err` value.

#### Returns

`E`

The error value.

#### Throws

When the result is `Ok`.

#### See

[Result::unwrap\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_err)

***

### unwrapOr()

> **unwrapOr**\<`T2`\>(`defaultValue`): `T` \| `T2`

Defined in: [src/result/result/type.ts:121](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L121)

Returns the contained `Ok` value, or `defaultValue` if the result is `Err`.

#### Type Parameters

##### T2

`T2`

#### Parameters

##### defaultValue

`T2`

Value to return when this result is `Err` (evaluated eagerly).

#### Returns

`T` \| `T2`

`T` on `Ok`, otherwise `defaultValue`.

#### See

[Result::unwrap\_or](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or)

***

### unwrapOrElse()

> **unwrapOrElse**\<`T2`\>(`fn`): `T` \| `T2`

Defined in: [src/result/result/type.ts:130](https://github.com/xkatianx/always-panic/blob/881c1b407a45e008f3a06d46eb9029aee629ce8e/src/result/result/type.ts#L130)

Returns the contained `Ok` value, or computes it from the `Err` value.

#### Type Parameters

##### T2

`T2`

#### Parameters

##### fn

(`error`) => `T2`

Called with the error when this result is `Err`.

#### Returns

`T` \| `T2`

`T` on `Ok`, otherwise the value returned by `fn`.

#### See

[Result::unwrap\_or\_else](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or_else)
