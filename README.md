# always-panic

Typed errors and Rust-style `Result` types for TypeScript.

Handle failures as values instead of untyped exceptions: define error codes, wrap throwing code with `try`, and chain operations with `map`, `andThen`, and friends. Works in sync and async code.

## Install

```bash
npm install always-panic
```

Requires TypeScript and a modern ESM runtime (Node.js 18+, Bun, Deno, etc.). Zero runtime dependencies.

API reference: [https://xkatianx.github.io/always-panic/](https://xkatianx.github.io/always-panic/)

Design rationale (expected vs unexpected errors, `.try()`, always-panic): [CORE_CONCEPTS.md](https://github.com/xkatianx/always-panic/blob/main/CORE_CONCEPTS.md)

## Quick start

```ts
import { UnexpectedError, TypedError, ok, err, result } from 'always-panic'

enum AppErrorCode {
  NOT_FOUND,
  INVALID_INPUT,
}

class AppError extends TypedError<AppErrorCode> {
  constructor(code: AppErrorCode, message: string) {
    super(code, message)
    this.name = 'AppError'
  }

  static override fromAny(e: unknown) {
    if (e instanceof Error && e.message === 'db row not found') {
      return new AppError(AppErrorCode.NOT_FOUND, e.message)
    }
    return UnexpectedError.fromAny(e)
  }
}

function findUser(id: string) {
  return result.panic(
    AppError.try(() => {
      if (id === '') return err(new AppError(AppErrorCode.INVALID_INPUT, 'id is empty'))
      if (id === 'missing') throw new Error('db row not found')
      return ok({ id, name: 'Alice' })
    }),
  )
}

const found = findUser('missing')

if (found.isOk()) {
  console.log(found.value.name)
} else {
  console.error(found.error.code, found.error.message)
}
```

Thrown values are converted through your error class's `fromAny` and returned as `Err`. Return `ok(...)` or `err(...)` explicitly when you already know the outcome.

## Core concepts

### Typed errors

`TypedError` is the base class for domain errors. Subclass it with a numeric enum of codes (`Code` is `number`):

```ts
import { TypedError, UnexpectedError } from 'always-panic'

enum ParseErrorCode {
  INVALID_JSON,
  EMPTY_INPUT,
}

class ParseError extends TypedError<ParseErrorCode> {
  constructor(code: ParseErrorCode, message: string) {
    super(code, message)
    this.name = 'ParseError'
  }

  static override fromAny(e: unknown) {
    if (e instanceof SyntaxError) {
      return new ParseError(ParseErrorCode.INVALID_JSON, e.message)
    }
    return UnexpectedError.fromAny(e)
  }
}
```

`UnexpectedError` holds failures that are not yet typed (usually from `.try()` / `fromAny`). Map known cases to your `TypedError` with `fromAny` or `mapErr`; call **`result.panic`** on remaining `UnexpectedError` inside your package instead of exporting it in public `Result` types. For impossible branches, return `err(UnexpectedError.unreachable('…'))` and panic before export.

See [CORE_CONCEPTS.md](https://github.com/xkatianx/always-panic/blob/main/CORE_CONCEPTS.md) for the full expected vs unexpected model and why only `UnexpectedError` attaches `cause` on unwrap.

### `Result<T, E>`

A discriminated union of `Ok<T>` and `Err<E>`, modeled after [Rust's `Result`](https://doc.rust-lang.org/std/result/enum.Result.html).

Create values with `ok(value)` and `err(error)`:

```ts
import { ok, err } from 'always-panic'

const success = ok(42)
const failure = err(new ParseError(ParseErrorCode.EMPTY_INPUT, 'nope'))
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

On `Err`, `unwrap()` and `expect()` attach the inner error as `Error.cause` when it is a `UnexpectedError` (or any error with `causeForUnwrap: true`).

`inspect` / `inspectErr` callbacks receive `DeepReadonly<T>` — a compile-time readonly view; nothing is frozen at runtime.

Use `result.all([...])` to combine multiple sync `Result`s. It short-circuits on the first `Err`.

Use `result.panic(res)` before returning from public APIs: if `res` is still `Err(UnexpectedError)`, it **throws** via `unwrap()` (with a traceable `cause` chain); otherwise it returns `res` with `UnexpectedError` removed from the error union.

`panic` accepts a `Result` or a `PromiseLike<Result>` (including an `AsyncResult`) and stays in that world — sync in, sync out; async in, `AsyncResult` out. In the async case the panic surfaces as a **rejection** rather than a synchronous throw:

```ts
// sync — throws here
const r = result.panic(MathError.try(() => ok(divide(a, b))))

// async — rejects on await, still chainable
const r = await result.panic(MathError.try(async () => ok(await fetchUser('1'))))
```

`result.panicSync` / `result.panicAsync` are the explicit variants, mirroring `trySync` / `tryAsync`; prefer `panic` unless you need to pin the overload.

### `AsyncResult<T, E>`

Thenable wrapper around `Promise<Result<T, E>>`. `await asyncResult` yields a `Result`. Chain with `map`, `andThen`, and the other combinators; callbacks may return sync or async values.

```ts
import { AsyncResult, ok } from 'always-panic'

const ar = AsyncResult.from(async () => ok(await fetchUser('1')))

const mapped = await ar.map((user) => user.name)
const name = mapped.unwrapOr('anonymous')
```

Construct from a `Result`, a `PromiseLike<Result<...>>`, or a function returning either:

```ts
AsyncResult.from(ok(1))
AsyncResult.from(Promise.resolve(ok(1)))
AsyncResult.from(async () => ok(await load()))
```

**`AsyncResult.all`** — fail-fast. Returns `Err(e)` as soon as the **first** input settles to `Err` (by completion time, not array index). Unlike `Promise.all`, an `Err` value resolves the outer async result instead of rejecting it; only a rejected underlying promise rejects (and only if that rejection wins the race before an `Err` settles).

**`AsyncResult.merge`** — waits for **every** input to settle as a `Result`, then returns the first `Err` by **array order** (or `Ok([...])` if all succeeded). Underlying promise **rejections** still reject the merge via `Promise.all` (it does not treat rejections as `Err` values).

```ts
const allOk = await AsyncResult.all([fetchA(), fetchB()])
const [a, b] = allOk.unwrap()

const merged = await AsyncResult.merge([fetchA(), fetchB()])
const [c, d] = merged.unwrap()
```

### `YourTypedError.try` or `UnexpectedError.try`

Wrap sync or async functions and turn thrown values into `Err`. Use a **domain subclass** of `TypedError` (override `fromAny`, fall back to `UnexpectedError.fromAny(e)`). Use **`UnexpectedError.try`** only when you have no domain error yet. Do not call **`TypedError.fromAny`** on the base class — it throws.

```ts
// sync → Result
const sync = ParseError.trySync(() => doWork())

// async → AsyncResult
const async = ParseError.tryAsync(async () => await doWork())

// or let try pick sync vs async from the callback's return type
const either = ParseError.try(() => doWork())
const fromAsync = ParseError.try(async () => ok(await load()))
```

Explicit variants: `trySync` and `tryAsync`.

## End-to-end example

The pattern below wraps third-party functions that throw, maps known failures to domain errors, and falls back to `UnexpectedError` for everything else:

```ts
import { UnexpectedError, TypedError, err, ok, result } from 'always-panic'

function divide(a: number, b: number) {
  if (b === 0) throw new Error('denominator is 0')
  return a / b
}

enum MathErrorCode {
  DIVISION_BY_ZERO,
}

class MathError extends TypedError<MathErrorCode> {
  constructor(code: MathErrorCode, message: string) {
    super(code, message)
    this.name = 'MathError'
  }

  static override fromAny(e: unknown) {
    if (e instanceof Error && e.message === 'denominator is 0') {
      return new MathError(MathErrorCode.DIVISION_BY_ZERO, e.message)
    }
    return UnexpectedError.fromAny(e)
  }
}

export function safeDivide(a: number, b: number) {
  return result.panic(MathError.try(() => ok(divide(a, b))))
}

const divided = safeDivide(10, 0)
// divided.isErr() === true
// divided.error.code === MathErrorCode.DIVISION_BY_ZERO
```

See [the math example in the repo](https://github.com/xkatianx/always-panic/blob/main/src/error/example/math.ts) for a fuller version with `mapErr`, `result.panic`, and nested `try`/`catch` mapping.

## API exports

```ts
// Errors
export { TypedError, UnexpectedError, UnexpectedErrorCode }
export type { Code }

// Result (values)
export { Ok, Err, ok, err, result, AsyncResult }

// Result (types)
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

// result namespace
result.ok
result.err
result.asIs   // widen merged Result unions for type assertions
result.all    // sync Result.all
result.isResult
result.panic       // unwrap remaining UnexpectedError before export (sync or async)
result.panicSync   // the sync part of panic
result.panicAsync  // the async part of panic
```

## Development

```bash
git clone https://github.com/xkatianx/always-panic.git
cd always-panic
bun install
bun test
bun run build
```

## License

[MIT](LICENSE)
