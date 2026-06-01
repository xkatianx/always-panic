/** biome-ignore-all lint/suspicious/noThenProperty: feature */
import { describe, expect, expectTypeOf, it, mock } from 'bun:test'
import { err, ok } from '../index.js'
import AsyncResult from './asyncResult'
import Err from './err.js'
import Ok from './ok.js'
import type { DeepReadonly, Result } from './type.js'

type T1 = { T1: number }
type T2 = { T2: number }
type T3 = { T3: number }
type T4 = { T4: number }

const t1: T1 = { T1: 1 }
const t2: T2 = { T2: 2 }
const t3: T3 = { T3: 3 }
const t4: T4 = { T4: 4 }

describe('AsyncResult', () => {
  const okT3s = [
    ok(t3),
    Promise.resolve(ok(t3)),
    new Ok(t3),
    Promise.resolve(new Ok(t3)),
    AsyncResult.from(ok(t3)),
    Promise.resolve(AsyncResult.from(ok(t3))),
  ] as const

  const okT3Fns = [
    () => ok(t3),
    async () => ok(t3),
    () => new Ok(t3),
    async () => new Ok(t3),
    () => AsyncResult.from(ok(t3)),
    async () => AsyncResult.from(ok(t3)),
  ] as const

  const errT4s = [
    err(t4),
    Promise.resolve(err(t4)),
    new Err(t4),
    Promise.resolve(new Err(t4)),
    AsyncResult.from(err(t4)),
    Promise.resolve(AsyncResult.from(err(t4))),
  ] as const

  const errT4Fns = [
    () => err(t4),
    async () => err(t4),
    () => new Err(t4),
    async () => new Err(t4),
    () => AsyncResult.from(err(t4)),
    async () => AsyncResult.from(err(t4)),
  ] as const

  const resOkT3T4s = [
    ok(t3) as Result<T3, T4>,
    Promise.resolve(ok(t3) as Result<T3, T4>),
    new Ok(t3) as Result<T3, T4>,
    Promise.resolve(new Ok(t3) as Result<T3, T4>),
    AsyncResult.from(ok(t3) as Result<T3, T4>),
    Promise.resolve(AsyncResult.from(ok(t3) as Result<T3, T4>)),
  ] as const

  const resOkT3T4Fns = [
    () => ok(t3) as Result<T3, T4>,
    async () => ok(t3) as Result<T3, T4>,
    () => new Ok(t3) as Result<T3, T4>,
    async () => new Ok(t3) as Result<T3, T4>,
    () => AsyncResult.from(ok(t3) as Result<T3, T4>),
    async () => AsyncResult.from(ok(t3) as Result<T3, T4>),
  ] as const

  const resErrT3T4s = [
    err(t4) as Result<T3, T4>,
    Promise.resolve(err(t4) as Result<T3, T4>),
    new Err(t4) as Result<T3, T4>,
    Promise.resolve(new Err(t4) as Result<T3, T4>),
    AsyncResult.from(err(t4) as Result<T3, T4>),
    Promise.resolve(AsyncResult.from(err(t4) as Result<T3, T4>)),
  ] as const

  const resErrT3T4Fns = [
    () => err(t4) as Result<T3, T4>,
    async () => err(t4) as Result<T3, T4>,
    () => new Err(t4) as Result<T3, T4>,
    async () => new Err(t4) as Result<T3, T4>,
    () => AsyncResult.from(err(t4) as Result<T3, T4>),
    async () => AsyncResult.from(err(t4) as Result<T3, T4>),
  ] as const

  describe('from', () => {
    it('should create AsyncResult from Ok', async () => {
      for (const res of okT3s) {
        const asyncResult = AsyncResult.from(res)
        expectTypeOf(asyncResult).toEqualTypeOf<AsyncResult<T3, never>>()
        const resolved = await asyncResult
        expect(resolved.unwrap()).toBe(t3)
      }
      for (const fn of resOkT3T4s) {
        const asyncResult = AsyncResult.from(fn)
        expectTypeOf(asyncResult).toEqualTypeOf<AsyncResult<T3, T4>>()
        const resolved = await asyncResult
        expect(resolved.unwrap()).toBe(t3)
      }
    })

    it('should create AsyncResult from Err', async () => {
      for (const res of errT4s) {
        const asyncResult = AsyncResult.from(res)
        expectTypeOf(asyncResult).toEqualTypeOf<AsyncResult<never, T4>>()
        const resolved = await asyncResult
        expect(resolved.unwrapErr()).toBe(t4)
      }
      for (const fn of resErrT3T4s) {
        const asyncResult = AsyncResult.from(fn)
        expectTypeOf(asyncResult).toEqualTypeOf<AsyncResult<T3, T4>>()
        const resolved = await asyncResult
        expect(resolved.unwrapErr()).toBe(t4)
      }
    })

    it('should create AsyncResult from function returning Ok', async () => {
      for (const fn2 of okT3Fns) {
        const fn = mock(fn2)
        const asyncResult = AsyncResult.from(fn)
        expectTypeOf(asyncResult).toEqualTypeOf<AsyncResult<T3, never>>()
        const resolved = await asyncResult
        expect(resolved.unwrap()).toBe(t3)
        expect(fn).toHaveBeenCalledTimes(1)
      }
      for (const fn2 of resOkT3T4Fns) {
        const fn = mock(fn2)
        const asyncResult = AsyncResult.from(fn)
        expectTypeOf(asyncResult).toEqualTypeOf<AsyncResult<T3, T4>>()
        const resolved = await asyncResult
        expect(resolved.unwrap()).toBe(t3)
        expect(fn).toHaveBeenCalledTimes(1)
      }
    })

    it('should create AsyncResult from function returning Err', async () => {
      for (const fn2 of errT4Fns) {
        const fn = mock(fn2)
        const asyncResult = AsyncResult.from(fn)
        expectTypeOf(asyncResult).toEqualTypeOf<AsyncResult<never, T4>>()
        const resolved = await asyncResult
        expect(resolved.unwrapErr()).toBe(t4)
        expect(fn).toHaveBeenCalledTimes(1)
      }
      for (const fn2 of resErrT3T4Fns) {
        const fn = mock(fn2)
        const asyncResult = AsyncResult.from(fn)
        expectTypeOf(asyncResult).toEqualTypeOf<AsyncResult<T3, T4>>()
        const resolved = await asyncResult
        expect(resolved.unwrapErr()).toBe(t4)
        expect(fn).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('then', () => {
    it('should work as Promise with onfulfilled', async () => {
      {
        const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
        const value = await asyncResult.then((result) => {
          expectTypeOf(result).toEqualTypeOf<Result<T1, T2>>()
          return result.unwrap()
        })
        expect(value).toBe(t1)
      }
      {
        const asyncResult = AsyncResult.from(err(t2) as Result<T1, T2>)
        const value = await asyncResult.then((result) => {
          expectTypeOf(result).toEqualTypeOf<Result<T1, T2>>()
          return result.unwrapErr()
        })
        expect(value).toBe(t2)
      }
    })

    it('should work with Promise chain', async () => {
      const asyncResult = AsyncResult.from(ok(t1))
      const value = await asyncResult
        .then((result) => (result.isOk() ? result.value : t2))
        .then((x) => {
          expectTypeOf(x).toEqualTypeOf<T1 | T2>()
          return x === t1 ? t3 : x
        })
      expect(value).toBe(t3)
    })

    it('should return a result after await', async () => {
      const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
      const result = await asyncResult
      expectTypeOf(result).toEqualTypeOf<Result<T1, T2>>()
      expect(result.unwrap()).toBe(t1)
    })
  })

  describe('chains', () => {
    describe('map', () => {
      const mapToT3Fns = [() => t3, async () => t3] as const

      it('should have proper types', () => {
        const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
        mapToT3Fns.forEach((fn) => {
          expectTypeOf(asyncResult.map(fn)).toEqualTypeOf<AsyncResult<T3, T2>>()
        })
        asyncResult.map((x) => {
          expectTypeOf(x).toEqualTypeOf<T1>()
          return t3
        })
      })

      it('should work for ok', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const mapper2 of mapToT3Fns) {
          const mapper = mock(mapper2)
          const resolved = await asyncResult.map(mapper)
          expect(resolved.isOk()).toBe(true)
          expect(resolved.unwrap()).toEqual(t3)
          expect(mapper).toHaveBeenCalledTimes(1)
          expect(mapper).toHaveBeenCalledWith(t1)
        }
      })

      it('should work for err', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const mapper2 of mapToT3Fns) {
          const mapper = mock(mapper2)
          const resolved = await asyncResult.map(mapper)
          expect(resolved.isErr()).toBe(true)
          expect(resolved.unwrapErr()).toEqual(t2)
          expect(mapper).toHaveBeenCalledTimes(0)
        }
      })
    })

    describe('mapErr', () => {
      const mapErrToT4Fns = [() => t4, async () => t4] as const

      it('should have proper types', () => {
        const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
        mapErrToT4Fns.forEach((fn) => {
          expectTypeOf(asyncResult.mapErr(fn)).toEqualTypeOf<
            AsyncResult<T1, T4>
          >()
        })
        asyncResult.mapErr((x) => {
          expectTypeOf(x).toEqualTypeOf<T2>()
          return t4
        })
      })

      it('should work for ok', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const mapper2 of mapErrToT4Fns) {
          const mapper = mock(mapper2)
          const resolved = await asyncResult.mapErr(mapper)
          expect(resolved.isOk()).toBe(true)
          expect(resolved.unwrap()).toEqual(t1)
          expect(mapper).toHaveBeenCalledTimes(0)
        }
      })

      it('should work for err', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const mapper2 of mapErrToT4Fns) {
          const mapper = mock(mapper2)
          const resolved = await asyncResult.mapErr(mapper)
          expect(resolved.isErr()).toBe(true)
          expect(resolved.unwrapErr()).toEqual(t4)
          expect(mapper).toHaveBeenCalledTimes(1)
          expect(mapper).toHaveBeenCalledWith(t2)
        }
      })
    })

    describe('and', () => {
      it('should have proper types', () => {
        const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
        okT3s.forEach((other) => {
          expectTypeOf(asyncResult.and(other)).toEqualTypeOf<
            AsyncResult<T3, T2>
          >()
        })
        errT4s.forEach((other) => {
          expectTypeOf(asyncResult.and(other)).toEqualTypeOf<
            AsyncResult<never, T2 | T4>
          >()
        })
        resOkT3T4s.forEach((other) => {
          expectTypeOf(asyncResult.and(other)).toEqualTypeOf<
            AsyncResult<T3, T2 | T4>
          >()
        })
      })

      it('should work for ok to ok', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const other of [...okT3s, ...resOkT3T4s]) {
          const resolved = await asyncResult.and(other)
          expect(resolved.isOk()).toBe(true)
          expect(resolved.unwrap()).toEqual(t3)
        }
      })

      it('should work for ok to err', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const other of [...errT4s, ...resErrT3T4s]) {
          const resolved = await asyncResult.and(other)
          expect(resolved.isErr()).toBe(true)
          expect(resolved.unwrapErr()).toEqual(t4)
        }
      })

      it('should work for err to any', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const other of [
          ...okT3s,
          ...errT4s,
          ...resOkT3T4s,
          ...resErrT3T4s,
        ]) {
          const resolved = await asyncResult.and(other)
          expect(resolved.isErr()).toBe(true)
          expect(resolved.unwrapErr()).toEqual(t2)
        }
      })
    })

    describe('andThen', () => {
      it('should have proper types', () => {
        const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
        okT3Fns.forEach((fn) => {
          expectTypeOf(asyncResult.andThen(fn)).toEqualTypeOf<
            AsyncResult<T3, T2>
          >()
        })
        errT4Fns.forEach((fn) => {
          expectTypeOf(asyncResult.andThen(fn)).toEqualTypeOf<
            AsyncResult<never, T2 | T4>
          >()
        })
        resOkT3T4Fns.forEach((fn) => {
          expectTypeOf(asyncResult.andThen(fn)).toEqualTypeOf<
            AsyncResult<T3, T2 | T4>
          >()
        })
        asyncResult.andThen((x) => {
          expectTypeOf(x).toEqualTypeOf<T1>()
          return ok(t3)
        })
      })

      it('should work for ok to ok', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const fn2 of [...okT3Fns, ...resOkT3T4Fns]) {
          const fn = mock(fn2)
          const resolved = await asyncResult.andThen(fn)
          expect(resolved.isOk()).toBe(true)
          expect(resolved.unwrap()).toEqual(t3)
          expect(fn).toHaveBeenCalledTimes(1)
          expect(fn).toHaveBeenCalledWith(t1)
        }
      })

      it('should work for ok to err', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const fn2 of [...errT4Fns, ...resErrT3T4Fns]) {
          const fn = mock(fn2)
          const resolved = await asyncResult.andThen(fn)
          expect(resolved.isErr()).toBe(true)
          expect(resolved.unwrapErr()).toEqual(t4)
          expect(fn).toHaveBeenCalledTimes(1)
          expect(fn).toHaveBeenCalledWith(t1)
        }
      })

      it('should work for err to any', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const fn2 of [
          ...okT3Fns,
          ...errT4Fns,
          ...resOkT3T4Fns,
          ...resErrT3T4Fns,
        ]) {
          const fn = mock(fn2)
          const resolved = await asyncResult.andThen(fn)
          expect(resolved.isErr()).toBe(true)
          expect(resolved.unwrapErr()).toEqual(t2)
          expect(fn).toHaveBeenCalledTimes(0)
        }
      })
    })

    describe('or', () => {
      it('should have proper types', () => {
        const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
        okT3s.forEach((other) => {
          expectTypeOf(asyncResult.or(other)).toEqualTypeOf<
            AsyncResult<T1 | T3, never>
          >()
        })
        errT4s.forEach((other) => {
          expectTypeOf(asyncResult.or(other)).toEqualTypeOf<
            AsyncResult<T1, T4>
          >()
        })
        resOkT3T4s.forEach((other) => {
          expectTypeOf(asyncResult.or(other)).toEqualTypeOf<
            AsyncResult<T1 | T3, T4>
          >()
        })
      })

      it('should work for err to ok', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const other of [...okT3s, ...resOkT3T4s]) {
          const resolved = await asyncResult.or(other)
          expect(resolved.isOk()).toBe(true)
          expect(resolved.unwrap()).toEqual(t3)
        }
      })

      it('should work for err to err', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const other of [...errT4s, ...resErrT3T4s]) {
          const resolved = await asyncResult.or(other)
          expect(resolved.isErr()).toBe(true)
          expect(resolved.unwrapErr()).toEqual(t4)
        }
      })

      it('should work for ok to any', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const other of [
          ...okT3s,
          ...errT4s,
          ...resOkT3T4s,
          ...resErrT3T4s,
        ]) {
          const resolved = await asyncResult.or(other)
          expect(resolved.isOk()).toBe(true)
          expect(resolved.unwrap()).toEqual(t1)
        }
      })
    })

    describe('orElse', () => {
      it('should have proper types', () => {
        const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
        okT3Fns.forEach((fn) => {
          expectTypeOf(asyncResult.orElse(fn)).toEqualTypeOf<
            AsyncResult<T1 | T3, never>
          >()
        })
        errT4Fns.forEach((fn) => {
          expectTypeOf(asyncResult.orElse(fn)).toEqualTypeOf<
            AsyncResult<T1, T4>
          >()
        })
        resOkT3T4Fns.forEach((fn) => {
          expectTypeOf(asyncResult.orElse(fn)).toEqualTypeOf<
            AsyncResult<T1 | T3, T4>
          >()
        })
        asyncResult.orElse((x) => {
          expectTypeOf(x).toEqualTypeOf<T2>()
          return ok(t3)
        })
      })

      it('should work for err to ok', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const fn2 of [...okT3Fns, ...resOkT3T4Fns]) {
          const fn = mock(fn2)
          const resolved = await asyncResult.orElse(fn)
          expect(resolved.isOk()).toBe(true)
          expect(resolved.unwrap()).toEqual(t3)
          expect(fn).toHaveBeenCalledTimes(1)
          expect(fn).toHaveBeenCalledWith(t2)
        }
      })

      it('should work for err to err', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const fn2 of [...errT4Fns, ...resErrT3T4Fns]) {
          const fn = mock(fn2)
          const resolved = await asyncResult.orElse(fn)
          expect(resolved.isErr()).toBe(true)
          expect(resolved.unwrapErr()).toEqual(t4)
          expect(fn).toHaveBeenCalledTimes(1)
          expect(fn).toHaveBeenCalledWith(t2)
        }
      })

      it('should work for ok to any', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const fn2 of [
          ...okT3Fns,
          ...errT4Fns,
          ...resOkT3T4Fns,
          ...resErrT3T4Fns,
        ]) {
          const fn = mock(fn2)
          const resolved = await asyncResult.orElse(fn)
          expect(resolved.isOk()).toBe(true)
          expect(resolved.unwrap()).toEqual(t1)
          expect(fn).toHaveBeenCalledTimes(0)
        }
      })
    })

    describe('inspect', () => {
      const inspectFns = [() => {}, async () => {}] as const

      it('should have proper types', () => {
        const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
        inspectFns.forEach((fn) => {
          expectTypeOf(asyncResult.inspect(fn)).toEqualTypeOf<
            AsyncResult<T1, T2>
          >()
        })
        asyncResult.inspect((x) => {
          expectTypeOf(x).toEqualTypeOf<DeepReadonly<T1>>()
        })
      })

      it('should work for ok', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const callback2 of inspectFns) {
          const callback = mock(callback2)
          const inspected = await asyncResult.inspect(callback)
          expect(inspected.isOk()).toBe(true)
          expect(inspected.unwrap()).toEqual(t1)
          expect(callback).toHaveBeenCalledTimes(1)
          expect(callback).toHaveBeenCalledWith(t1)
        }
      })

      it('should work for err', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const callback2 of inspectFns) {
          const callback = mock(callback2)
          const inspected = await asyncResult.inspect(callback)
          expect(inspected.isErr()).toBe(true)
          expect(inspected.unwrapErr()).toEqual(t2)
          expect(callback).toHaveBeenCalledTimes(0)
        }
      })
    })

    describe('inspectErr', () => {
      const inspectErrFns = [() => {}, async () => {}] as const

      it('should have proper types', () => {
        const asyncResult = AsyncResult.from(ok(t1) as Result<T1, T2>)
        inspectErrFns.forEach((fn) => {
          expectTypeOf(asyncResult.inspectErr(fn)).toEqualTypeOf<
            AsyncResult<T1, T2>
          >()
        })
        asyncResult.inspectErr((x) => {
          expectTypeOf(x).toEqualTypeOf<DeepReadonly<T2>>()
        })
      })

      it('should work for ok', async () => {
        const asyncResult = AsyncResult.from(ok(t1))
        for (const callback2 of inspectErrFns) {
          const callback = mock(callback2)
          const inspected = await asyncResult.inspectErr(callback)
          expect(inspected.isOk()).toBe(true)
          expect(inspected.unwrap()).toEqual(t1)
          expect(callback).toHaveBeenCalledTimes(0)
        }
      })

      it('should work for err', async () => {
        const asyncResult = AsyncResult.from(err(t2))
        for (const callback2 of inspectErrFns) {
          const callback = mock(callback2)
          const inspected = await asyncResult.inspectErr(callback)
          expect(inspected.isErr()).toBe(true)
          expect(inspected.unwrapErr()).toEqual(t2)
          expect(callback).toHaveBeenCalledTimes(1)
          expect(callback).toHaveBeenCalledWith(t2)
        }
      })
    })
  })
})

