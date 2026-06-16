import { describe, expect, it, mock } from 'bun:test'
import { AsyncResult, err, ok } from '../result/index.js'
import { TypedError } from './base.js'

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
