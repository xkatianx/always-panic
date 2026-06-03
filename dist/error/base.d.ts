import type { ErrContent, OkContent, Result, ResultLike } from '../result/index.js';
import { AsyncResult } from '../result/index.js';
export type Code = number;
export declare class MyErrorBase<T extends Code> extends Error {
    readonly code: T;
    info?: unknown;
    constructor(code: T, message: string, info?: unknown);
    changeMessage(message: string | ((message: string) => string)): this;
    /** Generate an instance of this error from anything. Used by `try`. */
    static fromAny(e: unknown): MyErrorBase<Code>;
    /** Try to run a function and return a Result or AsyncResult.
     *  Anything thrown by the function will be converted by `fromAny`.
     */
    static try<T extends typeof MyErrorBase, R extends ResultLike<R>>(this: T, fn: () => R): Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>;
    static try<T extends typeof MyErrorBase, R extends ResultLike<R>>(this: T, fn: () => PromiseLike<R>): AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>;
    /** The sync part of `try`. Just use `try` instead. */
    static trySync<T extends typeof MyErrorBase, R extends ResultLike<R>>(this: T, fn: () => R): Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>;
    /** The async part of `try`. Just use `try` instead. */
    static tryAsync<T extends typeof MyErrorBase, R extends ResultLike<R>>(this: T, fn: () => PromiseLike<R>): AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>;
}
