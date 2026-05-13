import { err, ok } from '../../result/index.js';
import { MyError, MyErrorBase, MyErrorCode } from '../index.js';
// some functions from other packages
function divide(numerator, denominator) {
    if (Number.isNaN(numerator) || Number.isNaN(denominator))
        throw new Error('input is NaN');
    if (denominator === 0)
        throw new Error('denominator is 0');
    return numerator / denominator;
}
function sqrt(n) {
    if (Number.isNaN(n))
        throw new Error('input is NaN');
    if (n < 0)
        throw new Error('number is negative');
    if (n === 42)
        throw new Error('boom');
    return Math.sqrt(n);
}
// my error wrapper
export var ExampleMathErrorCode;
(function (ExampleMathErrorCode) {
    ExampleMathErrorCode[ExampleMathErrorCode["INPUT_IS_NAN"] = 0] = "INPUT_IS_NAN";
    ExampleMathErrorCode[ExampleMathErrorCode["DIVISION_BY_ZERO"] = 1] = "DIVISION_BY_ZERO";
    ExampleMathErrorCode[ExampleMathErrorCode["OUTPUT_IS_IMAGINARY"] = 2] = "OUTPUT_IS_IMAGINARY";
})(ExampleMathErrorCode || (ExampleMathErrorCode = {}));
export class ExampleMathError extends MyErrorBase {
    constructor(code, message) {
        super(code, message);
        this.name = 'ExampleMathError';
    }
    static fromAny(e) {
        // general error mapping
        if (e instanceof Error) {
            if (e.message === 'input is NaN') {
                return new ExampleMathError(ExampleMathErrorCode.INPUT_IS_NAN, e.message);
            }
        }
        // Fall back to MyError for unknown errors
        return MyError.fromAny(e);
    }
}
// my function wrapper
export function myDivide(numerator, denominator) {
    return ExampleMathError.try(() => ok(divide(numerator, denominator))).mapErr((e) => {
        // specific error mapping (with mapErr)
        if (e instanceof MyError && e.code === MyErrorCode.OTHERS) {
            const cause = e.cause;
            if (Error.isError(cause) && cause.message === 'denominator is 0')
                return new ExampleMathError(ExampleMathErrorCode.DIVISION_BY_ZERO, cause.message);
        }
        return e;
    });
}
export function mySqrt(n) {
    return ExampleMathError.try(() => {
        try {
            return ok(sqrt(n));
        }
        catch (e) {
            // specific error mapping (with try-catch)
            if (Error.isError(e) && e.message === 'number is negative') {
                return err(new ExampleMathError(ExampleMathErrorCode.OUTPUT_IS_IMAGINARY, e.message));
            }
            throw e;
        }
    });
}
