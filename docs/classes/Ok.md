[**always-panic v0.8.3**](../README.md)

***

[always-panic](../globals.md) / Ok

# Class: Ok\<T\>

Defined in: [src/result/result/ok.ts:9](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L9)

Method contract shared by Ok and [Err](Err.md), aligned with Rust
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

## Implements

- [`ResultBase`](../interfaces/ResultBase.md)\<`T`, `never`\>

## Constructors

### Constructor

> **new Ok**\<`T`\>(`value`): `Ok`\<`T`\>

Defined in: [src/result/result/ok.ts:10](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L10)

#### Parameters

##### value

`T`

#### Returns

`Ok`\<`T`\>

## Properties

### value

> `readonly` **value**: `T`

Defined in: [src/result/result/ok.ts:10](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L10)

## Methods

### and()

> **and**\<`R`\>(`res`): `R`

Defined in: [src/result/result/ok.ts:56](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L56)

Returns `res` if this result is `Ok`, otherwise returns this `Err`.

`res` is evaluated eagerly; prefer [andThen](../interfaces/ResultBase.md#andthen) when it comes from a function
call that should run only after `Ok`.

#### Type Parameters

##### R

`R` *extends* [`Result`](../type-aliases/Result.md)\<[`OkContent`](../type-aliases/OkContent.md)\<`R`\>, [`ErrContent`](../type-aliases/ErrContent.md)\<`R`\>\>

#### Parameters

##### res

`R`

Second result to return when this result is `Ok`.

#### Returns

`R`

`res` on `Ok`, or `this` on `Err`.

#### See

[Result::and](https://doc.rust-lang.org/std/result/enum.Result.html#method.and)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`and`](../interfaces/ResultBase.md#and)

***

### andThen()

> **andThen**\<`R`\>(`fn`): `R`

Defined in: [src/result/result/ok.ts:60](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L60)

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

`R`

The `Result` from `fn`, or `this` on `Err`.

#### See

[Result::and\_then](https://doc.rust-lang.org/std/result/enum.Result.html#method.and_then)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`andThen`](../interfaces/ResultBase.md#andthen)

***

### expect()

> **expect**(`_message`): `T`

Defined in: [src/result/result/ok.ts:20](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L20)

Returns the contained `Ok` value.

Prefer narrowing (`isOk` / `isErr`) or non-throwing helpers (`unwrapOr`,
`unwrapOrElse`) when the `Err` case is expected.

#### Parameters

##### \_message

`string`

#### Returns

`T`

The success value.

#### Throws

When the result is `Err`.

#### See

[Result::expect](https://doc.rust-lang.org/std/result/enum.Result.html#method.expect)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`expect`](../interfaces/ResultBase.md#expect)

***

### inspect()

> **inspect**(`fn`): `this`

Defined in: [src/result/result/ok.ts:74](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L74)

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

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`inspect`](../interfaces/ResultBase.md#inspect)

***

### inspectErr()

> **inspectErr**(`_fn`): `this`

Defined in: [src/result/result/ok.ts:79](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L79)

Calls `fn` with the contained `Err` value, then returns `this` unchanged.

#### Parameters

##### \_fn

`unknown`

#### Returns

`this`

`this` (for chaining).

#### See

[Result::inspect\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.inspect_err)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`inspectErr`](../interfaces/ResultBase.md#inspecterr)

***

### isErr()

> **isErr**(): `this is never`

Defined in: [src/result/result/ok.ts:16](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L16)

Returns `true` if the result is `Err`.

#### Returns

`this is never`

#### See

[Result::is\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.is_err)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`isErr`](../interfaces/ResultBase.md#iserr)

***

### isOk()

> **isOk**(): `this is Ok<T>`

Defined in: [src/result/result/ok.ts:12](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L12)

Returns `true` if the result is `Ok`.

#### Returns

`this is Ok<T>`

#### See

[Result::is\_ok](https://doc.rust-lang.org/std/result/enum.Result.html#method.is_ok)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`isOk`](../interfaces/ResultBase.md#isok)

***

### map()

> **map**\<`T2`\>(`fn`): `Ok`\<`T2`\>

Defined in: [src/result/result/ok.ts:40](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L40)

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

`Ok`\<`T2`\>

A new `Result` with the mapped `Ok` value, or the original `Err`.

#### See

[Result::map](https://doc.rust-lang.org/std/result/enum.Result.html#method.map)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`map`](../interfaces/ResultBase.md#map)

***

### mapErr()

> **mapErr**\<`_`\>(`_fn`): `this`

Defined in: [src/result/result/ok.ts:44](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L44)

Maps `Result<T, E>` to `Result<T, F>` by applying `fn` to the contained `Err`
value, leaving an `Ok` untouched.

#### Type Parameters

##### _

`_`

#### Parameters

##### \_fn

`unknown`

#### Returns

`this`

A new `Result` with the mapped `Err` value, or the original `Ok`.

#### See

[Result::map\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_err)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`mapErr`](../interfaces/ResultBase.md#maperr)

***

### mapOr()

> **mapOr**\<`U1`, `U2`\>(`_defaultValue`, `fn`): `U2`

Defined in: [src/result/result/ok.ts:48](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L48)

Returns `defaultValue` if `Err`, or applies `fn` to the contained `Ok` value.

Both arguments are evaluated eagerly; prefer [mapOrElse](../interfaces/ResultBase.md#maporelse) when the fallback
should run only on `Err`.

#### Type Parameters

##### U1

`U1`

##### U2

`U2`

#### Parameters

##### \_defaultValue

`U1`

##### fn

(`value`) => `U2`

Applied to the success value when this result is `Ok`.

#### Returns

`U2`

#### See

[Result::map\_or](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_or)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`mapOr`](../interfaces/ResultBase.md#mapor)

***

### mapOrElse()

> **mapOrElse**\<`_`, `U2`\>(`_defaultValue`, `fn`): `U2`

Defined in: [src/result/result/ok.ts:52](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L52)

Maps a `Result` to `U` by applying `onErr` to a contained `Err` value, or `onOk`
to a contained `Ok` value.

#### Type Parameters

##### _

`_`

##### U2

`U2`

#### Parameters

##### \_defaultValue

`unknown`

##### fn

(`value`) => `U2`

#### Returns

`U2`

#### See

[Result::map\_or\_else](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_or_else)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`mapOrElse`](../interfaces/ResultBase.md#maporelse)

***

### or()

> **or**(`_res`): `this`

Defined in: [src/result/result/ok.ts:66](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L66)

Returns `res` if this result is `Err`, otherwise returns this `Ok`.

`res` is evaluated eagerly; prefer [orElse](../interfaces/ResultBase.md#orelse) for lazy fallbacks.

#### Parameters

##### \_res

`unknown`

#### Returns

`this`

`this` on `Ok`, or `res` on `Err`.

#### See

[Result::or](https://doc.rust-lang.org/std/result/enum.Result.html#method.or)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`or`](../interfaces/ResultBase.md#or)

***

### orElse()

> **orElse**(`_fn`): `this`

Defined in: [src/result/result/ok.ts:70](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L70)

Calls `fn` if this result is `Err`, otherwise returns this `Ok`.

#### Parameters

##### \_fn

`unknown`

#### Returns

`this`

The `Result` from `fn`, or `this` on `Ok`.

#### See

[Result::or\_else](https://doc.rust-lang.org/std/result/enum.Result.html#method.or_else)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`orElse`](../interfaces/ResultBase.md#orelse)

***

### unwrap()

> **unwrap**(): `T`

Defined in: [src/result/result/ok.ts:24](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L24)

Returns the contained `Ok` value.

#### Returns

`T`

The success value.

#### Throws

When the result is `Err` (message derived from the error).

#### See

[Result::unwrap](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`unwrap`](../interfaces/ResultBase.md#unwrap)

***

### unwrapErr()

> **unwrapErr**(): `never`

Defined in: [src/result/result/ok.ts:28](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L28)

Returns the contained `Err` value.

#### Returns

`never`

The error value.

#### Throws

When the result is `Ok`.

#### See

[Result::unwrap\_err](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_err)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`unwrapErr`](../interfaces/ResultBase.md#unwraperr)

***

### unwrapOr()

> **unwrapOr**\<`T2`\>(`_defaultValue`): `T`

Defined in: [src/result/result/ok.ts:32](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L32)

Returns the contained `Ok` value, or `defaultValue` if the result is `Err`.

#### Type Parameters

##### T2

`T2`

#### Parameters

##### \_defaultValue

`T2`

#### Returns

`T`

`T` on `Ok`, otherwise `defaultValue`.

#### See

[Result::unwrap\_or](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`unwrapOr`](../interfaces/ResultBase.md#unwrapor)

***

### unwrapOrElse()

> **unwrapOrElse**\<`_`\>(`_fn`): `T`

Defined in: [src/result/result/ok.ts:36](https://github.com/xkatianx/always-panic/blob/76703c0987dff44a1a82536ea874cdfe24a2610a/src/result/result/ok.ts#L36)

Returns the contained `Ok` value, or computes it from the `Err` value.

#### Type Parameters

##### _

`_`

#### Parameters

##### \_fn

`unknown`

#### Returns

`T`

`T` on `Ok`, otherwise the value returned by `fn`.

#### See

[Result::unwrap\_or\_else](https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or_else)

#### Implementation of

[`ResultBase`](../interfaces/ResultBase.md).[`unwrapOrElse`](../interfaces/ResultBase.md#unwraporelse)
