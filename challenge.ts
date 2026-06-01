// ============================================================
// challenge.ts — Typed Real-Time Event Stream Aggregator
// ============================================================
// RULES: strict: true, no `any`, no `as` casts, no type assertions.
// Fill in every section marked TODO.
// ============================================================

// ── 1. BRANDED TYPES ────────────────────────────────────────

// TODO: Define a branded type helper `Brand<Base, Tag>` using
//       an intersection with `{ readonly __brand: Tag }`.
export type Brand<Base, Tag extends string> = /* TODO */ never;

// TODO: Using `Brand`, create the following opaque scalar types:
export type EventId   = Brand<string, "EventId">;
export type SourceId  = Brand<string, "SourceId">;
export type Timestamp = Brand<number, "Timestamp">;

// ── 2. DISCRIMINATED UNION — RAW EVENT KINDS ────────────────

// TODO: Define three event-payload interfaces:
//
//   MetricPayload  { metricName: string; value: number; unit: string }
//   LogPayload     { level: "info" | "warn" | "error"; message: string }
//   AlertPayload   { severity: "low" | "medium" | "high" | "critical";
//                    code: string; description: string }

export interface MetricPayload  { /* TODO */ }
export interface LogPayload     { /* TODO */ }
export interface AlertPayload   { /* TODO */ }

// TODO: Build a discriminated union `TelemetryEvent` with a `kind`
//       discriminant.  Each member must carry:
//         id        : EventId
//         sourceId  : SourceId
//         timestamp : Timestamp
//         payload   : <the matching payload type>
//
//   Variants: kind "metric" | "log" | "alert"

export type TelemetryEvent = /* TODO */ never;

// Helper: extract the event for a specific kind
export type EventOfKind<K extends TelemetryEvent["kind"]> =
  Extract<TelemetryEvent, { kind: K }>;

// ── 3. VALIDATION — unknown → TelemetryEvent ────────────────

// TODO: Implement `parseEvent(raw: unknown): TelemetryEvent | null`.
//
// Requirements (# R-1):
//   R-1a  `raw` must be a non-null object with string `id`, `sourceId`,
//          string `kind` ∈ {"metric","log","alert"}, and numeric `timestamp`.
//   R-1b  Validate the nested `payload` shape for each `kind`.
//   R-1c  Return `null` for any validation failure — never throw.
//   R-1d  Cast scalars to their branded types only AFTER all checks pass
//         (use a single `return { ... } satisfies TelemetryEvent` pattern).

export function parseEvent(raw: unknown): TelemetryEvent | null {
  // TODO
  return null;
}

// ── 4. REDUCER MAP — per-kind typed accumulators ────────────

// TODO: Define the accumulator shapes:
//
//   MetricAccumulator  { count: number; sum: number; min: number; max: number }
//   LogAccumulator     { info: number; warn: number; error: number }
//   AlertAccumulator   { low: number; medium: number; high: number; critical: number }

export interface MetricAccumulator  { /* TODO */ }
export interface LogAccumulator     { /* TODO */ }
export interface AlertAccumulator   { /* TODO */ }

// TODO: Define a mapped type `AccumulatorMap` that maps each
//       `TelemetryEvent["kind"]` to its accumulator type:
//         "metric" → MetricAccumulator
//         "log"    → LogAccumulator
//         "alert"  → AlertAccumulator
//
//  Hint: use a conditional type or a helper interface + `{ [K in ...]: ... }`.

export type AccumulatorMap = /* TODO */ never;

// TODO: Define `initialAccumulator<K extends TelemetryEvent["kind"]>(kind: K): AccumulatorMap[K]`.
//       Returns a zeroed-out accumulator for the given kind.

export function initialAccumulator<K extends TelemetryEvent["kind"]>(
  kind: K
): AccumulatorMap[K] {
  // TODO
  throw new Error("not implemented");
}

