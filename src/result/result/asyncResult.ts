import { err, ok } from '../index.js'
import type {
  AsyncResultErrTypes,
  AsyncResultOkTypes,
  DeepReadonly,
  ErrContent,
  OkContent,
  Result,
  ResultLike,
} from './type.js'
import util from './util.js'

class AsyncResult<T, E> {
  constructor(protected readonly promise: Promise<Result<T, E>>) {}

  /**
   * Create an AsyncResult from a Result, a PromiseLike, or a function returning a Result or a PromiseLike.
   * Does not throw synchronously; rejections from the input promise propagate through the returned thenable.
   * @param input - A Result, a PromiseLike, or a function returning a Result or a PromiseLike.
   * @returns An AsyncResult.
   */
  static from<R extends Result<OkContent<R>, ErrContent<R>>>(
    input: R | PromiseLike<R> | (() => R | PromiseLike<R>),
  ): AsyncResult<OkContent<R>, ErrContent<R>> {
    return new AsyncResult(
      typeof input === 'function'
        ? Promise.resolve(input())
        : Promise.resolve(input),
    )
  }

  protected transform<R extends Result<OkContent<R>, ErrContent<R>>>(
    fn: (r: Result<T, E>) => Promise<R>,
  ): AsyncResult<OkContent<R>, ErrContent<R>> {
    return new AsyncResult(this.promise.then(fn))
  }

  map<T2>(fn: (value: T) => T2 | Promise<T2>): AsyncResult<T2, E> {
    return this.transform(async (r) => (r.isOk() ? ok(await fn(r.value)) : r))
  }

  mapErr<E2>(fn: (error: E) => E2 | Promise<E2>): AsyncResult<T, E2> {
    return this.transform(async (r) => (r.isErr() ? err(await fn(r.error)) : r))
  }

  and<R2 extends ResultLike<R2>>(
    res: R2 | PromiseLike<R2>,
  ): AsyncResult<OkContent<R2>, E | ErrContent<R2>> {
    return this.andThen(() => res)
  }

  andThen<R2 extends ResultLike<R2>>(
    fn: (value: T) => R2 | PromiseLike<R2>,
  ): AsyncResult<OkContent<R2>, E | ErrContent<R2>> {
    return this.transform(async (r) => (r.isOk() ? await fn(r.value) : r))
  }

  or<R2 extends ResultLike<R2>>(
    res: R2 | PromiseLike<R2>,
  ): AsyncResult<T | OkContent<R2>, ErrContent<R2>> {
    return this.orElse(() => res)
  }

  orElse<R2 extends ResultLike<R2>>(
    fn: (error: E) => R2 | PromiseLike<R2>,
  ): AsyncResult<T | OkContent<R2>, ErrContent<R2>> {
    return this.transform(async (r) => (r.isErr() ? await fn(r.error) : r))
  }

  // biome-ignore lint/suspicious/noThenProperty: thenable
  then<TResult1 = Result<T, E>, TResult2 = never>(
    onfulfilled?:
      | ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected)
  }

  inspect(fn: (value: DeepReadonly<T>) => void | Promise<void>) {
    return this.transform(async (r) => {
      if (r.isOk()) await fn(r.value as DeepReadonly<T>)
      return r
    })
  }

  inspectErr(fn: (error: DeepReadonly<E>) => void | Promise<void>) {
    return this.transform(async (r) => {
      if (r.isErr()) await fn(r.error as DeepReadonly<E>)
      return r
    })
  }

  /**
   * Waits for **every** input to settle as a `Result`, then returns the first
   * `Err` by **array order** (or `Ok([...])` if none errored).
   *
   * Unlike {@link AsyncResult.all}, an early `Err` does not short-circuit the
   * wait. Underlying promise **rejections** still reject via `Promise.all`
   * (rejections are not converted to `Err` values).
   *
   * @see {@link AsyncResult.all} for fail-fast-on-`Err` semantics.
   * @param results - An array of AsyncResults to merge.
   * @returns An AsyncResult that is either an array of all Ok values
   * or the first Err value (by array order).
   * @example
   * // ok
   * const asyncResult1 = AsyncResult.from(ok(1))
   * const asyncResult2 = AsyncResult.from(ok("2"))
   * const asyncResult3 = AsyncResult.from(ok(3n))
   * const merged = await AsyncResult.merge([asyncResult1, asyncResult2, asyncResult3])
   * expect(merged.unwrap()).toEqual([1, "2", 3n])
   * // err
   * const asyncResult1 = AsyncResult.from(ok(1))
   * const asyncResult2 = AsyncResult.from(err("2"))
   * const asyncResult3 = AsyncResult.from(err(3n))
   * const merged = await AsyncResult.merge([asyncResult1, asyncResult2, asyncResult3])
   * expect(merged.unwrapErr()).toBe("2")
   */
  static merge<
    const T extends ReadonlyArray<PromiseLike<Result<unknown, unknown>>>,
  >(results: T) {
    return new AsyncResult(Promise.all(results).then(util.all))
  }

  /**
   * AsyncResult version of `Promise.all` with **fail-fast** semantics.
   *
   * - Resolves to `Ok([...])` once **all** inputs resolve to `Ok`
   *   (values preserved in input order).
   * - Resolves to `Err(e)` as soon as the **first** input (in time, not array
   *   order) resolves to `Err`, without waiting for the rest to settle.
   * - Rejects if any input's underlying Promise rejects.
   *
   * @see {@link AsyncResult.merge} for the variant that waits for every input
   * before picking the first `Err` by array order.
   *
   * @example
   * const slow = AsyncResult.from(
   *   new Promise(r => setTimeout(() => r(ok(1)), 1000)),
   * )
   * const fast = AsyncResult.from(err('boom'))
   * const result = await AsyncResult.all([slow, fast])
   * expect(result.unwrapErr()).toBe('boom') // resolves ~immediately
   */
  static all<
    const T extends ReadonlyArray<PromiseLike<Result<unknown, unknown>>>,
  >(
    results: T,
  ): AsyncResult<AsyncResultOkTypes<T>, AsyncResultErrTypes<T>[number]> {
    const promise = new Promise<Result<unknown, unknown>>((resolve, reject) => {
      if (results.length === 0) {
        resolve(ok([]))
        return
      }
      const okValues: unknown[] = new Array(results.length)
      let okCount = 0
      let settled = false
      results.forEach((input, i) => {
        Promise.resolve(input).then(
          (r) => {
            if (settled) return
            if (r.isOk()) {
              okValues[i] = r.value
              okCount++
              if (okCount === results.length) {
                settled = true
                resolve(ok(okValues))
              }
            } else {
              settled = true
              resolve(err(r.error))
            }
          },
          (e) => {
            if (settled) return
            settled = true
            reject(e)
          },
        )
      })
    })
    return new AsyncResult(promise) as AsyncResult<
      AsyncResultOkTypes<T>,
      AsyncResultErrTypes<T>[number]
    >
  }
}

export default AsyncResult
