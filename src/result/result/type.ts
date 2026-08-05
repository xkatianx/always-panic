import type Err from './err.js'
import type Ok from './ok.js'

/**
 * Recursive readonly view of `T` for inspect callbacks (compile-time only).
 */
export type DeepReadonly<T> = T extends Date | RegExp | Error
  ? T
  : T extends (...args: infer A) => infer R
    ? (...args: A) => R
    : T extends readonly (infer U)[]
      ? readonly DeepReadonly<U>[]
      : T extends object
        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
        : T

export type OkContent<T> = T extends Ok<infer U> ? U : never
export type ErrContent<T> = T extends Err<infer U> ? U : never

export type Result<T, E> = Ok<T> | Err<E>
export type ResultLike<R> = Result<OkContent<R>, ErrContent<R>>

export type MaybeResult<T, E = unknown> = T | Result<T, E>

/**
 * The `Ok` payload a {@link MaybeResult} normalizes to: the `Ok` content of any
 * `Result` member, and the value itself for any bare member.
 */
export type MaybeOkContent<M> =
  M extends Result<unknown, unknown> ? OkContent<M> : M

export type ResultOkTypes<T extends Result<unknown, unknown>[]> = {
  [key in keyof T]: T[key] extends Result<unknown, unknown>
    ? OkContent<T[key]>
    : never
}
export type ResultErrTypes<T extends Result<unknown, unknown>[]> = {
  [key in keyof T]: T[key] extends Result<unknown, unknown>
    ? ErrContent<T[key]>
    : never
}

export type AsyncResultOkTypes<
  T extends ReadonlyArray<PromiseLike<Result<unknown, unknown>>>,
> = {
  -readonly [key in keyof T]: T[key] extends PromiseLike<
    Result<unknown, unknown>
  >
    ? OkContent<Awaited<T[key]>>
    : never
}
export type AsyncResultErrTypes<
  T extends ReadonlyArray<PromiseLike<Result<unknown, unknown>>>,
> = {
  -readonly [key in keyof T]: T[key] extends PromiseLike<
    Result<unknown, unknown>
  >
    ? ErrContent<Awaited<T[key]>>
    : never
}

/**
 * Method contract shared by {@link Ok} and {@link Err}, aligned with Rust
 * [`std::result::Result`](https://doc.rust-lang.org/std/result/enum.Result.html).
 *
 * `Result<T, E>` is either success (`Ok(T)`) or failure (`Err(E)`). Implementations
 * mirror the Rust combinator names and semantics; on failure, `expect` / `unwrap` /
 * `unwrapErr` throw a JavaScript `Error` instead of panicking.
 *
 * @typeParam T - Success (Ok) payload type.
 * @typeParam E - Error (Err) payload type.
 * @see https://doc.rust-lang.org/std/result/enum.Result.html
 */
export interface ResultBase<T, E> {
  /**
   * Returns `true` if the result is `Ok`.
   *
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.is_ok | Result::is_ok}
   */
  isOk(): boolean

  /**
   * Returns `true` if the result is `Err`.
   *
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.is_err | Result::is_err}
   */
  isErr(): boolean

  /**
   * Returns the contained `Ok` value.
   *
   * Prefer narrowing (`isOk` / `isErr`) or non-throwing helpers (`unwrapOr`,
   * `unwrapOrElse`) when the `Err` case is expected.
   *
   * @param message - Included in the thrown `Error` when this result is `Err`
   *   (describe why you expected `Ok`, as in Rust's `expect` docs).
   * @returns The success value.
   * @throws {Error} When the result is `Err`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.expect | Result::expect}
   */
  expect(message: string): T

  /**
   * Returns the contained `Ok` value.
   *
   * @returns The success value.
   * @throws {Error} When the result is `Err` (message derived from the error).
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap | Result::unwrap}
   */
  unwrap(): T

  /**
   * Returns the contained `Err` value.
   *
   * @returns The error value.
   * @throws {Error} When the result is `Ok`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_err | Result::unwrap_err}
   */
  unwrapErr(): E

  /**
   * Returns the contained `Ok` value, or `defaultValue` if the result is `Err`.
   *
   * @param defaultValue - Value to return when this result is `Err` (evaluated eagerly).
   * @returns `T` on `Ok`, otherwise `defaultValue`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or | Result::unwrap_or}
   */
  unwrapOr<T2>(defaultValue: T2): T | T2

  /**
   * Returns the contained `Ok` value, or computes it from the `Err` value.
   *
   * @param fn - Called with the error when this result is `Err`.
   * @returns `T` on `Ok`, otherwise the value returned by `fn`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or_else | Result::unwrap_or_else}
   */
  unwrapOrElse<T2>(fn: (error: E) => T2): T | T2

