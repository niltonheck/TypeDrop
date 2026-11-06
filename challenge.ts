// ============================================================
// Typed Event Stream Aggregator with Windowed Rollups
// ============================================================
// GOAL: Validate raw telemetry events, bucket them into fixed
// time windows, and compute per-metric rollups — all with the
// compiler catching every shape mismatch.
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES
// ------------------------------------------------------------------

/** The set of recognised metric names — extend as needed. */
export type MetricName =
  | "cpu_usage"
  | "memory_usage"
  | "request_latency"
  | "error_rate"
  | "throughput";

/** Every event must carry one of these aggregation strategies. */
export type AggregationKind = "sum" | "avg" | "min" | "max" | "count";

/**
 * A raw event as it arrives from an external source.
 * Shape is UNKNOWN at the boundary — you must validate it.
 */
export type RawEvent = unknown;

/** A validated, well-typed telemetry event. */
export interface TelemetryEvent {
  readonly serviceId: string;       // non-empty string
  readonly metric: MetricName;
  readonly value: number;           // finite number
  readonly timestampMs: number;     // positive integer (ms since epoch)
  readonly aggregation: AggregationKind;
}

// ------------------------------------------------------------------
// 2. RESULT TYPE  (no exceptions — callers pattern-match on this)
// ------------------------------------------------------------------

export type ValidationResult<T> =
  | { readonly ok: true;  readonly data: T }
  | { readonly ok: false; readonly error: string };

// ------------------------------------------------------------------
// 3. WINDOW TYPES
// ------------------------------------------------------------------

/** Describes a single fixed-width time bucket. */
export interface TimeWindow {
  readonly startMs: number;   // inclusive
  readonly endMs: number;     // exclusive  (startMs + windowSizeMs)
}

/**
 * One rollup record produced for a specific (window × service × metric) triple.
 * The `aggregation` field mirrors the kind used by events in that group.
 */
export interface RollupRecord {
  readonly window: TimeWindow;
  readonly serviceId: string;
  readonly metric: MetricName;
  readonly aggregation: AggregationKind;
  readonly result: number;          // computed aggregate value
  readonly eventCount: number;      // how many events contributed
}

// ------------------------------------------------------------------
// 4. AGGREGATION CONFIG
// ------------------------------------------------------------------

/**
 * Maps each MetricName to the AggregationKind that should be applied
 * when events for that metric disagree (or as the canonical strategy).
 * Every MetricName key MUST be present — use a mapped type.
 */
export type MetricAggregationConfig = {
  // TODO: replace this comment with a mapped type over MetricName
  // that maps every MetricName → AggregationKind
  [K in MetricName]: AggregationKind;
};

// ------------------------------------------------------------------
// 5. GROUPING HELPER TYPE
// ------------------------------------------------------------------

/**
 * A nested lookup structure:
 *   windowKey  →  serviceId  →  MetricName  →  TelemetryEvent[]
 *
 * Use mapped types + Record where appropriate.
 * `windowKey` is a string of the form `"${startMs}-${endMs}"`.
 */
export type WindowedGroups = Record<
  string,                              // windowKey
  Record<
    string,                            // serviceId
    Partial<Record<MetricName, TelemetryEvent[]>>
  >
>;

// ------------------------------------------------------------------
// 6. FUNCTIONS TO IMPLEMENT
// ------------------------------------------------------------------

/**
 * REQUIREMENT 1 — Runtime validator
 *
 * Accepts an unknown value and returns a ValidationResult<TelemetryEvent>.
 * Must check:
 *   - `serviceId`    : non-empty string
 *   - `metric`       : one of the MetricName literals
 *   - `value`        : finite number
 *   - `timestampMs`  : positive integer
 *   - `aggregation`  : one of the AggregationKind literals
 *
 * Return { ok: false, error: "<reason>" } for the FIRST failing field.
 */
export function validateEvent(raw: RawEvent): ValidationResult<TelemetryEvent> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2 — Window assignment
 *
 * Given a `timestampMs` and a `windowSizeMs`, return the TimeWindow
 * that contains this timestamp.
 *
 *   startMs = Math.floor(timestampMs / windowSizeMs) * windowSizeMs
 *   endMs   = startMs + windowSizeMs
 */
export function assignWindow(timestampMs: number, windowSizeMs: number): TimeWindow {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 3 — Grouping
 *
 * Given a list of validated events and a window size, return a
 * WindowedGroups object that buckets events by (windowKey, serviceId, metric).
 *
 * windowKey format: `"${startMs}-${endMs}"`
 */
export function groupByWindow(
  events: readonly TelemetryEvent[],
  windowSizeMs: number
): WindowedGroups {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 4 — Aggregation engine
 *
 * Given a list of numeric values and an AggregationKind, return the
 * aggregate result.
 *
 *   sum   → sum of all values
 *   avg   → arithmetic mean  (0 if empty)
 *   min   → minimum value    (Infinity if empty)
 *   max   → maximum value    (-Infinity if empty)
 *   count → number of values
 *
 * The return type must be `number`.
 */
export function aggregate(values: readonly number[], kind: AggregationKind): number {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5 — Full pipeline
 *
 * Accepts:
 *   - `rawEvents`    : RawEvent[]  (may contain invalid entries)
 *   - `windowSizeMs` : number
 *   - `config`       : MetricAggregationConfig  (canonical strategy per metric)
 *
 * Returns:
 *   {
 *     rollups  : RollupRecord[];          // one per (window × service × metric)
 *     rejected : ValidationResult<never>[] // failed validations (ok === false)
 *   }
 *
 * Pipeline steps:
 *   a. Validate every raw event — collect successes and failures separately.
 *   b. Group valid events with `groupByWindow`.
 *   c. For each (window × service × metric) group:
 *        - Use the AggregationKind from `config[metric]` (canonical strategy).
 *        - Compute the rollup with `aggregate`.
 *        - Build a RollupRecord.
 *   d. Return rollups sorted by startMs ASC, then serviceId ASC, then metric ASC.
 */
export function processEventStream(
  rawEvents: readonly RawEvent[],
  windowSizeMs: number,
  config: MetricAggregationConfig
): { rollups: RollupRecord[]; rejected: Array<ValidationResult<never>> } {
  // TODO: implement
  throw new Error("Not implemented");
}
