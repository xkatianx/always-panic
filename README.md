# always-panic

Typed errors and Rust-style `Result` types for TypeScript.

Handle failures as values instead of untyped exceptions: define error codes, wrap throwing code with `try`, and chain operations with `map`, `andThen`, and friends. Works in sync and async code.

## Install

```bash
npm install always-panic
```

Requires a modern ESM runtime (Node.js 18+, Bun, Deno, etc.). Zero runtime dependencies.

### TypeScript support

**Requires TypeScript 5.4 or newer. There is no upper bound** — 6.x and 7.x (the native port) are both supported.

| TypeScript | Status |
| --- | --- |
| ≤ 5.2 | Not supported — `result.all` and `AsyncResult.all` infer `unknown[]` instead of a tuple |
| 5.3 | Not supported — `orElse` of two different Ok payloads then `andThen` leaks `OkContent<R>` into the callback |
| 5.4 and newer | Supported, including 6.x and 7.x |

5.4 is the floor because chaining `orElse` across distinct Ok types, then `andThen` on a shared field, only infers correctly from that release. (`const` type parameters for `result.all` arrived in 5.3, but that is no longer the limiting check.)

Every pull request runs a CI matrix over TypeScript 5.4 (the floor), 5.9, 6.0, and 7.0: on each version it compiles the full type test suite and a downstream consumer against the shipped `.d.ts` under `nodenext`, `node16`, and `bundler` resolution, with `strict` and `skipLibCheck: false`. Locally, `bun run test:compat` runs the consumer checks against your installed TypeScript.

