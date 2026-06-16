import { describe, expect, it } from 'bun:test'
import type { Code } from '../base.js'
import { UnexpectedError, UnexpectedErrorCode } from '../error.js'
import {
  ExampleMathError,
  ExampleMathErrorCode,
  myDivide,
  mySqrt,
} from './math.js'

describe('example (math)', () => {
  describe('myDivide', () => {
    it('should return Ok with quotient when denominator is non-zero', () => {
      const result = myDivide(10, 2)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(5)
    })

    it('should return Err when denominator is zero', () => {
      const result = myDivide(1, 0)
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ExampleMathError)
      expect(error.code).toBe(ExampleMathErrorCode.DIVISION_BY_ZERO)
    })

    it('should return Err with INPUT_IS_NAN when numerator is NaN', () => {
      const result = myDivide(Number.NaN, 2)
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(ExampleMathError)
      expect(error.code).toBe(ExampleMathErrorCode.INPUT_IS_NAN)
      expect(error.message).toBe('input is NaN')
    })

    it('should return Err with INPUT_IS_NAN when denominator is NaN', () => {
      const result = myDivide(1, Number.NaN)
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(ExampleMathError)
      expect(error.code).toBe(ExampleMathErrorCode.INPUT_IS_NAN)
      expect(error.message).toBe('input is NaN')
    })
  })

  describe('mySqrt', () => {
    it('should return Ok with square root for non-negative n not equal to 42', () => {
      const result = mySqrt(9)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(3)
    })

    it('should have ExampleMathErrorCode.OUTPUT_IS_IMAGINARY for negative input', () => {
      const result = mySqrt(-1)
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(ExampleMathError)
      expect(error.code).toBe(ExampleMathErrorCode.OUTPUT_IS_IMAGINARY)
      expect(error.message).toBe('number is negative')
    })

    it('should have ExampleMathErrorCode.INPUT_IS_NAN for NaN input', () => {
      const result = mySqrt(Number.NaN)
      expect(result.isErr()).toBe(true)
      const error = result.unwrapErr()
      expect(error).toBeInstanceOf(ExampleMathError)
      expect(error.code).toBe(ExampleMathErrorCode.INPUT_IS_NAN)
      expect(error.message).toBe('input is NaN')
    })

    it('should panic with cause chain for uncaught upstream throw', () => {
      expect(() => mySqrt(42)).toThrow()
      try {
        mySqrt(42)
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(Error)
        if (!(e instanceof Error)) return
        expect(e.cause).toBeInstanceOf(UnexpectedError)
        const unexpected = e.cause as UnexpectedError<Code>
        expect(unexpected.code).toBe(UnexpectedErrorCode.UNKNOWN)
        const original = unexpected.cause
        expect(original).toBeInstanceOf(Error)
        if (!(original instanceof Error)) return
        expect(original.message).toBe('boom')
        const secondLine = original.stack?.split('\n').at(1)
        expect(secondLine).toMatch(/^\s*at sqrt /)
      }
    })
  })
})
