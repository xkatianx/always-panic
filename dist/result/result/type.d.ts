import type Err from './err.js';
import type Ok from './ok.js';
/** Built-in instances whose methods are not deep-readonly-wrapped. */
type DeepReadonlyBuiltin = Date | RegExp | Error;
/**
 * Recursive readonly view of `T` for inspect callbacks (compile-time only).
 */
export type DeepReadonly<T> = T extends DeepReadonlyBuiltin ? T : T extends (...args: infer A) => infer R ? (...args: A) => R : T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : T extends object ? {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
} : T;
export type OkContent<T> = T extends Ok<infer U> ? U : never;
export type ErrContent<T> = T extends Err<infer U> ? U : never;
export type Result<T, E> = Ok<T> | Err<E>;
export type ResultLike<R> = Result<OkContent<R>, ErrContent<R>>;
export type MaybeResult<T, E = unknown> = T | Result<T, E>;
export type ResultOkTypes<T extends Result<unknown, unknown>[]> = {
    [key in keyof T]: T[key] extends Result<unknown, unknown> ? OkContent<T[key]> : never;
};
export type ResultErrTypes<T extends Result<unknown, unknown>[]> = {
    [key in keyof T]: T[key] extends Result<unknown, unknown> ? ErrContent<T[key]> : never;
};
export type AsyncResultOkTypes<T extends ReadonlyArray<PromiseLike<Result<unknown, unknown>>>> = {
    -readonly [key in keyof T]: T[key] extends PromiseLike<Result<unknown, unknown>> ? OkContent<Awaited<T[key]>> : never;
};
export type AsyncResultErrTypes<T extends ReadonlyArray<PromiseLike<Result<unknown, unknown>>>> = {
    -readonly [key in keyof T]: T[key] extends PromiseLike<Result<unknown, unknown>> ? ErrContent<Awaited<T[key]>> : never;
};
export {};
