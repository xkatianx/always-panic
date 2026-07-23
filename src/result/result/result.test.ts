import { describe, expect, expectTypeOf, it, mock } from 'bun:test'
import { UnexpectedError, UnexpectedErrorCode } from '../../error/index.js'
import {
  type DeepReadonly,
  err,
  type MaybeResult,
  ok,
  type Result,
} from '../index.js'
import AsyncResult from './asyncResult.js'
import Err from './err.js'
import Ok from './ok.js'
import util from './util.js'

type T1 = { T1: number }
type T2 = { T2: number }
type T3 = { T3: number }
type T4 = { T4: number }

const t1: T1 = { T1: 1 }
const t2: T2 = { T2: 2 }
const t3: T3 = { T3: 3 }
const t4: T4 = { T4: 4 }

describe('Result', () => {
  describe('isOk and isErr', () => {
    it('Ok is Ok', () => {
      expect(new Ok(t1).isOk()).toBe(true)
    })

    it('Ok is not Err', () => {
      expect(new Ok(t1).isErr()).toBe(false)
    })

    it('Err is Err', () => {
      expect(new Err(t1).isErr()).toBe(true)
    })

    it('Err is not Ok', () => {
      expect(new Err(t1).isOk()).toBe(false)
    })

    it('Narrows type', () => {
      const result = null as Result<T1, T2> | null
      if (result?.isOk()) {
        expectTypeOf(result).toEqualTypeOf<Ok<T1>>()
      }
      if (result?.isErr()) {
        expectTypeOf(result).toEqualTypeOf<Err<T2>>()
      }
    })
  })

  describe('expect', () => {
    const expectMessage = 'expect failed'

    it('should work with Ok', () => {
      const result = new Ok(t1)
      const expected = result.expect(expectMessage)
      expect(expected).toEqual(t1)
      expectTypeOf(expected).toEqualTypeOf<T1>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      expect(() => result.expect(expectMessage)).toThrow(expectMessage)
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const expected = result.expect(expectMessage)
      expect(expected).toEqual(t1)
      expectTypeOf(expected).toEqualTypeOf<T1>()
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      expect(() => result.expect(expectMessage)).toThrow(expectMessage)
    })
  })

  describe('unwrap', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const unwrapped = result.unwrap()
      expect(unwrapped).toEqual(t1)
      expectTypeOf(unwrapped).toEqualTypeOf<T1>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      expect(() => result.unwrap()).toThrow()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const unwrapped = result.unwrap()
      expect(unwrapped).toEqual(t1)
      expectTypeOf(unwrapped).toEqualTypeOf<T1>()
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      expect(() => result.unwrap()).toThrow()
    })
  })

  describe('unwrapErr', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      expect(() => result.unwrapErr()).toThrow()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const unwrappedErr = result.unwrapErr()
      expect(unwrappedErr).toEqual(t2)
      expectTypeOf(unwrappedErr).toEqualTypeOf<T2>()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      expect(() => result.unwrapErr()).toThrow()
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      const unwrappedErr = result.unwrapErr()
      expect(unwrappedErr).toEqual(t2)
      expectTypeOf(unwrappedErr).toEqualTypeOf<T2>()
    })
  })

  describe('unwrapOr', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const unwrapped = result.unwrapOr(t2)
      expect(unwrapped).toEqual(t1)
      expectTypeOf(unwrapped).toEqualTypeOf<T1>()
    })

    it('should work with Err', () => {
      const result = new Err(t1)
      const unwrapped = result.unwrapOr(t2)
      expect(unwrapped).toEqual(t2)
      expectTypeOf(unwrapped).toEqualTypeOf<T2>()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const unwrapped = result.unwrapOr(t3)
      expect(unwrapped).toEqual(t1)
      expectTypeOf(unwrapped).toEqualTypeOf<T1 | T3>()
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      const unwrapped = result.unwrapOr(t3)
      expect(unwrapped).toEqual(t3)
      expectTypeOf(unwrapped).toEqualTypeOf<T1 | T3>()
    })
  })

  describe('unwrapOrElse', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const onErr = mock(() => t3)
      const unwrapped = result.unwrapOrElse(onErr)
      expect(unwrapped).toEqual(t1)
      expect(onErr).toHaveBeenCalledTimes(0)
      expectTypeOf(unwrapped).toEqualTypeOf<T1>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const onErr = mock(() => t3)
      const unwrapped = result.unwrapOrElse(onErr)
      expect(unwrapped).toEqual(t3)
      expect(onErr).toHaveBeenCalledTimes(1)
      expect(onErr).toHaveBeenCalledWith(t2)
      expectTypeOf(unwrapped).toEqualTypeOf<T3>()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const onErr = mock(() => t3)
      const unwrapped = result.unwrapOrElse(onErr)
      expect(unwrapped).toEqual(t1)
      expect(onErr).toHaveBeenCalledTimes(0)
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      const onErr = mock(() => t3)
      const unwrapped = result.unwrapOrElse(onErr)
      expect(unwrapped).toEqual(t3)
      expect(onErr).toHaveBeenCalledTimes(1)
      expect(onErr).toHaveBeenCalledWith(t2)
    })

    it('should infer implicit callback types', () => {
      const result = err(t2) as Result<T1, T2>
      expectTypeOf(
        result.unwrapOrElse((x) => {
          expectTypeOf(x).toEqualTypeOf<T2>()
          return t3
        }),
      ).toEqualTypeOf<T1 | T3>()
    })
  })

  describe('map', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const mapper = mock(() => t3)
      const mapped = result.map(mapper)
      expect(mapped.unwrap()).toEqual(t3)
      expect(mapped).not.toBe(result)
      expect(mapper).toHaveBeenCalledTimes(1)
      expect(mapper).toHaveBeenCalledWith(t1)
      expectTypeOf(mapped).toEqualTypeOf<Ok<T3>>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const mapper = mock(() => t3)
      const mapped = result.map(mapper)
      expect(mapped.unwrapErr()).toEqual(t2)
      expect(mapped).toBe(result)
      expect(mapper).toHaveBeenCalledTimes(0)
      expectTypeOf(mapped).toEqualTypeOf<Err<T2>>()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const mapper = mock(() => t3)
      const mapped = result.map(mapper)
      expect(mapped.unwrap()).toEqual(t3)
      expect(mapped).not.toBe(result)
      expect(mapper).toHaveBeenCalledTimes(1)
      expect(mapper).toHaveBeenCalledWith(t1)
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      const mapper = mock(() => t3)
      const mapped = result.map(mapper)
      expect(mapped.unwrapErr()).toEqual(t2)
      expect(mapped).toBe<Result<T1, T2>>(result)
      expect(mapper).toHaveBeenCalledTimes(0)
    })

    it('should infer implicit callback types', () => {
      const result = ok(t1) as Result<T1, T2>
      expectTypeOf(
        util.asIs(
          result.map((x) => {
            expectTypeOf(x).toEqualTypeOf<T1>()
            return t3
          }),
        ),
      ).toEqualTypeOf<Result<T3, T2>>()
    })
  })

  describe('mapErr', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const mapper = mock(() => t4)
      const mapped = result.mapErr(mapper)
      expect(mapped.unwrap()).toEqual(t1)
      expect(mapped).toBe(result)
      expect(mapper).toHaveBeenCalledTimes(0)
      expectTypeOf(mapped).toEqualTypeOf<Ok<T1>>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const mapper = mock(() => t4)
      const mapped = result.mapErr(mapper)
      expect(mapped.unwrapErr()).toEqual(t4)
      expect(mapped).not.toBe(result)
      expect(mapper).toHaveBeenCalledTimes(1)
      expect(mapper).toHaveBeenCalledWith(t2)
      expectTypeOf(mapped).toEqualTypeOf<Err<T4>>()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const mapper = mock(() => t4)
      const mapped = result.mapErr(mapper)
      expect(mapped.unwrap()).toEqual(t1)
      expect(mapped).toBe<Result<T1, T2>>(result)
      expect(mapper).toHaveBeenCalledTimes(0)
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      const mapper = mock(() => t4)
      const mapped = result.mapErr(mapper)
      expect(mapped.unwrapErr()).toEqual(t4)
      expect(mapped).not.toBe(result)
      expect(mapper).toHaveBeenCalledTimes(1)
      expect(mapper).toHaveBeenCalledWith(t2)
    })

    it('should infer implicit callback types', () => {
      const result = err(t2) as Result<T1, T2>
      expectTypeOf(
        util.asIs(
          result.mapErr((x) => {
            expectTypeOf(x).toEqualTypeOf<T2>()
            return t4
          }),
        ),
      ).toEqualTypeOf<Result<T1, T4>>()
    })
  })

  describe('mapOr', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const mapper = mock(() => t3)
      const mapped = result.mapOr(t4, mapper)
      expect(mapped).toEqual(t3)
      expect(mapper).toHaveBeenCalledTimes(1)
      expect(mapper).toHaveBeenCalledWith(t1)
      expectTypeOf(mapped).toEqualTypeOf<T3>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const mapper = mock(() => t3)
      const mapped = result.mapOr(t4, mapper)
      expect(mapped).toEqual(t4)
      expect(mapper).toHaveBeenCalledTimes(0)
      expectTypeOf(mapped).toEqualTypeOf<T4>()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const mapper = mock(() => t3)
      const mapped = result.mapOr(t4, mapper)
      expect(mapped).toEqual(t3)
      expect(mapper).toHaveBeenCalledTimes(1)
      expect(mapper).toHaveBeenCalledWith(t1)
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      const mapper = mock(() => t3)
      const mapped = result.mapOr(t4, mapper)
      expect(mapped).toEqual(t4)
      expect(mapper).toHaveBeenCalledTimes(0)
    })

    it('should infer implicit callback types', () => {
      const result = ok(t1) as Result<T1, T2>
      expectTypeOf(
        result.mapOr(t4, (x) => {
          expectTypeOf(x).toEqualTypeOf<T1>()
          return t3
        }),
      ).toEqualTypeOf<T3 | T4>()
    })
  })

  describe('mapOrElse', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const defaultFn = mock(() => t4)
      const mapper = mock(() => t3)
      const mapped = result.mapOrElse(defaultFn, mapper)
      expect(mapped).toEqual(t3)
      expect(mapper).toHaveBeenCalledTimes(1)
      expect(mapper).toHaveBeenCalledWith(t1)
      expect(defaultFn).toHaveBeenCalledTimes(0)
      expectTypeOf(mapped).toEqualTypeOf<T3>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const defaultFn = mock(() => t4)
      const mapper = mock(() => t3)
      const mapped = result.mapOrElse(defaultFn, mapper)
      expect(mapped).toEqual(t4)
      expect(defaultFn).toHaveBeenCalledTimes(1)
      expect(defaultFn).toHaveBeenCalledWith(t2)
      expect(mapper).toHaveBeenCalledTimes(0)
      expectTypeOf(mapped).toEqualTypeOf<T4>()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const defaultFn = mock(() => t4)
      const mapper = mock(() => t3)
      const mapped = result.mapOrElse(defaultFn, mapper)
      expect(mapped).toEqual(t3)
      expect(mapper).toHaveBeenCalledTimes(1)
      expect(mapper).toHaveBeenCalledWith(t1)
      expect(defaultFn).toHaveBeenCalledTimes(0)
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      const defaultFn = mock(() => t4)
      const mapper = mock(() => t3)
      const mapped = result.mapOrElse(defaultFn, mapper)
      expect(mapped).toEqual(t4)
      expect(defaultFn).toHaveBeenCalledTimes(1)
      expect(defaultFn).toHaveBeenCalledWith(t2)
      expect(mapper).toHaveBeenCalledTimes(0)
    })

    it('should infer implicit callback types', () => {
      const result = ok(t1) as Result<T1, T2>
      expectTypeOf(
        result.mapOrElse(
          (x) => {
            expectTypeOf(x).toEqualTypeOf<T2>()
            return t4
          },
          (x) => {
            expectTypeOf(x).toEqualTypeOf<T1>()
            return t3
          },
        ),
      ).toEqualTypeOf<T3 | T4>()
    })
  })

  describe('and', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const other = new Ok(t3)
      const chained = result.and(other)
      expect(chained.isOk()).toBe(true)
      expect(chained.unwrap()).toEqual(t3)
      expect(chained).toBe(other)
      expectTypeOf(chained).toEqualTypeOf<Ok<T3>>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const other = new Ok(t3)
      const chained = result.and(other)
      expect(chained.isErr()).toBe(true)
      expect(chained.unwrapErr()).toEqual(t2)
      expect(chained).toBe(result)
      expectTypeOf(chained).toEqualTypeOf<Err<T2>>()
    })

    it('should work with Result containing Ok', () => {
      {
        const result = ok(t1) as Result<T1, T2>
        const other = ok(t3) as Result<T3, T4>
        const chained = result.and(other)
        expect(chained.isOk()).toBe(true)
        expect(chained.unwrap()).toEqual(t3)
        expect(chained).toBe(other)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T3, T2 | T4>>()
      }
      {
        const result = ok(t1) as Result<T1, T2>
        const other = err(t4) as Result<T3, T4>
        const chained = result.and(other)
        expect(chained.isErr()).toBe(true)
        expect(chained.unwrapErr()).toEqual(t4)
        expect(chained).toBe(other)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T3, T2 | T4>>()
      }
    })

    it('should work with Result containing Err', () => {
      {
        const result = err(t2) as Result<T1, T2>
        const other = ok(t3) as Result<T3, T4>
        const chained = result.and(other)
        expect(chained.isErr()).toBe(true)
        expect(chained.unwrapErr()).toBe(t2)
        expect(chained).toBe<Result<T1, T2>>(result)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T3, T2 | T4>>()
      }
      {
        const result = err(t2) as Result<T1, T2>
        const other = err(t4) as Result<T3, T4>
        const chained = result.and(other)
        expect(chained.isErr()).toBe(true)
        expect(chained.unwrapErr()).toBe(t2)
        expect(chained).toBe<Result<T1, T2>>(result)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T3, T2 | T4>>()
      }
    })
  })

  describe('andThen', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const fn = mock(() => new Ok(t3))
      const chained = result.andThen(fn)
      expect(chained.isOk()).toBe(true)
      expect(chained.unwrap()).toEqual(t3)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(t1)
      expectTypeOf(chained).toEqualTypeOf<Ok<T3>>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const fn = mock(() => new Ok(t3))
      const chained = result.andThen(fn)
      expect(chained.isErr()).toBe(true)
      expect(chained.unwrapErr()).toEqual(t2)
      expect(chained).toBe(result)
      expect(fn).toHaveBeenCalledTimes(0)
      expectTypeOf(chained).toEqualTypeOf<Err<T2>>()
    })

    it('should work with Result containing Ok', () => {
      {
        const result = ok(t1) as Result<T1, T2>
        const fn = mock(() => ok(t3))
        const chained = result.andThen(fn)
        expect(chained.isOk()).toBe(true)
        expect(chained.unwrap()).toEqual(t3)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith(t1)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T3, T2>>()
      }
      {
        const result = ok(t1) as Result<T1, T2>
        const fn = mock(() => err(t4))
        const chained = result.andThen(fn)
        expect(chained.isErr()).toBe(true)
        expect(chained.unwrapErr()).toEqual(t4)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith(t1)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<never, T2 | T4>>()
      }
    })

    it('should work with Result containing Err', () => {
      {
        const result = err(t2) as Result<T1, T2>
        const fn = mock(() => ok(t3))
        const chained = result.andThen(fn)
        expect(chained.isErr()).toBe(true)
        expect(chained.unwrapErr()).toEqual(t2)
        expect(chained).toBe<Result<T1, T2>>(result)
        expect(fn).toHaveBeenCalledTimes(0)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T3, T2>>()
      }
      {
        const result = err(t2) as Result<T1, T2>
        const fn = mock(() => err(t4))
        const chained = result.andThen(fn)
        expect(chained.isErr()).toBe(true)
        expect(chained.unwrapErr()).toEqual(t2)
        expect(chained).toBe<Result<T1, T2>>(result)
        expect(fn).toHaveBeenCalledTimes(0)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<never, T2 | T4>>()
      }
    })

    it('should infer implicit callback types', () => {
      ;(ok(t1) as Result<T1, T2>).andThen((x) => {
        expectTypeOf(x).toEqualTypeOf<T1>()
        return ok(t3)
      })
    })
  })

  describe('or', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const other = new Ok(t3)
      const chained = result.or(other)
      expect(chained.isOk()).toBe(true)
      expect(chained.unwrap()).toEqual(t1)
      expect(chained).toBe(result)
      expectTypeOf(chained).toEqualTypeOf<Ok<T1>>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const other = new Ok(t3)
      const chained = result.or(other)
      expect(chained.isOk()).toBe(true)
      expect(chained.unwrap()).toEqual(t3)
      expect(chained).toBe(other)
      expectTypeOf(chained).toEqualTypeOf<Ok<T3>>()
    })

    it('should work with Result containing Ok', () => {
      {
        const result = ok(t1) as Result<T1, T2>
        const other = ok(t3) as Result<T3, T4>
        const chained = result.or(other)
        expect(chained.isOk()).toBe(true)
        expect(chained.unwrap()).toEqual(t1)
        expect(chained).toBe<Result<T1, T2>>(result)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T1 | T3, T4>>()
      }
      {
        const result = ok(t1) as Result<T1, T2>
        const other = err(t4) as Result<T3, T4>
        const chained = result.or(other)
        expect(chained.isOk()).toBe(true)
        expect(chained.unwrap()).toEqual(t1)
        expect(chained).toBe<Result<T1, T2>>(result)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T1 | T3, T4>>()
      }
    })

    it('should work with Result containing Err', () => {
      {
        const result = err(t2) as Result<T1, T2>
        const other = ok(t3) as Result<T3, T4>
        const chained = result.or(other)
        expect(chained.isOk()).toBe(true)
        expect(chained.unwrap()).toEqual(t3)
        expect(chained).toBe(other)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T1 | T3, T4>>()
      }
      {
        const result = err(t2) as Result<T1, T2>
        const other = err(t4) as Result<T3, T4>
        const chained = result.or(other)
        expect(chained.isErr()).toBe(true)
        expect(chained.unwrapErr()).toEqual(t4)
        expect(chained).toBe(other)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T1 | T3, T4>>()
      }
    })
  })

  describe('orElse', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const fn = mock(() => new Ok(t3))
      const chained = result.orElse(fn)
      expect(chained.isOk()).toBe(true)
      expect(chained.unwrap()).toEqual(t1)
      expect(chained).toBe(result)
      expect(fn).toHaveBeenCalledTimes(0)
      expectTypeOf(chained).toEqualTypeOf<Ok<T1>>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const fn = mock(() => new Ok(t3))
      const chained = result.orElse(fn)
      expect(chained.isOk()).toBe(true)
      expect(chained.unwrap()).toEqual(t3)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(t2)
      expectTypeOf(chained).toEqualTypeOf<Ok<T3>>()
    })

    it('should work with Result containing Ok', () => {
      {
        const result = ok(t1) as Result<T1, T2>
        const fn = mock(() => ok(t3))
        const chained = result.orElse(fn)
        expect(chained.isOk()).toBe(true)
        expect(chained.unwrap()).toEqual(t1)
        expect(chained).toBe<Result<T1, T2>>(result)
        expect(fn).toHaveBeenCalledTimes(0)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T1 | T3, never>>()
      }
      {
        const result = ok(t1) as Result<T1, T2>
        const fn = mock(() => err(t4))
        const chained = result.orElse(fn)
        expect(chained.isOk()).toBe(true)
        expect(chained.unwrap()).toEqual(t1)
        expect(chained).toBe<Result<T1, T2>>(result)
        expect(fn).toHaveBeenCalledTimes(0)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T1, T4>>()
      }
    })

    it('should work with Result containing Err', () => {
      {
        const result = err(t2) as Result<T1, T2>
        const fn = mock(() => ok(t3))
        const chained = result.orElse(fn)
        expect(chained.isOk()).toBe(true)
        expect(chained.unwrap()).toEqual(t3)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith(t2)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T1 | T3, never>>()
      }
      {
        const result = err(t2) as Result<T1, T2>
        const fn = mock(() => err(t4))
        const chained = result.orElse(fn)
        expect(chained.isErr()).toBe(true)
        expect(chained.unwrapErr()).toEqual(t4)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith(t2)
        expectTypeOf(util.asIs(chained)).toEqualTypeOf<Result<T1, T4>>()
      }
    })

    it('should infer implicit callback types', () => {
      ;(err(t2) as Result<T1, T2>).orElse((x) => {
        expectTypeOf(x).toEqualTypeOf<T2>()
        return ok(t3)
      })
    })
  })

  describe('inspect', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const callback = mock(() => {})
      const inspected = result.inspect(callback)
      expect(inspected).toBe(result)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(t1)
      expectTypeOf(inspected).toEqualTypeOf<Ok<T1>>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const callback = mock(() => {})
      const inspected = result.inspect(callback)
      expect(inspected).toBe(result)
      expect(callback).toHaveBeenCalledTimes(0)
      expectTypeOf(inspected).toEqualTypeOf<Err<T2>>()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const callback = mock(() => {})
      const inspected = result.inspect(callback)
      expect(inspected.isOk()).toBe(true)
      expect(inspected).toBe(result)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(t1)
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      const callback = mock(() => {})
      const inspected = result.inspect(callback)
      expect(inspected.isErr()).toBe(true)
      expect(inspected).toBe(result)
      expect(callback).toHaveBeenCalledTimes(0)
    })

    it('should infer implicit callback types', () => {
      const result = ok(t1) as Result<T1, T2>
      expectTypeOf(
        util.asIs(
          result.inspect((x) => {
            expectTypeOf(x).toEqualTypeOf<DeepReadonly<T1>>()
          }),
        ),
      ).toEqualTypeOf<Result<T1, T2>>()
    })
  })

  describe('inspectErr', () => {
    it('should work with Ok', () => {
      const result = new Ok(t1)
      const callback = mock(() => {})
      const inspected = result.inspectErr(callback)
      expect(inspected).toBe(result)
      expect(callback).toHaveBeenCalledTimes(0)
      expectTypeOf(inspected).toEqualTypeOf<Ok<T1>>()
    })

    it('should work with Err', () => {
      const result = new Err(t2)
      const callback = mock(() => {})
      const inspected = result.inspectErr(callback)
      expect(inspected).toBe(result)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(t2)
      expectTypeOf(inspected).toEqualTypeOf<Err<T2>>()
    })

    it('should work with Result containing Ok', () => {
      const result = ok(t1) as Result<T1, T2>
      const callback = mock(() => {})
      const inspected = result.inspectErr(callback)
      expect(inspected.isOk()).toBe(true)
      expect(inspected).toBe(result)
      expect(callback).toHaveBeenCalledTimes(0)
    })

    it('should work with Result containing Err', () => {
      const result = err(t2) as Result<T1, T2>
      const callback = mock(() => {})
      const inspected = result.inspectErr(callback)
      expect(inspected.isErr()).toBe(true)
      expect(inspected).toBe(result)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(t2)
    })

    it('should infer implicit callback types', () => {
      const result = err(t2) as Result<T1, T2>
      expectTypeOf(
        util.asIs(
          result.inspectErr((x) => {
            expectTypeOf(x).toEqualTypeOf<DeepReadonly<T2>>()
          }),
        ),
      ).toEqualTypeOf<Result<T1, T2>>()
    })
  })
})

