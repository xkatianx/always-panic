class Err {
    error;
    constructor(error) {
        this.error = error;
    }
    isOk() {
        return false;
    }
    isErr() {
        return true;
    }
    expect(message) {
        const e = new Error(message);
        if (this.error instanceof Error &&
            'causeForUnwrap' in this.error &&
            this.error.causeForUnwrap === true) {
            e.cause = this.error;
        }
        throw e;
    }
    unwrap() {
        const e = new Error(`Called unwrap() on an Err value: ${String(this.error)}`);
        if (this.error instanceof Error &&
            'causeForUnwrap' in this.error &&
            this.error.causeForUnwrap === true) {
            e.cause = this.error;
        }
        throw e;
    }
    unwrapErr() {
        return this.error;
    }
    unwrapOr(defaultValue) {
        return defaultValue;
    }
    unwrapOrElse(fn) {
        return fn(this.error);
    }
    map(_fn) {
        return this;
    }
    mapErr(fn) {
        return new Err(fn(this.error));
    }
    mapOr(defaultValue, _fn) {
        return defaultValue;
    }
    mapOrElse(defaultValue, _fn) {
        return defaultValue(this.error);
    }
    and(_res) {
        return this;
    }
    andThen(_fn) {
        return this;
    }
    or(res) {
        return res;
    }
    orElse(fn) {
        return fn(this.error);
    }
    inspect(_fn) {
        return this;
    }
    inspectErr(fn) {
        fn(this.error);
        return this;
    }
}
export default Err;
