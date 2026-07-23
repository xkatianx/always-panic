# Result

Rust-style `Result` types for TypeScript — the value half of
[always-panic](../../README.md).

Everything here stands alone: `E` can be any type (a `string`, a plain
`Error`, a discriminated union, …). Nothing requires `TypedError` — the
[typed-error half](../../README.md#typed-errors) builds on top of these
types, not the other way around.

```ts
import { ok, err, type Result } from 'always-panic'

function parsePort(raw: string): Result<number, string> {
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 0 || n > 65535) return err(`bad port: ${raw}`)
  return ok(n)
}

const port = parsePort('8080').unwrapOr(3000)
```

## `Result<T, E>`

A discriminated union of `Ok<T>` and `Err<E>`, modeled after
[Rust's `Result`](https://doc.rust-lang.org/std/result/enum.Result.html).
Create values with `ok(value)` and `err(error)`; narrow with `isOk()` /
`isErr()`.

```ts
const r = parsePort(input)
if (r.isOk()) {
  r.value // number
} else {
  r.error // string
}
```

Common methods:

| Method | Ok | Err |
| --- | --- | --- |
| `isOk()` / `isErr()` | type guard | type guard |
| `expect(msg)` | returns value | throws `Error` with `msg` |
| `unwrap()` | returns value | throws `Error` |
| `unwrapErr()` | throws | returns error |
| `unwrapOr(default)` | returns value | returns default |
| `unwrapOrElse(fn)` | returns value | calls `fn(error)` |
| `map(fn)` / `mapErr(fn)` | maps value / unchanged | unchanged / maps error |
| `mapOr` / `mapOrElse` | compute from value | return default or call `fn(error)` |
| `and` / `andThen(fn)` | pass through / chain `Result` | unchanged |
| `or` / `orElse(fn)` | unchanged | pass through / fallback `Result` |
| `inspect(fn)` / `inspectErr(fn)` | side effect on value / unchanged | unchanged / side effect on error |

`inspect` / `inspectErr` callbacks receive `DeepReadonly<T>` — a compile-time
readonly view; nothing is frozen at runtime.

On `Err`, `unwrap()` and `expect()` attach the inner error as `Error.cause`
when it opts in with `causeForUnwrap: true` (the error half's
`UnexpectedError` is the built-in error that does).

## Early return: `result.gen` (the `?` operator)

`result.gen` runs a generator body in which `yield* res` either evaluates to
the `Ok` value or short-circuits the whole body with the `Err` — the
equivalent of Rust's
[`?` operator](https://doc.rust-lang.org/std/result/index.html#the-question-mark-operator-).
No more `if (r.isErr()) return r` ladders:

```ts
import { ok, result } from 'always-panic'

// sync — Result out
const r = result.gen(function* () {
  const user = yield* findUser(id) // Result<User, DbError>
  const posts = yield* findPosts(user) // Result<Post[], DbError | CacheError>
  return ok({ user, posts })
}) // Result<{ user: User; posts: Post[] }, DbError | CacheError>

// async — AsyncResult out; yield* works on AsyncResult directly
const ar = result.gen(async function* () {
  const user = yield* fetchUser(id) // AsyncResult<User, HttpError>
  const posts = yield* fetchPosts(user) // AsyncResult<Post[], HttpError>
  return ok({ user, posts })
})
```

- The body must `return` a `Result` (`ok(...)` or `err(...)`). Error types from every `yield*` and from the returned `Result` accumulate in the resulting error union.
- A yielded `Err` is returned **by reference** — identity and stack preserved, exactly like an early `return r`.
- On early return the generator is **closed**, so `finally` blocks and `using` / `await using` disposals in the body still run.
- Thrown (foreign) exceptions are not caught — gathering throws stays the job of the [error half's `.try()`](../../README.md).
- Sync in, `Result` out; async in, `AsyncResult` out. In an async body `yield*` accepts both `AsyncResult`s and awaited `Result`s; sync `Result`s work in either. Explicit variants: `genSync` / `genAsync`.

## The `result` namespace

```ts
import { result } from 'always-panic'
```

- **`result.ok(value)` / `result.err(error)`** — also exported top-level as
  `ok` / `err`. `ok()` with no argument is `Ok(undefined)`, typed
  `Result<void, never>` — the success case of a `Result<void, E>`.
- **`result.all([...])`** — combine sync `Result`s into
  `Result<[values], E>`; short-circuits on the first `Err` by array order.
- **`result.isResult(value)`** — runtime guard: `value instanceof Ok | Err`.
- **`result.gen(body)`** (and `genSync` / `genAsync`) — early return via
  `yield*`; see above.
- **`result.asIs(res)`** — identity helper that widens a merged union like
  `Ok<A> | Err<B> | Err<C>` back to `Result<A, B | C>` for type assertions.
- **`result.panic(res)`** (and `panicSync` / `panicAsync`) — the one bridge
  to the [typed-error half](../../README.md#typed-errors): unwraps (throws)
  when `res` is `Err(UnexpectedError)` and removes `UnexpectedError` from the
  error union otherwise. Irrelevant unless you use `TypedError`; see the
  [main README](../../README.md) and [CORE_CONCEPTS](../../CORE_CONCEPTS.md).

## `AsyncResult<T, E>`

Thenable wrapper around `Promise<Result<T, E>>`. `await asyncResult` yields a
`Result`. Chain with `map`, `mapErr`, `and`, `andThen`, `or`, `orElse`,
`inspect`, `inspectErr` — the callbacks may return sync or async values.

```ts
import { AsyncResult, ok } from 'always-panic'

const ar = AsyncResult.from(async () => ok(await fetchUser('1')))

const mapped = await ar.map((user) => user.name)
const name = mapped.unwrapOr('anonymous')
```

Construct from a `Result`, a `PromiseLike<Result<...>>`, or a function
returning either:

```ts
AsyncResult.from(ok(1))
AsyncResult.from(Promise.resolve(ok(1)))
AsyncResult.from(async () => ok(await load()))
```

**`AsyncResult.all`** — fail-fast. Returns `Err(e)` as soon as the **first**
input settles to `Err` (by completion time, not array index). Unlike
`Promise.all`, an `Err` value resolves the outer async result instead of
rejecting it; only a rejected underlying promise rejects (and only if that
rejection wins the race before an `Err` settles).

**`AsyncResult.merge`** — waits for **every** input to settle as a `Result`,
then returns the first `Err` by **array order** (or `Ok([...])` if all
succeeded). Underlying promise **rejections** still reject the merge via
`Promise.all` (it does not treat rejections as `Err` values).

```ts
const allOk = await AsyncResult.all([fetchA(), fetchB()])
const [a, b] = allOk.unwrap()

const merged = await AsyncResult.merge([fetchA(), fetchB()])
const [c, d] = merged.unwrap()
```

## Exports

```ts
// values
export { Ok, Err, ok, err, result, AsyncResult }

// types
export type {
  Result,
  ResultBase,
  ResultLike,
  OkContent,
  ErrContent,
  DeepReadonly,
  MaybeResult,
  ResultOkTypes,
  ResultErrTypes,
  AsyncResultOkTypes,
  AsyncResultErrTypes,
}
```
