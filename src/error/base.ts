import type {
  ErrContent,
  OkContent,
  Result,
  ResultLike,
} from '../result/index.js'
import { AsyncResult, err } from '../result/index.js'

export type Code = number

/**
 * Phantom key that carries a `TypedError` subclass's info map at the type
 * level, so `CodeContent` / `AtCode` can recover it via `infer`. The property
 * never exists at runtime.
 *
 * @internal Type-level only — do not import this symbol at runtime.
 */
export declare const infoMapKey: unique symbol

/** Constraint for a `TypedError` info map: error code → `info` payload type. */
export type InfoMap<T extends Code> = Partial<Record<T, unknown>>

/**
 * The static-side shape the `try` helpers need from a `TypedError` class.
 * Deliberately excludes the construct signature: no subclass is assignable to
 * `typeof TypedError` — even one that only inherits the constructor — because
 * the conditional `info` tuple, re-instantiated with the subclass's narrowed
 * code parameter, cannot be related to the base's unresolved form.
 */
export type TypedErrorClass = Pick<
  typeof TypedError,
  'fromAny' | 'trySync' | 'tryAsync'
>

/**
 * The union of error codes in `E`'s static type — not the full enum of the
 * class, but exactly the codes this value may carry. Distributes over unions,
 * so `XError<A> | XError<B>` and `XError<A | B>` both give `A | B`.
 */
export type CodeContent<E> = E extends TypedError<infer C, infer _M> ? C : never

/**
 * `E` narrowed to code(s) `C`: `code` becomes `C` and `info` becomes the info
 * map's payload for `C`. Distributes over both `E` and `C`, dropping union
 * members of `E` that cannot carry `C`.
 */
export type AtCode<E, C extends Code> =
  E extends TypedError<infer TC, infer M>
    ? C extends TC
      ? E & { code: C; info: M[C & keyof M] }
      : never
    : never

/**
 * Predicate type for {@link TypedError.is} with codes, computed from the
 * **argument's** type `E` rather than the class's wide instance type `I`.
 * Same-class union members keep their own (narrow) instantiation, which is
 * what lets the false branch of `is` subtract a matched member from a
 * distributed union — like `===` narrowing on a discriminant — instead of
 * comparing every member against the wide class type and removing nothing.
 * Falls back to the class-based {@link AtCode} for `unknown` and other
 * non-member inputs; members of other `TypedError` classes never match.
 */
export type IsCode<E, I, C extends Code> = unknown extends E
  ? AtCode<I, C>
  : E extends I
    ? CodeContent<E> extends C
      ? // Fully matched member: keep its own type. Its `info` is already
        // per-code, and a bare member (no intersection carrying `info`) is the
        // shape TypeScript's false-branch subtraction accepts.
        E
      : AtCode<E, C>
    : E extends TypedError<Code>
      ? never
      : AtCode<I, C>

/**
 * Handler map for {@link TypedError.match} covering **every** code in `E`'s
 * static type. Omitting a code is a compile error naming exactly the missing
 * code — this is how downstream keeps up when upstream widens its error union.
 */
export type MatchHandlers<E> = {
  [K in CodeContent<E>]: (e: AtCode<E, K>) => unknown
}

/**
 * Handler map for {@link TypedError.match} covering any subset of `E`'s codes,
 * with a required `else` fallback for the rest.
 */
export type PartialMatchHandlers<E> = {
  [K in CodeContent<E>]?: (e: AtCode<E, K>) => unknown
} & { else: (e: E) => unknown }

/**
 * Base class for **expected** (typed) errors — the `E` in exported `Result<T, E>`.
 *
 * Subclass with a numeric error-code enum. Callers handle these explicitly;
 * unwrapping a `TypedError` usually means the call site wrongly assumed success.
 *
 * The optional second type parameter maps each code to its `info` payload.
 * With it, `info` is typed per code (in {@link is}, {@link match}, and the
 * constructor — which requires `info` exactly when the map entry is not
 * `undefined`-able), and the subclass needs no `declare info` or constructor
 * override:
 *
 * ```ts
 * enum ParseErrorCode { EMPTY_INPUT, BAD_TOKEN }
 * type ParseErrorInfoMap = {
 *   [ParseErrorCode.EMPTY_INPUT]: undefined
 *   [ParseErrorCode.BAD_TOKEN]: { token: string }
 * }
 * class ParseError<C extends ParseErrorCode = ParseErrorCode>
 *   extends TypedError<C, ParseErrorInfoMap> {}
 *
 * new ParseError(ParseErrorCode.BAD_TOKEN, 'bad', { token: 'x' }) // info required
 * new ParseError(ParseErrorCode.EMPTY_INPUT, 'empty') // info omitted
 * ```
 */
export class TypedError<
  T extends Code,
  // The default must not depend on T: a T-dependent default would give
  // XError<A> and XError<A | B> different phantom-map types, degrading
  // narrowing (`is`) from clean member filtering to intersections.
  M extends InfoMap<T> = InfoMap<Code>,
