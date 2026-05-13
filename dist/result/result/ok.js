class Ok {
    value;
    constructor(value) {
        this.value = value;
    }
    isOk() {
        return true;
    }
    isErr() {
        return false;
    }
    expect(_message) {
        return this.value;
    }
    unwrap() {
        return this.value;
    }
    unwrapErr() {
        throw new Error(`Called unwrapErr() on an Ok value: ${String(this.value)}`);
    }
    unwrapOr(_defaultValue) {
        return this.value;
    }
    unwrapOrElse(_fn) {
        return this.value;
    }
    map(fn) {
        return new Ok(fn(this.value));
    }
    mapErr(_fn) {
        return this;
    }
    mapOr(_defaultValue, fn) {
        return fn(this.value);
    }
    mapOrElse(_defaultValue, fn) {
        return fn(this.value);
    }
    and(res) {
        return res;
    }
    andThen(fn) {
        return fn(this.value);
    }
    or(_res) {
        return this;
    }
    orElse(_fn) {
        return this;
    }
    inspect(fn) {
        fn(this.value);
        return this;
    }
    inspectErr(_fn) {
        return this;
    }
}
export default Ok;
