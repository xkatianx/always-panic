import { describe, expect, expectTypeOf, it } from 'bun:test'
import { err, ok, type Result } from '../index.js'
import AsyncResult from './asyncResult.js'
import Err from './err.js'
import Ok from './ok.js'
import result from './util.js'

type T1 = { T1: number }
type T2 = { T2: number }
type T3 = { T3: number }
type T4 = { T4: number }

const t1: T1 = { T1: 1 }
const t2: T2 = { T2: 2 }
const t3: T3 = { T3: 3 }

describe('result.gen (sync)', () => {
  it('should return Ok when every yield* succeeds', () => {
    const r = result.gen(function* () {
      const a = yield* ok(t1) as Result<T1, T2>
      const b = yield* ok(t3) as Result<T3, T4>
      return ok([a, b] as const)
    })
    expect(r.unwrap()).toEqual([t1, t3])
    expectTypeOf(r).toEqualTypeOf<Result<readonly [T1, T3], T2 | T4>>()
  })

  it('should short-circuit on the first Err', () => {
    let reached = false
    const r = result.gen(function* () {
      yield* err(t2) as Result<T1, T2>
      reached = true
      return ok(t1)
    })
    expect(r.isErr()).toBe(true)
    expect(r.unwrapErr()).toBe(t2)
    expect(reached).toBe(false)
  })

  it('should return the yielded Err by reference', () => {
    const original = err(t2) as Result<T1, T2>
    const r = result.gen(function* () {
      const a = yield* original
      return ok(a)
    })
    expect(r).toBe(original as never)
  })

  it('should evaluate yield* to the Ok value', () => {
    result
      .gen(function* () {
        const a = yield* ok(t1) as Result<T1, T2>
        expectTypeOf(a).toEqualTypeOf<T1>()
        return ok(a)
      })
      .unwrap()
  })

  it('should allow returning err directly from the body', () => {
    const r = result.gen(function* () {
      const a = yield* ok(t1) as Result<T1, T2>
      if (a.T1 === 1) return err(t3)
      return ok(a)
    })
    expect(r.unwrapErr()).toBe(t3)
    expectTypeOf(r).toEqualTypeOf<Result<T1, T2 | T3>>()
  })

  it('should accumulate error types from yields and the return', () => {
    const r = result.gen(function* () {
      const a = yield* ok(t1) as Result<T1, T2>
      yield* ok(t1) as Result<T1, T4>
      return ok(a) as Result<T1, T3>
    })
    expectTypeOf(r).toEqualTypeOf<Result<T1, T2 | T3 | T4>>()
  })

  it('should run finally blocks on early return', () => {
    let cleaned = false
    const r = result.gen(function* () {
      try {
        yield* err(t2) as Result<T1, T2>
        return ok(t1)
      } finally {
        cleaned = true
      }
    })
    expect(r.unwrapErr()).toBe(t2)
    expect(cleaned).toBe(true)
  })

  it('should let thrown exceptions escape', () => {
    expect(() =>
      result.gen(function* () {
        yield* ok(t1) as Result<T1, T2>
        throw new Error('boom')
      }),
    ).toThrow('boom')
  })

  it('should return a plain Result, not an AsyncResult', () => {
    // biome-ignore lint/correctness/useYield: a body with no fallible steps is valid
    const r = result.gen(function* () {
      return ok(t1)
    })
    expect(r instanceof Ok || r instanceof Err).toBe(true)
    expect(r).not.toBeInstanceOf(AsyncResult)
  })

  it('should work via the explicit genSync variant', () => {
    const r = result.genSync(function* () {
      const a = yield* ok(t1) as Result<T1, T2>
      return ok(a)
    })
    expect(r.unwrap()).toBe(t1)
    expectTypeOf(r).toEqualTypeOf<Result<T1, T2>>()
  })
})

