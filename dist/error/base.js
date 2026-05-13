import { AsyncResult, err } from '../result/index.js';
export class MyErrorBase extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.name = 'MyErrorBase';
        this.code = code;
    }
    changeMessage(message) {
        this.message = message instanceof Function ? message(this.message) : message;
        return this;
    }
    /** Generate an instance of this error from anything. Used by `try`. */
    static fromAny(e) {
        const err = e instanceof Error ? e : new Error(String(e));
        const base = new MyErrorBase(0, err.message);
        if (err.stack)
            base.stack = err.stack;
        if (err.cause)
            base.cause = err.cause;
        return base;
    }
    static try(fn) {
        let captured;
        const sync = this.trySync(() => {
            captured = fn();
            return captured;
        });
        if (captured != null &&
            typeof captured === 'object' &&
            'then' in captured &&
            typeof captured.then === 'function') {
            const promise = captured;
            return this.tryAsync(() => promise);
        }
        return sync;
    }
    /** The sync part of `try`. Just use `try` instead. */
    static trySync(fn) {
        try {
            return fn();
        }
        catch (error) {
            return err(this.fromAny(error));
        }
    }
    /** The async part of `try`. Just use `try` instead. */
    static tryAsync(fn) {
        return AsyncResult.from(async () => {
            try {
                return await fn();
            }
            catch (error) {
                return err(this.fromAny(error));
            }
        });
    }
}
