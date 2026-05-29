import type { DeepReadonly, ErrContent, OkContent, Result } from './type.js';
declare class Ok<T> {
    readonly value: T;
    constructor(value: T);
    isOk(): this is Ok<T>;
    isErr(): this is never;
    expect(_message: string): T;
    unwrap(): T;
    unwrapErr(): never;
    unwrapOr<T2>(_defaultValue: T2): T;
    unwrapOrElse<_>(_fn: unknown): T;
    map<T2>(fn: (value: T) => T2): Ok<T2>;
    mapErr<_>(_fn: unknown): this;
    mapOr<U1, U2>(_defaultValue: U1, fn: (value: T) => U2): U2;
    mapOrElse<_, U2>(_defaultValue: unknown, fn: (value: T) => U2): U2;
    and<R extends Result<OkContent<R>, ErrContent<R>>>(res: R): R;
    andThen<R extends Result<OkContent<R>, ErrContent<R>>>(fn: (value: T) => R): R;
    or(_res: unknown): this;
    orElse(_fn: unknown): this;
    inspect(fn: (value: DeepReadonly<T>) => void): this;
    inspectErr(_fn: unknown): this;
}
export default Ok;
//# sourceMappingURL=ok.d.ts.map