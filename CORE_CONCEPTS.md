# Core concepts

## Expected vs unexpected errors

Every failure falls into one of two categories:

| | Expected | Unexpected |
| --- | --- | --- |
| **Meaning** | A normal outcome of the operation | A bug somewhere in the chain — not part of your API contract |
| **Examples** | Out-of-bounds index, invalid input, not found, permission denied | Logic error, broken invariant, unreachable branch, unknown throw from a dependency |
| **Representation** | Typed `Err(E)` with `E extends TypedError` | `UnexpectedError` — gathered at boundaries, then **always panic** (unwrap) inside your package |
| **Who handles it** | The caller, explicitly | Nobody downstream — stop and throw with a traceable `cause` |

**Expected errors should be typed.** That is what a Rust-style `Result` is for: success and failure are both part of the function's contract, and TypeScript tracks `E` at every call site.

**Unexpected errors are not part of the API you expose.** They may not be bugs in *your* code — they often come from an upstream package — but they are still not outcomes your callers should branch on. Inside your package, `UnexpectedError` should eventually unwrap (panic). That is why the library is called **always-panic**: unexpected failures stop here instead of riding a `Result` into the next layer.

### Divergence from Rust's std

In Rust, indexing out of range panics in the standard library. This model disagrees: an out-of-bounds access is not a bug in the std library — it is an **expected** failure the caller could have avoided or must handle.

A std-style API here would return something like:

```ts
Result<T, StdError<StdErrorCode.OUT_OF_BOUNDS>>
```

The caller then handles that `Err` explicitly — branch on the code, map it to a domain error, or, when certain it cannot happen in their context, `unwrap()` and accept that a throw means *their* code was wrong.

Panics (or throws from `unwrap`) belong at boundaries where failure was never a valid outcome, not inside low-level primitives that can fail for ordinary reasons.

## Rust-style `Result`

`Result<T, E>` is either `Ok<T>` or `Err<E>`. Public APIs should constrain `E` to your domain `TypedError` subclasses — the errors callers are meant to handle.

- Create values with `ok(value)` and `err(error)`; `ok()` with no argument is `Ok(undefined)`, the success case of a `Result<void, E>`.
- Normalize a value that may or may not already be a `Result` with `result.fromMaybe`.
- Narrow with `isOk()` / `isErr()`, or chain with `map`, `andThen`, `orElse`, and the rest of the Rust-aligned combinators.
- Combine sync results with `result.all`, which short-circuits on the first `Err` by array order.
- Chain many fallible steps with `result.gen`, where `yield*` is the equivalent of Rust's `?` operator: it evaluates to the `Ok` value or short-circuits the body with the first `Err`. Sync generator in, `Result` out; async generator in, `AsyncResult` out (and `yield*` accepts `AsyncResult`s directly).

`AsyncResult<T, E>` is the same idea for async code: `await` yields a `Result`. `AsyncResult.all` fails fast by completion time (an `Err` resolves the outer result; only a winning promise rejection rejects). `AsyncResult.merge` waits for every input to settle as a `Result`, then returns the first `Err` by array order — but an underlying promise rejection still rejects the merge.

## Typed errors (`TypedError`)

Expected failures carry a numeric `code` (enum), a `message`, and optional `info`. Subclass `TypedError` for your domain.

Typed errors are the `E` in `Result<T, E>` on **exported** functions — they are what callers match on, log, and map.

If a caller unwraps an `Err(TypedError)`, the bug is almost always at **that call site**: they treated an expected failure as impossible. The error itself is already the origin, so there is no need to attach a long `cause` chain when unwrapping.

## `UnexpectedError` — gather, refine, then panic

`UnexpectedError` (codes `UNKNOWN` and `UNREACHABLE`) is the built-in bucket for failures that are **not** yet typed — usually foreign `Error`s thrown by dependencies.

It exists because wrapping everything in `Result` is slightly at odds with the core idea: `Result` is for **expected** failures. Keeping a still-unexpected failure inside `Err` is a **temporary** state while you are at the integration boundary, not something you re-export to downstream packages.

### Progressive refinement

