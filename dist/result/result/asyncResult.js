import { err, ok } from '../index.js';
import util from './util.js';
class AsyncResult {
    promise;
    constructor(promise) {
        this.promise = promise;
    }
    /**
     * Create an AsyncResult from a Result, a PromiseLike, or a function returning a Result or a PromiseLike.
     * @param input - A Result, a PromiseLike, or a function returning a Result or a PromiseLike.
     * @returns An AsyncResult.
     * @throws inherits
     */
    static from(input) {
        return new AsyncResult(typeof input === 'function'
            ? Promise.resolve(input())
            : Promise.resolve(input));
    }
    transform(fn) {
        return new AsyncResult(this.promise.then(fn));
    }
    map(fn) {
        return this.transform(async (r) => (r.isOk() ? ok(await fn(r.value)) : r));
    }
    mapErr(fn) {
        return this.transform(async (r) => (r.isErr() ? err(await fn(r.error)) : r));
    }
    and(res) {
        return this.andThen(() => res);
    }
    andThen(fn) {
        return this.transform(async (r) => (r.isOk() ? await fn(r.value) : r));
    }
    or(res) {
        return this.orElse(() => res);
    }
    orElse(fn) {
        return this.transform(async (r) => (r.isErr() ? await fn(r.error) : r));
    }
    // biome-ignore lint/suspicious/noThenProperty: thenable
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
    inspect(fn) {
        return this.transform(async (r) => {
            if (r.isOk())
                await fn(r.value);
            return r;
        });
    }
    inspectErr(fn) {
        return this.transform(async (r) => {
            if (r.isErr())
                await fn(r.error);
            return r;
        });
    }
    /**
     * AsyncResult version of `Promise.all`, but without early rejection.
     * Waits for **every** input to settle, then returns the first `Err` by
     * **array order** (or `Ok([...])` if none errored).
     *
     * @see {@link AsyncResult.all} for fail-fast semantics matching `Promise.all`.
     * @param results - An array of AsyncResults to merge.
     * @returns An AsyncResult that is either an array of all Ok values
     * or the first Err value (by array order).
     * @example
     * // ok
     * const asyncResult1 = AsyncResult.from(ok(1))
     * const asyncResult2 = AsyncResult.from(ok("2"))
     * const asyncResult3 = AsyncResult.from(ok(3n))
     * const merged = await AsyncResult.merge([asyncResult1, asyncResult2, asyncResult3])
     * expect(merged.unwrap()).toEqual([1, "2", 3n])
     * // err
     * const asyncResult1 = AsyncResult.from(ok(1))
     * const asyncResult2 = AsyncResult.from(err("2"))
     * const asyncResult3 = AsyncResult.from(err(3n))
     * const merged = await AsyncResult.merge([asyncResult1, asyncResult2, asyncResult3])
     * expect(merged.unwrapErr()).toBe("2")
     */
    static merge(results) {
        return new AsyncResult(Promise.all(results).then(util.all));
    }
    /**
     * AsyncResult version of `Promise.all` with **fail-fast** semantics.
     *
     * - Resolves to `Ok([...])` once **all** inputs resolve to `Ok`
     *   (values preserved in input order).
     * - Resolves to `Err(e)` as soon as the **first** input (in time, not array
     *   order) resolves to `Err`, without waiting for the rest to settle.
     * - Rejects if any input's underlying Promise rejects.
     *
     * @see {@link AsyncResult.merge} for the variant that waits for every input
     * before picking the first `Err` by array order.
     *
     * @example
     * const slow = AsyncResult.from(
     *   new Promise(r => setTimeout(() => r(ok(1)), 1000)),
     * )
     * const fast = AsyncResult.from(err('boom'))
     * const result = await AsyncResult.all([slow, fast])
     * expect(result.unwrapErr()).toBe('boom') // resolves ~immediately
     */
    static all(results) {
        const promise = new Promise((resolve, reject) => {
            if (results.length === 0) {
                resolve(ok([]));
                return;
            }
            const okValues = new Array(results.length);
            let okCount = 0;
            let settled = false;
            results.forEach((input, i) => {
                Promise.resolve(input).then((r) => {
                    if (settled)
                        return;
                    if (r.isOk()) {
                        okValues[i] = r.value;
                        okCount++;
                        if (okCount === results.length) {
                            settled = true;
                            resolve(ok(okValues));
                        }
                    }
                    else {
                        settled = true;
                        resolve(err(r.error));
                    }
                }, (e) => {
                    if (settled)
                        return;
                    settled = true;
                    reject(e);
                });
            });
        });
        return new AsyncResult(promise);
    }
}
export default AsyncResult;
