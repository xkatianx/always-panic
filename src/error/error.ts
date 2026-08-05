import { TypedError } from './base.js'

export enum UnexpectedErrorCode {
  /** Foreign or unknown failure — promote to a `TypedError` when recognized. */
  UNKNOWN,
  /** Branch that should never run (bug in caller or logic). */
  UNREACHABLE,
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
export class UnexpectedError<
  C extends UnexpectedErrorCode,
> extends TypedError<C> {
  protected causeForUnwrap = true
  override name = 'UnexpectedError'

  static override fromAny(e: unknown) {
    const err = new UnexpectedError(
      UnexpectedErrorCode.UNKNOWN,
      Error.isError(e) ? e.message : String(e),
    )
    err.cause = e
    return err
  }

  static unreachable(reason: string = '') {
    return new UnexpectedError(
      UnexpectedErrorCode.UNREACHABLE,
      `unreachable: ${reason}`,
    )
  }
}
