// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts  –  Typed API Rate Limiter with Sliding Window & Policy Registry
// ─────────────────────────────────────────────────────────────────────────────
// TOPICS: discriminated unions · generics · mapped types · branded types ·
//         unknown → typed narrowing · Result<T,E> · Map/Set · sliding window
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Branded primitives ─────────────────────────────────────────────────────

/** A tenant identifier — must never be confused with a plain string. */
export type TenantId = string & { readonly __brand: "TenantId" };

/** A request identifier — must never be confused with a plain string. */
export type RequestId = string & { readonly __brand: "RequestId" };

/** Unix-epoch milliseconds — must never be confused with a plain number. */
export type EpochMs = number & { readonly __brand: "EpochMs" };

// ── 2. Policy kinds (discriminated union) ─────────────────────────────────────

/**
 * A "fixed" policy: `maxRequests` allowed per `windowMs` milliseconds.
 * The window is always aligned to wall-clock boundaries (e.g. every 60 s).
 */
export interface FixedWindowPolicy {
  readonly kind: "fixed";
  readonly maxRequests: number;
  readonly windowMs: number;
}

/**
 * A "sliding" policy: `maxRequests` allowed in any rolling `windowMs`-ms window.
 * Uses a per-tenant timestamp log to count only requests inside the window.
 */
export interface SlidingWindowPolicy {
  readonly kind: "sliding";
  readonly maxRequests: number;
  readonly windowMs: number;
}

/**
 * A "tiered" policy: different limits apply depending on the tenant's tier.
 * `tiers` maps tier name → { maxRequests, windowMs }.
 */
export interface TieredWindowPolicy {
  readonly kind: "tiered";
  readonly tier: string;
  readonly tiers: Record<string, { maxRequests: number; windowMs: number }>;
}

export type RateLimitPolicy =
  | FixedWindowPolicy
  | SlidingWindowPolicy
  | TieredWindowPolicy;

// ── 3. Result type ────────────────────────────────────────────────────────────

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// ── 4. Validation errors ──────────────────────────────────────────────────────

export type PolicyValidationError =
  | { readonly kind: "missing_field"; readonly field: string }
  | { readonly kind: "invalid_kind"; readonly received: unknown }
  | { readonly kind: "invalid_tier"; readonly tier: string; readonly available: string[] }
  | { readonly kind: "negative_value"; readonly field: string };

// ── 5. Admission decision ─────────────────────────────────────────────────────

/** Returned when a request is allowed through. */
export interface AdmissionAllowed {
  readonly decision: "allowed";
  readonly tenantId: TenantId;
  readonly requestId: RequestId;
  readonly remainingRequests: number;
  readonly windowResetAt: EpochMs;
}

/** Returned when a request is denied. */
export interface AdmissionDenied {
  readonly decision: "denied";
  readonly tenantId: TenantId;
  readonly requestId: RequestId;
  readonly retryAfterMs: number;
  readonly windowResetAt: EpochMs;
}

export type AdmissionDecision = AdmissionAllowed | AdmissionDenied;

// ── 6. Limiter state ──────────────────────────────────────────────────────────

/**
 * Internal per-tenant state kept by the limiter.
 * You may extend this interface if you need extra fields.
 */
export interface TenantState {
  /** Ordered log of request timestamps (sliding window). */
  readonly timestamps: EpochMs[];
  /** Count used for fixed-window accounting. */
  readonly fixedWindowCount: number;
  /** The start of the current fixed window. */
  readonly fixedWindowStart: EpochMs;
}

// ── 7. The RateLimiter class ──────────────────────────────────────────────────

export class RateLimiter {
  /**
   * Keyed by TenantId.
   * Stores per-tenant mutable state (you'll need to work around `readonly`
   * in TenantState when mutating — without using `any` or type assertions).
   */
  private readonly state: Map<TenantId, TenantState> = new Map();

  /**
   * Registry of validated policies, keyed by TenantId.
   */
  private readonly policies: Map<TenantId, RateLimitPolicy> = new Map();

  // ── REQUIREMENT 1 ───────────────────────────────────────────────────────────
  /**
   * Validate and register a raw (unknown) policy for a tenant.
   *
   * Rules:
   *  - `raw` must be a non-null object.
   *  - `raw.kind` must be "fixed" | "sliding" | "tiered".
   *  - For "fixed" / "sliding": `maxRequests` and `windowMs` must be
   *    positive integers (> 0).
   *  - For "tiered": `tier` must be a non-empty string present as a key in
   *    `tiers`; each tier entry must have positive `maxRequests` and `windowMs`.
   *  - On success, store the validated policy and return `{ ok: true, value: policy }`.
   *  - On failure, return `{ ok: false, error: PolicyValidationError }`.
   *
   * TODO: implement this method.
   */
  registerPolicy(
    tenantId: TenantId,
    raw: unknown
  ): Result<RateLimitPolicy, PolicyValidationError> {
    throw new Error("Not implemented");
  }

  // ── REQUIREMENT 2 ───────────────────────────────────────────────────────────
  /**
   * Evaluate whether an incoming request should be admitted or denied.
   *
   * Rules:
   *  - If no policy is registered for `tenantId`, treat it as denied with
   *    `retryAfterMs: 0` and `windowResetAt` equal to `now`.
   *  - For "fixed" policies:
   *      • The window starts at the most recent multiple of `windowMs` before `now`.
   *      • If `now` has moved past `fixedWindowStart + windowMs`, reset the counter.
   *      • Allow if count < maxRequests; deny otherwise.
   *  - For "sliding" policies:
   *      • Prune timestamps older than `now - windowMs` from the log.
   *      • Allow if remaining log length < maxRequests; deny otherwise.
   *  - For "tiered" policies:
   *      • Look up the effective `{ maxRequests, windowMs }` from
   *        `policy.tiers[policy.tier]`.
   *      • Apply sliding-window logic using those values.
   *  - `windowResetAt` for sliding/tiered: earliest timestamp in the log + windowMs
   *    (or `now + windowMs` when the log is empty after admission).
   *  - `remainingRequests` must never be negative.
   *  - `retryAfterMs` = `windowResetAt - now` (minimum 0).
   *
   * TODO: implement this method.
   */
  admit(
    tenantId: TenantId,
    requestId: RequestId,
    now: EpochMs
  ): AdmissionDecision {
    throw new Error("Not implemented");
  }

  // ── REQUIREMENT 3 ───────────────────────────────────────────────────────────
  /**
   * Return a snapshot of every tenant's current admission status.
   *
   * The snapshot is a `Record` mapping each registered TenantId to an object:
   *   {
   *     policy: RateLimitPolicy;
   *     requestsInWindow: number;   // how many requests are in the current window
   *     windowResetAt: EpochMs;     // when the current window resets
   *   }
   *
   * For "fixed" policies, `requestsInWindow` is the current fixed-window count.
   * For "sliding" / "tiered" policies, it is the number of timestamps in the log
   * that fall within the window at time `now`.
   *
   * TODO: implement this method.
   */
  snapshot(now: EpochMs): Record<TenantId, {
    policy: RateLimitPolicy;
    requestsInWindow: number;
    windowResetAt: EpochMs;
  }> {
    throw new Error("Not implemented");
  }
}

// ── 8. Helper — branded constructors (already implemented for you) ─────────────

export const asTenantId  = (s: string): TenantId  => s as TenantId;
export const asRequestId = (s: string): RequestId => s as RequestId;
export const asEpochMs   = (n: number): EpochMs   => n as EpochMs;
