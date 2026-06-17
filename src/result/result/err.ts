import type {
  DeepReadonly,
  ErrContent,
  OkContent,
  Result,
  ResultBase,
} from './type.js'

class Err<E> implements ResultBase<never, E> {
  constructor(public readonly error: E) {}

  isOk(): this is never {
    return false
  }

  isErr(): this is Err<E> {
    return true
  }

  expect(message: string): never {
    const e = new Error(message)
    if (
      this.error instanceof Error &&
      'causeForUnwrap' in this.error &&
      this.error.causeForUnwrap === true
    ) {
      e.cause = this.error
    }
    throw e
  }

  unwrap(): never {
    const e = new Error(
      `Called unwrap() on an Err value: ${String(this.error)}`,
    )
    if (
      this.error instanceof Error &&
      'causeForUnwrap' in this.error &&
      this.error.causeForUnwrap === true
    ) {
      e.cause = this.error
    }
    throw e
  }

  unwrapErr(): E {
    return this.error
  }

  unwrapOr<T2>(defaultValue: T2): T2 {
    return defaultValue
  }

  unwrapOrElse<T2>(fn: (error: E) => T2): T2 {
    return fn(this.error)
  }

  map<_>(_fn: unknown): this {
    return this
  }

  mapErr<E2>(fn: (error: E) => E2): Err<E2> {
    return new Err(fn(this.error))
  }

  mapOr<U1, _>(defaultValue: U1, _fn: unknown): U1 {
    return defaultValue
  }

  mapOrElse<U1, _>(defaultValue: (error: E) => U1, _fn: unknown): U1 {
    return defaultValue(this.error)
  }

  and(_res: unknown): this {
    return this
  }

  andThen(_fn: unknown): this {
    return this
  }

  or<R extends Result<OkContent<R>, ErrContent<R>>>(res: R): R {
    return res
  }

  orElse<R extends Result<OkContent<R>, ErrContent<R>>>(
    fn: (error: E) => R,
  ): R {
    return fn(this.error)
  }

  inspect(_fn: unknown): this {
    return this
  }

  inspectErr(fn: (error: DeepReadonly<E>) => void): this {
    fn(this.error as DeepReadonly<E>)
    return this
  }
}

export default Err