  /**
   * Maps `Result<T, E>` to `Result<U, E>` by applying `fn` to the contained `Ok`
   * value, leaving an `Err` untouched.
   *
   * @param fn - Transforms the success value.
   * @returns A new `Result` with the mapped `Ok` value, or the original `Err`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.map | Result::map}
   */
  map<T2>(fn: (value: T) => T2): Result<T2, E>

  /**
   * Maps `Result<T, E>` to `Result<T, F>` by applying `fn` to the contained `Err`
   * value, leaving an `Ok` untouched.
   *
   * @param fn - Transforms the error value.
   * @returns A new `Result` with the mapped `Err` value, or the original `Ok`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.map_err | Result::map_err}
   */
  mapErr<E2>(fn: (error: E) => E2): Result<T, E2>

  /**
   * Returns `defaultValue` if `Err`, or applies `fn` to the contained `Ok` value.
   *
   * Both arguments are evaluated eagerly; prefer {@link mapOrElse} when the fallback
   * should run only on `Err`.
   *
   * @param defaultValue - Value returned when this result is `Err`.
   * @param fn - Applied to the success value when this result is `Ok`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.map_or | Result::map_or}
   */
  mapOr<T2>(defaultValue: T2, fn: (value: T) => T2): T2

  /**
   * Maps a `Result` to `U` by applying `onErr` to a contained `Err` value, or `onOk`
   * to a contained `Ok` value.
   *
   * @param onErr - Called with the error when this result is `Err`.
   * @param onOk - Called with the success value when this result is `Ok`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.map_or_else | Result::map_or_else}
   */
  mapOrElse<T2>(onErr: (error: E) => T2, onOk: (value: T) => T2): T2

  /**
   * Returns `res` if this result is `Ok`, otherwise returns this `Err`.
   *
   * `res` is evaluated eagerly; prefer {@link andThen} when it comes from a function
   * call that should run only after `Ok`.
   *
   * @param res - Second result to return when this result is `Ok`.
   * @returns `res` on `Ok`, or `this` on `Err`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.and | Result::and}
   */
  and<R extends Result<OkContent<R>, ErrContent<R>>>(res: R): R | this

  /**
   * Calls `fn` if this result is `Ok`, otherwise returns this `Err`.
   *
   * Use to chain fallible steps that return another `Result`.
   *
   * @param fn - Called with the success value when this result is `Ok`.
   * @returns The `Result` from `fn`, or `this` on `Err`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.and_then | Result::and_then}
   */
  andThen<R extends Result<OkContent<R>, ErrContent<R>>>(
    fn: (value: T) => R,
  ): R | this

  /**
   * Returns `res` if this result is `Err`, otherwise returns this `Ok`.
   *
   * `res` is evaluated eagerly; prefer {@link orElse} for lazy fallbacks.
   *
   * @param res - Alternate result when this result is `Err`.
   * @returns `this` on `Ok`, or `res` on `Err`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.or | Result::or}
   */
  or<R extends Result<OkContent<R>, ErrContent<R>>>(res: R): R | this

  /**
   * Calls `fn` if this result is `Err`, otherwise returns this `Ok`.
   *
   * @param fn - Called with the error when this result is `Err`.
   * @returns The `Result` from `fn`, or `this` on `Ok`.
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.or_else | Result::or_else}
   */
  orElse<R extends Result<OkContent<R>, ErrContent<R>>>(
    fn: (error: E) => R,
  ): R | this

  /**
   * Calls `fn` with the contained `Ok` value, then returns `this` unchanged.
   *
   * Callbacks receive {@link DeepReadonly} views (compile-time only; no runtime freeze).
   *
   * @param fn - Side effect for the success value; not called on `Err`.
   * @returns `this` (for chaining).
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.inspect | Result::inspect}
   */
  inspect(fn: (value: DeepReadonly<T>) => void): this

  /**
   * Calls `fn` with the contained `Err` value, then returns `this` unchanged.
   *
   * @param fn - Side effect for the error value; not called on `Ok`.
   * @returns `this` (for chaining).
   * @see {@link https://doc.rust-lang.org/std/result/enum.Result.html#method.inspect_err | Result::inspect_err}
   */
  inspectErr(fn: (error: DeepReadonly<E>) => void): this

  /**
   * Enables `yield* res` inside a `result.gen` body — the equivalent of Rust's
   * [`?` operator](https://doc.rust-lang.org/std/result/index.html#the-question-mark-operator-).
   *
   * On `Ok`, `yield*` produces no yields and evaluates to the contained value.
   * On `Err`, it yields the `Err` itself, which the surrounding
   * `result.gen` / `genSync` / `genAsync` driver returns by reference
   * (short-circuiting the rest of the body). Not meant to be iterated by
   * anything other than those drivers.
   */
  [Symbol.iterator](): Generator<Err<E>, T>
}
