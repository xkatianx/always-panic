import { type Code, UnexpectedError } from '../../error/index.js'
import Err from './err.js'
import Ok from './ok.js'
import type {
  ErrContent,
  OkContent,
  Result,
  ResultErrTypes,
  ResultLike,
  ResultOkTypes,
} from './type.js'

function ok<T>(value: T): Result<T, never> {
  return new Ok(value)
}

function err<E>(error: E): Result<never, E> {
  return new Err(error)
}

function asIs<T extends Result<OkContent<T>, ErrContent<T>>>(
  res: T,
): Result<OkContent<T>, ErrContent<T>> {
  return res
}

/**
 * Parse a set of `Result`s, returning an array of all `Ok` values.
 * Short circuits with the first `Err` found, if any
 */
function all<const T extends Result<unknown, unknown>[]>(
  results: T,
): Result<ResultOkTypes<T>, ResultErrTypes<T>[number]> {
  const okResult = []
  for (const result of results) {
    if (result.isOk()) {
      okResult.push(result.value)
    } else {
      return result as Err<ResultErrTypes<T>[number]>
    }
  }

  return ok(okResult as ResultOkTypes<T>)
}

function isResult<T, E>(value: unknown): value is Result<T, E> {
  return value instanceof Ok || value instanceof Err
}

/**
 * Panic on remaining `UnexpectedError` before exporting to callers.
 *
 * If `res` is `Err(UnexpectedError)`, calls `unwrap()` — the thrown `Error`
 * attaches the `UnexpectedError` as `cause` (via `causeForUnwrap`). Otherwise
 * returns `res` with `UnexpectedError` removed from the error union.
 */
function panic<R extends ResultLike<R>>(res: R) {
  if (res.isErr() && res.error instanceof UnexpectedError) {
    res.unwrap()
  }
  return res.mapErr((e) => e as Exclude<typeof e, UnexpectedError<Code>>)
}

export default {
  ok,
  err,
  asIs,
  all,
  isResult,
  panic,
}
