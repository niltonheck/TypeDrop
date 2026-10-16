// ============================================================
// Typed Middleware Pipeline with Typed Context & Error Boundaries
// ============================================================
// RULES: strict: true, no `any`, no `as`, no unsafe casts.
// ============================================================

// ---------------------------------------------------------------------------
// § 1 — Core Result type
// ---------------------------------------------------------------------------

/** A discriminated-union Result type used throughout the pipeline. */
export type Result<T, E extends AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// Convenience constructors (implement these — bodies are TODO)
export function ok<T>(value: T): Result<T, never> {
  // TODO: return the Ok variant
  throw new Error("TODO");
}

export function fail<E extends AppError>(error: E): Result<never, E> {
  // TODO: return the Err variant
  throw new Error("TODO");
}

// ---------------------------------------------------------------------------
// § 2 — Typed error hierarchy (discriminated union)
// ---------------------------------------------------------------------------

export type AppError =
  | { readonly kind: "AuthError";       readonly message: string }
  | { readonly kind: "ValidationError"; readonly field: string; readonly message: string }
  | { readonly kind: "NotFoundError";   readonly resource: string }
  | { readonly kind: "RateLimitError";  readonly retryAfterMs: number }
  | { readonly kind: "InternalError";   readonly cause: unknown };

// ---------------------------------------------------------------------------
// § 3 — Context accumulation via intersection (the hard typing part)
// ---------------------------------------------------------------------------

/**
 * BaseContext is the empty starting context handed to the first middleware.
 * Each middleware declares what it ADDS to the context via the `Adds` type
 * parameter, and what it REQUIRES to already be present via `Requires`.
 *
 * The pipeline builder enforces — at compile time — that no middleware is
 * appended unless all of its `Requires` keys are already present in the
 * accumulated context type.
 */
export type BaseContext = {
  readonly requestId: string;
  readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  readonly path: string;
  readonly headers: Readonly<Record<string, string>>;
};

/**
 * A single middleware step.
 *  - `Ctx`  – the context shape available when this middleware runs
 *  - `Adds` – the extra properties this middleware contributes (must not
 *             overlap with `Ctx`)
 *  - `Err`  – the error kinds this middleware can emit
 */
export type MiddlewareFn<
  Ctx extends BaseContext,
  Adds extends Record<string, unknown>,
  Err extends AppError
> = (ctx: Ctx) => Promise<Result<Ctx & Adds, Err>>;

// ---------------------------------------------------------------------------
// § 4 — Pipeline builder
// ---------------------------------------------------------------------------

/**
 * Requirement 1 — `Pipeline<Ctx>` is a class (or object) that holds the
 * accumulated context type `Ctx` and an ordered list of middleware functions.
 *
 * Requirement 2 — `pipe<Adds, Err>(fn: MiddlewareFn<Ctx, Adds, Err>)`
 *   appends a middleware and returns a NEW Pipeline whose context type is
 *   `Ctx & Adds`. The method must be generic so the returned pipeline's
 *   context type is inferred correctly by the compiler.
 *
 * Requirement 3 — `run(base: BaseContext): Promise<Result<Ctx, AppError>>`
 *   executes all middleware in order, threading the enriched context through
 *   each step. If any step returns a `fail`, the pipeline short-circuits and
 *   returns that error immediately (no further middleware runs).
 *
 * Requirement 4 — The pipeline must be immutable: calling `.pipe(...)` must
 *   NOT mutate the existing pipeline instance.
 */
export class Pipeline<Ctx extends BaseContext> {
  // TODO: add private field(s) to store the middleware chain

  // TODO: implement constructor
  constructor(/* TODO */) {
    throw new Error("TODO");
  }

  /**
   * Appends `fn` to the pipeline.
   * Returns a new Pipeline<Ctx & Adds> — the compiler widens the context type.
   *
   * REQUIREMENT: `fn` must accept exactly `Ctx` (not a subtype), and the
   * returned pipeline must expose `Ctx & Adds` as its context type.
   */
  pipe<Adds extends Record<string, unknown>, Err extends AppError>(
    fn: MiddlewareFn<Ctx, Adds, Err>
  ): Pipeline<Ctx & Adds> {
    // TODO
    throw new Error("TODO");
  }

  /**
   * Runs the pipeline starting from `base`.
   * Threading rule: each middleware receives the output context of the
   * previous step (which is a superset of BaseContext).
   */
  run(base: BaseContext): Promise<Result<Ctx, AppError>> {
    // TODO
    throw new Error("TODO");
  }
}

/** Factory that creates a fresh, empty pipeline starting from BaseContext. */
export function createPipeline(): Pipeline<BaseContext> {
  // TODO
  throw new Error("TODO");
}

// ---------------------------------------------------------------------------
// § 5 — Error handler utility
// ---------------------------------------------------------------------------

/**
 * Requirement 5 — `handleError` must be an EXHAUSTIVE switch over every
 * `AppError` kind. The TypeScript compiler must report a type error if a new
 * `kind` is added to `AppError` and `handleError` is not updated.
 *
 * Return a human-readable string describing the error.
 *
 * HINT: Use a `never`-typed default branch to enforce exhaustiveness.
 */
export function handleError(error: AppError): string {
  // TODO: exhaustive switch over error.kind
  throw new Error("TODO");
}

// ---------------------------------------------------------------------------
// § 6 — Typed helper: `mapResult`
// ---------------------------------------------------------------------------

/**
 * Requirement 6 — Implement `mapResult` as a generic function.
 *
 * If `result.ok` is true, apply `fn` to `result.value` and return Ok of the
 * mapped value. If `result.ok` is false, forward the error unchanged.
 *
 * Signature must be fully generic — no `any`, no type assertions.
 */
export function mapResult<T, U, E extends AppError>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  // TODO
  throw new Error("TODO");
}

// ---------------------------------------------------------------------------
// § 7 — Typed helper: `collectResults`
// ---------------------------------------------------------------------------

/**
 * Requirement 7 — `collectResults` takes an array of Results and returns:
 *   - Ok<T[]>  if ALL results are Ok (preserving order)
 *   - fail<E>  with the FIRST error encountered
 *
 * The function must be generic over T and E.
 */
export function collectResults<T, E extends AppError>(
  results: ReadonlyArray<Result<T, E>>
): Result<T[], E> {
  // TODO
  throw new Error("TODO");
}
