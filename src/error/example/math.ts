import { err, ok, result } from '../../result/index.js'
import { TypedError, UnexpectedError, UnexpectedErrorCode } from '../index.js'

// some functions from other packages

function divide(numerator: number, denominator: number) {
  if (Number.isNaN(numerator) || Number.isNaN(denominator))
    throw new Error('input is NaN')
  if (denominator === 0) throw new Error('denominator is 0')
  return numerator / denominator
}

function sqrt(n: number) {
  if (Number.isNaN(n)) throw new Error('input is NaN')
  if (n < 0) throw new Error('number is negative')
  if (n === 42) throw new Error('boom')
  return Math.sqrt(n)
}

// my error wrapper

export enum ExampleMathErrorCode {
  INPUT_IS_NAN,
  DIVISION_BY_ZERO,
  OUTPUT_IS_IMAGINARY,
}

export class ExampleMathError<
  C extends ExampleMathErrorCode,
> extends TypedError<C> {
  static override fromAny(e: unknown) {
    // general error mapping
    if (e instanceof Error) {
      if (e.message === 'input is NaN') {
        return new ExampleMathError(
          ExampleMathErrorCode.INPUT_IS_NAN,
          e.message,
        )
      }
    }
    // Fall back to UnexpectedError for unknown errors
    return UnexpectedError.fromAny(e)
  }
}

// my function wrapper

export function myDivide(numerator: number, denominator: number) {
  return result.panic(
    ExampleMathError.try(() => ok(divide(numerator, denominator))).mapErr(
      (e) => {
        // specific error mapping (with mapErr)
        if (
          e instanceof UnexpectedError &&
          e.code === UnexpectedErrorCode.UNKNOWN
        ) {
          const cause = e.cause
          if (Error.isError(cause) && cause.message === 'denominator is 0')
            return new ExampleMathError(
              ExampleMathErrorCode.DIVISION_BY_ZERO,
              cause.message,
            )
        }
        return e
      },
    ),
  )
}

export function mySqrt(n: number) {
  return result.panic(
    ExampleMathError.try(() => {
      try {
        return ok(sqrt(n))
      } catch (e) {
        // specific error mapping (with try-catch)
        if (Error.isError(e) && e.message === 'number is negative') {
          return err(
            new ExampleMathError(
              ExampleMathErrorCode.OUTPUT_IS_IMAGINARY,
              e.message,
            ),
          )
        }
        throw e
      }
    }),
  )
}