1. **Gather** — wrap foreign calls in your domain `YourError.try()`. Its overridden `fromAny` returns a typed error when it recognizes the throw, and `UnexpectedError` with code `UNKNOWN` otherwise. (Never call `TypedError.fromAny` on the base class — it throws; use `UnexpectedError.try` when you have no domain type yet.)
2. **Refine** — as you learn an upstream package, map specific cases from `UNKNOWN` to dedicated `TypedError` codes in `fromAny` or `mapErr` (see the [math example](https://github.com/xkatianx/always-panic/blob/main/src/error/example/math.ts)).
3. **Panic** — whatever remains `UnexpectedError` is still unexpected. Do not propagate it in your public `Result`. Call `result.panic` inside your package before the value crosses your boundary.

```text
upstream throw
      │
      ▼
  .try() / fromAny          ──► Err(UnexpectedError UNKNOWN)      "we don't know yet"
      │
      │  mapErr / fromAny    ──► Err(YourTypedError)               "now expected"
      │  (as you learn)
      ▼
  still UNKNOWN?             ──► result.panic inside your package  "always panic"
      │                            (never in an exported Result)
      ▼
  downstream only sees       Result<T, YourTypedError>
  typed Err
```

The panic is not always *your* bug — it may be an upstream defect or an unhandled throw. You still stop propagation so callers are never forced to handle open-ended failure modes.

## `.try()` — gather foreign throws into `Result`

`YourTypedError.try`, `trySync`, and `tryAsync` (or `UnexpectedError.try` before you have a domain class) pull foreign throws into `Result` in one place:

```text
┌──────────────────────┐
│  third-party /       │
│  legacy code         │  throws Error, rejects, or unknown values
└──────────┬───────────┘
           │  .try(fn)  — catch + fromAny
           ▼
┌──────────────────────┐
│  Result /            │  Ok(T) or Err(TypedError | UnexpectedError)
│  AsyncResult         │  (internal — refine before exporting)
└──────────┬───────────┘
           │  mapErr / fromAny — promote known cases to TypedError
           │  result.panic — unwrap on remaining UnexpectedError
           ▼
┌──────────────────────┐
│  exported API        │  Result<T, YourTypedError> only
└──────────────────────┘
```

Inside the callback:

- Return `ok(…)` / `err(…)` when you already know the outcome.
- Let foreign code throw — `fromAny` converts it (often via `UnexpectedError.fromAny`).
- Override `fromAny` on your `TypedError` subclass to recognize known upstream failures, falling back explicitly to `UnexpectedError.fromAny(e)`. `TypedError.fromAny` itself throws — never call it on the base class.

| Entry point | Output |
| --- | --- |
| `trySync(fn)` | `Result<…>` |
| `tryAsync(fn)` | `AsyncResult<…>` |
| `try(fn)` | picks sync vs async from the callback |

## Why only `UnexpectedError` sets `cause` on unwrap

Only `UnexpectedError` enables `causeForUnwrap`. When `unwrap()` or `expect()` runs on `Err(UnexpectedError)`, the thrown `Error` attaches the `UnexpectedError` as `Error.cause`, which in turn usually `cause`-links to the original foreign throw captured by `fromAny`.

That chain answers: **where did this unknown failure come from?** — often an upstream package, not the line that called `unwrap`.

Domain `TypedError` subclasses do **not** enable `causeForUnwrap`. Only `UnexpectedError` sets it. Unwrapping a typed `Err` almost always means the caller ignored a documented, expected failure. The `TypedError` itself is sufficient context; tracing further is usually noise.

## Where `unwrap` fits

| What you unwrap | Meaning |
| --- | --- |
| `Ok` | Success path — normal. |
| `Err(TypedError)` on a caller that assumed success | Bug at the **call site** — handle the `Err` or fix the assumption. |
| `Err(UnexpectedError)` inside **your** package | **Always panic** via `result.panic` — do not export; upstream or unmapped throw. |
| `Err(TypedError)` when **you** said it cannot happen | Bug in **your** logic — same as Rust's `unwrap` on `Err`. |

For **expected** failures, handle the `Err` explicitly instead of unwrapping.

## Mental checklist

1. **Designing an API** — Can this fail for ordinary reasons? Return `Result<T, YourTypedError>`, not `throw`. Never put `UnexpectedError` in the exported `E`.
2. **Integrating throw-based code** — Use `.try()` to gather; `mapErr` / `fromAny` to promote known cases to `TypedError`.
3. **Before returning to callers** — `result.panic` on any remaining `UnexpectedError` inside your package.
4. **Calling a typed API** — Branch on `isErr()` or use combinators. `unwrap()` only when failure is impossible **here**.
5. **Debugging an unwrap of `UnexpectedError`** — Follow `Error.cause` to the foreign throw; fix upstream, add a `fromAny` mapping, or handle at the right layer.

## Supporting pieces

- `ResultBase` — shared method contract for `Ok` and `Err`.
- `DeepReadonly` — compile-time readonly view for `inspect` / `inspectErr` callbacks (no runtime freeze).
- `result.asIs` / `result.isResult` / `result.panic` — union widening, runtime checks, and export-boundary panic.

## Further reading

- [README](README.md) — install, quick start, method tables
- [API reference](https://xkatianx.github.io/always-panic/)
- [Example: math](https://github.com/xkatianx/always-panic/blob/main/src/error/example/math.ts) — `.try()`, `mapErr`, `result.panic`, promoting `UNKNOWN` to typed errors
