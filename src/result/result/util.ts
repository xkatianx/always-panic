import { type Code, UnexpectedError } from '../../error/index.js'
import AsyncResult from './asyncResult.js'
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
function panic<R extends ResultLike<R>>(
  res: R,
): Result<OkContent<R>, Exclude<ErrContent<R>, UnexpectedError<Code>>>
function panic<R extends ResultLike<R>>(
  res: PromiseLike<R>,
): AsyncResult<OkContent<R>, Exclude<ErrContent<R>, UnexpectedError<Code>>>
function panic<R extends ResultLike<R>>(res: R | PromiseLike<R>) {
  return isResult(res) ? panicSync(res as R) : panicAsync(res)
}

/** The sync part of `panic`. Just use `panic` instead. */
function panicSync<R extends ResultLike<R>>(res: R) {
  if (res.isErr() && res.error instanceof UnexpectedError) {
    res.unwrap()
  }
  return res.mapErr((e) => e as Exclude<typeof e, UnexpectedError<Code>>)
}

/** The async part of `panic`. Just use `panic` instead. */
function panicAsync<R extends ResultLike<R>>(
  res: PromiseLike<R>,
): AsyncResult<OkContent<R>, Exclude<ErrContent<R>, UnexpectedError<Code>>> {
  return AsyncResult.from(async () => panicSync(await res))
}

export default {
  ok,
  err,
  asIs,
  all,
  isResult,
  panic,
  panicSync,
  panicAsync,
}
