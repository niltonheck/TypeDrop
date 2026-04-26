// ============================================================
// challenge.ts — Typed Real-Time Metrics Aggregator
// ============================================================
// Rules: strict: true, no `any`, no `as`, no type assertions.
// Fill every TODO. Do NOT change existing type signatures.
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque brand helper — do NOT modify. */
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type MetricName  = Brand<string,  "MetricName">;
export type AgentId     = Brand<string,  "AgentId">;
export type WindowMs    = Brand<number,  "WindowMs">;
export type TimestampMs = Brand<number,  "TimestampMs">;

// ------------------------------------------------------------------
// 2. RAW EVENT SHAPES (discriminated union)
// ------------------------------------------------------------------

/**
 * All metric kinds supported by the platform.
 * Each kind carries different payload fields.
 */
export type RawMetricEvent =
  | { kind: "counter";   name: string; agentId: string; value: number;             timestampMs: number }
  | { kind: "gauge";     name: string; agentId: string; value: number;             timestampMs: number }
  | { kind: "histogram"; name: string; agentId: string; buckets: number[];         timestampMs: number }
  | { kind: "summary";   name: string; agentId: string; quantiles: [number, number][]; timestampMs: number };

// ------------------------------------------------------------------
// 3. VALIDATED EVENT (branded fields)
// ------------------------------------------------------------------

/**
 * TODO: Define `ValidatedEvent<K>` as a generic mapped/conditional type.
 *
 * Requirements:
 *  - K must be constrained to RawMetricEvent["kind"].
 *  - Extract the matching member of RawMetricEvent whose `kind` is K.
 *  - Replace `name`, `agentId`, and `timestampMs` with their branded
 *    counterparts (MetricName, AgentId, TimestampMs) while keeping
 *    all other fields unchanged.
 *  - The `kind` discriminant must remain as the literal K.
 */
export type ValidatedEvent<K extends RawMetricEvent["kind"]> = TODO_ValidatedEvent<K>;
// Replace `TODO_ValidatedEvent<K>` with your real type expression.
// Hint: use Extract<RawMetricEvent, { kind: K }> then remap fields.
type TODO_ValidatedEvent<K extends RawMetricEvent["kind"]> = never; // ← replace this line

// ------------------------------------------------------------------
// 4. AGGREGATION RESULT (discriminated union)
// ------------------------------------------------------------------

export type AggregationResult =
  | { kind: "counter";   name: MetricName; totalCount: number;   windowMs: WindowMs }
  | { kind: "gauge";     name: MetricName; min: number; max: number; avg: number; windowMs: WindowMs }
  | { kind: "histogram"; name: MetricName; mergedBuckets: number[]; p50: number; p95: number; p99: number; windowMs: WindowMs }
  | { kind: "summary";   name: MetricName; quantileMap: Map<number, number>; windowMs: WindowMs };

// ------------------------------------------------------------------
// 5. FLUSH REPORT (final output per series)
// ------------------------------------------------------------------

export type SeriesKey = `${MetricName}::${AgentId}`;

export type FlushReport =
  | { status: "ok";      seriesKey: SeriesKey; result: AggregationResult }
  | { status: "empty";   seriesKey: SeriesKey }
  | { status: "error";   seriesKey: SeriesKey; reason: string };

// ------------------------------------------------------------------
// 6. AGGREGATOR STRATEGY INTERFACE
// ------------------------------------------------------------------

/**
 * Each metric kind has its own aggregator strategy.
 * TODO: Complete the interface — do NOT change the method names.
 */
export interface AggregatorStrategy<K extends RawMetricEvent["kind"]> {
  /** Ingest a validated event into internal state. */
  ingest(event: ValidatedEvent<K>): void;

  /**
   * TODO: Declare `flush`.
   * Requirements:
   *  - Returns a Promise.
   *  - Resolves to the AggregationResult whose `kind` matches K,
   *    OR `null` if no events were ingested.
   *  - Use Extract<AggregationResult, { kind: K }> to constrain the return.
   */
  flush(windowMs: WindowMs): Promise<TODO_FlushReturn<K>>;
}
// Replace TODO_FlushReturn<K> with your real conditional/extract expression.
type TODO_FlushReturn<K extends RawMetricEvent["kind"]> = never; // ← replace this line

// ------------------------------------------------------------------
// 7. STRATEGY REGISTRY
// ------------------------------------------------------------------

/**
 * TODO: Define `StrategyRegistry` as a mapped type over all metric kinds.
 *
 * Requirements:
 *  - Keys are every member of RawMetricEvent["kind"].
 *  - Each value is a () => AggregatorStrategy<K> factory (not an instance).
 *  - Use a mapped type with a key remapping or homomorphic map.
 */
export type StrategyRegistry = TODO_StrategyRegistry;
type TODO_StrategyRegistry = never; // ← replace this line

// ------------------------------------------------------------------
// 8. RUNTIME VALIDATION
// ------------------------------------------------------------------

/**
 * TODO: Implement `validateEvent`.
 *
 * Requirements:
 *  - Accepts `unknown` input.
 *  - Returns a discriminated Result:
 *      { ok: true;  value: ValidatedEvent<RawMetricEvent["kind"]> }
 *    | { ok: false; error: string }
 *  - Must narrow `unknown` → RawMetricEvent → ValidatedEvent without `as`/`any`.
 *  - Check: input is a non-null object with a string `kind` matching one of
 *    the four kinds, a string `name`, a string `agentId`, and a numeric `timestampMs`.
 *  - Check kind-specific payload fields (value: number for counter/gauge;
 *    buckets: number[] for histogram; quantiles: [number,number][] for summary).
 *  - On success, cast string/number fields to their branded types using
 *    a brand-safe helper (see hint below).
 *
 * Hint — brand-safe helper already provided:
 */
