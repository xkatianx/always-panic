import { default as result } from './result/util.js';
export { default as AsyncResult } from './result/asyncResult.js';
export { default as Err } from './result/err.js';
export { default as Ok } from './result/ok.js';
export * from './result/type.js';
export { result };
export declare const ok: <T>(value: T) => import("./result/type.js").Result<T, never>;
export declare const err: <E>(error: E) => import("./result/type.js").Result<never, E>;
