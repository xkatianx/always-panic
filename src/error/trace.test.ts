import { describe, expect, it } from 'bun:test'
import { err, ok, type Result, result } from '../result/index.js'
import { TypedError } from './base.js'
import { UnexpectedError, UnexpectedErrorCode } from './error.js'

// Cross-layer `cause` / unwrap behavior aligned with CORE_CONCEPTS.md.
// A = producer, B = integrator (`.try()` / `mapErr`), C = caller.

enum AErrorCode {
  FAIL = 100,
}

class AError<C extends AErrorCode> extends TypedError<C> {
  constructor(code: C, message: string) {
    super(code, message)
    this.name = 'AError'
  }
}

enum BErrorCode {
  KNOWN_UPSTREAM = 200,
}

class BError<C extends BErrorCode> extends TypedError<C> {
  constructor(code: C, message: string) {
    super(code, message)
    this.name = 'BError'
  }

  static override fromAny(e: unknown) {
    if (e instanceof Error && e.message === 'known upstream failure') {
      return new BError(BErrorCode.KNOWN_UPSTREAM, e.message)
    }
    return UnexpectedError.fromAny(e)
  }
}

describe('error trace', () => {
  describe('unwrap and expect cause rules', () => {
    it('should not set cause when unwrapping Err(TypedError)', () => {
      const r = err(new AError(AErrorCode.FAIL, 'expected failure'))
      expect(() => r.unwrap()).toThrow()
      try {
        r.unwrap()
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        if (!(e instanceof Error)) return
        expect(e.cause).toBeUndefined()
      }
      expect(() => r.expect('assumed success')).toThrow('assumed success')
      try {
        r.expect('assumed success')
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        if (!(e instanceof Error)) return
        expect(e.cause).toBeUndefined()
      }
    })

    it('should set cause when unwrapping Err(UnexpectedError)', () => {
      const unexpected = new UnexpectedError(
        UnexpectedErrorCode.UNKNOWN,
        'unexpected',
      )
      const r = err(unexpected)
      expect(() => r.unwrap()).toThrow()
      try {
        r.unwrap()
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        if (!(e instanceof Error)) return
        expect(e.cause).toBe(unexpected)
      }
      expect(() => r.expect('boundary panic')).toThrow('boundary panic')
      try {
        r.expect('boundary panic')
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        if (!(e instanceof Error)) return
        expect(e.cause).toBe(unexpected)
      }
    })
  })

  describe('expected Err propagation', () => {
    it('should pass Err(AError) through andThen by reference with stack unchanged', () => {
      const aError = new AError(AErrorCode.FAIL, 'expected failure')
      const stackAtA = aError.stack
      expect(stackAtA).toBeDefined()
      const a = err(aError) as Result<number, AError<AErrorCode>>
      const atC = a.andThen((n) => ok(n + 1))
      expect(atC.isErr()).toBe(true)
      expect(atC.unwrapErr()).toBe(aError)
      expect(atC.unwrapErr().stack).toBe(stackAtA)
    })

    it('should gather a wrong unwrap inside .try without chaining the TypedError', () => {
      const a = err(new AError(AErrorCode.FAIL, 'expected failure')) as Result<
        number,
        AError<AErrorCode>
      >
      const r = BError.try(() => ok(a.unwrap()))
      expect(r.isErr()).toBe(true)
      const gathered = r.unwrapErr()
      expect(gathered).toBeInstanceOf(UnexpectedError)
      if (!(gathered instanceof UnexpectedError)) return
      const thrownAtB = gathered.cause
      expect(thrownAtB).toBeInstanceOf(Error)
      if (!(thrownAtB instanceof Error)) return
      expect(thrownAtB.message).toContain('Called unwrap() on an Err value')
      expect(thrownAtB.cause).toBeUndefined()
    })
  })

  describe('foreign throws', () => {
    it('should let an uncaught throw escape andThen untouched', () => {
      const foreign = new Error('foreign throw')
      expect(() =>
        ok(1).andThen(() => {
          throw foreign
        }),
      ).toThrow('foreign throw')
      try {
        ok(1).andThen(() => {
          throw foreign
        })
      } catch (e) {
        expect(e).toBe(foreign)
      }
    })

    it('should catch a thrown TypedError via .try and fall back to UnexpectedError.fromAny', () => {
      {
        const thrown = new AError(AErrorCode.FAIL, 'thrown, not returned')
        const r = BError.try(() => {
          throw thrown
        })
        expect(r.isErr()).toBe(true)
        const gathered = r.unwrapErr()
        expect(gathered).toBeInstanceOf(UnexpectedError)
        expect(gathered.code).toBe(UnexpectedErrorCode.UNKNOWN)
        expect(gathered.cause).toBe(thrown)
      }
      {
        const r = BError.try(() => {
          throw new Error('known upstream failure')
        })
        expect(r.isErr()).toBe(true)
        const gathered = r.unwrapErr()
        expect(gathered).toBeInstanceOf(BError)
        expect(gathered.code).toBe(BErrorCode.KNOWN_UPSTREAM)
      }
    })

    it('should promote UNKNOWN to BError via mapErr and drop the unexpected chain', () => {
      const b = result.panic(
        BError.try(() => {
          throw new Error('recognized later')
        }).mapErr((e) => {
          if (
            e instanceof UnexpectedError &&
            e.code === UnexpectedErrorCode.UNKNOWN &&
            e.cause instanceof Error &&
            e.cause.message === 'recognized later'
          ) {
            return new BError(BErrorCode.KNOWN_UPSTREAM, e.cause.message)
          }
          return e
        }),
      )
      expect(b.isErr()).toBe(true)
      const promoted = b.unwrapErr()
      expect(promoted).toBeInstanceOf(BError)
      expect(promoted.cause).toBeUndefined()

      expect(() => b.unwrap()).toThrow()
      try {
        b.unwrap()
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        if (!(e instanceof Error)) return
        expect(e.cause).toBeUndefined()
      }
    })
  })
})
