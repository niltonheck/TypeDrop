// ============================================================
// Typed API Rate-Limiter Middleware Chain
// challenge.ts — fill in every TODO. No `any`, no `as`.
// Must compile under strict: true.
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque tenant identifier */
type TenantId = string & { readonly __brand: "TenantId" };

/** Opaque route key, e.g. "POST /payments" */
type RouteKey = string & { readonly __brand: "RouteKey" };

/** Unix timestamp in milliseconds */
type TimestampMs = number & { readonly __brand: "TimestampMs" };

// TODO (1): Implement `brandTenantId`, `brandRouteKey`, and `brandTimestamp`
//           — three branded-type constructors that accept the raw primitive
//           and return the branded type. Do NOT use `as`.
//           Hint: a single-argument generic helper `brand<T>` can do the
//           heavy lifting; `satisfies` is your friend for the return type.

// ------------------------------------------------------------------
// 2. INBOUND REQUEST (raw + validated)
// ------------------------------------------------------------------

/** Shape that arrives as `unknown` from the network edge */
export interface RawRequest {
  tenantId: unknown;
  route: unknown;
  timestampMs: unknown;
  /** Arbitrary metadata — must survive validation as-is */
  meta: unknown;
}

/** Validated, strongly-typed inbound request */
export interface ApiRequest {
  tenantId: TenantId;
  route: RouteKey;
  timestampMs: TimestampMs;
  meta: Record<string, string>;
}

// TODO (2): Implement `validateRequest(raw: unknown): Result<ApiRequest, ValidationError>`
//           Requirements:
//           a) `raw` must be a non-null object
//           b) `tenantId` must be a non-empty string
//           c) `route` must match /^(GET|POST|PUT|DELETE|PATCH) \/.*/
//           d) `timestampMs` must be a finite positive number
//           e) `meta` must be an object whose every value is a string
//              (keys with non-string values should be dropped, not rejected)
//           Return Err(...) for failures a–d; strip bad keys for e.

// ------------------------------------------------------------------
// 3. RESULT TYPE
// ------------------------------------------------------------------

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// ------------------------------------------------------------------
// 4. ERROR HIERARCHY  (discriminated union)
// ------------------------------------------------------------------

export type ValidationError =
  | { readonly kind: "NOT_AN_OBJECT" }
  | { readonly kind: "MISSING_TENANT_ID" }
  | { readonly kind: "INVALID_ROUTE"; route: string }
  | { readonly kind: "INVALID_TIMESTAMP" };

export type RateLimitError =
  | { readonly kind: "TOKEN_BUCKET_EXHAUSTED"; retryAfterMs: number }
  | { readonly kind: "WINDOW_QUOTA_EXCEEDED"; windowResetMs: TimestampMs }
  | { readonly kind: "CONCURRENCY_CAP_REACHED"; activeRequests: number };

export type GatewayError =
  | { readonly kind: "VALIDATION_FAILED"; inner: ValidationError }
  | { readonly kind: "RATE_LIMITED"; inner: RateLimitError }
  | { readonly kind: "MIDDLEWARE_PANIC"; message: string };

// ------------------------------------------------------------------
// 5. RATE-LIMITER STRATEGIES  (discriminated union + generics)
// ------------------------------------------------------------------

/**
 * Each strategy carries its own typed config and its own typed state.
 * The discriminant is `type`.
 */
export type RateLimiterStrategy =
  | {
      readonly type: "TOKEN_BUCKET";
      readonly config: TokenBucketConfig;
      state: TokenBucketState;
    }
  | {
      readonly type: "SLIDING_WINDOW";
      readonly config: SlidingWindowConfig;
      state: SlidingWindowState;
    }
  | {
      readonly type: "CONCURRENCY_CAP";
      readonly config: ConcurrencyCapConfig;
      state: ConcurrencyCapState;
    };

export interface TokenBucketConfig {
  /** Maximum tokens in the bucket */
  capacity: number;
  /** Tokens added per millisecond */
  refillRatePerMs: number;
}
export interface TokenBucketState {
  tokens: number;
  lastRefillMs: TimestampMs;
}

export interface SlidingWindowConfig {
  /** Window length in milliseconds */
  windowMs: number;
  /** Maximum requests allowed in the window */
  maxRequests: number;
}
export interface SlidingWindowState {
  /** Ring of timestamps for requests in the current window */
  timestamps: TimestampMs[];
}

export interface ConcurrencyCapConfig {
  maxConcurrent: number;
}
export interface ConcurrencyCapState {
  activeRequests: number;
}

// ------------------------------------------------------------------
// 6. STRATEGY EVALUATOR
// ------------------------------------------------------------------

