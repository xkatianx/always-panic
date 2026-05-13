import { MyErrorBase } from './base.js';
export declare enum MyErrorCode {
    /** some errors thrown by others' packages not dealt */
    OTHERS = 0,
    /** not used for now */
    placeholder = 1
}
export declare class MyError<C extends MyErrorCode> extends MyErrorBase<C> {
    protected causeForUnwrap: boolean;
    constructor(code: C, message: string);
    static fromAny(e: unknown): MyError<MyErrorCode.OTHERS>;
}
//# sourceMappingURL=error.d.ts.map