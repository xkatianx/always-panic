export { default as AsyncResult } from './result/asyncResult.js';
export type { DeepReadonly, ErrContent, OkContent, Result, ResultLike, } from './result/type.js';
export { result };
import { default as result } from './result/util.js';
export declare const ok: <T>(value: T) => import("./result/type.js").Result<T, never>;
export declare const err: <E>(error: E) => import("./result/type.js").Result<never, E>;
//# sourceMappingURL=index.d.ts.map