describe('AsyncResult utils', () => {
  describe('all & merge', () => {
    it('should resolve to Ok([values]) when all inputs are Ok', async () => {
      for (const fnName of ['all', 'merge'] as const) {
        const asyncResults = AsyncResult[fnName]([
          AsyncResult.from(ok(t1)),
          AsyncResult.from(ok(t2)),
          AsyncResult.from(ok(t3)),
        ])
        expectTypeOf(asyncResults).toEqualTypeOf<
          AsyncResult<[T1, T2, T3], never>
        >()
        const results = await asyncResults
        expect(results.unwrap()).toEqual([t1, t2, t3])
      }
    })

    it.each([
      ['all', 'time', true],
      ['merge', 'array order', false],
    ] as const)('%s should return the first Err in %s', async (fnName, _, isAll) => {
      const slow = AsyncResult.from(
        new Promise<Result<never, string>>((r) =>
          setTimeout(() => r(err('slow')), 30),
        ),
      )
      const fast = AsyncResult.from(
        new Promise<Result<never, string>>((r) =>
          setTimeout(() => r(err('fast')), 5),
        ),
      )
      const result = await AsyncResult[fnName]([slow, fast])
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe(isAll ? 'fast' : 'slow')
    })

    it.each([
      ['all', 'should', true],
      ['merge', 'should not', false],
    ] as const)('%s %s fail fast', async (fnName, _, isAll) => {
      let slowResolved = false
      const slow = AsyncResult.from(
        new Promise<Result<T1, T4>>((r) =>
          setTimeout(() => {
            slowResolved = true
            r(ok(t1))
          }, 50),
        ),
      )
      const fast = AsyncResult.from(err(t2))
      const result = await AsyncResult[fnName]([slow, fast])
      expectTypeOf(result).toEqualTypeOf<Result<[T1, never], T2 | T4>>()
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe(t2)
      expect(slowResolved).toBe(!isAll)
    })
  })
})