API reference: [https://xkatianx.github.io/always-panic/](https://xkatianx.github.io/always-panic/)

Design rationale (expected vs unexpected errors, `.try()`, always-panic): [CORE_CONCEPTS.md](https://github.com/xkatianx/always-panic/blob/main/CORE_CONCEPTS.md)

Standalone `Result` / `AsyncResult` guide (no typed errors required): [src/result/README.md](https://github.com/xkatianx/always-panic/blob/main/src/result/README.md)

## Quick start

```ts
import { UnexpectedError, TypedError, ok, err, result } from 'always-panic'

enum AppErrorCode {
  NOT_FOUND,
  INVALID_INPUT,
}

class AppError extends TypedError<AppErrorCode> {
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

`TypedError` is the base class for domain errors. Subclass it with a numeric enum of codes (`Code` is `number`). No constructor boilerplate is needed — `name` is set from the class name automatically (declare a field `override name = 'ParseError'` if it must survive minification):

```ts
import { TypedError, UnexpectedError } from 'always-panic'

enum ParseErrorCode {
  INVALID_JSON,
  EMPTY_INPUT,
  BAD_TOKEN,
}

class ParseError<
  C extends ParseErrorCode = ParseErrorCode,
> extends TypedError<C> {
  static override fromAny(e: unknown) {
    if (e instanceof SyntaxError) {
      return new ParseError(ParseErrorCode.INVALID_JSON, e.message)
    }
    return UnexpectedError.fromAny(e)
  }
}
```

Keeping the class generic in its code (`ParseError<C extends ParseErrorCode = ParseErrorCode>`) makes factories and `fromAny` produce narrowly-typed errors (`ParseError<ParseErrorCode.INVALID_JSON>`), so a function's error union advertises exactly the codes it can produce — which is what makes `match` exhaustiveness (below) precise.

Each code can carry a typed `info` payload by passing an info map as the second type parameter. The constructor then requires `info` exactly when the map entry is not `undefined`-able:

```ts
type ParseErrorInfoMap = {
  [ParseErrorCode.INVALID_JSON]: undefined
  [ParseErrorCode.EMPTY_INPUT]: undefined
  [ParseErrorCode.BAD_TOKEN]: { token: string }
}

class ParseError<
  C extends ParseErrorCode = ParseErrorCode,
> extends TypedError<C, ParseErrorInfoMap> {}

new ParseError(ParseErrorCode.BAD_TOKEN, 'bad', { token: 'x' }) // info required
new ParseError(ParseErrorCode.EMPTY_INPUT, 'empty') // info omitted
```

Because the required-`info` constructor signature only resolves for concrete codes, subclasses should not declare their own constructors (there is nothing left to do in one).

`UnexpectedError` holds failures that are not yet typed (usually from `.try()` / `fromAny`). Map known cases to your `TypedError` with `fromAny` or `mapErr`; call **`result.panic`** on remaining `UnexpectedError` inside your package instead of exporting it in public `Result` types. For impossible branches, return `err(UnexpectedError.unreachable('…'))` and panic before export.

See [CORE_CONCEPTS.md](https://github.com/xkatianx/always-panic/blob/main/CORE_CONCEPTS.md) for the full expected vs unexpected model and why only `UnexpectedError` attaches `cause` on unwrap.

### `Result<T, E>` and `AsyncResult<T, E>`

A discriminated union of `Ok<T>` and `Err<E>`, modeled after [Rust's `Result`](https://doc.rust-lang.org/std/result/enum.Result.html), plus `AsyncResult` — a thenable wrapper around `Promise<Result>` with the same combinators.

The `Result` half stands alone: `E` can be any type, and nothing in it requires `TypedError`. See the **[Result README](src/result/README.md)** for the full guide — creating values, the method table, early return with `result.gen` (Rust's `?` operator), the `result` namespace utilities, and `AsyncResult.all` / `AsyncResult.merge`.

```ts
import { ok, err, type Result } from 'always-panic'

const success = ok(42)
const failure = err(new ParseError(ParseErrorCode.EMPTY_INPUT, 'nope'))
```

### `result.panic`

Use `result.panic(res)` before returning from public APIs: if `res` is still `Err(UnexpectedError)`, it **throws** via `unwrap()` (with a traceable `cause` chain); otherwise it returns `res` with `UnexpectedError` removed from the error union.

`panic` accepts a `Result` or a `PromiseLike<Result>` (including an `AsyncResult`) and stays in that world — sync in, sync out; async in, `AsyncResult` out. In the async case the panic surfaces as a **rejection** rather than a synchronous throw:

```ts
// sync — throws here
const r = result.panic(MathError.try(() => ok(divide(a, b))))

// async — rejects on await, still chainable
const r = await result.panic(MathError.try(async () => ok(await fetchUser('1'))))
```

`result.panicSync` / `result.panicAsync` are the explicit variants, mirroring `trySync` / `tryAsync`; prefer `panic` unless you need to pin the overload.

### `YourTypedError.is` — narrow by class and code

A static type guard. With no codes it narrows to the class — use it to split a mixed-class error union. With codes it also narrows `code` **and** `info` (when the class has an info map), so no `e.code as YourErrorCode` cast is needed downstream:

```ts
if (ParseError.is(e, ParseErrorCode.BAD_TOKEN)) {
  e.code // ParseErrorCode.BAD_TOKEN
  e.info // { token: string }
}
```

Narrowing keeps union members that are already narrower than the class (e.g. `ParseError<A>` in `ParseError<A> | HttpError<B>`), so a following `match` still exhausts only the value's codes. Note that narrowing is structural: two error classes sharing the same enum and info shape cannot be told apart at the type level (at runtime `is` still distinguishes them via `instanceof`).

On a **distributed** union (`ParseError<A> | ParseError<B>` — the shape narrowly-typed factories produce), a fully matched member is also **subtracted** in the false branch, exactly like `===` narrowing on a discriminant. That makes `is` the lightweight way to recover from one code, with the recovered code trimmed from the resulting union:

```ts
const items = parseItems(input).orElse((e) =>
  ParseError.is(e, ParseErrorCode.EMPTY_INPUT) ? ok([]) : err(e),
) // EMPTY_INPUT is trimmed from the error union
```

The subtraction cannot see inside a single wide instantiation (`ParseError<A | B>`) — there the false branch keeps the full union; use `match` when you need per-code handling regardless of shape.

### `YourTypedError.match` — exhaustively map codes

`match` maps an error to a value with one handler per code, like Rust's `match` on an error enum. Exhaustiveness is keyed on the **value's static type**, not the class's full enum: an error typed `ParseError<EMPTY_INPUT | BAD_TOKEN>` requires handlers for exactly those two codes. When upstream widens a function's error union with a new code, every `match` on it without `else` fails to compile, naming exactly the missing code.

```ts
declare const e: ParseError<
  ParseErrorCode.EMPTY_INPUT | ParseErrorCode.BAD_TOKEN
>

// exhaustive — a handler per code in the value's type; code & info narrowed per branch
const msg = ParseError.match(e, {
  [ParseErrorCode.EMPTY_INPUT]: () => 'nothing to parse',
  [ParseErrorCode.BAD_TOKEN]: (e) => `bad token ${e.info.token}`,
})

// partial — any subset of codes plus a required `else`
const msg2 = ParseError.match(e, {
  [ParseErrorCode.BAD_TOKEN]: (e) => `bad token ${e.info.token}`,
  else: (e) => e.message,
})
```

`match` is also how you **recover** from some codes while propagating the rest — handlers that keep a code return `err(e)` with `e` narrowed to that one code, so recovered codes are *erased* from the resulting error union:

```ts
const items = parseItems(input).orElse((e) =>
  ParseError.match(e, {
    [ParseErrorCode.EMPTY_INPUT]: () => ok([]),
    [ParseErrorCode.BAD_TOKEN]: (e) => err(e), // e: ParseError<BAD_TOKEN>
  }),
) // Result<Item[], ParseError<ParseErrorCode.BAD_TOKEN>> — EMPTY_INPUT is gone
```

(Erasure needs the exhaustive form: an `else` handler receives the un-narrowed error, so codes routed through `else` keep the full union.)

`match` is a static method (`ParseError.match(e, ...)`) rather than an instance method because distributed unions like `ParseError<A> | ParseError<B>` — the shape produced by separate `err()` branches — cannot dispatch a generic instance method, and calling it on the class rejects errors of other classes whose numeric codes would otherwise collide. Use `is` to split a mixed-class union first, then `match` to exhaust one class's codes.

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
export type {
  Code,
  InfoMap, // constraint for TypedError's info-map type parameter
  CodeContent, // code union of an error type's static type
  AtCode, // error type narrowed to specific code(s)
  IsCode, // `is` predicate: AtCode keyed on the argument's type
  MatchHandlers, // exhaustive handler map for TypedError.match
  PartialMatchHandlers, // partial handler map + `else` for TypedError.match
  TypedErrorClass, // static-side shape used by the `try` helpers
}

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
  MaybeOkContent,
  ResultOkTypes,
  ResultErrTypes,
  AsyncResultOkTypes,
  AsyncResultErrTypes,
}

// result namespace
result.ok       // ok() with no argument is Ok(undefined): Result<void, never>
result.err
result.asIs     // widen merged Result unions for type assertions
result.all      // sync Result.all
result.isResult
result.fromMaybe   // normalize a MaybeResult into a Result
result.panic       // unwrap remaining UnexpectedError before export (sync or async)
result.panicSync   // the sync part of panic
result.panicAsync  // the async part of panic
result.gen         // early return via yield* — Rust's `?` operator (sync or async)
result.genSync     // the sync part of gen
result.genAsync    // the async part of gen
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
