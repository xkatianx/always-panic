import { describe, expect, it } from 'bun:test'
import { err, ok } from '../result/index.js'
import { TypedError } from './base.js'
import { UnexpectedError, UnexpectedErrorCode } from './error.js'

describe('UnexpectedError', () => {
  describe('constructor', () => {
    it('should create an error with code and message', () => {
      const error = new UnexpectedError(
        UnexpectedErrorCode.UNKNOWN,
        'Test error',
      )
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(TypedError)
      expect(error.name).toBe('UnexpectedError')
      expect(error.code).toBe(UnexpectedErrorCode.UNKNOWN)
      expect(error.message).toBe('Test error')
    })
  })

  describe('fromAny', () => {
    it('should wrap an Error as cause and copy its message', () => {
      const originalError = new Error('Original error')
      const error = UnexpectedError.fromAny(originalError)

      expect(error).toBeInstanceOf(UnexpectedError)
      expect(error.code).toBe(UnexpectedErrorCode.UNKNOWN)
      expect(error.message).toBe('Original error')
      expect(error.cause).toBe(originalError)
    })

    it('should preserve an Error chain by wrapping the input as cause', () => {
      const inner = new Error('Inner')
      const outer = new Error('Outer', { cause: inner })
      const error = UnexpectedError.fromAny(outer)

      expect(error.cause).toBe(outer)
      expect((error.cause as Error).cause).toBe(inner)
    })

    it('should capture its own stack at the fromAny call site', () => {
      const originalError = new Error('Original error')
      originalError.stack = 'fake stack'

      const error = UnexpectedError.fromAny(originalError)

      expect(typeof error.stack).toBe('string')
      expect(error.stack).not.toBe('fake stack')
    })

    it('should wrap a string value as cause and stringify the message', () => {
      const error = UnexpectedError.fromAny('String value')
      expect(error).toBeInstanceOf(UnexpectedError)
      expect(error.code).toBe(UnexpectedErrorCode.UNKNOWN)
      expect(error.message).toBe('String value')
      expect(error.cause).toBe('String value')
    })

    it('should wrap a number value as cause', () => {
      const error = UnexpectedError.fromAny(42)
      expect(error).toBeInstanceOf(UnexpectedError)
      expect(error.code).toBe(UnexpectedErrorCode.UNKNOWN)
      expect(error.message).toBe('42')
      expect(error.cause).toBe(42)
    })

    it('should wrap an object value as cause', () => {
      const payload = { test: 'value' }
      const error = UnexpectedError.fromAny(payload)
      expect(error).toBeInstanceOf(UnexpectedError)
      expect(error.code).toBe(UnexpectedErrorCode.UNKNOWN)
      expect(error.message).toBe('[object Object]')
      expect(error.cause).toBe(payload)
    })

    it('should wrap null and undefined as cause', () => {
      const nullError = UnexpectedError.fromAny(null)
      expect(nullError.message).toBe('null')
      expect(nullError.cause).toBeNull()

      const undefinedError = UnexpectedError.fromAny(undefined)
      expect(undefinedError.message).toBe('undefined')
      expect(undefinedError.cause).toBeUndefined()
    })
  })

  describe('unreachable', () => {
    it('should create an error with UNREACHABLE code', () => {
      const error = UnexpectedError.unreachable()
      expect(error).toBeInstanceOf(UnexpectedError)
      expect(error.code).toBe(UnexpectedErrorCode.UNREACHABLE)
    })

    it('should include the reason in the message', () => {
      const reason = Math.random().toString(36)
      const error = UnexpectedError.unreachable(reason)
      expect(error.code).toBe(UnexpectedErrorCode.UNREACHABLE)
      expect(error.message).toContain(reason)
    })
  })

  describe('try', () => {
    it('should return Ok for successful function', () => {
      const result = UnexpectedError.try(() => ok(100))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(100)
    })

    it('should return Err with UnexpectedError for Error thrown', () => {
      const result = UnexpectedError.try(() => {
        throw new Error('Test error')
      })
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(UnexpectedError)
      expect(error.code).toBe(UnexpectedErrorCode.UNKNOWN)
      expect(error.message).toBe('Test error')
    })

    it('should return Err with UnexpectedError for non-Error thrown', () => {
      const result = UnexpectedError.try(() => {
        throw 'String error'
      })
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(UnexpectedError)
      expect(error.code).toBe(UnexpectedErrorCode.UNKNOWN)
      expect(error.message).toBe('String error')
    })

    it('should accept functions that return two different ok types and two different err types', () => {
      const result = UnexpectedError.try(() => {
        if (Math.random() > 1) return ok(1 as const)
        if (Math.random() > 1) return ok(2 as const)
        if (Math.random() > 1) return err(3 as const)
        return err(4 as const)
      })
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe(4)
    })
  })
})
