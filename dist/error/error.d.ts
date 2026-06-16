import { TypedError } from './base.js';
export declare enum UnexpectedErrorCode {
    /** Foreign or unknown failure — promote to a `TypedError` when recognized. */
    UNKNOWN = 0,
    /** Branch that should never run (bug in caller or logic). */
    UNREACHABLE = 1
}
/**
 * Bucket for **unexpected** failures (usually from `fromAny` after `.try()`).
 *
 * Temporary inside integration code: refine `UNKNOWN` into domain `TypedError`s,
 * then call `result.panic` on what remains before exporting — unexpected errors
 * should always panic inside your package, not propagate downstream.
 *
 * Enables `causeForUnwrap` so `unwrap`/`expect` attach this error (and its
 * `cause` chain) when tracing upstream bugs.
 */
export declare class UnexpectedError<C extends UnexpectedErrorCode> extends TypedError<C> {
    protected causeForUnwrap: boolean;
    constructor(code: C, message: string);
    static fromAny(e: unknown): UnexpectedError<UnexpectedErrorCode.UNKNOWN>;
    static unreachable(reason?: string): UnexpectedError<UnexpectedErrorCode.UNREACHABLE>;
}