describe('utils', () => {
  describe('asIs', () => {
    it('should merge `Result<T1, T2> | Err<T3>` to `Result<T1, T2 | T3>`', () => {
      const result = null as unknown as Result<T1, T2> | Err<T3>
      expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<T1, T2 | T3>>()
    })
    it('should merge `Result<T1, T2> | Ok<T3>` to `Result<T1 | T3, T2>`', () => {
      const result = null as unknown as Result<T1, T2> | Ok<T3>
      expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<T1 | T3, T2>>()
    })
    it('should merge `Result<T1, T2> | Result<T3, T4>` to `Result<T1 | T3, T2 | T4>`', () => {
      const result = null as unknown as Result<T1, T2> | Result<T3, T4>
      expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<T1 | T3, T2 | T4>>()
    })
    it('should merge `Ok<T1> | Ok<T2>` to `Result<T1 | T2, never>`', () => {
      const result = null as unknown as Ok<T1> | Ok<T2>
      expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<T1 | T2, never>>()
    })
    it('should merge `Err<T1> | Err<T2>` to `Result<never, T1 | T2>`', () => {
      const result = null as unknown as Err<T1> | Err<T2>
      expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<never, T1 | T2>>()
    })
    it('should merge `Ok<T1> | Err<T2> | Err<T3>` to `Result<T1, T2 | T3>`', () => {
      const result = null as unknown as Ok<T1> | Err<T2> | Err<T3>
      expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<T1, T2 | T3>>()
    })
    it('should merge `Ok<T1> | Ok<T2> | Err<T3>` to `Result<T1 | T2, T3>`', () => {
      const result = null as unknown as Ok<T1> | Ok<T2> | Err<T3>
      expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<T1 | T2, T3>>()
    })
  })

  describe('ok', () => {
    it('should create an Ok value with type Result<T, never>', () => {
      const result = ok(t1)
      expect(result.isOk()).toBe(true)
      expect(result.isErr()).toBe(false)
      expect(result.unwrap()).toBe(t1)
      expectTypeOf(result).toEqualTypeOf<Result<T1, never>>()
    })

    it('should create an Ok(undefined) with type Result<void, never> when called with no argument', () => {
      const result = ok()
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBeUndefined()
      expectTypeOf(result).toEqualTypeOf<Result<void, never>>()
    })
  })

  describe('err', () => {
    it('should create an Err value with type Result<never, T>', () => {
      const result = err(t1)
      expect(result.isOk()).toBe(false)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe(t1)
      expectTypeOf(result).toEqualTypeOf<Result<never, T1>>()
    })
  })

  describe('all', () => {
    it('should return Ok([values]) when every input is Ok', () => {
      const result = util.all([ok(t1), ok(t2), ok(t3)])
      expectTypeOf(result).toEqualTypeOf<Result<[T1, T2, T3], never>>()
      expect(result).toEqual(ok([t1, t2, t3]))
    })

    it('should return the first Err in array order', () => {
      const result = util.all([ok(t1), err(t4), err(t2), ok(t3)])
      expectTypeOf(result).toEqualTypeOf<
        Result<[T1, never, never, T3], T4 | T2>
      >()
      expect(result).toEqual(err(t4))
    })

    it('should return Ok([]) for an empty array', () => {
      const result = util.all([])
      expectTypeOf(result).toEqualTypeOf<Result<[], never>>()
      expect(result).toEqual(ok([]))
    })
  })

  describe('isResult', () => {
    it('should return true for Ok and Err instances', () => {
      expect(util.isResult(new Ok(t1))).toBe(true)
      expect(util.isResult(new Err(t2))).toBe(true)
      expect(util.isResult(ok(t3))).toBe(true)
      expect(util.isResult(err(t4))).toBe(true)
    })

    it('should return false for non-Result values', () => {
      expect(util.isResult(null)).toBe(false)
      expect(util.isResult(undefined)).toBe(false)
      expect(util.isResult(t1)).toBe(false)
      expect(util.isResult({ isOk: () => true })).toBe(false)
      expect(util.isResult(Promise.resolve(ok(t1)))).toBe(false)
    })

    it('should narrow types', () => {
      const value = ok(t3) as Ok<T1> | Result<T3, T4> | Err<T2> | null | T1 | T2
      if (util.isResult(value)) {
        expectTypeOf(util.asIs(value)).toEqualTypeOf<Result<T1 | T3, T2 | T4>>()
        expect(value.unwrap()).toEqual(t3)
      } else {
        expectTypeOf(value).toEqualTypeOf<null | T1 | T2>()
        expect.unreachable()
      }
    })
  })

  describe('fromMaybe', () => {
    it('should wrap a bare value in Ok', () => {
      const result = util.fromMaybe(t1)
      expectTypeOf(result).toEqualTypeOf<Result<T1, never>>()
      expect(result).toEqual(ok(t1))
    })

    it('should return a Result by reference', () => {
      {
        const input = ok(t3) as Result<T3, T4>
        const result = util.fromMaybe(input)
        expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<T3, T4>>()
        expect(result).toBe(input)
      }
      {
        const input = err(t4) as Result<T3, T4>
        const result = util.fromMaybe(input)
        expect(result).toBe(input)
      }
    })

    it('should normalize a MaybeResult union', () => {
      {
        const value = t1 as MaybeResult<T1, T2>
        const result = util.fromMaybe(value)
        expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<T1, T2>>()
        expect(result).toEqual(ok(t1))
      }
      {
        const value = err(t2) as MaybeResult<T1, T2>
        const result = util.fromMaybe(value)
        expect(result).toEqual(err(t2))
      }
    })

    it('should keep bare and Ok members of a mixed union in the Ok type', () => {
      const value = t1 as T1 | Result<T3, T4>
      const result = util.fromMaybe(value)
      expectTypeOf(util.asIs(result)).toEqualTypeOf<Result<T1 | T3, T4>>()
      expect(result).toEqual(ok(t1))
    })

    it('should wrap undefined and null in Ok', () => {
      expect(util.fromMaybe(undefined)).toEqual(ok(undefined))
      expect(util.fromMaybe(null)).toEqual(ok(null))
    })
  })

  describe('panic', () => {
    const unexpected = new UnexpectedError(
      UnexpectedErrorCode.UNKNOWN,
      'unexpected',
    )

    it('should return Ok unchanged', () => {
      const input = ok(t3)
      const result = util.panic(input)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual(t3)
      expect(result).toBe(input)
      expectTypeOf(result).toEqualTypeOf<Result<T3, never>>()
    })

    it('should return Err unchanged for non-UnexpectedError', () => {
      const result = util.panic(err(t4))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toEqual(t4)
      expectTypeOf(result).toEqualTypeOf<Result<never, T4>>()
    })

    it('should throw UnexpectedError', () => {
      const result = err(unexpected) as Result<
        T1,
        UnexpectedError<UnexpectedErrorCode>
      >
      expect(() => util.panic(result)).toThrow()
    })

    it('should exclude UnexpectedError from the Err union', () => {
      const result = err(t4) as Result<
        T1,
        T4 | UnexpectedError<UnexpectedErrorCode>
      >
      expectTypeOf(util.panic(result)).toEqualTypeOf<Result<T1, T4>>()
    })

    it('should dispatch to panicSync for a Result', () => {
      expect(util.panic(ok(t3))).toBeInstanceOf(Ok)
      expect(util.panicSync(ok(t3))).toBeInstanceOf(Ok)
    })
  })

  describe('panicAsync', () => {
    const unexpected = new UnexpectedError(
      UnexpectedErrorCode.UNKNOWN,
      'unexpected',
    )

    it('should return Ok unchanged for an AsyncResult', async () => {
      const result = await util.panic(AsyncResult.from(ok(t3)))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual(t3)
    })

    it('should return Ok unchanged for a Promise<Result>', async () => {
      const result = await util.panic(Promise.resolve(ok(t3)))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual(t3)
    })

    it('should return Err unchanged for non-UnexpectedError', async () => {
      const result = await util.panic(AsyncResult.from(err(t4)))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toEqual(t4)
    })

    it('should reject with UnexpectedError instead of throwing', async () => {
      const input = AsyncResult.from(
        err(unexpected) as Result<T1, UnexpectedError<UnexpectedErrorCode>>,
      )
      // The panic surfaces as a rejection; calling panic must not throw here.
      const panicked = util.panic(input)
      expect(Promise.resolve(panicked)).rejects.toThrow()
    })

    it('should attach UnexpectedError as cause of the rejection', async () => {
      const input = AsyncResult.from(
        err(unexpected) as Result<T1, UnexpectedError<UnexpectedErrorCode>>,
      )
      const error = await Promise.resolve(util.panic(input)).catch((e) => e)
      expect(error).toBeInstanceOf(Error)
      expect(error.cause).toBe(unexpected)
    })

    it('should propagate an underlying rejection', async () => {
      const boom = new Error('boom')
      const input = Promise.reject(boom) as Promise<Result<T1, T4>>
      expect(Promise.resolve(util.panic(input))).rejects.toThrow(boom)
    })

    it('should return an AsyncResult, not a Promise', () => {
      expect(util.panic(AsyncResult.from(ok(t3)))).toBeInstanceOf(AsyncResult)
      expect(util.panicAsync(AsyncResult.from(ok(t3)))).toBeInstanceOf(
        AsyncResult,
      )
    })

    it('should exclude UnexpectedError from the Err union', () => {
      const input = AsyncResult.from(
        err(t4) as Result<T1, T4 | UnexpectedError<UnexpectedErrorCode>>,
      )
      expectTypeOf(util.panic(input)).toEqualTypeOf<AsyncResult<T1, T4>>()
      expectTypeOf(util.panicAsync(input)).toEqualTypeOf<AsyncResult<T1, T4>>()
    })

    it('should stay chainable after panicking', async () => {
      const result = await util
        .panic(AsyncResult.from(ok(t3)))
        .map((v) => v.T3 + 1)
      expect(result.unwrap()).toBe(4)
    })
  })
})

describe('equality', () => {
  it('ok({ a: 1 }) to strict equal ok({ a: 1 })', () => {
    expect(ok({ a: 1 })).toStrictEqual(ok({ a: 1 }))
  })
  it('ok(1) not to be ok(1)', () => {
    expect(ok(1)).not.toBe(ok(1))
  })
  it('err({ a: 1 }) to strict equal err({ a: 1 })', () => {
    expect(err({ a: 1 })).toStrictEqual(err({ a: 1 }))
  })
  it('err(1) not to be err(1)', () => {
    expect(err(1)).not.toBe(err(1))
  })
})
