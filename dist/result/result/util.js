import Err from './err.js';
import Ok from './ok.js';
function ok(value) {
    return new Ok(value);
}
function err(error) {
    return new Err(error);
}
function asIs(res) {
    return res;
}
function wrapError(e) {
    if (e instanceof Error)
        return err(e);
    else
        return err(new Error(String(e)));
}
/**
 * Parse a set of `Result`s, returning an array of all `Ok` values.
 * Short circuits with the first `Err` found, if any
 */
function all(results) {
    const okResult = [];
    for (const result of results) {
        if (result.isOk()) {
            okResult.push(result.value);
        }
        else {
            return result;
        }
    }
    return ok(okResult);
}
function wrapFn(fn) {
    return asIs(fn());
}
function isResult(value) {
    return value instanceof Ok || value instanceof Err;
}
export default {
    ok,
    err,
    asIs,
    wrapError,
    all,
    wrapFn,
    isResult,
};