function brand<T extends number | string, B extends string>(
  v: T
): Brand<T, B> {
  return v as Brand<T, B>; // sole permitted `as` in this file
}

export type ValidationResult =
  | { ok: true;  value: ValidatedEvent<RawMetricEvent["kind"]> }
  | { ok: false; error: string };

export function validateEvent(raw: unknown): ValidationResult {
  // TODO: implement — ~40 lines
  return { ok: false, error: "not implemented" };
}

// ------------------------------------------------------------------
// 9. WINDOWED AGGREGATION ENGINE
// ------------------------------------------------------------------

/**
 * TODO: Implement the `MetricsAggregator` class.
 *
 * Constructor requirements:
 *  - Accepts `registry: StrategyRegistry` and `windowMs: WindowMs`.
 *  - Maintains a Map from SeriesKey → AggregatorStrategy<RawMetricEvent["kind"]>.
 *
 * Method requirements:
 *
 *  ingest(raw: unknown): ValidationResult
 *    - Validate the raw event via `validateEvent`.
 *    - On success, look up or create the strategy for the series key
 *      (`${name}::${agentId}`), then call strategy.ingest(event).
 *    - Return the ValidationResult.
 *
 *  flushAll(): Promise<FlushReport[]>
 *    - Concurrently flush ALL active series (Promise.all).
 *    - For each series:
 *        • If flush() returns null  → { status: "empty", seriesKey }
 *        • If flush() returns a result → { status: "ok", seriesKey, result }
 *        • If flush() throws        → { status: "error", seriesKey, reason: e.message }
 *    - After flushing, clear the internal series map.
 *    - Return the array of FlushReports.
 *
 *  activeSeries(): SeriesKey[]
 *    - Return the list of currently tracked series keys.
 */
export class MetricsAggregator {
  // TODO: implement
}

// ------------------------------------------------------------------
// 10. CONCRETE STRATEGY IMPLEMENTATIONS
// ------------------------------------------------------------------

/**
 * TODO: Implement all four concrete strategies.
 * Each must satisfy AggregatorStrategy<K> for its K.
 *
 * CounterStrategy  — accumulates `value` into a running total (totalCount).
 *
 * GaugeStrategy    — tracks min, max, and computes avg across all ingested values.
 *
 * HistogramStrategy — merges all `buckets` arrays (concatenate + sort),
 *                     then computes p50/p95/p99 as index-based percentiles
 *                     (Math.floor(pct * length) clamped to last index).
 *
 * SummaryStrategy  — averages values per quantile key across all ingested
 *                    quantile pairs, stores result in a Map<number, number>.
 */
export class CounterStrategy implements AggregatorStrategy<"counter"> {
  // TODO: implement
  ingest(_event: ValidatedEvent<"counter">): void { /* TODO */ }
  async flush(_windowMs: WindowMs): Promise<Extract<AggregationResult, { kind: "counter" }> | null> {
    // TODO: implement
    return null;
  }
}

export class GaugeStrategy implements AggregatorStrategy<"gauge"> {
  // TODO: implement
  ingest(_event: ValidatedEvent<"gauge">): void { /* TODO */ }
  async flush(_windowMs: WindowMs): Promise<Extract<AggregationResult, { kind: "gauge" }> | null> {
    // TODO: implement
    return null;
  }
}

export class HistogramStrategy implements AggregatorStrategy<"histogram"> {
  // TODO: implement
  ingest(_event: ValidatedEvent<"histogram">): void { /* TODO */ }
  async flush(_windowMs: WindowMs): Promise<Extract<AggregationResult, { kind: "histogram" }> | null> {
    // TODO: implement
    return null;
  }
}

export class SummaryStrategy implements AggregatorStrategy<"summary"> {
  // TODO: implement
  ingest(_event: ValidatedEvent<"summary">): void { /* TODO */ }
  async flush(_windowMs: WindowMs): Promise<Extract<AggregationResult, { kind: "summary" }> | null> {
    // TODO: implement
    return null;
  }
}

// ------------------------------------------------------------------
// 11. REPORT HELPERS
// ------------------------------------------------------------------

/**
 * TODO: Implement `summariseReports`.
 *
 * Requirements:
 *  - Accepts FlushReport[].
 *  - Returns an object:
 *      {
 *        ok:    Array<Extract<FlushReport, { status: "ok" }>>,
 *        empty: Array<Extract<FlushReport, { status: "empty" }>>,
 *        error: Array<Extract<FlushReport, { status: "error" }>>,
 *      }
 *  - Use type narrowing (discriminated union) — no casting.
 *  - Must be implemented as a single-pass reduce or for-loop.
 */
export function summariseReports(reports: FlushReport[]): {
  ok:    Array<Extract<FlushReport, { status: "ok" }>>;
  empty: Array<Extract<FlushReport, { status: "empty" }>>;
  error: Array<Extract<FlushReport, { status: "error" }>>;
} {
  // TODO: implement
  return { ok: [], empty: [], error: [] };
}

/**
 * TODO: Implement `formatReport` using exhaustive matching.
 *
 * Requirements:
 *  - Accepts a single FlushReport.
 *  - Returns a human-readable string for each status variant.
 *  - Must use a switch on `report.status` that is exhaustive —
 *    add a `never`-typed default branch that throws.
 */
export function formatReport(report: FlushReport): string {
  // TODO: implement
  return "";
}
