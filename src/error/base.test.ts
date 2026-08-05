import { describe, expect, expectTypeOf, it, mock } from 'bun:test'
import { AsyncResult, err, ok, type Result } from '../result/index.js'
import { type AtCode, TypedError } from './base.js'
import type { UnexpectedError, UnexpectedErrorCode } from './error.js'

enum AErrorCode {
  LOCKED = 0,
  MISSING = 1,
  STALE = 2,
}
class AError<C extends AErrorCode = AErrorCode> extends TypedError<C> {}
class BError<C extends AErrorCode = AErrorCode> extends TypedError<C> {}

enum CErrorCode {
  EMPTY_INPUT = 0,
  BAD_TOKEN = 1,
  TOO_LONG = 2,
}
type CErrorInfoMap = {
  [CErrorCode.EMPTY_INPUT]: undefined
  [CErrorCode.BAD_TOKEN]: { token: string }
  [CErrorCode.TOO_LONG]: { limit: number }
}
class CError<C extends CErrorCode = CErrorCode> extends TypedError<
  C,
  CErrorInfoMap
> {}

describe('TypedError', () => {
  describe('constructor', () => {
    it('should create an error with code and message', () => {
      const error = new TypedError(100, 'Test error message')
      expect(error.name).toBe('TypedError')
      expect(error.code).toBe(100)
      expect(error.message).toBe('Test error message')
    })

    it('should be instance of Error', () => {
      const error = new TypedError(200, 'Another error')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('changeMessage', () => {
    it('should change the message to a new string', () => {
      const error = new TypedError(1, 'old message')
      error.changeMessage('new message')
      expect(error.message).toBe('new message')
    })

    it('should change the message using a callback function', () => {
      const error = new TypedError(2, 'first')
      error.changeMessage((msg) => `prefix: ${msg}`)
      expect(error.message).toBe('prefix: first')
    })

    it('should return `this` from changeMessage', () => {
      const error = new TypedError(2, 'msg')
      const returned = error.changeMessage('changed')
      expect(returned).toBe(error)
    })

    it('should handle empty string', () => {
      const error = new TypedError(3, 'not empty')
      error.changeMessage('')
      expect(error.message).toBe('')
    })

    it('should handle message set to the same value', () => {
      const error = new TypedError(4, 'msg')
      error.changeMessage('msg')
      expect(error.message).toBe('msg')
    })
  })

  describe('is', () => {
    const locked = new AError(AErrorCode.LOCKED, 'locked')
    const stale = new AError(AErrorCode.STALE, 'stale')

    it('should match any code of the class when no code is given', () => {
      expect(AError.is(locked)).toBe(true)
      expect(AError.is(stale)).toBe(true)
    })

    it('should return false for another class, a plain Error and non-errors', () => {
      expect(BError.is(locked)).toBe(false)
      expect(AError.is(new Error('locked'))).toBe(false)
      expect(AError.is(null)).toBe(false)
      expect(AError.is(undefined)).toBe(false)
      expect(AError.is({ code: AErrorCode.LOCKED })).toBe(false)
    })

    it('should match only the listed codes', () => {
      expect(AError.is(locked, AErrorCode.LOCKED)).toBe(true)
      expect(AError.is(locked, AErrorCode.MISSING)).toBe(false)
      expect(AError.is(locked, AErrorCode.MISSING, AErrorCode.LOCKED)).toBe(
        true,
      )
      expect(AError.is(stale, AErrorCode.MISSING, AErrorCode.LOCKED)).toBe(
        false,
      )
    })

    it('should match a subclass instance', () => {
      class ASubError extends AError {}
      const sub = new ASubError(AErrorCode.LOCKED, 'sub')
      expect(AError.is(sub, AErrorCode.LOCKED)).toBe(true)
      expect(ASubError.is(locked, AErrorCode.LOCKED)).toBe(false)
    })

    it('should narrow the instance and its code', () => {
      const e = locked as unknown
      if (AError.is(e, AErrorCode.LOCKED, AErrorCode.STALE)) {
        expectTypeOf(e).toEqualTypeOf<
          AtCode<AError, AErrorCode.LOCKED | AErrorCode.STALE>
        >()
        expectTypeOf(e.code).toEqualTypeOf<
          AErrorCode.LOCKED | AErrorCode.STALE
        >()
        expect(e.message).toBe('locked')
      } else {
        expect.unreachable()
      }
      const e2 = stale as unknown
      if (AError.is(e2)) {
        expectTypeOf(e2).toEqualTypeOf<AError>()
        expectTypeOf(e2.code).toEqualTypeOf<AErrorCode>()
      } else {
        expect.unreachable()
      }
    })

    it('should keep a narrow union member instead of widening to the class', () => {
      // CError is structurally distinct from AError (different enum + info map);
      // structurally identical classes cannot be told apart at the type level.
      const e = locked as AError<AErrorCode.LOCKED> | CError
      if (AError.is(e)) {
        expectTypeOf(e).toEqualTypeOf<AError<AErrorCode.LOCKED>>()
      } else {
        expectTypeOf(e).toEqualTypeOf<CError>()
        expect.unreachable()
      }
    })

    it('should narrow info per code when the class has an info map', () => {
      const e = new CError(CErrorCode.BAD_TOKEN, 'bad', {
        token: 'x',
      }) as unknown
      if (CError.is(e, CErrorCode.BAD_TOKEN)) {
        expectTypeOf(e.code).toEqualTypeOf<CErrorCode.BAD_TOKEN>()
        expectTypeOf(e.info.token).toEqualTypeOf<string>()
        expect(e.info.token).toBe('x')
      } else {
        expect.unreachable()
      }
    })

    it('should subtract a fully matched member of a distributed union', () => {
      const e = stale as
        | AError<AErrorCode.LOCKED>
        | AError<AErrorCode.STALE>
        | Error
      if (AError.is(e, AErrorCode.LOCKED)) {
        // the foreign Error member also narrows here (an AError is an Error),
        // so assert the discriminant rather than the exact union shape
        expectTypeOf(e.code).toEqualTypeOf<AErrorCode.LOCKED>()
        expect.unreachable()
      } else {
        // LOCKED is gone; STALE and the foreign Error remain
        expectTypeOf(e).toEqualTypeOf<AError<AErrorCode.STALE> | Error>()
      }
    })

    it('should recover from one code inside orElse and trim it from the union', () => {
      const badToken = new CError(CErrorCode.BAD_TOKEN, 'bad', { token: 'x' })
      const tooLong = new CError(CErrorCode.TOO_LONG, 'long', { limit: 10 })
      type E = CError<CErrorCode.BAD_TOKEN> | CError<CErrorCode.TOO_LONG>
      {
        const result = err(badToken as E).orElse((e) =>
          CError.is(e, CErrorCode.BAD_TOKEN) ? ok('fallback') : err(e),
        )
        expect(result.unwrap()).toBe('fallback')
      }
      {
        const result = err(tooLong as E).orElse((e) =>
          CError.is(e, CErrorCode.BAD_TOKEN) ? ok('fallback') : err(e),
        )
        expect(result.unwrapErr()).toBe(tooLong)
        if (result.isErr()) {
          // BAD_TOKEN was recovered, so it is trimmed from the error type
          expectTypeOf(result.error).toEqualTypeOf<
            CError<CErrorCode.TOO_LONG>
          >()
        }
      }
    })

    it('should subtract the recovered code through an async orElse (find-or-create)', async () => {
      // mirrors yuki-bot's GFolder.getOrCreateFolder: find may fail with a
      // recoverable code, recovery runs another fallible AsyncResult
      type FindErrors =
        | CError<CErrorCode.BAD_TOKEN>
        | CError<CErrorCode.TOO_LONG>
        | UnexpectedError<UnexpectedErrorCode>
      type CreateErrors =
        | CError<CErrorCode.EMPTY_INPUT>
        | UnexpectedError<UnexpectedErrorCode>

      const find = (seed: Result<string, FindErrors>) => AsyncResult.from(seed)
      const create = () =>
        AsyncResult.from(ok('created') as Result<string, CreateErrors>)
      const getOrCreate = (seed: Result<string, FindErrors>) =>
        find(seed).orElse(async (e) =>
          CError.is(e, CErrorCode.BAD_TOKEN) ? create() : err(e),
        )

      {
        const found = await getOrCreate(ok('found'))
        expect(found.unwrap()).toBe('found')
      }
      {
        const badToken = new CError(CErrorCode.BAD_TOKEN, 'bad', {
          token: 'x',
        })
        const recovered = await getOrCreate(err(badToken))
        expect(recovered.unwrap()).toBe('created')
      }
      {
        const tooLong = new CError(CErrorCode.TOO_LONG, 'long', { limit: 10 })
        const kept = await getOrCreate(err(tooLong))
        expect(kept.unwrapErr()).toBe(tooLong)
        if (kept.isErr()) {
          // BAD_TOKEN is subtracted; create's own errors are added
          expectTypeOf(kept.error).toEqualTypeOf<
            | CError<CErrorCode.TOO_LONG>
            | CError<CErrorCode.EMPTY_INPUT>
            | UnexpectedError<UnexpectedErrorCode>
          >()
        }
      }
    })
  })

  describe('match', () => {
    const badToken = new CError(CErrorCode.BAD_TOKEN, 'bad', { token: 'x' })
    const tooLong = new CError(CErrorCode.TOO_LONG, 'long', { limit: 10 })
    const empty = new CError(CErrorCode.EMPTY_INPUT, 'empty')

    it('should dispatch to the handler for the code', () => {
      const onBadToken = mock((e: CError<CErrorCode.BAD_TOKEN>) => e.info.token)
      const onTooLong = mock((e: CError<CErrorCode.TOO_LONG>) =>
        String(e.info.limit),
      )
      const result = CError.match(
        badToken as CError<CErrorCode.BAD_TOKEN | CErrorCode.TOO_LONG>,
        {
          [CErrorCode.BAD_TOKEN]: onBadToken,
          [CErrorCode.TOO_LONG]: onTooLong,
        },
      )
      expect(result).toBe('x')
      expect(onBadToken).toHaveBeenCalledTimes(1)
      expect(onTooLong).toHaveBeenCalledTimes(0)
    })

    it('should exhaust only the codes in the value type', () => {
      const e = badToken as CError<CErrorCode.BAD_TOKEN | CErrorCode.TOO_LONG>
      const result = CError.match(e, {
        [CErrorCode.BAD_TOKEN]: (e) => {
          expectTypeOf(e.code).toEqualTypeOf<CErrorCode.BAD_TOKEN>()
          expectTypeOf(e.info.token).toEqualTypeOf<string>()
          return e.info.token
        },
        [CErrorCode.TOO_LONG]: (e) => String(e.info.limit),
        // EMPTY_INPUT is not in the value type, so no handler is required
      })
      expect(result).toBe('x')
    })

    it('should require every code of the value type when there is no else', () => {
      const e = badToken as CError<CErrorCode.BAD_TOKEN | CErrorCode.TOO_LONG>
      // @ts-expect-error TOO_LONG is unhandled and there is no `else`
      CError.match(e, {
        [CErrorCode.BAD_TOKEN]: (e: CError<CErrorCode.BAD_TOKEN>) =>
          e.info.token,
      })
    })

    it('should work with a distributed union', () => {
      const e = tooLong as
        | CError<CErrorCode.BAD_TOKEN>
        | CError<CErrorCode.TOO_LONG>
      const result = CError.match(e, {
        [CErrorCode.BAD_TOKEN]: (e) => e.info.token,
        [CErrorCode.TOO_LONG]: (e) => String(e.info.limit),
      })
      expect(result).toBe('10')
    })

    it('should fall back to else for unlisted codes', () => {
      const onElse = mock((e: CError) => e.message)
      const result = CError.match(empty as CError, {
        [CErrorCode.BAD_TOKEN]: (e) => e.info.token,
        else: onElse,
      })
      expect(result).toBe('empty')
      expect(onElse).toHaveBeenCalledTimes(1)
    })

    it('should prefer a listed handler over else', () => {
      const onElse = mock((e: CError) => e.message)
      const result = CError.match(badToken as CError, {
        [CErrorCode.BAD_TOKEN]: (e) => e.info.token,
        else: onElse,
      })
      expect(result).toBe('x')
      expect(onElse).toHaveBeenCalledTimes(0)
    })

    it('should union heterogeneous handler return types', () => {
      {
        const e = badToken as CError<CErrorCode.BAD_TOKEN | CErrorCode.TOO_LONG>
        const result = CError.match(e, {
          [CErrorCode.BAD_TOKEN]: () => 1,
          [CErrorCode.TOO_LONG]: () => 'two',
        })
        expectTypeOf(result).toEqualTypeOf<number | string>()
      }
      {
        const result = CError.match(empty as CError, {
          [CErrorCode.BAD_TOKEN]: () => 1,
          else: () => true,
        })
        expectTypeOf(result).toEqualTypeOf<number | boolean>()
      }
    })

    it('should reject an error of another class', () => {
      const foreign = new AError(AErrorCode.LOCKED, 'locked')
      // @ts-expect-error AError is not a CError even though the codes overlap numerically
      CError.match(foreign, { else: (e) => e.message })
    })

    it('should work on a class without an info map', () => {
      const e = new AError(AErrorCode.LOCKED, 'locked') as AError<
        AErrorCode.LOCKED | AErrorCode.STALE
      >
      const result = AError.match(e, {
        [AErrorCode.LOCKED]: (e) => e.message,
        [AErrorCode.STALE]: () => 'stale',
      })
      expect(result).toBe('locked')
    })

    it('should erase recovered codes from the error union inside orElse', () => {
      const recover = (e: CError<CErrorCode.BAD_TOKEN | CErrorCode.TOO_LONG>) =>
        CError.match(e, {
          [CErrorCode.BAD_TOKEN]: () => ok('fallback'),
          [CErrorCode.TOO_LONG]: (e) => err(e), // e: CError<TOO_LONG>
        })
      {
        const result = err(
          badToken as CError<CErrorCode.BAD_TOKEN | CErrorCode.TOO_LONG>,
        )
          .orElse(recover)
          .orElse((e) =>
            CError.match(e, {
              [CErrorCode.TOO_LONG]: (e) => err(e),
            }),
          )
        expect(result.unwrap()).toBe('fallback')
      }
      {
        const result = err(
          tooLong as CError<CErrorCode.BAD_TOKEN | CErrorCode.TOO_LONG>,
        ).orElse(recover)
        expect(result.unwrapErr()).toBe(tooLong)
        if (result.isErr()) {
          // BAD_TOKEN was recovered, so it is gone from the error's code type
          expectTypeOf(result.error.code).toEqualTypeOf<CErrorCode.TOO_LONG>()
        }
      }
    })

    it('should throw when no handler matches at runtime', () => {
      // simulate a stale build: the static type lies about the code
      const e = empty as unknown as CError<CErrorCode.BAD_TOKEN>
      expect(() =>
        CError.match(e, { [CErrorCode.BAD_TOKEN]: (e) => e.info.token }),
      ).toThrow('no handler for code 0')
    })
  })

  describe('info map constructor', () => {
    it('should require info when the map entry is not undefined-able', () => {
      const e = new CError(CErrorCode.BAD_TOKEN, 'bad', { token: 'x' })
      expect(e.info).toEqual({ token: 'x' })
      // @ts-expect-error BAD_TOKEN requires info
      new CError(CErrorCode.BAD_TOKEN, 'bad')
    })

    it('should allow omitting info when the map entry is undefined', () => {
      const e = new CError(CErrorCode.EMPTY_INPUT, 'empty')
      expect(e.info).toBeUndefined()
      expectTypeOf(e.info).toEqualTypeOf<undefined>()
    })

    it('should type info as the union of map entries for a wide instance', () => {
      const e = new CError(CErrorCode.TOO_LONG, 'long', {
        limit: 10,
      }) as CError
      expectTypeOf(e.info).toEqualTypeOf<
        { token: string } | { limit: number } | undefined
      >()
    })

    it('should set name from the class automatically', () => {
      expect(new CError(CErrorCode.EMPTY_INPUT, 'empty').name).toBe('CError')
      expect(new TypedError(1, 'msg').name).toBe('TypedError')
    })
  })

  describe('fromAny', () => {
    it('should throw when called on the base class', () => {
      expect(() => TypedError.fromAny(new Error('x'))).toThrow(
        'TypedError.fromAny must not be called',
      )
    })
  })

  describe('try', () => {
    describe('with sync fn', () => {
      it('should return a sync Result (not AsyncResult) for Ok', () => {
        const result = TypedError.try(() => ok(42))
        expect(result).not.toBeInstanceOf(AsyncResult)
        expect(result.isOk()).toBe(true)
        expect(result.unwrap()).toBe(42)
      })

      it('should rethrow when sync fn throws (base fromAny is not callable)', () => {
        expect(() =>
          TypedError.try(() => {
            throw new Error('Test error')
          }),
        ).toThrow('TypedError.fromAny must not be called')
      })

      it('should rethrow when sync fn throws non-Error', () => {
        expect(() =>
          TypedError.try(() => {
            throw 'String error'
          }),
        ).toThrow('TypedError.fromAny must not be called')
      })

      it('should return Err for Result error', () => {
        const result = TypedError.try(() => err('Result error'))
        expect(result.isErr()).toBe(true)
        expect(result.unwrapErr()).toBe('Result error')
      })

      it('should rethrow when nested throws escape', () => {
        expect(() =>
          TypedError.try(() => {
            try {
              throw new Error('Inner error')
            } catch {
              throw new Error('Outer error')
            }
          }),
        ).toThrow('TypedError.fromAny must not be called')
      })

      it('should invoke fn exactly once', () => {
        const fn = mock(() => ok(1))
        TypedError.try(fn)
        expect(fn).toHaveBeenCalledTimes(1)
      })
    })

    describe('with async fn', () => {
      it('should return an AsyncResult for Ok', async () => {
        const pending = TypedError.try(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return ok('success')
        })
        expect(pending).toBeInstanceOf(AsyncResult)
        const result = await pending
        expect(result.isOk()).toBe(true)
        expect(result.unwrap()).toBe('success')
      })

      it('should rethrow when async fn throws', async () => {
        await expect(
          Promise.resolve(
            TypedError.try(async () => {
              throw new Error('Async error')
            }),
          ),
        ).rejects.toThrow('TypedError.fromAny must not be called')
      })

      it('should rethrow when async fn rejects with non-Error', async () => {
        await expect(
          Promise.resolve(
            TypedError.try(async () => {
              throw 'String error'
            }),
          ),
        ).rejects.toThrow('TypedError.fromAny must not be called')
      })

      it('should route a non-async fn that returns a Promise through tryAsync', async () => {
        const pending = TypedError.try(() => Promise.resolve(ok('promise-fn')))
        expect(pending).toBeInstanceOf(AsyncResult)
        const result = await pending
        expect(result.isOk()).toBe(true)
        expect(result.unwrap()).toBe('promise-fn')
      })

      it('should invoke fn exactly once', async () => {
        const fn = mock(async () => ok(1))
        await TypedError.try(fn)
        expect(fn).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('trySync', () => {
    it('should return Ok for successful sync fn', () => {
      const result = TypedError.trySync(() => ok(42))
      expect(result).not.toBeInstanceOf(AsyncResult)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should rethrow when fn throws', () => {
      expect(() =>
        TypedError.trySync(() => {
          throw new Error('Test error')
        }),
      ).toThrow('TypedError.fromAny must not be called')
    })

    it('should rethrow when fn throws non-Error', () => {
      expect(() =>
        TypedError.trySync(() => {
          throw 'String error'
        }),
      ).toThrow('TypedError.fromAny must not be called')
    })

    it('should pass through Err Result without wrapping', () => {
      const result = TypedError.trySync(() => err('Result error'))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('Result error')
    })
  })

  describe('tryAsync', () => {
    it('should always return an AsyncResult', () => {
      const pending = TypedError.tryAsync(async () => ok(1))
      expect(pending).toBeInstanceOf(AsyncResult)
    })

    it('should return Ok for successful async fn', async () => {
      const result = await TypedError.tryAsync(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return ok('success')
      })
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('success')
    })

    it('should rethrow when async fn throws', async () => {
      await expect(
        Promise.resolve(
          TypedError.tryAsync(async () => {
            throw new Error('Async error')
          }),
        ),
      ).rejects.toThrow('TypedError.fromAny must not be called')
    })

    it('should rethrow when async fn rejects with non-Error', async () => {
      await expect(
        Promise.resolve(
          TypedError.tryAsync(async () => {
            throw 'String error'
          }),
        ),
      ).rejects.toThrow('TypedError.fromAny must not be called')
    })

    it('should pass through Err Result without wrapping', async () => {
      const result = await TypedError.tryAsync(async () => err('Result error'))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('Result error')
    })

    it('should accept a non-async fn returning a Promise', async () => {
      const result = await TypedError.tryAsync(() =>
        Promise.resolve(ok('from promise')),
      )
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('from promise')
    })
  })
})
