// ============================================================
// Typed Middleware Pipeline Executor with Typed Context & Error Lanes
// challenge.ts
// ============================================================
// Rules:
//   - strict: true, no `any`, no `as`, no type assertions
//   - All TODOs must be implemented; type stubs must not be changed
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** A branded string for request IDs to prevent accidental mixing. */
export type RequestId = string & { readonly __brand: "RequestId" };

/** A branded string for user IDs. */
export type UserId = string & { readonly __brand: "UserId" };

/** Helper to create a RequestId at runtime. */
export function makeRequestId(raw: string): RequestId {
  return raw as RequestId; // Only allowed in factory functions
}

/** Helper to create a UserId at runtime. */
export function makeUserId(raw: string): UserId {
  return raw as UserId; // Only allowed in factory functions
}

// ------------------------------------------------------------------
// 2. PIPELINE CONTEXT
// ------------------------------------------------------------------

/**
 * The mutable context object threaded through every middleware.
 * Middleware may only ADD keys — they must never remove existing ones.
 * Use a generic parameter to track what has been added so far.
 */
export interface PipelineContext<TExtra extends Record<string, unknown> = Record<never, never>> {
  readonly requestId: RequestId;
  readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  readonly path: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly receivedAt: Date;
  /** Arbitrary extra fields added by middleware — tracked at the type level. */
  extra: TExtra;
}

// ------------------------------------------------------------------
// 3. TYPED ERROR VARIANTS (Discriminated Union)
// ------------------------------------------------------------------

export type AuthError = {
  readonly kind: "AuthError";
  readonly message: string;
  readonly missingHeader?: string;
};

export type RateLimitError = {
  readonly kind: "RateLimitError";
  readonly message: string;
  readonly retryAfterMs: number;
};

export type ValidationError = {
  readonly kind: "ValidationError";
  readonly message: string;
  readonly fields: readonly string[];
};

export type TransformError = {
  readonly kind: "TransformError";
  readonly message: string;
  readonly stage: string;
};

export type LoggingError = {
  readonly kind: "LoggingError";
  readonly message: string;
};

/** The full union of all errors any middleware can produce. */
export type PipelineError =
  | AuthError
  | RateLimitError
  | ValidationError
  | TransformError
  | LoggingError;

// ------------------------------------------------------------------
// 4. MIDDLEWARE RESULT
// ------------------------------------------------------------------

/**
 * A middleware returns either:
 *   - { outcome: "next";    context: PipelineContext<TOut> }  — pass control forward
 *   - { outcome: "halt";    error: PipelineError }            — short-circuit with error
 *   - { outcome: "respond"; body: unknown; statusCode: number } — short-circuit with success
 *
 * TODO: Define `MiddlewareResult<TOut>` as a discriminated union of these three shapes.
 * `TOut` must extend `Record<string, unknown>`.
 */
export type MiddlewareResult<TOut extends Record<string, unknown>> =
  // TODO: replace this stub with the correct discriminated union
  never;

// ------------------------------------------------------------------
// 5. MIDDLEWARE TYPE
// ------------------------------------------------------------------

/**
 * A single middleware is an async function that:
 *   - receives the current context `PipelineContext<TIn>`
 *   - returns a `MiddlewareResult<TOut>`
 *
 * The `TIn` → `TOut` relationship must be expressed so that `TOut`
 * always contains at least all the fields of `TIn` (i.e., TOut extends TIn).
 *
 * TODO: Define `Middleware<TIn, TOut>` as a typed async function signature.
 * Both `TIn` and `TOut` must extend `Record<string, unknown>`, and `TOut` must extend `TIn`.
 */
export type Middleware<
  TIn extends Record<string, unknown>,
  TOut extends TIn
> =
  // TODO: replace this stub with the correct function type
  never;

// ------------------------------------------------------------------
// 6. PIPELINE FINAL OUTCOME
// ------------------------------------------------------------------

/**
 * After all middleware have run, the pipeline resolves to one of:
 *   - { outcome: "completed"; context: PipelineContext<TFinal> }
 *       — all middleware passed, no early response
 *   - { outcome: "responded"; body: unknown; statusCode: number; context: PipelineContext<TFinal> }
 *       — a middleware short-circuited with a success response
 *   - { outcome: "halted"; error: PipelineError; context: PipelineContext<TFinal> }
 *       — a middleware short-circuited with an error
 *   - { outcome: "threw"; thrownError: unknown; context: PipelineContext<TFinal> }
 *       — a middleware threw an unexpected exception
 *
 * TODO: Define `PipelineOutcome<TFinal>` as a discriminated union of these four shapes.
 */
export type PipelineOutcome<TFinal extends Record<string, unknown>> =
  // TODO: replace this stub with the correct discriminated union
  never;

// ------------------------------------------------------------------
// 7. PIPELINE RUNNER
// ------------------------------------------------------------------

