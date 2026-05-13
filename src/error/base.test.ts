import { describe, expect, it, mock } from 'bun:test'
import { AsyncResult, err, ok } from '../result/index.js'
import { MyErrorBase } from './base.js'

describe('MyErrorBase', () => {
  describe('constructor', () => {
    it('should create an error with code and message', () => {
      const error = new MyErrorBase(100, 'Test error message')
      expect(error.name).toBe('MyErrorBase')
      expect(error.code).toBe(100)
      expect(error.message).toBe('Test error message')
    })

    it('should be instance of Error', () => {
      const error = new MyErrorBase(200, 'Another error')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('changeMessage', () => {
    it('should change the message to a new string', () => {
      const error = new MyErrorBase(1, 'old message')
      error.changeMessage('new message')
      expect(error.message).toBe('new message')
    })

    it('should change the message using a callback function', () => {
      const error = new MyErrorBase(2, 'first')
      error.changeMessage((msg) => `prefix: ${msg}`)
      expect(error.message).toBe('prefix: first')
    })

    it('should return `this` from changeMessage', () => {
      const error = new MyErrorBase(2, 'msg')
      const returned = error.changeMessage('changed')
      expect(returned).toBe(error)
    })

    it('should handle empty string', () => {
      const error = new MyErrorBase(3, 'not empty')
      error.changeMessage('')
      expect(error.message).toBe('')
    })

    it('should handle message set to the same value', () => {
      const error = new MyErrorBase(4, 'msg')
      error.changeMessage('msg')
      expect(error.message).toBe('msg')
    })
  })

  describe('fromAny', () => {
    it('should convert Error to MyErrorBase', () => {
      const originalError = new Error('Original error message')
      originalError.stack = 'Error stack trace'
      originalError.cause = new Error('Cause error')

      const error = MyErrorBase.fromAny(originalError)

      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('Original error message')
      expect(error.stack).toBe('Error stack trace')
      expect(error.cause).toBe(originalError.cause)
    })

    it('should handle Error without cause', () => {
      const originalError = new Error('Error without cause')

      const error = MyErrorBase.fromAny(originalError)

      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('Error without cause')
      expect(error.cause).toBeUndefined()
    })

    it('should convert string to MyErrorBase', () => {
      const error = MyErrorBase.fromAny('String error')
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('String error')
    })

    it('should convert number to MyErrorBase', () => {
      const error = MyErrorBase.fromAny(123)
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('123')
    })

    it('should convert null to MyErrorBase', () => {
      const error = MyErrorBase.fromAny(null)
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('null')
    })

    it('should convert undefined to MyErrorBase', () => {
      const error = MyErrorBase.fromAny(undefined)
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('undefined')
    })

    it('should convert object to MyErrorBase', () => {
      const error = MyErrorBase.fromAny({ key: 'value' })
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('[object Object]')
    })

    it('should convert array to MyErrorBase', () => {
      const error = MyErrorBase.fromAny([1, 2, 3])
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('1,2,3')
    })
  })

  describe('try', () => {
    describe('with sync fn', () => {
      it('should return a sync Result (not AsyncResult) for Ok', () => {
        const result = MyErrorBase.try(() => ok(42))
        expect(result).not.toBeInstanceOf(AsyncResult)
        expect(result.isOk()).toBe(true)
        expect(result.unwrap()).toBe(42)
      })

      it('should return Err for Error thrown in sync fn', () => {
        const result = MyErrorBase.try(() => {
          throw new Error('Test error')
        })
        expect(result).not.toBeInstanceOf(AsyncResult)
        expect(result.isErr()).toBe(true)
        const error = result.unwrapErr()
        expect(error).toBeInstanceOf(MyErrorBase)
        expect(error.message).toBe('Test error')
      })

      it('should return Err for non-Error thrown in sync fn', () => {
        const result = MyErrorBase.try(() => {
          throw 'String error'
        })
        expect(result.isErr()).toBe(true)
        const error = result.unwrapErr()
        expect(error).toBeInstanceOf(MyErrorBase)
        expect(error.message).toBe('String error')
      })

      it('should return Err for Result error', () => {
        const result = MyErrorBase.try(() => err('Result error'))
        expect(result.isErr()).toBe(true)
        expect(result.unwrapErr()).toBe('Result error')
      })

      it('should handle nested errors', () => {
        const result = MyErrorBase.try(() => {
          try {
            throw new Error('Inner error')
          } catch {
            throw new Error('Outer error')
          }
        })
        expect(result.isErr()).toBe(true)
        const error = result.unwrapErr()
        expect(error).toBeInstanceOf(MyErrorBase)
        expect(error.message).toBe('Outer error')
      })

      it('should invoke fn exactly once', () => {
        const fn = mock(() => ok(1))
        MyErrorBase.try(fn)
        expect(fn).toHaveBeenCalledTimes(1)
      })
    })

    describe('with async fn', () => {
      it('should return an AsyncResult for Ok', async () => {
        const pending = MyErrorBase.try(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return ok('success')
        })
        expect(pending).toBeInstanceOf(AsyncResult)
        const result = await pending
        expect(result.isOk()).toBe(true)
        expect(result.unwrap()).toBe('success')
      })

      it('should return Err for Error thrown in async fn', async () => {
        const result = await MyErrorBase.try(async () => {
          throw new Error('Async error')
        })
        expect(result.isErr()).toBe(true)
        const error = result.unwrapErr()
        expect(error).toBeInstanceOf(MyErrorBase)
        expect(error.message).toBe('Async error')
      })

      it('should return Err for non-Error rejection', async () => {
        const result = await MyErrorBase.try(async () => {
          throw 'String error'
        })
        expect(result.isErr()).toBe(true)
        const error = result.unwrapErr()
        expect(error).toBeInstanceOf(MyErrorBase)
        expect(error.message).toBe('String error')
      })

      it('should route a non-async fn that returns a Promise through tryAsync', async () => {
        const pending = MyErrorBase.try(() => Promise.resolve(ok('promise-fn')))
        expect(pending).toBeInstanceOf(AsyncResult)
        const result = await pending
        expect(result.isOk()).toBe(true)
        expect(result.unwrap()).toBe('promise-fn')
      })

      it('should invoke fn exactly once', async () => {
        const fn = mock(async () => ok(1))
        await MyErrorBase.try(fn)
        expect(fn).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('trySync', () => {
    it('should return Ok for successful sync fn', () => {
      const result = MyErrorBase.trySync(() => ok(42))
      expect(result).not.toBeInstanceOf(AsyncResult)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should return Err for Error thrown in fn', () => {
      const result = MyErrorBase.trySync(() => {
        throw new Error('Test error')
      })
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('Test error')
    })

    it('should return Err for non-Error thrown in fn', () => {
      const result = MyErrorBase.trySync(() => {
        throw 'String error'
      })
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('String error')
    })

    it('should pass through Err Result without wrapping', () => {
      const result = MyErrorBase.trySync(() => err('Result error'))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('Result error')
    })
  })

  describe('tryAsync', () => {
    it('should always return an AsyncResult', () => {
      const pending = MyErrorBase.tryAsync(async () => ok(1))
      expect(pending).toBeInstanceOf(AsyncResult)
    })

    it('should return Ok for successful async fn', async () => {
      const result = await MyErrorBase.tryAsync(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return ok('success')
      })
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('success')
    })

    it('should return Err for Error thrown in async fn', async () => {
      const result = await MyErrorBase.tryAsync(async () => {
        throw new Error('Async error')
      })
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('Async error')
    })

    it('should return Err for non-Error rejection', async () => {
      const result = await MyErrorBase.tryAsync(async () => {
        throw 'String error'
      })
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(MyErrorBase)
      expect(error.message).toBe('String error')
    })

    it('should pass through Err Result without wrapping', async () => {
      const result = await MyErrorBase.tryAsync(async () => err('Result error'))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('Result error')
    })

    it('should accept a non-async fn returning a Promise', async () => {
      const result = await MyErrorBase.tryAsync(() =>
        Promise.resolve(ok('from promise')),
      )
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('from promise')
    })
  })
})
