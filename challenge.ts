// =============================================================
// challenge.ts — Typed User Session Aggregator
// =============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill in every section marked TODO.
// =============================================================

// ── 1. Domain Types ──────────────────────────────────────────

/** All valid event categories tracked by the telemetry API. */
export type EventCategory = "pageview" | "click" | "error" | "purchase";

/**
 * A validated session event.
 * TODO: Add a branded type alias `UserId` that is a `string` branded
 *       with `{ readonly _brand: "UserId" }`.
 */
// TODO: declare the `UserId` branded type here
export type UserId = string & { readonly _brand: "UserId" };

export interface SessionEvent {
  readonly eventId: string;
  readonly userId: UserId;
  readonly category: EventCategory;
  /** Unix timestamp in milliseconds */
  readonly occurredAt: number;
  /** Page path, e.g. "/dashboard" */
  readonly path: string;
  /** Revenue in cents; only present for "purchase" events */
  readonly revenuecents?: number;
}

// ── 2. Validation ─────────────────────────────────────────────

/**
 * A Result type so callers get typed success/failure without exceptions.
 * TODO: Define `Result<T, E>` as a discriminated union:
 *   - { ok: true;  value: T }
 *   - { ok: false; error: E }
 */
// TODO: declare `Result<T, E>` here
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Validates a single raw value as a `SessionEvent`.
 *
 * Requirements (implement inside the function body):
 * 1. Return `{ ok: false, error: "<reason>" }` if `raw` is not a non-null object.
 * 2. Return `{ ok: false, error: "<reason>" }` if any of the following string fields
 *    are missing or not strings: `eventId`, `userId`, `path`.
 * 3. Return `{ ok: false, error: "<reason>" }` if `category` is not one of the
 *    four valid EventCategory values.
 * 4. Return `{ ok: false, error: "<reason>" }` if `occurredAt` is not a finite number.
 * 5. If `revenuecents` is present, return `{ ok: false, error: "<reason>" }` if it
 *    is not a non-negative finite number.
 * 6. On success return `{ ok: true, value: <SessionEvent> }`.
 *    Cast `userId` to `UserId` using the ONE permitted branded-type helper below.
 */
export function validateSessionEvent(raw: unknown): Result<SessionEvent, string> {
  // TODO: implement validation
  throw new Error("Not implemented");
}

// ── 3. Aggregation Types ──────────────────────────────────────

/**
 * Per-user summary produced by the aggregator.
 *
 * TODO: Use a mapped type to build `EventCounts` — a record whose keys are
 *       exactly `EventCategory` and whose values are `number`.
 *       (Do NOT hand-write four properties; use a mapped type.)
 */
export type EventCounts = { [K in EventCategory]: number };

export interface UserSessionSummary {
  readonly userId: UserId;
  /** Total number of valid events for this user */
  readonly totalEvents: number;
  /** Breakdown of events by category */
  readonly eventCounts: EventCounts;
  /** Earliest `occurredAt` across all events for this user */
  readonly firstSeen: number;
  /** Latest `occurredAt` across all events for this user */
  readonly lastSeen: number;
  /** Sum of `revenuecents` across all purchase events (0 if none) */
  readonly totalRevenueCents: number;
  /** Distinct paths visited, in insertion order */
  readonly uniquePaths: ReadonlyArray<string>;
}

export interface AggregationReport {
  readonly totalRawEvents: number;
  readonly validEvents: number;
  readonly invalidEvents: number;
  /** One summary per unique userId, sorted ascending by userId string */
  readonly userSummaries: ReadonlyArray<UserSessionSummary>;
}

// ── 4. Branded-type helper (the ONE permitted cast) ───────────
/**
 * Call this function to safely "mint" a UserId from a validated string.
 * You may use this inside `validateSessionEvent` — nowhere else.
 */
export function toUserId(raw: string): UserId {
  return raw as UserId; // sole permitted assertion in the file
}

// ── 5. Core Aggregation Function ──────────────────────────────

/**
 * Aggregates an array of raw telemetry payloads into a typed report.
 *
 * Requirements:
 * 1. Validate every element of `rawEvents` with `validateSessionEvent`.
 * 2. Count valid vs invalid events for the report totals.
 * 3. Group valid events by `userId`.
 * 4. For each user compute all fields of `UserSessionSummary`:
 *    - `eventCounts` must start at 0 for every category (use your mapped type).
 *    - `uniquePaths` must contain no duplicates and preserve insertion order.
 * 5. Return `userSummaries` sorted ascending by `userId` (lexicographic).
 *
 * TODO: implement this function.
 */
export function aggregateSessions(rawEvents: unknown[]): AggregationReport {
  // TODO: implement aggregation
  throw new Error("Not implemented");
}
