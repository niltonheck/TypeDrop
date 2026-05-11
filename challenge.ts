// ============================================================
// Typed Distributed Circuit Breaker
// challenge.ts — fill in every TODO, do NOT use `any` or `as`
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque identifier for a registered service. */
export type ServiceId = string & { readonly __brand: "ServiceId" };

/** Duration in milliseconds. */
export type Ms = number & { readonly __brand: "Ms" };

// Helper to construct branded values (already implemented for you).
export const serviceId = (s: string): ServiceId => s as ServiceId;
export const ms = (n: number): Ms => n as Ms;

// ------------------------------------------------------------------
// 2. CIRCUIT BREAKER STATE — discriminated union
// ------------------------------------------------------------------

export type BreakerState =
  | { readonly status: "closed";  failureCount: number }
  | { readonly status: "open";    openedAt: number }
  | { readonly status: "half-open" };

// ------------------------------------------------------------------
// 3. RAW CONFIG SHAPE (arrives as `unknown` from the gateway config)
// ------------------------------------------------------------------

/**
 * TODO: Define `RawServiceConfig` as the exact object shape you expect
 * to receive before validation.  All fields are `unknown` so the
 * validator is forced to narrow every one of them.
 */
export type RawServiceConfig = {
  // TODO — every field must be typed as `unknown`
};

// ------------------------------------------------------------------
// 4. VALIDATED SERVICE CONFIG
// ------------------------------------------------------------------

export interface ServiceConfig {
  readonly id: ServiceId;
  /** Maximum consecutive failures before opening the breaker. */
  readonly failureThreshold: number;
  /** How long the breaker stays open before moving to half-open (ms). */
  readonly recoveryTimeout: Ms;
  /** Per-call timeout (ms). */
  readonly callTimeout: Ms;
  /** Maximum retry attempts when the breaker is closed. */
  readonly maxRetries: number;
}

// ------------------------------------------------------------------
// 5. CALL RESULT — discriminated union
// ------------------------------------------------------------------

export type CallOutcome<T> =
  | { readonly ok: true;  value: T;     durationMs: number }
  | { readonly ok: false; reason: CallFailureReason; durationMs: number };

export type CallFailureReason =
  | "timeout"
  | "circuit-open"
  | "max-retries-exceeded"
  | "upstream-error";

// ------------------------------------------------------------------
// 6. BREAKER REGISTRY
// ------------------------------------------------------------------

/**
 * TODO: Define `BreakerRegistry` as a `Record` mapping `ServiceId`
 * to `BreakerState`.  Use a mapped type so only valid `ServiceId`
 * keys are accepted.
 */
export type BreakerRegistry = /* TODO */;

// ------------------------------------------------------------------
// 7. HEALTH REPORT
// ------------------------------------------------------------------

export interface ServiceHealthSnapshot {
  readonly id: ServiceId;
  readonly state: BreakerState;
  readonly totalCalls: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly lastOutcome: CallOutcome<unknown> | null;
}

export interface GatewayHealthReport {
  readonly generatedAt: number; // Unix timestamp ms
  readonly services: ReadonlyArray<ServiceHealthSnapshot>;
  /** Count of services currently in each state. */
  readonly summary: Record<BreakerState["status"], number>;
}

// ------------------------------------------------------------------
// 8. VALIDATION
// ------------------------------------------------------------------

/**
 * TODO: Implement `validateServiceConfig`.
 *
 * Requirements:
 *  R-1  Accept a single `unknown` value.
 *  R-2  Return `ServiceConfig` on success or throw a `TypeError`
 *       with a descriptive message on failure.
 *  R-3  Validate every field: `id` (non-empty string), `failureThreshold`
 *       (positive integer), `recoveryTimeout` (positive number),
 *       `callTimeout` (positive number), `maxRetries` (non-negative integer).
 *  R-4  Return branded `ServiceId` and `Ms` values — no type assertions
 *       outside of the two provided brand constructors (`serviceId`, `ms`).
 */
export function validateServiceConfig(raw: unknown): ServiceConfig {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. CIRCUIT BREAKER ENGINE
// ------------------------------------------------------------------

/**
 * TODO: Implement `createBreakerEngine`.
 *
 * Requirements:
 *  R-5  Accept an array of `ServiceConfig` and return the engine object
 *       described by `BreakerEngine` below.
 *  R-6  Initialise every breaker in the "closed" state with `failureCount: 0`.
 *  R-7  `call<T>` executes `fn` against the named service with the
 *       following state-machine logic:
 *         • "open"      → resolve immediately with `{ ok: false, reason: "circuit-open", … }`.
 *                         If `recoveryTimeout` has elapsed since `openedAt`,
 *                         transition to "half-open" first and allow one attempt.
 *         • "half-open" → allow exactly one attempt; success → "closed" (reset counts);
 *                         failure → back to "open" (reset `openedAt`).
 *         • "closed"    → attempt up to `maxRetries + 1` times.
 *                         Each attempt is raced against `callTimeout`.
 *                         On timeout resolve with `{ ok: false, reason: "timeout", … }`.
 *                         After `failureThreshold` consecutive failures, transition to "open".
 *                         On success reset `failureCount` to 0.
 *  R-8  `call<T>` must be generic — the return type must be
 *       `Promise<CallOutcome<T>>` where `T` is inferred from `fn`.
 *  R-9  `getReport()` returns a `GatewayHealthReport` snapshot of all services.
 *  R-10 `resetBreaker(id)` forces a service back to "closed" state.
 */

export interface BreakerEngine {
  call<T>(
    id: ServiceId,
    fn: () => Promise<T>
  ): Promise<CallOutcome<T>>;

  getReport(): GatewayHealthReport;

  resetBreaker(id: ServiceId): void;
}

export function createBreakerEngine(configs: ReadonlyArray<ServiceConfig>): BreakerEngine {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 10. BATCH INITIALISER
// ------------------------------------------------------------------

/**
 * TODO: Implement `initGateway`.
 *
 * Requirements:
 *  R-11 Accept an array of `unknown` raw configs.
 *  R-12 Validate each entry with `validateServiceConfig`; collect
 *       validation errors without short-circuiting (process all entries).
 *  R-13 Return `{ engine: BreakerEngine; errors: ReadonlyArray<string> }`.
 *       `engine` is always present (built from whichever configs passed validation).
 *  R-14 Use a conditional type alias `ValidatedOrError<T>` (defined below)
 *       internally to type the intermediate per-item result before
 *       splitting into successes and errors.
 */

export type ValidatedOrError<T> =
  | { readonly valid: true;  data: T }
  | { readonly valid: false; error: string };

export function initGateway(rawConfigs: ReadonlyArray<unknown>): {
  engine: BreakerEngine;
  errors: ReadonlyArray<string>;
} {
  // TODO
  throw new Error("Not implemented");
}
