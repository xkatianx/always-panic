import type { ErrContent, OkContent, Result, ResultErrTypes, ResultOkTypes } from './type.js';
declare function ok<T>(value: T): Result<T, never>;
declare function err<E>(error: E): Result<never, E>;
declare function asIs<T extends Result<OkContent<T>, ErrContent<T>>>(res: T): Result<OkContent<T>, ErrContent<T>>;
/**
 * Parse a set of `Result`s, returning an array of all `Ok` values.
 * Short circuits with the first `Err` found, if any
 */
declare function all<const T extends Result<unknown, unknown>[]>(results: T): Result<ResultOkTypes<T>, ResultErrTypes<T>[number]>;
declare function isResult<T, E>(value: unknown): value is Result<T, E>;
declare const _default: {
    ok: typeof ok;
    err: typeof err;
    asIs: typeof asIs;
    all: typeof all;
    isResult: typeof isResult;
};
export default _default;
