// ============================================================
// Typed Event RSVP Aggregator
// ============================================================
// SCENARIO:
//   Raw RSVP payloads arrive as `unknown` from a public form
//   endpoint. Your job is to:
//     1. Validate each payload into a typed Rsvp
//     2. Group RSVPs by eventId
//     3. Compute a per-event attendance summary
//     4. Return a discriminated-union Result for every step
//
// RULES:
//   - No `any`, no `as`, no non-null assertions (!)
//   - strict: true must pass
// ============================================================

// ── 1. Domain types ─────────────────────────────────────────

/** Possible responses a guest can submit. */
export type RsvpStatus = "attending" | "declined" | "maybe";

/** A validated RSVP from a single guest. */
export interface Rsvp {
  readonly guestName: string;
  readonly eventId: string;
  readonly status: RsvpStatus;
  /** Number of additional guests the primary guest is bringing (≥ 0). */
  readonly plusOnes: number;
}

// ── 2. Result type ───────────────────────────────────────────

/** Discriminated union for operations that can fail. */
export type Result<T, E extends string = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// ── 3. Validation error codes ────────────────────────────────

export type RsvpValidationError =
  | "MISSING_GUEST_NAME"
  | "MISSING_EVENT_ID"
  | "INVALID_STATUS"
  | "INVALID_PLUS_ONES"
  | "NOT_AN_OBJECT";

// ── 4. Summary types ─────────────────────────────────────────

/** Per-event attendance breakdown. */
export interface EventSummary {
  readonly eventId: string;
  /** Total guests confirmed attending (primary + plusOnes). */
  readonly totalAttending: number;
  /** Count of "attending" RSVPs (not counting plusOnes). */
  readonly attendingCount: number;
  /** Count of "declined" RSVPs. */
  readonly declinedCount: number;
  /** Count of "maybe" RSVPs. */
  readonly maybeCount: number;
  /** All validated RSVPs for this event. */
  readonly rsvps: readonly Rsvp[];
}

/** Final report returned by the aggregator. */
export interface AggregationReport {
  /** Successfully parsed event summaries, keyed by eventId. */
  readonly summaries: Readonly<Record<string, EventSummary>>;
  /** Payloads that failed validation, with their error codes. */
  readonly failures: ReadonlyArray<{
    readonly payload: unknown;
    readonly error: RsvpValidationError;
  }>;
}

// ── 5. Your implementation ───────────────────────────────────

/**
 * REQUIREMENT 1 — Validate an unknown payload into a typed Rsvp.
 *
 * Rules:
 *   - payload must be a non-null object
 *   - guestName must be a non-empty string
 *   - eventId  must be a non-empty string
 *   - status   must be one of "attending" | "declined" | "maybe"
 *   - plusOnes must be a non-negative integer (default to 0 if absent)
 *
 * Return Result<Rsvp, RsvpValidationError>.
 */
export function validateRsvp(
  payload: unknown
): Result<Rsvp, RsvpValidationError> {
  // TODO: implement validation
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2 — Build an EventSummary from a list of RSVPs
 * that all share the same eventId.
 *
 * Rules:
 *   - totalAttending = sum of (1 + plusOnes) for every "attending" RSVP
 *   - attendingCount / declinedCount / maybeCount = simple head-counts
 */
export function buildEventSummary(
  eventId: string,
  rsvps: readonly Rsvp[]
): EventSummary {
  // TODO: implement summary builder
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 3 — Aggregate an array of unknown payloads into a
 * full AggregationReport.
 *
 * Rules:
 *   - Validate every payload with validateRsvp
 *   - Group valid RSVPs by eventId
 *   - Produce one EventSummary per eventId using buildEventSummary
 *   - Collect all failures (payload + error code) in the failures array
 *   - Never throw; always return a complete AggregationReport
 */
export function aggregateRsvps(payloads: readonly unknown[]): AggregationReport {
  // TODO: implement aggregator
  throw new Error("Not implemented");
}
