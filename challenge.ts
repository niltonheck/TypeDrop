// ============================================================
// challenge.ts — Typed Middleware Pipeline with Retry & Cancellation
// ============================================================
// Do NOT use `any`, `as`, or non-trivial type assertions.
// All code must compile under strict: true.
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED / PRIMITIVE TYPES
// ------------------------------------------------------------------

/** An opaque millisecond duration — must be created via `ms()`. */
type Milliseconds = number & { readonly __brand: "Milliseconds" };

/** Helper to create a branded Milliseconds value. */
export function ms(n: number): Milliseconds {
  return n as Milliseconds; // sole permitted cast — provided for you
}

// ------------------------------------------------------------------
// 2. CORE DOMAIN TYPES
// ------------------------------------------------------------------

/** The mutable context object that flows through every middleware. */
export interface PipelineContext<TBody = unknown> {
  readonly requestId: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: Record<string, string>;
  body: TBody | undefined;
  /** Arbitrary metadata bag — middlewares may attach typed data here. */
  meta: Record<string, unknown>;
}

/** A successful pipeline result. */
export interface PipelineSuccess<TResponse> {
  readonly kind: "success";
  readonly response: TResponse;
  readonly durationMs: Milliseconds;
  readonly attempts: number;
}

/** A failure produced by a middleware short-circuit or final fetch error. */
export interface PipelineFailure<TError> {
  readonly kind: "failure";
  readonly error: TError;
  readonly durationMs: Milliseconds;
  readonly attempts: number;
}

/** Discriminated union returned by `runPipeline`. */
export type PipelineResult<TResponse, TError> =
  | PipelineSuccess<TResponse>
  | PipelineFailure<TError>;

// ------------------------------------------------------------------
// 3. MIDDLEWARE TYPES
// ------------------------------------------------------------------

/**
 * A middleware is an async function that receives the current context
 * and a `next` function.
 *
 * - Calling `next(ctx)` passes control to the next middleware.
 * - Returning a `PipelineFailure` WITHOUT calling `next` short-circuits
 *   the pipeline (no further middlewares or the executor are called).
 * - Middlewares MAY mutate `ctx` before/after calling `next`.
 *
 * TODO (a): Define `Middleware<TBody, TResponse, TError>` as a type alias
 *           for the async function described above. The `next` parameter
 *           must itself be typed as accepting a `PipelineContext<TBody>`
 *           and returning the same `Promise<PipelineResult<TResponse, TError>>`.
 */
export type Middleware<TBody, TResponse, TError> = // TODO (a)
  never;

// ------------------------------------------------------------------
// 4. EXECUTOR TYPE
// ------------------------------------------------------------------

/**
 * The executor is the innermost "middleware" — it performs the actual
 * work (e.g. fetch). It receives a finalised context and an AbortSignal,
 * and must resolve to a `PipelineResult<TResponse, TError>`.
 *
 * TODO (b): Define `Executor<TBody, TResponse, TError>` as a type alias.
 */
export type Executor<TBody, TResponse, TError> = // TODO (b)
  never;

// ------------------------------------------------------------------
// 5. RETRY POLICY
// ------------------------------------------------------------------

/**
 * Controls if and how the pipeline retries on failure.
 *
 * - `maxAttempts`: total number of tries (1 = no retry).
 * - `backoff`:     a function that returns how long to wait before the
 *                  next attempt, given the current attempt number (1-based).
 * - `retryIf`:     optional predicate — if provided, only retry when it
 *                  returns true for the given failure.
 *
 * TODO (c): Define `RetryPolicy<TError>` as an interface satisfying the
 *           description above. `backoff` must return `Milliseconds`.
 */
export interface RetryPolicy<TError> { // TODO (c)
  // replace this body
  __placeholder: never;
}

// ------------------------------------------------------------------
// 6. PIPELINE OPTIONS
// ------------------------------------------------------------------

/**
 * Options passed to `runPipeline`.
 *
 * TODO (d): Define `PipelineOptions<TBody, TResponse, TError>` as an
 *           interface containing:
 *           - `context`:     the initial PipelineContext<TBody>
 *           - `middlewares`: readonly array of Middleware<TBody, TResponse, TError>
 *           - `executor`:    Executor<TBody, TResponse, TError>
 *           - `retry`:       optional RetryPolicy<TError>
 *           - `signal`:      optional AbortSignal for cancellation
 */
