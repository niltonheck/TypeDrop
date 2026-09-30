// ============================================================
// Typed Concurrent API Client with Retry, Cancellation & Result Aggregation
// ============================================================
// Difficulty: Hard
// Topics: generics, discriminated unions, conditional types, mapped types,
//         utility types, Promise.allSettled, AbortController, retry logic,
//         Result<T,E> pattern, infer, satisfies
// ============================================================

// ------------------------------------------------------------------
// 1. CORE RESULT TYPE
// ------------------------------------------------------------------

// TODO (1): Define a generic discriminated union `Result<T, E>`.
//   - `{ status: "ok";   value: T }` branch
//   - `{ status: "err";  error: E }` branch
export type Result<T, E> = never; // replace with your implementation

// ------------------------------------------------------------------
// 2. ERROR HIERARCHY
// ------------------------------------------------------------------

// TODO (2): Define a discriminated union `FetchError` with three members:
//   - NetworkError  : { kind: "network";  message: string }
//   - TimeoutError  : { kind: "timeout";  timeoutMs: number }
//   - ParseError    : { kind: "parse";    raw: string; cause: string }
export type FetchError = never; // replace with your implementation

// ------------------------------------------------------------------
// 3. ENDPOINT REGISTRY
// ------------------------------------------------------------------

// An endpoint descriptor binds a URL template to its expected response shape.
export interface Endpoint<T> {
  url: string;
  /** Parse an unknown JSON value into T, or return a ParseError. */
  parse: (raw: unknown) => Result<T, Extract<FetchError, { kind: "parse" }>>;
  timeoutMs?: number;
  maxRetries?: number;
}

// TODO (3): Define `EndpointMap` — a record whose keys are string literals and
//   whose values are `Endpoint<unknown>` (the unknown will be narrowed later).
//   Use an interface or type alias; callers will pass objects `satisfies EndpointMap`.
export type EndpointMap = Record<string, Endpoint<unknown>>;

// ------------------------------------------------------------------
// 4. EXTRACTING THE RESPONSE TYPE FROM AN ENDPOINT
// ------------------------------------------------------------------

// TODO (4): Define a conditional type `EndpointResponse<E>` that, given an
//   `Endpoint<T>`, resolves to `T`.  Use `infer`.
export type EndpointResponse<E> = never; // replace with your implementation

// ------------------------------------------------------------------
// 5. AGGREGATED RESULT MAP
// ------------------------------------------------------------------

// TODO (5): Define a mapped type `AggregatedResults<M extends EndpointMap>` that
//   maps each key K of M to `Result<EndpointResponse<M[K]>, FetchError>`.
//   This is the return type of `fetchAll`.
export type AggregatedResults<M extends EndpointMap> = never; // replace with your implementation

// ------------------------------------------------------------------
// 6. RETRY CONFIGURATION
// ------------------------------------------------------------------

export interface RetryConfig {
  maxRetries: number;
  /** Base delay in ms; actual delay = baseDelayMs * 2^attempt */
  baseDelayMs: number;
  /** Only retry when this predicate returns true */
  shouldRetry: (error: FetchError) => boolean;
}

export const defaultRetryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  shouldRetry: (error: FetchError) => error.kind === "network",
} satisfies RetryConfig;

// ------------------------------------------------------------------
// 7. SINGLE-ENDPOINT FETCH WITH RETRY & CANCELLATION
// ------------------------------------------------------------------

/**
 * TODO (6): Implement `fetchWithRetry`.
 *
 * Requirements:
 *  a) Accept an `Endpoint<T>`, a `RetryConfig`, and an `AbortSignal`.
 *  b) Simulate an HTTP call: if `signal.aborted` at any point, resolve to
 *     `{ status: "err", error: { kind: "timeout", timeoutMs: endpoint.timeoutMs ?? 5000 } }`.
 *  c) Attempt to call `endpoint.parse(rawJson)` where `rawJson` is a value
 *     you receive as a parameter (see signature below) — do NOT actually fetch.
 *  d) On a ParseError, do NOT retry; return immediately.
 *  e) On a NetworkError, retry up to `retryConfig.maxRetries` times with
 *     exponential back-off (`baseDelayMs * 2^attempt`) if `shouldRetry` returns true.
 *  f) Return `Result<T, FetchError>`.
 *
 * Signature (do not change):
 */
export async function fetchWithRetry<T>(
  endpoint: Endpoint<T>,
  rawJson: unknown,
  retryConfig: RetryConfig,
  signal: AbortSignal
): Promise<Result<T, FetchError>> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 8. FAN-OUT: FETCH ALL ENDPOINTS CONCURRENTLY
// ------------------------------------------------------------------

/**
 * TODO (7): Implement `fetchAll`.
 *
 * Requirements:
 *  a) Accept an `EndpointMap` `M`, a matching `rawResponses` map (same keys,
 *     values are `unknown` — the pre-fetched JSON for each endpoint), a
 *     `RetryConfig`, and an optional `timeoutMs` (default 8000).
 *  b) Create ONE `AbortController`; start a `setTimeout` that calls
 *     `controller.abort()` after `timeoutMs` ms.
 *  c) Fan out `fetchWithRetry` for every key in M concurrently
 *     (use `Promise.allSettled` — individual retries must NOT block each other).
 *  d) Collect results into an `AggregatedResults<M>` object keyed by the
 *     same string keys as `M`.
 *  e) Cancel the timeout once all requests settle.
 *  f) Return `AggregatedResults<M>`.
 *
 * Signature (do not change):
 */
export async function fetchAll<M extends EndpointMap>(
  endpoints: M,
  rawResponses: { [K in keyof M]: unknown },
  retryConfig: RetryConfig,
  timeoutMs?: number
): Promise<AggregatedResults<M>> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. RESULT HELPERS
// ------------------------------------------------------------------

/**
 * TODO (8): Implement `isOk` — a type-guard that narrows `Result<T, E>` to
 *   its `ok` branch.
 */
export function isOk<T, E>(result: Result<T, E>): result is Extract<Result<T, E>, { status: "ok" }> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO (9): Implement `unwrapOr` — returns `result.value` if ok, else `fallback`.
 *   The return type must be inferred as `T` (not `T | F`).
 *   Hint: make `fallback` type parameter `F extends T`.
 */
export function unwrapOr<T, E, F extends T>(result: Result<T, E>, fallback: F): T {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO (10): Implement `mapResult` — applies `fn` to the value if ok, leaving
 *   errors untouched.  Both input and output types must be fully inferred.
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  // TODO: implement
  throw new Error("Not implemented");
}
