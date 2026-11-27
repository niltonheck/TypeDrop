// ============================================================
// Typed API Rate Limiter: Token Buckets, Throttled Fetch & Retry Orchestration
// challenge.ts
// ============================================================
// Rules:
//   • No `any`, no `as`, no non-null assertions (`!`)
//   • strict: true must pass
//   • Implement every function marked TODO
// ============================================================

// -----------------------------------------------------------
// 1. BRANDED TYPES
// -----------------------------------------------------------

/** Opaque brand helper — do NOT modify */
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type EndpointId   = Brand<string,  "EndpointId">;
export type RequestId    = Brand<string,  "RequestId">;
export type Milliseconds = Brand<number,  "Milliseconds">;
export type Tokens       = Brand<number,  "Tokens">;

/** Convenience constructors */
export const endpointId   = (s: string)  => s  as EndpointId;
export const requestId    = (s: string)  => s  as RequestId;
export const ms           = (n: number)  => n  as Milliseconds;
export const tokens       = (n: number)  => n  as Tokens;

// -----------------------------------------------------------
// 2. RATE-LIMIT POLICIES
// -----------------------------------------------------------

export type FixedWindowPolicy = {
  readonly kind:          "fixed-window";
  readonly windowMs:      Milliseconds;   // e.g. 60_000 for 1 minute
  readonly maxRequests:   Tokens;         // requests allowed per window
};

export type TokenBucketPolicy = {
  readonly kind:          "token-bucket";
  readonly capacityTokens: Tokens;        // max tokens in the bucket
  readonly refillRateMs:  Milliseconds;   // one token added every N ms
};

export type LeakyBucketPolicy = {
  readonly kind:          "leaky-bucket";
  readonly capacityTokens: Tokens;        // max queue depth
  readonly drainRateMs:   Milliseconds;   // one request drained every N ms
};

/** Discriminated union of all supported policies */
export type RateLimitPolicy =
  | FixedWindowPolicy
  | TokenBucketPolicy
  | LeakyBucketPolicy;

// -----------------------------------------------------------
// 3. BACK-OFF / RETRY STRATEGIES
// -----------------------------------------------------------

export type ExponentialBackoff = {
  readonly kind:       "exponential";
  readonly baseMs:     Milliseconds;
  readonly maxMs:      Milliseconds;
  readonly maxRetries: number;
};

export type LinearBackoff = {
  readonly kind:       "linear";
  readonly stepMs:     Milliseconds;
  readonly maxRetries: number;
};

export type NoRetry = {
  readonly kind: "none";
};

export type RetryStrategy = ExponentialBackoff | LinearBackoff | NoRetry;

// -----------------------------------------------------------
// 4. ENDPOINT CONFIGURATION
// -----------------------------------------------------------

export type EndpointConfig<TBody = unknown, TResponse = unknown> = {
  readonly id:       EndpointId;
  readonly url:      string;
  readonly method:   "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly policy:   RateLimitPolicy;
  readonly retry:    RetryStrategy;
  /** Validates a raw unknown response; returns typed data or throws */
  readonly validate: (raw: unknown) => TResponse;
  /** Optional request body serialiser */
  readonly serialize?: (body: TBody) => string;
};

// -----------------------------------------------------------
// 5. CALL OUTCOMES — discriminated union
// -----------------------------------------------------------

export type CallSuccess<TResponse> = {
  readonly kind:       "success";
  readonly requestId:  RequestId;
  readonly endpointId: EndpointId;
  readonly data:       TResponse;
  readonly attempts:   number;
  readonly totalMs:    Milliseconds;
};

export type CallThrottled = {
  readonly kind:       "throttled";
  readonly requestId:  RequestId;
  readonly endpointId: EndpointId;
  readonly retryAfterMs: Milliseconds;
};

export type CallFailed = {
  readonly kind:       "failed";
  readonly requestId:  RequestId;
  readonly endpointId: EndpointId;
  readonly error:      string;
  readonly attempts:   number;
  readonly totalMs:    Milliseconds;
};

export type CallOutcome<TResponse> =
  | CallSuccess<TResponse>
  | CallThrottled
  | CallFailed;

// -----------------------------------------------------------
// 6. AUDIT LOG
// -----------------------------------------------------------

export type AuditEntry<TResponse> = {
  readonly timestamp:  number;   // Date.now()
  readonly outcome:    CallOutcome<TResponse>;
};

export type AuditLog = {
  // Stores entries keyed by RequestId
  readonly entries: ReadonlyMap<RequestId, AuditEntry<unknown>>;
};

// -----------------------------------------------------------
// 7. TOKEN BUCKET STATE (runtime, mutable)
// -----------------------------------------------------------

export type BucketState = {
  availableTokens: Tokens;
  lastRefillAt:    number;   // Date.now() snapshot
};

// -----------------------------------------------------------
// 8. RATE LIMITER REGISTRY
// -----------------------------------------------------------

export type RateLimiterRegistry = {
  readonly buckets: Map<EndpointId, BucketState>;
};

// -----------------------------------------------------------
// TASK 1 — createRegistry
// -----------------------------------------------------------
/**
 * Create a fresh RateLimiterRegistry initialised from a list of
 * EndpointConfigs.  For each config:
 *   • "token-bucket"  → availableTokens = capacityTokens
 *   • "fixed-window"  → availableTokens = maxRequests
 *   • "leaky-bucket"  → availableTokens = capacityTokens
 * Set lastRefillAt to Date.now().
 *
 * Requirements:
 *   R1. Returns a RateLimiterRegistry with one BucketState per endpoint.
 *   R2. Must handle all three policy kinds via exhaustive narrowing
 *       (use a helper that causes a compile error if a case is missed).
 */