export interface PipelineOptions<TBody, TResponse, TError> { // TODO (d)
  // replace this body
  __placeholder: never;
}

// ------------------------------------------------------------------
// 7. HELPER — sleep
// ------------------------------------------------------------------

/**
 * Returns a promise that resolves after `duration` ms, but rejects with
 * an AbortError if `signal` is aborted before the timer fires.
 *
 * TODO (e): Implement `sleep`. Use `setTimeout` + `signal.addEventListener`.
 *           On abort, clear the timeout and reject with `signal.reason`.
 */
export function sleep(duration: Milliseconds, signal?: AbortSignal): Promise<void> {
  // TODO (e)
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 8. CORE FUNCTION — runPipeline
// ------------------------------------------------------------------

/**
 * Runs `options.middlewares` in order, then calls `options.executor`.
 * Implements retry-with-back-off when `options.retry` is provided.
 *
 * Requirements:
 * R1. Build a recursive `dispatch(index, ctx)` that:
 *       - calls middleware[index] with ctx and a `next` bound to dispatch(index+1, …)
 *       - when index === middlewares.length, calls the executor
 * R2. On each attempt, run the full middleware + executor chain from index 0.
 * R3. If the result is a `PipelineFailure` AND a retry policy exists AND
 *     attempts < maxAttempts AND (retryIf is absent OR retryIf(failure) is true),
 *     sleep for `backoff(attempt)` ms then retry.
 * R4. If `signal` is already aborted before an attempt starts, immediately
 *     return a `PipelineFailure` whose `error` is the signal's reason cast
 *     through a user-supplied `abortErrorFactory` — wait, there is no such
 *     factory. Instead, represent abort as a `PipelineFailure` where the error
 *     is `signal.reason` narrowed to `TError` via a type-guard you supply inline.
 *     (Hint: you may use a generic helper `isAbortError` that checks
 *     `signal.aborted`; the cast responsibility is on the caller's executor.)
 *     For simplicity: if `signal.aborted`, return early with the result of
 *     calling the executor once with the aborted signal — let the executor
 *     decide how to represent the abort error.
 * R5. `durationMs` in the result must reflect total wall-clock time across
 *     ALL attempts (including sleep time).
 * R6. `attempts` in the result must reflect how many executor calls were made.
 *
 * TODO (f): Implement `runPipeline`.
 */
export async function runPipeline<TBody, TResponse, TError>(
  options: PipelineOptions<TBody, TResponse, TError>
): Promise<PipelineResult<TResponse, TError>> {
  // TODO (f)
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. BUILT-IN MIDDLEWARE FACTORIES — implement all three
// ------------------------------------------------------------------

/**
 * TODO (g): `withBearerAuth(getToken)`
 * A middleware factory that injects `Authorization: Bearer <token>` into
 * ctx.headers. `getToken` is an async function returning a string.
 * Must work for any TBody / TResponse / TError.
 */
export function withBearerAuth<TBody, TResponse, TError>(
  getToken: () => Promise<string>
): Middleware<TBody, TResponse, TError> {
  // TODO (g)
  throw new Error("Not implemented");
}

/**
 * TODO (h): `withRequestLogger(log)`
 * Logs `[requestId] → METHOD url` before calling next, and
 * `[requestId] ← kind durationMs ms` after.
 * `log` is a plain `(msg: string) => void` callback.
 */
export function withRequestLogger<TBody, TResponse, TError>(
  log: (msg: string) => void
): Middleware<TBody, TResponse, TError> {
  // TODO (h)
  throw new Error("Not implemented");
}

/**
 * TODO (i): `withRateLimitHeader(limitPerMinute)`
 * Attaches `X-Rate-Limit: <limitPerMinute>` to ctx.headers before calling next.
 */
export function withRateLimitHeader<TBody, TResponse, TError>(
  limitPerMinute: number
): Middleware<TBody, TResponse, TError> {
  // TODO (i)
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 10. EXPONENTIAL BACK-OFF FACTORY
// ------------------------------------------------------------------

/**
 * TODO (j): `exponentialBackoff(baseMs, maxMs)`
 * Returns a `RetryPolicy["backoff"]`-compatible function:
 *   wait = min(baseMs * 2^(attempt-1), maxMs)
 * Result must be a `Milliseconds`.
 */
export function exponentialBackoff(
  baseMs: Milliseconds,
  maxMs: Milliseconds
): (attempt: number) => Milliseconds {
  // TODO (j)
  throw new Error("Not implemented");
}