describe('result.gen (async)', () => {
  const asyncOk = <T, E>(value: T) =>
    AsyncResult.from(Promise.resolve(ok(value) as Result<T, E>))
  const asyncErr = <T, E>(error: E) =>
    AsyncResult.from(Promise.resolve(err(error) as Result<T, E>))

  it('should yield* an AsyncResult directly', async () => {
    const r = await result.gen(async function* () {
      const a = yield* asyncOk<T1, T2>(t1)
      const b = yield* asyncOk<T3, T4>(t3)
      return ok([a, b] as const)
    })
    expect(r.unwrap()).toEqual([t1, t3])
    expectTypeOf(r).toEqualTypeOf<Result<readonly [T1, T3], T2 | T4>>()
  })

  it('should yield* an awaited Result', async () => {
    const r = await result.gen(async function* () {
      const a = yield* await asyncOk<T1, T2>(t1)
      return ok(a)
    })
    expect(r.unwrap()).toBe(t1)
  })

  it('should mix sync Results into an async body', async () => {
    const r = await result.gen(async function* () {
      const a = yield* ok(t1) as Result<T1, T2>
      const b = yield* asyncOk<T3, T4>(t3)
      return ok([a, b] as const)
    })
    expect(r.unwrap()).toEqual([t1, t3])
    expectTypeOf(r).toEqualTypeOf<Result<readonly [T1, T3], T2 | T4>>()
  })

  it('should short-circuit on the first Err without running the rest', async () => {
    let reached = false
    const r = await result.gen(async function* () {
      yield* asyncErr<T1, T2>(t2)
      reached = true
      return ok(t1)
    })
    expect(r.isErr()).toBe(true)
    expect(r.unwrapErr()).toBe(t2)
    expect(reached).toBe(false)
  })

  it('should return the yielded Err by reference', async () => {
    const original = err(t2) as Result<T1, T2>
    const r = await result.gen(async function* () {
      const a = yield* original
      return ok(a)
    })
    expect(r).toBe(original as never)
  })

  it('should run (async) finally blocks on early return', async () => {
    let cleaned = false
    const r = await result.gen(async function* () {
      try {
        yield* asyncErr<T1, T2>(t2)
        return ok(t1)
      } finally {
        await Promise.resolve()
        cleaned = true
      }
    })
    expect(r.unwrapErr()).toBe(t2)
    expect(cleaned).toBe(true)
  })

  it('should surface thrown exceptions as rejections', async () => {
    const r = result.gen(async function* () {
      yield* asyncOk<T1, T2>(t1)
      throw new Error('boom')
    })
    await expect(Promise.resolve(r)).rejects.toThrow('boom')
  })

  it('should return an AsyncResult', () => {
    // biome-ignore lint/correctness/useYield: a body with no fallible steps is valid
    const r = result.gen(async function* () {
      return ok(t1)
    })
    expect(r).toBeInstanceOf(AsyncResult)
  })

  it('should work via the explicit genAsync variant', async () => {
    const r = await result.genAsync(async function* () {
      const a = yield* asyncOk<T1, T2>(t1)
      return ok(a)
    })
    expect(r.unwrap()).toBe(t1)
  })
})

describe('Result iterator protocol', () => {
  it('Ok yields nothing and returns its value', () => {
    const iter = ok(t1)[Symbol.iterator]()
    const step = iter.next()
    expect(step.done).toBe(true)
    expect(step.value).toBe(t1)
  })

  it('Err yields itself once', () => {
    const res = err(t2)
    const iter = res[Symbol.iterator]()
    const step = iter.next()
    expect(step.done).toBe(false)
    expect(step.value).toBe(res as never)
  })

  it('Err throws when resumed by a foreign driver', () => {
    const iter = err(t2)[Symbol.iterator]()
    iter.next()
    expect(() => iter.next()).toThrow('result.gen')
  })

  it('AsyncResult delegates through its async iterator', async () => {
    const iter = AsyncResult.from(ok(t1))[Symbol.asyncIterator]()
    const step = await iter.next()
    expect(step.done).toBe(true)
    expect(step.value).toBe(t1)
  })
})
