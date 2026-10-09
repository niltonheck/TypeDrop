// =============================================================================
// Typed Retry-with-Fallback Async Executor
// =============================================================================
// REQUIREMENTS
// 1. Define a discriminated union `OpError` with three variants:
//    - { kind: "network"; statusCode: number; message: string }
//    - { kind: "timeout"; elapsedMs: number; message: string }
//    - { kind: "validation"; fields: string[]; message: string }
// 2. Define a `Result<T, E>` type that is either
//    { ok: true; value: T } or { ok: false; error: E }
// 3. Define a `RetryPolicy` type with:
//    - maxAttempts: number          (total tries including the first)
//    - delayMs: number              (fixed delay between retries)
//    - retryOn: ReadonlyArray<OpError["kind"]>  (which error kinds trigger a retry)
// 4. Define a `FallbackStrategy<T>` discriminated union:
//    - { type: "static"; value: T }          (return a constant)
//    - { type: "compute"; fn: () => Promise<T> }  (call an async producer)
//    - { type: "rethrow" }                   (surface the last error as-is)
// 5. Define an `Operation<T>` interface:
//    - exec: () => Promise<Result<T, OpError>>
//    - policy: RetryPolicy
//    - fallback: FallbackStrategy<T>
// 6. Implement `runWithRetry<T>(op: Operation<T>): Promise<Result<T, OpError>>`
//    - Attempt op.exec() up to policy.maxAttempts times.
//    - Between attempts, wait policy.delayMs milliseconds.
//    - Only retry when the error's `kind` is listed in policy.retryOn.
//    - After all attempts are exhausted (or a non-retryable error occurs),
//      apply the fallback:
//        • "static"  → return Ok(value)
//        • "compute" → return Ok(await fn()) — if fn() itself throws, wrap
//                      the thrown value as { kind:"network", statusCode:0,
//                      message: String(e) } and return Err(that)
//        • "rethrow" → return the last Err result
// 7. Implement `classifyError(e: OpError): "retryable" | "fatal"` where:
//    - "network" and "timeout" are retryable
//    - "validation" is fatal
//    Use exhaustive matching (add a never-check for unhandled variants).
// 8. Implement `summariseResults<T>(results: ReadonlyArray<Result<T, OpError>>):
//    { successCount: number; failureCount: number;
//      errorBreakdown: Record<OpError["kind"], number> }`
//    Aggregate an array of results into counts — every OpError["kind"] key
//    must always be present in errorBreakdown (even if zero).
// =============================================================================

// -- Helpers ------------------------------------------------------------------

/** Resolves after `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Convenience constructor for a successful result. */
export function Ok<T>(value: T): Result<T, never> {
  // TODO
  throw new Error("Not implemented");
}

/** Convenience constructor for a failed result. */
export function Err<E>(error: E): Result<never, E> {
  // TODO
  throw new Error("Not implemented");
}

// -- Types (TODO: replace `never` stubs with real definitions) ----------------

export type OpError = never; // TODO

export type Result<T, E> = never; // TODO

export type RetryPolicy = {
  // TODO
};

export type FallbackStrategy<T> = never; // TODO

export interface Operation<T> {
  // TODO
}

// -- Functions ----------------------------------------------------------------

/**
 * Runs an operation with retry logic and a typed fallback.
 * See requirement 6 for full behaviour spec.
 */
export async function runWithRetry<T>(
  op: Operation<T>
): Promise<Result<T, OpError>> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Classifies an OpError as retryable or fatal.
 * See requirement 7.
 */
export function classifyError(e: OpError): "retryable" | "fatal" {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Aggregates an array of Results into a summary object.
 * See requirement 8.
 */
export function summariseResults<T>(
  results: ReadonlyArray<Result<T, OpError>>
): {
  successCount: number;
  failureCount: number;
  errorBreakdown: Record<OpError["kind"], number>;
} {
  // TODO
  throw new Error("Not implemented");
}
