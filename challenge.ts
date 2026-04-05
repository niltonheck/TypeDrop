// ============================================================
// challenge.ts — Typed Event Stream Aggregator
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill in every section marked TODO.
// ============================================================

// -----------------------------------------------------------
// 1. DOMAIN TYPES
// -----------------------------------------------------------

/** All possible event categories emitted by stream sources. */
export type EventKind = "view" | "like" | "comment" | "share" | "donation";

/**
 * A validated, strongly-typed stream event.
 *
 * Requirements:
 *   - `id`        — non-empty string (branded)
 *   - `streamId`  — non-empty string (branded)
 *   - `kind`      — one of EventKind
 *   - `value`     — numeric payload (e.g. donation amount, view duration seconds)
 *   - `timestamp` — milliseconds since epoch (branded as TimestampMs)
 */

// TODO: declare a `Brand<T, B>` utility type
export type Brand<T, B extends string> = never; // replace `never`

// TODO: declare branded types using Brand<T, B>
export type EventId    = never; // replace `never`
export type StreamId   = never; // replace `never`
export type TimestampMs = never; // replace `never`

// TODO: declare the `StreamEvent` interface using the branded types above
export interface StreamEvent {
  // replace this comment with the correct fields
}

// -----------------------------------------------------------
// 2. RAW INPUT & VALIDATION
// -----------------------------------------------------------

/**
 * The shape that arrives over the wire (all fields untrustworthy).
 * Do NOT change this type.
 */
export interface RawEvent {
  id: unknown;
  streamId: unknown;
  kind: unknown;
  value: unknown;
  timestamp: unknown;
}

/** Ordered tuple of EventKind values — useful for runtime membership checks. */
const EVENT_KINDS: readonly EventKind[] = [
  "view", "like", "comment", "share", "donation",
] as const;

// TODO: implement `validateEvent`
// Requirements:
//   1. Returns `StreamEvent` on success, or a descriptive `string` error message on failure.
//   2. Use a `Result<T, E>` type (declare it below) — do NOT throw.
//   3. Validate every field:
//        - id / streamId: non-empty string
//        - kind: must be one of EVENT_KINDS
//        - value: finite number (use Number.isFinite)
//        - timestamp: positive integer
//   4. The returned branded values must satisfy their Brand constraints without `as`.
//      Hint: a type-guard helper that returns `x is EventId` (etc.) is the clean approach.

/** Generic Result type */
export type Result<T, E> = never; // replace `never`

export function validateEvent(raw: RawEvent): Result<StreamEvent, string> {
  // TODO
  throw new Error("not implemented");
}

// -----------------------------------------------------------
// 3. AGGREGATION
// -----------------------------------------------------------

/**
 * Per-stream statistics produced by the aggregator.
 *
 * Requirements:
 *   - `streamId`    — StreamId
 *   - `eventCounts` — a record mapping every EventKind to a number
 *   - `totalValue`  — sum of all `value` fields across events for this stream
 *   - `firstSeen`   — TimestampMs of the earliest event
 *   - `lastSeen`    — TimestampMs of the most recent event
 */

// TODO: declare `StreamStats` using the types above.
// Hint: use `Record<EventKind, number>` for eventCounts.
export interface StreamStats {
  // replace this comment with the correct fields
}

/**
 * Final report returned by the aggregator.
 *
 * Requirements:
 *   - `stats`         — a Map from StreamId → StreamStats
 *   - `failedEvents`  — array of { raw: RawEvent; error: string } for every validation failure
 *   - `processedCount`— total number of successfully processed events
 */

// TODO: declare `AggregationReport`
export interface AggregationReport {
  // replace this comment with the correct fields
}

// -----------------------------------------------------------
// 4. CONCURRENT PROCESSOR
// -----------------------------------------------------------

/**
 * Simulates async processing of a single validated event
 * (e.g. enrichment, persistence).  Do NOT change this signature.
 */
export type EventProcessor = (event: StreamEvent) => Promise<void>;

/**
 * `aggregateEvents` — the main entry point.
 *
 * Requirements:
 *   1. Accept an array of `RawEvent` and an `EventProcessor`.
 *   2. Accept a `concurrencyLimit` (default: 4) — at most this many
 *      `EventProcessor` calls may be in-flight simultaneously.
 *   3. Validate each raw event with `validateEvent`.
 *        - Failures → push to `failedEvents`; skip further processing.
 *        - Successes → pass to the EventProcessor (respecting the limit).
 *   4. After all processors resolve, aggregate `StreamStats` per streamId.
 *   5. Return a fully typed `AggregationReport`.
 *
 * Typing requirements:
 *   - The function must be generic enough that swapping `EventProcessor`
 *     implementations does not require changing the signature.
 *   - No `any`, no `as`, no non-null assertions (`!`).
 *
 * Concurrency hint:
 *   Process events in batches of `concurrencyLimit` using Promise.all,
 *   or implement a running-pool pattern — either is acceptable.
 */
export async function aggregateEvents(
  rawEvents: RawEvent[],
  processor: EventProcessor,
  concurrencyLimit = 4,
): Promise<AggregationReport> {
  // TODO
  throw new Error("not implemented");
}

// -----------------------------------------------------------
// 5. TYPED LOOKUP HELPER
// -----------------------------------------------------------

/**
 * `lookupStream`
 *
 * Given an `AggregationReport` and a plain `string` streamId,
 * return the `StreamStats` for that stream wrapped in a Result,
 * or a descriptive error string if not found.
 *
 * Requirements:
 *   - Must convert the plain string to `StreamId` via a type guard
 *     (same pattern as in validateEvent) — no `as`.
 *   - Return type must be `Result<StreamStats, string>`.
 */
export function lookupStream(
  report: AggregationReport,
  streamId: string,
): Result<StreamStats, string> {
  // TODO
  throw new Error("not implemented");
}