/**
 * `runPipeline` executes a sequence of middleware in order against an initial context.
 *
 * Requirements:
 *   R1. Execute each middleware in sequence (not in parallel).
 *   R2. If a middleware returns `outcome: "next"`, pass its enriched context to the next stage.
 *   R3. If a middleware returns `outcome: "halt"`, stop the chain and return a "halted" outcome,
 *       carrying the context AS IT WAS at that point (before the halting middleware ran).
 *   R4. If a middleware returns `outcome: "respond"`, stop the chain and return a "responded" outcome,
 *       carrying the context AS IT WAS at that point.
 *   R5. If a middleware throws, catch it and return a "threw" outcome with the thrown value,
 *       carrying the context AS IT WAS at that point.
 *   R6. If all middleware pass, return a "completed" outcome with the final enriched context.
 *   R7. The return type must be `Promise<PipelineOutcome<TFinal>>`.
 *   R8. The function must not use `any`, `as`, or non-branded type assertions outside of the
 *       branded-type factory functions already defined above.
 *
 * HINT: Because TypeScript cannot statically thread TIn→TOut across a heterogeneous array,
 * you may type the `middlewares` parameter as `ReadonlyArray<Middleware<Record<string, unknown>, Record<string, unknown>>>`.
 * The interesting typing challenge is in the RESULT types and the discriminated union narrowing.
 *
 * TODO: Implement this function.
 */
export async function runPipeline<TFinal extends Record<string, unknown>>(
  initialContext: PipelineContext<Record<never, never>>,
  middlewares: ReadonlyArray<Middleware<Record<string, unknown>, Record<string, unknown>>>,
): Promise<PipelineOutcome<TFinal>> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 8. OUTCOME REPORTER
// ------------------------------------------------------------------

/**
 * `reportOutcome` takes a `PipelineOutcome<TFinal>` and returns a
 * human-readable summary string.
 *
 * Requirements:
 *   R9.  The switch/if-else must be EXHAUSTIVE — the compiler should error
 *        if a new `outcome` variant is added to `PipelineOutcome` but not handled here.
 *   R10. For "halted" outcomes, include the `error.kind` in the summary.
 *        The inner switch over `error.kind` must ALSO be exhaustive.
 *   R11. Return a string of the form:
 *        - "completed: <requestId>"
 *        - "responded: <statusCode> <requestId>"
 *        - "halted(<errorKind>): <message> [<requestId>]"
 *        - "threw: <requestId>"
 *
 * TODO: Implement this function.
 */
export function reportOutcome<TFinal extends Record<string, unknown>>(
  outcome: PipelineOutcome<TFinal>,
): string {
  // TODO: implement — exhaustive over outcome.outcome AND outcome.error.kind for "halted"
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. MIDDLEWARE FACTORY HELPERS
// ------------------------------------------------------------------

/**
 * `makeAuthMiddleware` returns a Middleware that:
 *   - Checks `context.headers["authorization"]` for a value starting with "Bearer ".
 *   - If missing or malformed, halts with an `AuthError`.
 *   - If valid, extracts the token after "Bearer ", creates a `UserId` from it,
 *     and adds `{ authenticatedUserId: UserId }` to `context.extra`.
 *
 * TODO: Implement. The return type must be:
 *   Middleware<Record<never, never>, { authenticatedUserId: UserId }>
 */
export function makeAuthMiddleware(): Middleware<
  Record<never, never>,
  { authenticatedUserId: UserId }
> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * `makeRateLimitMiddleware` returns a Middleware that:
 *   - Accepts a `limitPerWindow` (max requests) and `windowMs` (window size in ms).
 *   - Maintains an internal counter per `requestId` prefix (first 4 chars).
 *   - If the counter for that prefix exceeds `limitPerWindow`, halts with a `RateLimitError`
 *     where `retryAfterMs` equals `windowMs`.
 *   - Otherwise, increments the counter and passes through unchanged context
 *     (TOut = TIn, so extra is unchanged).
 *
 * TODO: Implement. The return type must be:
 *   Middleware<Record<string, unknown>, Record<string, unknown>>
 */
export function makeRateLimitMiddleware(
  limitPerWindow: number,
  windowMs: number,
): Middleware<Record<string, unknown>, Record<string, unknown>> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * `makeLoggingMiddleware` returns a Middleware that:
 *   - Calls the provided `logFn` with a structured log entry:
 *     `{ requestId, path, method, timestamp: Date }`.
 *   - If `logFn` throws, halts with a `LoggingError`.
 *   - Otherwise, passes through unchanged context.
 *
 * TODO: Implement. The return type must be:
 *   Middleware<Record<string, unknown>, Record<string, unknown>>
 */
export function makeLoggingMiddleware(
  logFn: (entry: { requestId: RequestId; path: string; method: string; timestamp: Date }) => void,
): Middleware<Record<string, unknown>, Record<string, unknown>> {
  // TODO: implement
  throw new Error("Not implemented");
}