/**
 * TODO (3): Implement `evaluateStrategy`.
 *
 * Signature:
 *   evaluateStrategy(
 *     strategy: RateLimiterStrategy,
 *     request: ApiRequest
 *   ): Result<"ALLOWED", RateLimitError>
 *
 * Rules per strategy type:
 *
 * TOKEN_BUCKET
 *   • Refill tokens based on elapsed time since `lastRefillMs`:
 *       newTokens = elapsed * refillRatePerMs   (capped at capacity)
 *   • If tokens >= 1 after refill → consume 1 token, mutate state, return Ok("ALLOWED")
 *   • Otherwise → return Err TOKEN_BUCKET_EXHAUSTED with
 *       retryAfterMs = Math.ceil((1 - tokens) / refillRatePerMs)
 *
 * SLIDING_WINDOW
 *   • Drop timestamps older than (request.timestampMs - windowMs)
 *   • If count < maxRequests → push current timestamp, return Ok("ALLOWED")
 *   • Otherwise → return Err WINDOW_QUOTA_EXCEEDED with
 *       windowResetMs = (oldest timestamp in window + windowMs) as TimestampMs
 *
 * CONCURRENCY_CAP
 *   • If activeRequests < maxConcurrent → increment, return Ok("ALLOWED")
 *   • Otherwise → return Err CONCURRENCY_CAP_REACHED with activeRequests
 *
 * IMPORTANT: mutate `strategy.state` in-place for allowed requests.
 */
export function evaluateStrategy(
  strategy: RateLimiterStrategy,
  request: ApiRequest
): Result<"ALLOWED", RateLimitError> {
  // TODO (3)
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 7. MIDDLEWARE CHAIN
// ------------------------------------------------------------------

/**
 * A middleware chain is an ordered list of strategies applied left-to-right.
 * The first strategy to deny short-circuits the chain.
 */
export type MiddlewareChain = RateLimiterStrategy[];

/**
 * TODO (4): Implement `runChain`.
 *
 * Signature:
 *   runChain(
 *     chain: MiddlewareChain,
 *     request: ApiRequest
 *   ): Result<"ALLOWED", GatewayError>
 *
 * Requirements:
 *   a) If the chain is empty, return Ok("ALLOWED").
 *   b) Evaluate each strategy in order.
 *   c) On the first Err result, wrap it as GatewayError { kind: "RATE_LIMITED", inner }
 *      and return immediately (short-circuit).
 *   d) If evaluation throws an unexpected exception, catch it and return
 *      GatewayError { kind: "MIDDLEWARE_PANIC", message: <error message> }.
 *   e) If all strategies pass, return Ok("ALLOWED").
 */
export function runChain(
  chain: MiddlewareChain,
  request: ApiRequest
): Result<"ALLOWED", GatewayError> {
  // TODO (4)
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 8. GATEWAY ENTRY POINT
// ------------------------------------------------------------------

/**
 * TODO (5): Implement `processRequest`.
 *
 * Signature:
 *   processRequest(
 *     raw: unknown,
 *     chain: MiddlewareChain
 *   ): Result<"ALLOWED", GatewayError>
 *
 * Requirements:
 *   a) Validate the raw request with `validateRequest`.
 *   b) On validation failure, return GatewayError { kind: "VALIDATION_FAILED", inner }.
 *   c) On success, run the validated request through `runChain`.
 *   d) Return the chain result directly.
 */
export function processRequest(
  raw: unknown,
  chain: MiddlewareChain
): Result<"ALLOWED", GatewayError> {
  // TODO (5)
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. CONCURRENCY RELEASE HELPER
// ------------------------------------------------------------------

/**
 * TODO (6): Implement `releaseSlot`.
 *
 * After a request that passed a CONCURRENCY_CAP strategy completes,
 * callers must release the slot.
 *
 * Signature:
 *   releaseSlot(strategy: RateLimiterStrategy): void
 *
 * Requirements:
 *   • Only act if strategy.type === "CONCURRENCY_CAP".
 *   • Decrement activeRequests, but never below 0.
 */
export function releaseSlot(strategy: RateLimiterStrategy): void {
  // TODO (6)
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 10. TENANT ROUTE REGISTRY  (mapped + conditional types)
// ------------------------------------------------------------------

/**
 * A registry maps each TenantId to a Record of RouteKey → MiddlewareChain.
 * TODO (7): Define `TenantRegistry` as a mapped type over a generic
 *           set of tenant keys K (constrained to TenantId) such that
 *           each key maps to `Partial<Record<RouteKey, MiddlewareChain>>`.
 *
 *           Then implement `lookupChain`:
 *
 *   lookupChain<K extends TenantId>(
 *     registry: TenantRegistry<K>,
 *     tenantId: K,
 *     route: RouteKey
 *   ): MiddlewareChain | undefined
 *
 *           Returns the chain for (tenantId, route), or undefined if absent.
 */
export type TenantRegistry<K extends TenantId> = {
  // TODO (7) — replace this comment with the mapped type body
  [P in K]: Partial<Record<RouteKey, MiddlewareChain>>;
};

export function lookupChain<K extends TenantId>(
  registry: TenantRegistry<K>,
  tenantId: K,
  route: RouteKey
): MiddlewareChain | undefined {
  // TODO (7)
  throw new Error("Not implemented");
}