// TODO: Define typed reducer functions — one per kind.
//       Each reducer is PURE: it takes the current accumulator and the
//       matching event, and returns a NEW accumulator (no mutation).
//
//   reduceMetric(acc: MetricAccumulator, ev: EventOfKind<"metric">): MetricAccumulator
//   reduceLog   (acc: LogAccumulator,    ev: EventOfKind<"log">):    LogAccumulator
//   reduceAlert (acc: AlertAccumulator,  ev: EventOfKind<"alert">):  AlertAccumulator

export function reduceMetric(
  acc: MetricAccumulator,
  ev: EventOfKind<"metric">
): MetricAccumulator {
  // TODO
  throw new Error("not implemented");
}

export function reduceLog(
  acc: LogAccumulator,
  ev: EventOfKind<"log">
): LogAccumulator {
  // TODO
  throw new Error("not implemented");
}

export function reduceAlert(
  acc: AlertAccumulator,
  ev: EventOfKind<"alert">
): AlertAccumulator {
  // TODO
  throw new Error("not implemented");
}

// ── 5. SLIDING-WINDOW DEDUPLICATION ─────────────────────────

// TODO: Define `DeduplicationConfig`:
//   windowMs    : number   — width of the time window in milliseconds
//   maxSeen     : number   — max distinct IDs to track (evict oldest on overflow)

export interface DeduplicationConfig { /* TODO */ }

// TODO: Implement `createDeduplicator(config: DeduplicationConfig)`.
//
// Requirements (# R-2):
//   R-2a  Returns an object with a single method:
//           `isSeen(event: TelemetryEvent): boolean`
//   R-2b  An event is "seen" if its `id` was already processed AND
//         its `timestamp` falls within the current window
//         (i.e. timestamp >= now - windowMs, where "now" is the event's
//          own timestamp for deterministic testing).
//   R-2c  After calling `isSeen`, if the event is NOT a duplicate, record it.
//   R-2d  Evict entries whose timestamps fall outside the window on every call.
//   R-2e  If the tracked set exceeds `maxSeen` after eviction, remove the
//         entry with the smallest timestamp to stay within the cap.

export function createDeduplicator(config: DeduplicationConfig): {
  isSeen(event: TelemetryEvent): boolean;
} {
  // TODO
  throw new Error("not implemented");
}

// ── 6. SOURCE-LEVEL AGGREGATION REPORT ──────────────────────

// TODO: Define `SourceReport` — the per-source summary:
//   sourceId     : SourceId
//   eventCounts  : Record<TelemetryEvent["kind"], number>
//   accumulators : AccumulatorMap                          ← full set, always present
//   firstSeen    : Timestamp
//   lastSeen     : Timestamp

export interface SourceReport { /* TODO */ }

// TODO: Define `AggregationReport`:
//   sources       : Map<SourceId, SourceReport>
//   totalIngested : number      ← events that passed validation + dedup
//   totalDropped  : number      ← events that failed validation OR were duplicates

export interface AggregationReport { /* TODO */ }

// ── 7. MAIN AGGREGATOR ──────────────────────────────────────

// TODO: Implement `aggregateStream`.
//
// Requirements (# R-3):
//   R-3a  Iterate `rawEvents` (an array of `unknown`).
//   R-3b  Parse each item with `parseEvent`; increment `totalDropped` on null.
//   R-3c  Check deduplication with `createDeduplicator(dedupConfig)`;
//         increment `totalDropped` on duplicates.
//   R-3d  For each valid, non-duplicate event, upsert a `SourceReport` in
//         `sources`:
//           • Increment the matching kind counter in `eventCounts`.
//           • Run the matching reducer to update the accumulator.
//           • Update `firstSeen` / `lastSeen` from `event.timestamp`.
//   R-3e  Return the completed `AggregationReport`.
//
// Hint: Use a type-safe dispatch — no `any`, no index tricks.
//       A small helper like `applyReducer` that switches on `event.kind`
//       and calls the right reducer keeps narrowing clean.

export function aggregateStream(
  rawEvents: unknown[],
  dedupConfig: DeduplicationConfig
): AggregationReport {
  // TODO
  throw new Error("not implemented");
}
