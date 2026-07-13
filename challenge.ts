// challenge.ts
// =============================================================
// Typed Retry-with-Backoff Fetcher
// =============================================================
// SCENARIO: You're building the resilient HTTP layer for a microservice
// that calls third-party APIs known to occasionally return transient errors.
// Each request must be retried with exponential backoff, errors must be
// classified as retryable or fatal, and every outcome must be surfaced as a
// fully-typed FetchResult<T> with zero `any`.
// =============================================================

// ── 1. Error classification ───────────────────────────────────────────────

/**
 * A "retryable" error: transient network / server issues worth retrying.
 * A "fatal" error: bad request, auth failure — retrying will never help.
 */
export type ErrorKind = "retryable" | "fatal";

export interface ClassifiedError {
  kind: ErrorKind;
  /** HTTP status code, if one was received (undefined for network-level failures) */
  status?: number;
  message: string;
}

// REQUIREMENT 1:
// Implement `classifyError(status: number | undefined, message: string): ClassifiedError`
//
// Classification rules:
//   - No status (network failure)  → retryable
//   - 429 or 5xx (≥500)           → retryable
//   - Anything else (4xx, etc.)    → fatal
export function classifyError(
  status: number | undefined,
  message: string
): ClassifiedError {
  // TODO: implement classification logic
  throw new Error("Not implemented");
}

// ── 2. Result type ────────────────────────────────────────────────────────

/** Successful fetch outcome. */
export interface FetchSuccess<T> {
  outcome: "success";
  data: T;
  /** Total number of attempts made (1 = succeeded on first try). */
  attempts: number;
}

/** All retry attempts exhausted without a successful response. */
export interface FetchExhausted {
  outcome: "exhausted";
  /** The classified error from the LAST attempt. */
  lastError: ClassifiedError;
  /** Total number of attempts made before giving up. */
  attempts: number;
}

/** A fatal error was encountered — no retries were performed after it. */
export interface FetchFatal {
  outcome: "fatal";
  error: ClassifiedError;
  /** Total number of attempts made before the fatal error (including the fatal one). */
  attempts: number;
}

// REQUIREMENT 2:
// Define `FetchResult<T>` as a discriminated union of the three outcome types above.
export type FetchResult<T> = FetchSuccess<T> | FetchExhausted | FetchFatal;

// ── 3. Retry configuration ────────────────────────────────────────────────

export interface RetryConfig {
  /** Maximum total attempts (must be ≥ 1). */
  maxAttempts: number;
  /** Base delay in milliseconds before the first retry. */
  baseDelayMs: number;
  /**
   * Multiplier applied to the delay after each failed attempt.
   * e.g. 2 → exponential: 100ms, 200ms, 400ms …
   */
  backoffMultiplier: number;
  /**
   * Optional cap on the delay (ms). If provided, no single delay exceeds this.
   */
  maxDelayMs?: number;
}

// ── 4. Typed fetch adapter ────────────────────────────────────────────────

/**
 * A typed stand-in for a real HTTP fetch.
 * Resolves with `{ status: number; body: unknown }` on any HTTP response
 * (including error status codes), or rejects with an `Error` for network failures.
 */
export type FetchAdapter = (url: string) => Promise<{ status: number; body: unknown }>;

// ── 5. Response validator ─────────────────────────────────────────────────

/**
 * Validates `body: unknown` and returns a typed `T` or throws a `TypeError`
 * describing what was wrong. You must accept and use this — do NOT assume
 * the body shape inline.
 */
export type BodyValidator<T> = (body: unknown) => T;

// ── 6. Core function ──────────────────────────────────────────────────────

// REQUIREMENT 3:
// Implement `fetchWithRetry<T>`:
//
//   - Call `adapter(url)` up to `config.maxAttempts` times.
//   - On a NETWORK failure (adapter rejects):
//       • Classify as retryable (no status).
//       • If attempts remain, wait then retry.
//       • If no attempts remain, return FetchExhausted.
//   - On an HTTP response:
//       • If status is NOT 200-299:
//           – Classify the error.
//           – If fatal → return FetchFatal immediately (no more retries).
//           – If retryable and attempts remain → wait then retry.
//           – If retryable and no attempts remain → return FetchExhausted.
//       • If status IS 200-299:
//           – Run `validate(body)`.
//           – If validate throws → treat as FetchFatal (fatal kind, no status).
//           – If validate succeeds → return FetchSuccess<T>.
//   - Backoff delay between retries:
//       • delay = min(baseDelayMs * backoffMultiplier^(attemptIndex), maxDelayMs ?? Infinity)
//       • Use the provided `sleep` helper (already implemented below).
//
// REQUIREMENT 4:
// The function signature must be fully generic — `T` is inferred from `validate`.
// No `any`, no type assertions.

export async function fetchWithRetry<T>(
  url: string,
  adapter: FetchAdapter,
  validate: BodyValidator<T>,
  config: RetryConfig
): Promise<FetchResult<T>> {
  // TODO: implement retry loop with exponential backoff
  throw new Error("Not implemented");
}

// ── 7. Helpers ────────────────────────────────────────────────────────────

/** Resolves after `ms` milliseconds. Already implemented — use freely. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// REQUIREMENT 5:
// Implement `computeDelay(attemptIndex: number, config: RetryConfig): number`
//
// Returns the capped backoff delay (in ms) for a given zero-based attempt index.
//   delay = baseDelayMs * (backoffMultiplier ** attemptIndex)
//   capped at maxDelayMs if provided.
//
// This is the pure helper used by fetchWithRetry internally.
export function computeDelay(attemptIndex: number, config: RetryConfig): number {
  // TODO: implement delay computation
  throw new Error("Not implemented");
}

// ── 8. Narrowing helpers (REQUIREMENT 6) ─────────────────────────────────

// Implement THREE type-guard functions that narrow a FetchResult<T>:
//
//   isSuccess<T>(result: FetchResult<T>): result is FetchSuccess<T>
//   isExhausted<T>(result: FetchResult<T>): result is FetchExhausted
//   isFatal<T>(result: FetchResult<T>): result is FetchFatal

export function isSuccess<T>(result: FetchResult<T>): result is FetchSuccess<T> {
  // TODO
  throw new Error("Not implemented");
}

export function isExhausted<T>(result: FetchResult<T>): result is FetchExhausted {
  // TODO
  throw new Error("Not implemented");
}

export function isFatal<T>(result: FetchResult<T>): result is FetchFatal {
  // TODO
  throw new Error("Not implemented");
}
