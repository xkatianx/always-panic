import type {
  ErrContent,
  OkContent,
  Result,
  ResultLike,
} from '../result/index.js'
import { AsyncResult, err } from '../result/index.js'

export type Code = number

export class MyErrorBase<T extends Code> extends Error {
  readonly code: T

  constructor(code: T, message: string) {
    super(message)
    this.name = 'MyErrorBase'
    this.code = code
  }

  changeMessage(message: string | ((message: string) => string)): this {
    this.message = message instanceof Function ? message(this.message) : message
    return this
  }

  /** Generate an instance of this error from anything. Used by `try`. */
  static fromAny(e: unknown): MyErrorBase<Code> {
    const err = e instanceof Error ? e : new Error(String(e))
    const base = new MyErrorBase(0, err.message)
    if (err.stack) base.stack = err.stack
    if (err.cause) base.cause = err.cause
    return base
  }

  /** Try to run a function and return a Result or AsyncResult.
   *  Anything thrown by the function will be converted by `fromAny`.
   */
  static try<T extends typeof MyErrorBase, R extends ResultLike<R>>(
    this: T,
    fn: () => R,
  ): Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>
  static try<T extends typeof MyErrorBase, R extends ResultLike<R>>(
    this: T,
    fn: () => PromiseLike<R>,
  ): AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>
  static try<T extends typeof MyErrorBase, R extends ResultLike<R>>(
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
  static trySync<T extends typeof MyErrorBase, R extends ResultLike<R>>(
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
  static tryAsync<T extends typeof MyErrorBase, R extends ResultLike<R>>(
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
