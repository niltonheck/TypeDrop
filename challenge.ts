// ============================================================
// Typed Event Aggregator with Time-Window Bucketing
// ============================================================
// SCENARIO:
//   Raw events arrive as `unknown` from a webhook stream.
//   You must validate, type-narrow, bucket by time window,
//   and aggregate into per-window summaries — with zero `any`.
// ============================================================

// --------------- Domain Types ---------------

/** All valid event categories */
export type EventCategory = "error" | "warning" | "info" | "metric";

/** Severity only applies to error/warning events */
export type Severity = "low" | "medium" | "high" | "critical";

/** Base shape shared by all events */
interface BaseEvent {
  id: string;
  category: EventCategory;
  source: string;
  timestampMs: number;
}

/** An error or warning event carries a severity and message */
export interface AlertEvent extends BaseEvent {
  category: "error" | "warning";
  severity: Severity;
  message: string;
}

/** An info event carries a human-readable description */
export interface InfoEvent extends BaseEvent {
  category: "info";
  description: string;
}

/** A metric event carries a named numeric measurement */
export interface MetricEvent extends BaseEvent {
  category: "metric";
  metricName: string;
  value: number;
}

/** The discriminated union of all valid event shapes */
export type MonitoringEvent = AlertEvent | InfoEvent | MetricEvent;

// --------------- Validation ---------------

/**
 * REQUIREMENT 1
 * Validate an `unknown` payload and narrow it to `MonitoringEvent`.
 * Return `null` if the payload does not conform to any known event shape.
 *
 * Rules:
 *  - Every event must have: id (string), category (EventCategory),
 *    source (string), timestampMs (number).
 *  - "error" | "warning" → must also have severity (Severity) and message (string).
 *  - "info"              → must also have description (string).
 *  - "metric"            → must also have metricName (string) and value (number).
 */
export function parseEvent(raw: unknown): MonitoringEvent | null {
  // TODO: implement
  throw new Error("Not implemented");
}

// --------------- Time-Window Bucketing ---------------

/**
 * A bucket key is the ISO-8601 string of the window's start time.
 * e.g. for a 60 000 ms window: "2026-07-10T12:00:00.000Z"
 */
export type BucketKey = string;

/**
 * REQUIREMENT 2
 * Given a `timestampMs` and a `windowMs` duration, return the `BucketKey`
 * for the window that contains the timestamp.
 *
 * The bucket start is: Math.floor(timestampMs / windowMs) * windowMs
 * Convert that number to an ISO-8601 string (new Date(...).toISOString()).
 */
export function getBucketKey(timestampMs: number, windowMs: number): BucketKey {
  // TODO: implement
  throw new Error("Not implemented");
}

// --------------- Per-Window Summary ---------------

/** Counts broken down by event category */
export type CategoryCounts = Record<EventCategory, number>;

/** Counts broken down by severity (only from alert events) */
export type SeverityCounts = Record<Severity, number>;

/** Aggregated stats for a single metric name */
export interface MetricStats {
  count: number;
  sum: number;
  min: number;
  max: number;
}

export interface WindowSummary {
  /** ISO-8601 start of this time window */
  windowStart: BucketKey;
  /** Total number of valid events in this window */
  totalEvents: number;
  /** Per-category event counts */
  categoryCounts: CategoryCounts;
  /** Per-severity counts (from error/warning events only) */
  severityCounts: SeverityCounts;
  /** Per-metric aggregated stats (from metric events only) */
  metricStats: Record<string, MetricStats>;
  /** Unique source identifiers seen in this window */
  sources: string[];
}

// --------------- Aggregation Result ---------------

export interface AggregationResult {
  /** Summaries keyed by BucketKey, sorted chronologically */
  windows: WindowSummary[];
  /** Total events that failed validation */
  invalidCount: number;
  /** Total events that passed validation */
  validCount: number;
}

// --------------- Main Entry Point ---------------

/**
 * REQUIREMENT 3
 * Aggregate an array of raw unknown payloads into time-windowed summaries.
 *
 * Steps:
 *  a) Validate each raw payload with `parseEvent`; track invalid count.
 *  b) Assign each valid event to a bucket using `getBucketKey(event.timestampMs, windowMs)`.
 *  c) For each bucket, compute a `WindowSummary`:
 *       - categoryCounts: count events per EventCategory (initialise all 4 to 0).
 *       - severityCounts: count AlertEvents per Severity (initialise all 4 to 0).
 *       - metricStats: for each unique metricName accumulate count/sum/min/max.
 *       - sources: deduplicated list of source strings, insertion-order preserved.
 *  d) Return `windows` sorted ascending by windowStart string (lexicographic is fine
 *     since ISO-8601 strings sort correctly).
 *
 * @param rawEvents  - Array of unknown payloads from the webhook stream.
 * @param windowMs   - Time-window size in milliseconds (e.g. 60_000 for 1 minute).
 */
export function aggregateEvents(
  rawEvents: unknown[],
  windowMs: number
): AggregationResult {
  // TODO: implement
  throw new Error("Not implemented");
}

// --------------- Typed Helper (Bonus) ---------------

/**
 * BONUS REQUIREMENT
 * Implement a generic `groupBy` helper with a precise return type.
 *
 * `groupBy(items, keyFn)` groups an array of T by the string key
 * produced by `keyFn`, returning a `Map<K, T[]>`.
 *
 * The return type must use a const-narrowed key type K so callers
 * get back `Map<BucketKey, MonitoringEvent[]>` (not `Map<string, …>`)
 * when they pass a function typed as `(e: MonitoringEvent) => BucketKey`.
 */
export function groupBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K
): Map<K, T[]> {
  // TODO: implement
  throw new Error("Not implemented");
}
