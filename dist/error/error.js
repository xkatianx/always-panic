import { MyErrorBase } from './base.js';
export var MyErrorCode;
(function (MyErrorCode) {
    /** some errors thrown by others' packages not dealt */
    MyErrorCode[MyErrorCode["OTHERS"] = 0] = "OTHERS";
    /** not used for now */
    MyErrorCode[MyErrorCode["placeholder"] = 1] = "placeholder";
})(MyErrorCode || (MyErrorCode = {}));
export class MyError extends MyErrorBase {
    causeForUnwrap = true;
    constructor(code, message) {
        super(code, message);
        this.name = 'MyError';
    }
    static fromAny(e) {
        const err = new MyError(MyErrorCode.OTHERS, Error.isError(e) ? e.message : String(e));
        err.cause = e;
        return err;
    }
}