> extends Error {
  readonly code: T
  declare info: M[T]
  /**
   * Phantom carrier so the info map `M` is recoverable by inference
   * (`M` otherwise only appears in the non-invertible position `M[T]`).
   * Never assigned; does not exist at runtime.
   *
   * @internal
   */
  declare readonly [infoMapKey]: M

  /**
   * `info` is required exactly when the info map's entry for `code` is not
   * `undefined`-able — that requiredness is what makes the per-code `info`
   * types of {@link is} and {@link match} sound.
   *
   * Subclasses normally do **not** declare a constructor (a `super` call
   * cannot resolve the conditional `info` tuple while the code parameter is
   * still generic). `name` is set from the runtime class name automatically;
   * declare a field (`override name = 'XError'`) if it must survive
   * minification.
   */
  constructor(
    code: T,
    message: string,
    ...[info]: undefined extends M[T] ? [info?: M[T]] : [info: M[T]]
  ) {
    super(message)
    // Explicit for the base class: the published bundle is minified, so
    // `new.target.name` would be the mangled identifier here.
    this.name = new.target === TypedError ? 'TypedError' : new.target.name
    this.code = code
    if (info !== undefined) this.info = info as M[T]
  }

  changeMessage(message: string | ((message: string) => string)): this {
    this.message = message instanceof Function ? message(this.message) : message
    return this
  }

  /**
   * Type guard for "is this error mine, and (optionally) one of these codes?".
   *
   * Narrows `unknown` to the subclass instance, and — when codes are given —
   * narrows `code` **and** `info` (via {@link IsCode}) to just those codes,
   * replacing the `e.code as XErrorCode` cast that a wide `Err` union
   * otherwise forces. Union members that are already narrower than the class
   * (e.g. `XError<A>` in `XError<A> | YError<B>`) are kept as-is, so a
   * following {@link match} still exhausts only the value's codes.
   *
   * @param e - The value to test (usually an `Err` payload of a wide union).
   * @returns Whether `e` is an instance of this class.
   * @example
   * if (ParseError.is(e)) e.code // ParseErrorCode
   */
  static is<T extends abstract new (...args: never) => TypedError<Code>>(
    this: T,
    e: unknown,
  ): e is InstanceType<T>
  /**
   * Type guard narrowing to this class **and** one of `codes`.
   *
   * The predicate ({@link IsCode}) is computed from the argument's type, so
   * on a **distributed** union (`XError<A> | XError<B>`, the shape produced by
   * narrowly-typed factories) a fully matched member is also **subtracted**
   * in the false branch — recovering one code inside `orElse` trims it from
   * the resulting error union, exactly like `===` narrowing on `code`. A
   * single wide instantiation (`XError<A | B>`) cannot be subtracted from;
   * for exhaustively mapping codes, use {@link match}.
   *
   * @param e - The value to test (usually an `Err` payload of a wide union).
   * @param codes - Codes to accept.
   * @returns Whether `e` is an instance of this class with a matching code.
   * @example
   * // recover one code; EMPTY_INPUT is trimmed from the error union
   * parseItems(input).orElse((e) =>
   *   ParseError.is(e, ParseErrorCode.EMPTY_INPUT) ? ok([]) : err(e),
   * )
   */
  static is<
    T extends abstract new (
      ...args: never
    ) => TypedError<Code>,
    E,
    const C extends InstanceType<T>['code'],
  >(this: T, e: E, ...codes: C[]): e is IsCode<E, InstanceType<T>, C>
  static is(
    this: abstract new (
      ...args: never
    ) => TypedError<Code>,
    e: unknown,
    ...codes: Code[]
  ): boolean {
    if (!(e instanceof this)) return false
    return codes.length === 0 || codes.includes(e.code)
  }

  /**
   * Exhaustively map an error of this class to a value, one handler per code —
   * the equivalent of Rust's `match` on an error enum.
   *
   * Exhaustiveness is keyed on the **value's static type**, not the class's
   * full enum: an error typed `XError<A | B>` (or `XError<A> | XError<B>`)
   * requires handlers for exactly `A` and `B`. When upstream widens a
   * function's error union with a new code, every `match` on it without
   * `else` fails to compile, naming exactly the missing code.
   *
   * Each handler receives the error with `code` and `info` narrowed to its
   * branch (`info` per-code requires the info-map type parameter on the
   * class). Add an `else` handler to cover any subset of codes instead;
   * `else` receives the un-narrowed error.
   *
   * This is a static method (`XError.match(e, ...)`, not `e.match(...)`)
   * because distributed unions like `XError<A> | XError<B>` — the shape
   * produced by separate `err()` branches — cannot dispatch a generic
   * instance method. Calling it on the class also rejects values of other
   * error classes, whose numeric codes would otherwise collide.
   *
   * @param e - The error to match on.
   * @param handlers - One handler per code in `e`'s type, or a subset plus `else`.
   * @returns The union of the handlers' return types.
   * @throws {Error} When no handler matches at runtime — only possible when
   *   `e`'s static type lies (e.g. a stale build or an unchecked cast).
   * @example
   * declare const e: ParseError<ParseErrorCode.EMPTY_INPUT | ParseErrorCode.BAD_TOKEN>
   * // exhaustive: every code in the value's type is required
   * const msg = ParseError.match(e, {
   *   [ParseErrorCode.EMPTY_INPUT]: () => 'nothing to parse',
   *   [ParseErrorCode.BAD_TOKEN]: (e) => `bad token ${e.info.token}`,
   * })
   * // partial: any subset plus `else`
   * const msg2 = ParseError.match(e, {
   *   [ParseErrorCode.BAD_TOKEN]: (e) => `bad token ${e.info.token}`,
   *   else: (e) => e.message,
   * })
   * // recovery inside orElse: handlers that keep a code return err(e) with e
   * // narrowed to that code, so recovered codes are ERASED from the union
   * res.orElse((e) => ParseError.match(e, {
   *   [ParseErrorCode.EMPTY_INPUT]: () => ok([]),
   *   [ParseErrorCode.BAD_TOKEN]: (e) => err(e), // e: ParseError<BAD_TOKEN>
   * })) // Result<Item[], ParseError<ParseErrorCode.BAD_TOKEN>>
   * // (`else` receives the un-narrowed error, so erasure needs the exhaustive form)
   */
  static match<
    T extends abstract new (
      ...args: never
    ) => TypedError<Code>,
    E extends InstanceType<T>,
    H extends MatchHandlers<E>,
  >(this: T, e: E, handlers: H): ReturnType<H[keyof H & CodeContent<E>]>
  static match<
    T extends abstract new (
      ...args: never
    ) => TypedError<Code>,
    E extends InstanceType<T>,
    H extends PartialMatchHandlers<E>,
  >(
    this: T,
    e: E,
    handlers: H,
  ): ReturnType<Extract<H[keyof H], (e: never) => unknown>>
  static match(
    this: abstract new (
      ...args: never
    ) => TypedError<Code>,
    e: TypedError<Code>,
    handlers: Partial<Record<Code, (e: never) => unknown>> & {
      else?: (e: never) => unknown
    },
  ): unknown {
    const handler = handlers[e.code] ?? handlers.else
    if (handler == null) {
      throw new Error(
        `TypedError.match: no handler for code ${String(e.code)} and no \`else\``,
      )
    }
    return handler(e as never)
  }

  /**
   * Not callable on the base class — override in a domain subclass and fall back
   * to `UnexpectedError.fromAny(e)` so `E` stays specific. Use `UnexpectedError.try`
   * when you have no domain error type yet.
   */
  static fromAny(_e: unknown): TypedError<Code> {
    throw new Error(
      'TypedError.fromAny must not be called; override in a domain subclass and fall back to UnexpectedError.fromAny(e)',
    )
  }

  /**
   * Convenience boundary: catch throws and return `Result` / `AsyncResult`.
   * Foreign failures land in `Err` via `fromAny` (often `UnexpectedError` at first).
   * Refine with `mapErr` / `fromAny`, then `result.panic` on remaining
   * `UnexpectedError` inside your package — do not export it to downstream callers.
   */
  static try<T extends TypedErrorClass, R extends ResultLike<R>>(
    this: T,
    fn: () => R,
  ): Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>
  static try<T extends TypedErrorClass, R extends ResultLike<R>>(
    this: T,
    fn: () => PromiseLike<R>,
  ): AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>
  static try<T extends TypedErrorClass, R extends ResultLike<R>>(
    this: T,
    fn: () => R | PromiseLike<R>,
  ):
    | Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>>
    | AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>> {
    let captured: R | PromiseLike<R> | undefined
    const sync = this.trySync(() => {
      captured = fn()
      return captured as R
    })
    if (
      captured != null &&
      typeof captured === 'object' &&
      'then' in captured &&
      typeof (captured as PromiseLike<R>).then === 'function'
    ) {
      const promise = captured as PromiseLike<R>
      return this.tryAsync(() => promise)
    }
    return sync
  }

  /** The sync part of `try`. Just use `try` instead. */
  static trySync<T extends TypedErrorClass, R extends ResultLike<R>>(
    this: T,
    fn: () => R,
  ): Result<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>> {
    try {
      return fn()
    } catch (error) {
      return err(this.fromAny(error) as ReturnType<T['fromAny']>)
    }
  }

  /** The async part of `try`. Just use `try` instead. */
  static tryAsync<T extends TypedErrorClass, R extends ResultLike<R>>(
    this: T,
    fn: () => PromiseLike<R>,
  ): AsyncResult<OkContent<R>, ErrContent<R> | ReturnType<T['fromAny']>> {
    return AsyncResult.from(async () => {
      try {
        return await fn()
      } catch (error) {
        return err(this.fromAny(error) as ReturnType<T['fromAny']>)
      }
    })
  }
}
