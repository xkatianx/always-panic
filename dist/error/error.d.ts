import { MyErrorBase } from './base.js';
export declare enum MyErrorCode {
    /** some errors thrown by others' packages not dealt */
    OTHERS = 0,
    /** unreachable */
    UNREACHABLE = 1
}
export declare class MyError<C extends MyErrorCode> extends MyErrorBase<C> {
    protected causeForUnwrap: boolean;
    constructor(code: C, message: string);
    static fromAny(e: unknown): MyError<MyErrorCode.OTHERS>;
    static unreachable(reason?: string): MyError<MyErrorCode.UNREACHABLE>;
    /** Convert to MyErrorCode.OTHERS */
    toOthers(): MyError<MyErrorCode.OTHERS>;
}
//# sourceMappingURL=error.d.ts.map