// ============================================================
// Typed Event RSVP Aggregator — challenge.ts
// ============================================================
// TOPICS: union types, type narrowing, mapped types,
//         Record utility type, unknown → typed parsing,
//         Result<T,E> error handling
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES
// ------------------------------------------------------------------

/** The three possible RSVP responses an attendee can give. */
export type RsvpStatus = "attending" | "declined" | "maybe";

/**
 * A validated RSVP record.
 *
 * Requirements:
 *  - `id`       — non-empty string identifier (e.g. UUID)
 *  - `eventId`  — non-empty string identifying the target event
 *  - `name`     — attendee display name (non-empty string)
 *  - `email`    — attendee email address (non-empty string)
 *  - `status`   — one of the RsvpStatus union members
 *  - `guests`   — number of additional guests (0 or more, integer)
 */
export type Rsvp = {
  // TODO: fill in the fields described above
};

// ------------------------------------------------------------------
// 2. RESULT TYPE
// ------------------------------------------------------------------

/**
 * A discriminated union representing either a successful parse
 * or a parse failure carrying an error message.
 *
 * Requirements:
 *  - Success variant has `ok: true` and a `value` of the given type T
 *  - Failure variant has `ok: false` and an `error` string
 */
export type Result<T> =
  // TODO: define the two variants
  never;

// ------------------------------------------------------------------
// 3. RSVP SUMMARY TYPE
// ------------------------------------------------------------------

/**
 * A per-status tally plus a total guest-count breakdown.
 *
 * Requirements:
 *  - `counts`      — a Record mapping every RsvpStatus to a number
 *                    (how many RSVPs have that status)
 *  - `totalGuests` — sum of the `guests` field across ALL RSVPs
 *  - `eventId`     — the event this summary belongs to
 */
export type RsvpSummary = {
  // TODO: fill in the fields described above
};

// ------------------------------------------------------------------
// 4. PARSE FUNCTION
// ------------------------------------------------------------------

/**
 * parseRsvp(raw: unknown): Result<Rsvp>
 *
 * Validates that `raw` is a plain object containing all required
 * fields with the correct types and value constraints.
 *
 * Requirements (return a failure Result if any check fails):
 *  [1] `raw` must be a non-null object
 *  [2] `id`, `eventId`, `name`, `email` must be non-empty strings
 *  [3] `status` must be one of "attending" | "declined" | "maybe"
 *  [4] `guests` must be a non-negative integer (Number.isInteger check)
 *
 * On success return a success Result wrapping the validated Rsvp.
 */
export function parseRsvp(raw: unknown): Result<Rsvp> {
  // TODO: implement validation
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 5. AGGREGATION FUNCTION
// ------------------------------------------------------------------

/**
 * aggregateRsvps(eventId: string, raws: unknown[]): RsvpSummary
 *
 * Processes an array of raw webhook payloads for a single event.
 *
 * Requirements:
 *  [1] Parse each element with `parseRsvp`; silently skip failures
 *  [2] Only include RSVPs whose `eventId` matches the given `eventId`
 *  [3] Count how many valid, matching RSVPs have each RsvpStatus
 *  [4] Sum the `guests` field across all valid, matching RSVPs
 *  [5] Return an RsvpSummary with `counts`, `totalGuests`, and `eventId`
 *      — `counts` must always contain an entry for every RsvpStatus,
 *        defaulting to 0 for statuses with no RSVPs
 */
export function aggregateRsvps(
  eventId: string,
  raws: unknown[]
): RsvpSummary {
  // TODO: implement aggregation
  throw new Error("Not implemented");
}
