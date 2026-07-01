// ============================================================
// Typed API Rate Limiter with Sliding Window & Per-Client Policies
// ============================================================
// GOAL: Validate raw inbound requests, look up per-client rate-limit
// policies, apply a sliding-window counter, and return a typed
// allow/deny decision — all with zero `any`.
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES
// ------------------------------------------------------------------

/** The HTTP methods your gateway supports. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** A client tier determines which default policy applies. */
export type ClientTier = "free" | "pro" | "enterprise";

/**
 * A validated, strongly-typed inbound request descriptor.
 * `receivedAt` is the Unix timestamp (ms) when the request arrived.
 */
export interface RequestDescriptor {
  clientId: string;
  method: HttpMethod;
  path: string;
  receivedAt: number;
}

/**
 * A per-client rate-limit policy.
 * `windowMs`   – the sliding window size in milliseconds.
 * `maxRequests` – max requests allowed within that window.
 */
export interface RateLimitPolicy {
  clientId: string;
  tier: ClientTier;
  windowMs: number;
  maxRequests: number;
}

// ------------------------------------------------------------------
// 2. DECISION TYPES  (discriminated union)
// ------------------------------------------------------------------

/** The request is within quota — include remaining budget. */
export interface AllowedDecision {
  status: "allowed";
  clientId: string;
  remaining: number;   // requests still allowed in the current window
  resetAt: number;     // Unix ms when the oldest request in the window expires
}

/** The request exceeds quota — include retry-after information. */
export interface DeniedDecision {
  status: "denied";
  clientId: string;
  retryAfterMs: number; // ms until the client should retry
}

export type RateLimitDecision = AllowedDecision | DeniedDecision;

// ------------------------------------------------------------------
// 3. VALIDATION ERRORS  (discriminated union)
// ------------------------------------------------------------------

export interface MissingFieldError {
  kind: "missing_field";
  field: string;
}

export interface InvalidFieldError {
  kind: "invalid_field";
  field: string;
  reason: string;
}

export interface UnknownClientError {
  kind: "unknown_client";
  clientId: string;
}

export type ValidationError =
  | MissingFieldError
  | InvalidFieldError
  | UnknownClientError;

// ------------------------------------------------------------------
// 4. RESULT TYPE
// ------------------------------------------------------------------

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ------------------------------------------------------------------
// 5. POLICY REGISTRY
// ------------------------------------------------------------------

/**
 * A read-only map from clientId → RateLimitPolicy.
 * Backed by a plain Record for simplicity.
 */
export type PolicyRegistry = Readonly<Record<string, RateLimitPolicy>>;

// ------------------------------------------------------------------
// 6. SLIDING-WINDOW STATE
// ------------------------------------------------------------------

/**
 * Tracks the timestamps of recent requests for a single client.
 * You may store this however you like internally; the type below
 * is the canonical shape for the in-memory store.
 */
export type WindowStore = Map<string, number[]>; // clientId → sorted timestamps (ms)

// ------------------------------------------------------------------
// 7. YOUR TASKS
// ------------------------------------------------------------------

/**
 * TODO 1 — validateRequest
 *
 * Parse `raw: unknown` into a `RequestDescriptor`.
 *
 * Requirements (numbered for the test harness):
 * [R1] `raw` must be a non-null object; otherwise return a
 *       MissingFieldError for field "request".
 * [R2] `clientId` must be a non-empty string.
 * [R3] `method` must be one of the valid HttpMethod values.
 * [R4] `path` must be a non-empty string starting with "/".
 * [R5] `receivedAt` must be a positive finite number.
 *       If absent, default to `Date.now()`.
 * Return `Result<RequestDescriptor, ValidationError>`.
 */
export function validateRequest(
  raw: unknown
): Result<RequestDescriptor, ValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 2 — lookupPolicy
 *
 * Look up the policy for `clientId` in `registry`.
 *
 * Requirements:
 * [R6] If the clientId is not present in the registry, return a
 *       Result with an UnknownClientError.
 * [R7] Otherwise return the matching RateLimitPolicy wrapped in ok.
 */
export function lookupPolicy(
  clientId: string,
  registry: PolicyRegistry
): Result<RateLimitPolicy, UnknownClientError> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 3 — evaluateRateLimit
 *
 * Apply the sliding-window algorithm and return a RateLimitDecision.
 *
 * Requirements:
 * [R8]  Prune all timestamps from `store` for `clientId` that are
 *       older than `request.receivedAt - policy.windowMs`.
 * [R9]  After pruning, if the count of remaining timestamps is
 *       LESS THAN `policy.maxRequests`, push `request.receivedAt`
 *       onto the window, then return an AllowedDecision where:
 *         - `remaining` = maxRequests - (new count)
 *         - `resetAt`   = (oldest timestamp in window) + windowMs
 * [R10] If the count equals or exceeds `maxRequests`, do NOT push
 *       the timestamp. Return a DeniedDecision where:
 *         - `retryAfterMs` = (oldest timestamp in window + windowMs)
 *                            - request.receivedAt
 *       (i.e. how long until the oldest entry expires)
 * [R11] `store` must be mutated in-place (no new Map returned).
 */
export function evaluateRateLimit(
  request: RequestDescriptor,
  policy: RateLimitPolicy,
  store: WindowStore
): RateLimitDecision {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 4 — processRequest
 *
 * Orchestrate the full pipeline for a single raw inbound request.
 *
 * Requirements:
 * [R12] Validate `raw` via `validateRequest`; on failure return
 *        `{ ok: false, error }`.
 * [R13] Look up the policy via `lookupPolicy`; on failure return
 *        `{ ok: false, error }`.
 * [R14] Evaluate via `evaluateRateLimit` and return
 *        `{ ok: true, value: decision }`.
 */
export function processRequest(
  raw: unknown,
  registry: PolicyRegistry,
  store: WindowStore
): Result<RateLimitDecision, ValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 5 — narrowDecision  (type-guard helper)
 *
 * Requirements:
 * [R15] Return `true` iff `decision.status === "allowed"`.
 *        The return type must narrow `decision` to `AllowedDecision`.
 */
export function isAllowed(
  decision: RateLimitDecision
): decision is AllowedDecision {
  // TODO: implement
  throw new Error("Not implemented");
}
