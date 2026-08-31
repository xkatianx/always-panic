/**
 * Consumer-facing type smoke test. Compiled against the shipped `dist` under
 * each module resolution mode by the `test:compat` script (`compat/tsconfig.*`),
 * and across every supported TypeScript version by the `typescript-compat` CI
 * matrix in `.github/workflows/pr-to-main.yml`.
 *
 * It imports by package name rather than by relative path, so resolution goes
 * through the published `exports` map exactly as a downstream consumer's would.
 * Everything here is type-level only; the file is never executed.
 *
 * Kept in step with the public API: models the documented 0.9.0 surface —
 * info-mapped typed errors, `is` / `match`, `result.gen`, `result.fromMaybe`,
 * and zero-arg `ok()`.
 */
import {
  AsyncResult,
  type Code,
  err,
  type MaybeResult,
  ok,
  type Result,
  result,
  TypedError,
  UnexpectedError,
} from 'always-panic'

type Equal<A, B> =
  (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2
    ? true
    : false
type Expect<T extends true> = T

enum ParseErrorCode {
  EMPTY_INPUT,
  BAD_TOKEN,
}

/** Per-code `info` payloads: `BAD_TOKEN` carries one, `EMPTY_INPUT` does not. */
type ParseErrorInfoMap = {
  [ParseErrorCode.EMPTY_INPUT]: undefined
  [ParseErrorCode.BAD_TOKEN]: { token: string }
}

/**
 * The documented 0.9.0 subclass shape: generic in its code with a default, an
 * info map as the second type parameter, and **no constructor** — the base
 * supplies the conditional-`info` constructor and sets `name` from the class.
 */
class ParseError<C extends ParseErrorCode = ParseErrorCode> extends TypedError<
  C,
  ParseErrorInfoMap
> {
  static override fromAny(e: unknown) {
    if (e instanceof SyntaxError) {
      return new ParseError(ParseErrorCode.EMPTY_INPUT, e.message)
    }
    return UnexpectedError.fromAny(e)
  }
}

// Constructor requires `info` exactly when the code's map entry is not
// `undefined`-able.
new ParseError(ParseErrorCode.EMPTY_INPUT, 'nothing to parse')
new ParseError(ParseErrorCode.BAD_TOKEN, 'bad token', { token: 'x' })

// Factories stay narrowly typed, so the error union advertises exact codes.
function parse(input: string): Result<number, ParseError> {
  if (input === '')
    return err(new ParseError(ParseErrorCode.EMPTY_INPUT, 'empty'))
  const n = Number(input)
  if (Number.isNaN(n))
    return err(
      new ParseError(ParseErrorCode.BAD_TOKEN, 'bad', { token: input }),
    )
  return ok(n)
}

// isOk / isErr narrow both branches.
export function narrowing(): string {
  const r = parse('1')
  if (r.isOk()) return String(r.value)
  const e: ParseError = r.error
  return e.message
}

// Combinators keep the Ok and Err types threaded through a chain.
export const chained: number = parse('1')
  .map((n) => n * 2)
  .mapErr((e) => e.changeMessage('boom'))
  .unwrapOr(0)

// `is` with a code narrows both `code` and `info` — no `as` cast needed.
export function classify(e: unknown): string {
  if (ParseError.is(e, ParseErrorCode.BAD_TOKEN)) return e.info.token
  if (ParseError.is(e)) return String(e.code)
  return 'other'
}

// `match` is exhaustive over the value's static codes; handlers get narrow info.
declare const someErr: ParseError<
  ParseErrorCode.EMPTY_INPUT | ParseErrorCode.BAD_TOKEN
>
const matched = ParseError.match(someErr, {
  [ParseErrorCode.EMPTY_INPUT]: () => 'nothing to parse',
  [ParseErrorCode.BAD_TOKEN]: (e) => `bad token ${e.info.token}`,
})

// `result.gen` — Rust's `?`: yields short-circuit, errors accumulate.
const generated = result.gen(function* () {
  const a = yield* parse('1')
  const b = yield* parse('2')
  return ok(a + b)
})

// Zero-arg `ok()` is the success of a `Result<void, E>`.
const voidOk = ok()

// `fromMaybe` normalizes a value-or-Result into a Result.
declare const maybe: MaybeResult<number, ParseError>
const normalized = result.fromMaybe(maybe)

// `try` folds foreign throws into the error union via `fromAny`.
const tried = ParseError.try(() => parse('1'))
void tried

// `panic` strips UnexpectedError from the error union, leaving domain errors.
const panicked = result.panic(parse('1'))

// AsyncResult is awaitable and resolves to a plain Result.
const awaited: Result<number, ParseError> = await AsyncResult.from(parse('1'))
void awaited

// `orElse` of two different Ok payloads, then `andThen` on a shared field.
// TypeScript 5.3 leaks `OkContent<R>` into the callback (`g.x` fails); 5.4
// is the support floor because of this chain.
type RowA = { x: string; kind: 'a' }
type RowB = { x: string; kind: 'b' }
declare const rowA: RowA
declare const rowB: RowB
function maybeRow<T>(row: T | undefined) {
  return ok(row).andThen((v) =>
    v !== undefined ? ok(v) : err(new Error('empty')),
  )
}
const orElseAndThen = result.asIs(
  maybeRow(rowA)
    .orElse(() => maybeRow(rowB))
    .andThen((g) => ok(g.x)),
)

// `const` type parameters infer a tuple, not `unknown[]` (fails on TS < 5.3).
const allSync = result.all([ok(1), ok('two')])
const allAsync = await AsyncResult.all([
  AsyncResult.from(ok(1)),
  AsyncResult.from(ok('two')),
])
const merged = await AsyncResult.merge([
  AsyncResult.from(ok(1)),
  AsyncResult.from(ok('two')),
])

export type Assertions = [
  // Floor check: orElse of distinct Ok types then andThen on a shared field.
  Expect<Equal<typeof orElseAndThen, Result<string, Error>>>,
  // Tuple inference (const type parameters, TS 5.3+).
  Expect<Equal<typeof allSync, Result<[number, string], never>>>,
  Expect<Equal<typeof allAsync, Result<[number, string], never>>>,
  Expect<Equal<typeof merged, Result<[number, string], never>>>,
  // New 0.9.0 surface.
  Expect<Equal<typeof matched, string>>,
  Expect<Equal<typeof generated, Result<number, ParseError>>>,
  Expect<Equal<typeof voidOk, Result<void, never>>>,
  Expect<Equal<typeof normalized, Result<number, ParseError>>>,
  Expect<Equal<typeof panicked, Result<number, ParseError>>>,
  // `Code` is the public numeric base for error codes.
  Expect<Equal<Code, number>>,
]
