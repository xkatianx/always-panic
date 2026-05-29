import type { AsyncResultErrTypes, AsyncResultOkTypes, DeepReadonly, ErrContent, OkContent, Result, ResultLike } from './type.js';
declare class AsyncResult<T, E> {
    protected readonly promise: Promise<Result<T, E>>;
    constructor(promise: Promise<Result<T, E>>);
    /**
     * Create an AsyncResult from a Result, a PromiseLike, or a function returning a Result or a PromiseLike.
     * @param input - A Result, a PromiseLike, or a function returning a Result or a PromiseLike.
     * @returns An AsyncResult.
     * @throws inherits
     */
    static from<R extends Result<OkContent<R>, ErrContent<R>>>(input: R | PromiseLike<R> | (() => R | PromiseLike<R>)): AsyncResult<OkContent<R>, ErrContent<R>>;
    protected transform<R extends Result<OkContent<R>, ErrContent<R>>>(fn: (r: Result<T, E>) => Promise<R>): AsyncResult<OkContent<R>, ErrContent<R>>;
    map<T2>(fn: (value: T) => T2 | Promise<T2>): AsyncResult<T2, E>;
    mapErr<E2>(fn: (error: E) => E2 | Promise<E2>): AsyncResult<T, E2>;
    and<R2 extends ResultLike<R2>>(res: R2 | PromiseLike<R2>): AsyncResult<OkContent<R2>, E | ErrContent<R2>>;
    andThen<R2 extends ResultLike<R2>>(fn: (value: T) => R2 | PromiseLike<R2>): AsyncResult<OkContent<R2>, E | ErrContent<R2>>;
    or<R2 extends ResultLike<R2>>(res: R2 | PromiseLike<R2>): AsyncResult<T | OkContent<R2>, ErrContent<R2>>;
    orElse<R2 extends ResultLike<R2>>(fn: (error: E) => R2 | PromiseLike<R2>): AsyncResult<T | OkContent<R2>, ErrContent<R2>>;
    then<TResult1 = Result<T, E>, TResult2 = never>(onfulfilled?: ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
    inspect(fn: (value: DeepReadonly<T>) => void | Promise<void>): AsyncResult<T, E>;
    inspectErr(fn: (error: DeepReadonly<E>) => void | Promise<void>): AsyncResult<T, E>;
    /**
     * AsyncResult version of `Promise.all`, but without early rejection.
     * Waits for **every** input to settle, then returns the first `Err` by
     * **array order** (or `Ok([...])` if none errored).
     *
     * @see {@link AsyncResult.all} for fail-fast semantics matching `Promise.all`.
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
    static merge<const T extends ReadonlyArray<PromiseLike<Result<unknown, unknown>>>>(results: T): AsyncResult<import("./type.js").ResultOkTypes<{ -readonly [P in keyof T]: Awaited<T[P]>; }>, import("./type.js").ResultErrTypes<{ -readonly [P in keyof T]: Awaited<T[P]>; }>[number]>;
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
    static all<const T extends ReadonlyArray<PromiseLike<Result<unknown, unknown>>>>(results: T): AsyncResult<AsyncResultOkTypes<T>, AsyncResultErrTypes<T>[number]>;
}
export default AsyncResult;
//# sourceMappingURL=asyncResult.d.ts.map