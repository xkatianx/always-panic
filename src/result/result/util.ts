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

/**
 * Wrap a value in `Ok`. Called with no argument, produces `Ok(undefined)` —
 * the success case of a `Result<void, E>`.
 */
function ok(): Result<void, never>
function ok<T>(value: T): Result<T, never>
function ok<T>(value?: T): Result<T, never> {
  return new Ok(value as T)
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

/**
 * Early-return over `Result`s — the equivalent of Rust's
 * [`?` operator](https://doc.rust-lang.org/std/result/index.html#the-question-mark-operator-).
 *
 * Runs a generator body in which `yield* res` either evaluates to the `Ok`
 * value of `res` or short-circuits the whole body with its `Err` (returned
 * **by reference**, preserving the error's stack). The body must `return` a
 * `Result`; error types from every `yield*` and from the returned `Result`
 * accumulate in the resulting error union.
 *
 * Accepts a sync or an async generator function and stays in that world:
 * sync in, `Result` out; async in, `AsyncResult` out. In an async body,
 * `yield*` works directly on an `AsyncResult` as well as on an awaited
 * `Result`.
 *
 * On early return the generator is closed, so `finally` blocks and
 * `using` / `await using` disposals in the body still run. Thrown (foreign)
 * exceptions are not caught — wrap the body with `TypedError.try` semantics
 * yourself if you need that.
 *
 * @param body - A generator function using `yield*` on `Result`s (or
 *   `AsyncResult`s in the async case).
 * @returns The body's returned `Result`, or the first yielded `Err`.
 * @example
 * // sync
 * const r = result.gen(function* () {
 *   const a = yield* parse(input) // Result<number, ParseError>
 *   const b = yield* validate(a) // Result<number, ValidateError>
 *   return ok(a + b)
 * }) // Result<number, ParseError | ValidateError>
 * // async — yield* awaits AsyncResults directly
 * const r = await result.gen(async function* () {
 *   const user = yield* fetchUser(id) // AsyncResult<User, HttpError>
 *   const posts = yield* fetchPosts(user) // AsyncResult<Post[], HttpError>
 *   return ok({ user, posts })
 * })
 */
function gen<Y extends Err<unknown>, R extends Result<unknown, unknown>>(
  body: () => Generator<Y, R>,
): Result<OkContent<R>, ErrContent<Y> | ErrContent<R>>
function gen<Y extends Err<unknown>, R extends Result<unknown, unknown>>(
  body: () => AsyncGenerator<Y, R>,
): AsyncResult<OkContent<R>, ErrContent<Y> | ErrContent<R>>
function gen<Y extends Err<unknown>, R extends Result<unknown, unknown>>(
  body: () => Generator<Y, R> | AsyncGenerator<Y, R>,
):
  | Result<OkContent<R>, ErrContent<Y> | ErrContent<R>>
  | AsyncResult<OkContent<R>, ErrContent<Y> | ErrContent<R>> {
  const iter = body()
  return Symbol.asyncIterator in iter ? driveAsync(iter) : driveSync(iter)
}

/** The sync part of `gen`. Just use `gen` instead. */
function genSync<Y extends Err<unknown>, R extends Result<unknown, unknown>>(
  body: () => Generator<Y, R>,
): Result<OkContent<R>, ErrContent<Y> | ErrContent<R>> {
  return driveSync(body())
}

/** The async part of `gen`. Just use `gen` instead. */
function genAsync<Y extends Err<unknown>, R extends Result<unknown, unknown>>(
  body: () => AsyncGenerator<Y, R>,
): AsyncResult<OkContent<R>, ErrContent<Y> | ErrContent<R>> {
  return driveAsync(body())
}

function driveSync<Y extends Err<unknown>, R extends Result<unknown, unknown>>(
  iter: Generator<Y, R>,
): Result<OkContent<R>, ErrContent<Y> | ErrContent<R>> {
  const step = iter.next()
  if (!step.done) {
    // Close the generator so `finally` blocks and `using` disposals run.
    iter.return(undefined as never)
    return step.value as Err<ErrContent<Y>>
  }
  return step.value as Result<OkContent<R>, ErrContent<R>>
}

function driveAsync<Y extends Err<unknown>, R extends Result<unknown, unknown>>(
  iter: AsyncGenerator<Y, R>,
): AsyncResult<OkContent<R>, ErrContent<Y> | ErrContent<R>> {
  return AsyncResult.from(
    async (): Promise<Result<OkContent<R>, ErrContent<Y> | ErrContent<R>>> => {
      const step = await iter.next()
      if (!step.done) {
        // Close the generator so `finally` blocks and `await using` disposals run.
        await iter.return(undefined as never)
        return step.value as Err<ErrContent<Y>>
      }
      return step.value as Result<OkContent<R>, ErrContent<R>>
    },
  )
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
  gen,
  genSync,
  genAsync,
}