export function createRegistry(
  configs: ReadonlyArray<EndpointConfig>
): RateLimiterRegistry {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// TASK 2 — computeBackoffMs
// -----------------------------------------------------------
/**
 * Given a RetryStrategy and the current attempt number (1-based),
 * return the delay in Milliseconds before the next attempt, or
 * `null` if no more retries should be made.
 *
 * Requirements:
 *   R3. "none"        → always return null.
 *   R4. "linear"      → delay = stepMs * attempt; null when attempt > maxRetries.
 *   R5. "exponential" → delay = min(baseMs * 2^(attempt-1), maxMs);
 *                        null when attempt > maxRetries.
 *   R6. Return type must be `Milliseconds | null` — no widening to `number`.
 *   R7. Exhaustive: adding a new RetryStrategy variant without handling it
 *       here must cause a compile-time error.
 */
export function computeBackoffMs(
  strategy: RetryStrategy,
  attempt: number
): Milliseconds | null {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// TASK 3 — tryConsume
// -----------------------------------------------------------
/**
 * Attempt to consume one token from the bucket for the given endpoint.
 * Mutates the BucketState in the registry.
 *
 * Token-refill rules (apply BEFORE consuming):
 *   • "token-bucket": tokensToAdd = floor((now - lastRefillAt) / refillRateMs)
 *                     clamp availableTokens to capacityTokens after adding.
 *                     Update lastRefillAt += tokensToAdd * refillRateMs.
 *   • "fixed-window": if (now - lastRefillAt) >= windowMs, reset
 *                     availableTokens = maxRequests and lastRefillAt = now.
 *   • "leaky-bucket": same refill logic as "token-bucket" using drainRateMs.
 *
 * Requirements:
 *   R8.  Returns true if a token was consumed (availableTokens was > 0).
 *   R9.  Returns false if no tokens available (do NOT mutate the bucket).
 *   R10. If the endpointId is not in the registry, throw a TypeError.
 *   R11. All three policy kinds must be handled exhaustively.
 */
export function tryConsume(
  registry: RateLimiterRegistry,
  config: EndpointConfig,
  now?: number
): boolean {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// TASK 4 — dispatchWithRetry
// -----------------------------------------------------------
/**
 * Core orchestration function. Uses the provided `fetcher` abstraction
 * (instead of real fetch) so the logic is fully testable.
 *
 * Signature of the injected fetcher:
 *   fetcher(url, method, body?) => Promise<unknown>
 *   • Resolves with the raw response body (unknown).
 *   • Rejects with an Error whose message may start with "HTTP 429"
 *     (treat as throttled) or any other string (treat as a call failure).
 *
 * Algorithm:
 *   1. Call tryConsume; if false → return a CallThrottled outcome with
 *      retryAfterMs derived from the policy:
 *        token-bucket  → refillRateMs
 *        fixed-window  → remaining ms in current window  (windowMs - (now - lastRefillAt))
 *        leaky-bucket  → drainRateMs
 *   2. Attempt the fetch. On success, run config.validate(raw).
 *      If validate throws, treat as CallFailed (no retry).
 *   3. On fetch rejection:
 *        • If message starts with "HTTP 429" → return CallThrottled.
 *        • Otherwise → compute back-off via computeBackoffMs(strategy, attempt).
 *          - If null → return CallFailed.
 *          - If a delay → wait (use the injected `sleep` fn), then retry
 *            (loop back to step 1 for the next attempt).
 *   4. Track total elapsed time and attempt count in the returned outcome.
 *
 * Requirements:
 *   R12. Return type is Promise<CallOutcome<TResponse>> — generic, not unknown.
 *   R13. `fetcher` and `sleep` are injected (no global fetch / setTimeout).
 *   R14. Never swallow errors silently — every rejection path maps to a typed outcome.
 *   R15. The requestId and endpointId must appear in every returned outcome.
 */
export type Fetcher = (
  url: string,
  method: string,
  body?: string
) => Promise<unknown>;

export type Sleeper = (delayMs: number) => Promise<void>;

export async function dispatchWithRetry<TBody, TResponse>(
  config:    EndpointConfig<TBody, TResponse>,
  requestId: RequestId,
  registry:  RateLimiterRegistry,
  body:      TBody | undefined,
  fetcher:   Fetcher,
  sleep:     Sleeper
): Promise<CallOutcome<TResponse>> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// TASK 5 — buildAuditSummary
// -----------------------------------------------------------
/**
 * Given an AuditLog, produce a per-endpoint summary.
 *
 * Return type (define it yourself — no shortcuts):
 *   A ReadonlyMap<EndpointId, EndpointSummary> where EndpointSummary is:
 *   {
 *     totalCalls:     number;
 *     successCount:   number;
 *     failedCount:    number;
 *     throttledCount: number;
 *     avgSuccessMs:   Milliseconds;  // 0 if no successes
 *     lastOutcome:    CallOutcome<unknown>;
 *   }
 *
 * Requirements:
 *   R16. Single-pass over the audit log entries (one iteration, no double loops).
 *   R17. avgSuccessMs is the mean totalMs across successful calls only.
 *   R18. Return type must be explicit — define EndpointSummary as an exported type.
 *   R19. Exhaustive narrowing of CallOutcome kinds in the aggregation step.
 */
export type EndpointSummary = {
  readonly totalCalls:     number;
  readonly successCount:   number;
  readonly failedCount:    number;
  readonly throttledCount: number;
  readonly avgSuccessMs:   Milliseconds;
  readonly lastOutcome:    CallOutcome<unknown>;
};

export function buildAuditSummary(
  log: AuditLog
): ReadonlyMap<EndpointId, EndpointSummary> {
  // TODO
  throw new Error("Not implemented");
}
