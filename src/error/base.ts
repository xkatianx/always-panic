import type {
  ErrContent,
  OkContent,
  Result,
  ResultLike,
} from '../result/index.js'
import { AsyncResult, err } from '../result/index.js'

export type Code = number

/**
 * Base class for **expected** (typed) errors — the `E` in exported `Result<T, E>`.
 *
 * Subclass with a numeric error-code enum. Callers handle these explicitly;
 * unwrapping a `TypedError` usually means the call site wrongly assumed success.
 */
export class TypedError<T extends Code> extends Error {
  readonly code: T
  info?: unknown

  constructor(code: T, message: string, info?: unknown) {
    super(message)
    this.name = 'TypedError'
    this.code = code
    if (info !== undefined) this.info = info
  }

  changeMessage(message: string | ((message: string) => string)): this {
    this.message = message instanceof Function ? message(this.message) : message
    return this
  }

  /**
   * Not callable on the base class — override in a domain subclass and fall back
   * to `UnexpectedError.fromAny(e)` so `E` stays specific. Use `UnexpectedError.try`
   * when you have no domain error type yet.
   */
  static fromAny(_e: unknown): TypedError<Code> {
    throw new Error(
      'TypedError.fromAny must not be called; override in a domain subclass and fall back to UnexpectedError.fromAny(e)',
    )
  }

  /**
   * Convenience boundary: catch throws and return `Result` / `AsyncResult`.
   * Foreign failures land in `Err` via `fromAny` (often `UnexpectedError` at first).
   * Refine with `mapErr` / `fromAny`, then `result.panic` on remaining
   * `UnexpectedError` inside your package — do not export it to downstream callers.
   */
  static try<T extends typeof TypedError, R extends ResultLike<R>>(
    this: T,
    fn: () => R,
  ): Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>
  static try<T extends typeof TypedError, R extends ResultLike<R>>(
    this: T,
    fn: () => PromiseLike<R>,
  ): AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>
  static try<T extends typeof TypedError, R extends ResultLike<R>>(
    this: T,
    fn: () => R | PromiseLike<R>,
  ):
    | Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>
    | AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>> {
    let captured: R | PromiseLike<R> | undefined
    const sync = this.trySync(() => {
      captured = fn()
      return captured as R
    })
    if (
      captured != null &&
      typeof captured === 'object' &&
      'then' in captured &&
      typeof (captured as PromiseLike<R>).then === 'function'
    ) {
      const promise = captured as PromiseLike<R>
      return this.tryAsync(() => promise)
    }
    return sync
  }

  /** The sync part of `try`. Just use `try` instead. */
  static trySync<T extends typeof TypedError, R extends ResultLike<R>>(
    this: T,
    fn: () => R,
  ): Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>> {
    try {
      return fn()
    } catch (error) {
      return err(this.fromAny(error) as ReturnType<T['fromAny']>)
    }
  }

  /** The async part of `try`. Just use `try` instead. */
  static tryAsync<T extends typeof TypedError, R extends ResultLike<R>>(
    this: T,
    fn: () => PromiseLike<R>,
  ): AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>> {
    return AsyncResult.from(async () => {
      try {
        return await fn()
      } catch (error) {
        return err(this.fromAny(error) as ReturnType<T['fromAny']>)
      }
    })
  }
}
