import { type Code, UnexpectedError } from '../../error/index.js';
import AsyncResult from './asyncResult.js';
import Err from './err.js';
import Ok from './ok.js';
import type { ErrContent, OkContent, Result, ResultErrTypes, ResultLike, ResultOkTypes } from './type.js';
declare function ok<T>(value: T): Result<T, never>;
declare function err<E>(error: E): Result<never, E>;
declare function asIs<T extends Result<OkContent<T>, ErrContent<T>>>(res: T): Result<OkContent<T>, ErrContent<T>>;
/**
 * Parse a set of `Result`s, returning an array of all `Ok` values.
 * Short circuits with the first `Err` found, if any
 */
declare function all<const T extends Result<unknown, unknown>[]>(results: T): Result<ResultOkTypes<T>, ResultErrTypes<T>[number]>;
declare function isResult<T, E>(value: unknown): value is Result<T, E>;
/**
 * Panic on remaining `UnexpectedError` before exporting to callers.
 *
 * Accepts a `Result` or a `PromiseLike<Result>` (including an `AsyncResult`) and
 * stays in that world: sync in, sync out; async in, `AsyncResult` out.
 *
 * If `res` is `Err(UnexpectedError)`, calls `unwrap()` — the thrown `Error`
 * attaches the `UnexpectedError` as `cause` (via `causeForUnwrap`). Otherwise
 * returns `res` with `UnexpectedError` removed from the error union. In the async
 * case that throw surfaces as a rejection of the returned `AsyncResult`.
 *
 * @param res - The `Result` (or promise of one) to panic on.
 * @returns `res` with `UnexpectedError` removed from the error union.
 * @throws {Error} When `res` is `Err(UnexpectedError)`.
 * @example
 * // sync
 * const r = result.panic(mayBeUnexpected())
 * // async — rejects instead of throwing synchronously
 * const r = await result.panic(mayBeUnexpectedAsync())
 */
declare function panic<R extends ResultLike<R>>(res: R): Result<OkContent<R>, Exclude<ErrContent<R>, UnexpectedError<Code>>>;
declare function panic<R extends ResultLike<R>>(res: PromiseLike<R>): AsyncResult<OkContent<R>, Exclude<ErrContent<R>, UnexpectedError<Code>>>;
/** The sync part of `panic`. Just use `panic` instead. */
declare function panicSync<R extends ResultLike<R>>(res: R): Ok<OkContent<R>> | Err<Exclude<ErrContent<R>, UnexpectedError<number>>>;
/** The async part of `panic`. Just use `panic` instead. */
declare function panicAsync<R extends ResultLike<R>>(res: PromiseLike<R>): AsyncResult<OkContent<R>, Exclude<ErrContent<R>, UnexpectedError<Code>>>;
declare const _default: {
    ok: typeof ok;
    err: typeof err;
    asIs: typeof asIs;
    all: typeof all;
    isResult: typeof isResult;
    panic: typeof panic;
    panicSync: typeof panicSync;
    panicAsync: typeof panicAsync;
};
export default _default;
