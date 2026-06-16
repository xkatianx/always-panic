import type { ErrContent, OkContent, Result, ResultLike } from '../result/index.js';
import { AsyncResult } from '../result/index.js';
export type Code = number;
/**
 * Base class for **expected** (typed) errors — the `E` in exported `Result<T, E>`.
 *
 * Subclass with a numeric error-code enum. Callers handle these explicitly;
 * unwrapping a `TypedError` usually means the call site wrongly assumed success.
 */
export declare class TypedError<T extends Code> extends Error {
    readonly code: T;
    info?: unknown;
    constructor(code: T, message: string, info?: unknown);
    changeMessage(message: string | ((message: string) => string)): this;
    /**
     * Not callable on the base class — override in a domain subclass and fall back
     * to `UnexpectedError.fromAny(e)` so `E` stays specific. Use `UnexpectedError.try`
     * when you have no domain error type yet.
     */
    static fromAny(_e: unknown): TypedError<Code>;
    /**
     * Convenience boundary: catch throws and return `Result` / `AsyncResult`.
     * Foreign failures land in `Err` via `fromAny` (often `UnexpectedError` at first).
     * Refine with `mapErr` / `fromAny`, then `result.panic` on remaining
     * `UnexpectedError` inside your package — do not export it to downstream callers.
     */
    static try<T extends typeof TypedError, R extends ResultLike<R>>(this: T, fn: () => R): Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>;
    static try<T extends typeof TypedError, R extends ResultLike<R>>(this: T, fn: () => PromiseLike<R>): AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>;
    /** The sync part of `try`. Just use `try` instead. */
    static trySync<T extends typeof TypedError, R extends ResultLike<R>>(this: T, fn: () => R): Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>;
    /** The async part of `try`. Just use `try` instead. */
    static tryAsync<T extends typeof TypedError, R extends ResultLike<R>>(this: T, fn: () => PromiseLike<R>): AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>;
}
