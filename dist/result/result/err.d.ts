import type { DeepReadonly, ErrContent, OkContent, Result, ResultBase } from './type.js';
declare class Err<E> implements ResultBase<never, E> {
    readonly error: E;
    constructor(error: E);
    isOk(): this is never;
    isErr(): this is Err<E>;
    expect(message: string): never;
    unwrap(): never;
    unwrapErr(): E;
    unwrapOr<T2>(defaultValue: T2): T2;
    unwrapOrElse<T2>(fn: (error: E) => T2): T2;
    map<_>(_fn: unknown): this;
    mapErr<E2>(fn: (error: E) => E2): Err<E2>;
    mapOr<U1, _>(defaultValue: U1, _fn: unknown): U1;
    mapOrElse<U1, _>(defaultValue: (error: E) => U1, _fn: unknown): U1;
    and(_res: unknown): this;
    andThen(_fn: unknown): this;
    or<R extends Result<OkContent<R>, ErrContent<R>>>(res: R): R;
    orElse<R extends Result<OkContent<R>, ErrContent<R>>>(fn: (error: E) => R): R;
    inspect(_fn: unknown): this;
    inspectErr(fn: (error: DeepReadonly<E>) => void): this;
}
export default Err;
