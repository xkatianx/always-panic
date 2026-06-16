import { TypedError, UnexpectedError, UnexpectedErrorCode } from '../index.js';
export declare enum ExampleMathErrorCode {
    INPUT_IS_NAN = 0,
    DIVISION_BY_ZERO = 1,
    OUTPUT_IS_IMAGINARY = 2
}
export declare class ExampleMathError<C extends ExampleMathErrorCode> extends TypedError<C> {
    constructor(code: C, message: string);
    static fromAny(e: unknown): UnexpectedError<UnexpectedErrorCode.UNKNOWN> | ExampleMathError<ExampleMathErrorCode.INPUT_IS_NAN>;
}
export declare function myDivide(numerator: number, denominator: number): import("../../result/result/ok.js").default<number> | import("../../result/result/err.js").default<ExampleMathError<ExampleMathErrorCode.INPUT_IS_NAN> | ExampleMathError<ExampleMathErrorCode.DIVISION_BY_ZERO>>;
export declare function mySqrt(n: number): import("../../result/result/ok.js").default<number> | import("../../result/result/err.js").default<ExampleMathError<ExampleMathErrorCode.INPUT_IS_NAN> | ExampleMathError<ExampleMathErrorCode.OUTPUT_IS_IMAGINARY>>;
