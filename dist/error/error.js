import { MyErrorBase } from './base.js';
export var MyErrorCode;
(function (MyErrorCode) {
    /** some errors thrown by others' packages not dealt */
    MyErrorCode[MyErrorCode["OTHERS"] = 0] = "OTHERS";
    /** unreachable */
    MyErrorCode[MyErrorCode["UNREACHABLE"] = 1] = "UNREACHABLE";
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
    static unreachable(reason = '') {
        return new MyError(MyErrorCode.UNREACHABLE, `unreachable: ${reason}`);
    }
    /** Convert to MyErrorCode.OTHERS */
    toOthers() {
        if (this.code === MyErrorCode.OTHERS)
            return this;
        const err = new MyError(MyErrorCode.OTHERS, this.message);
        err.cause = this.cause;
        if (this.stack != null)
            err.stack = this.stack;
        return err;
    }
}
