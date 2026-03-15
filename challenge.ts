// ============================================================
// challenge.ts — Typed Real-Time Event Stream Processor
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// ============================================================

// ---------------------------------------------------------------------------
// 1. DOMAIN TYPES
// ---------------------------------------------------------------------------

/** The three kinds of events the stream can produce. */
export type EventKind = "user_action" | "system_alert" | "metric_snapshot";

/** Severity levels, ordered low → high. */
export type Severity = "info" | "warning" | "critical";

/** A user performed an action in the product. */
export interface UserActionEvent {
  kind: "user_action";
  userId: string;
  action: string;       // e.g. "click", "submit", "navigate"
  timestamp: number;    // Unix ms
  durationMs: number;
}

/** The system raised an alert. */
export interface SystemAlertEvent {
  kind: "system_alert";
  alertId: string;
  severity: Severity;
  message: string;
  timestamp: number;
}

/** A periodic snapshot of a named numeric metric. */
export interface MetricSnapshotEvent {
  kind: "metric_snapshot";
  metricName: string;
  value: number;
  unit: string;
  timestamp: number;
}

/** The discriminated union of all stream events. */
export type StreamEvent = UserActionEvent | SystemAlertEvent | MetricSnapshotEvent;

// ---------------------------------------------------------------------------
// 2. RESULT TYPE
// ---------------------------------------------------------------------------

export type Ok<T>  = { ok: true;  value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export type ParseError = { code: "MISSING_FIELD" | "WRONG_TYPE" | "UNKNOWN_KIND"; detail: string };

// ---------------------------------------------------------------------------
// 3. MIDDLEWARE PIPELINE
// ---------------------------------------------------------------------------

/**
 * A middleware receives the current event and a `next` function.
 * It may transform the event, produce a side-effect, or short-circuit by
 * returning `null` (drop the event from the pipeline).
 */
export type Middleware<E extends StreamEvent = StreamEvent> = (
  event: E,
  next: (event: E) => E | null
) => E | null;

/**
 * A typed pipeline that only accepts middleware written for events of kind K.
 * Middleware registered for "user_action" must accept `UserActionEvent`, etc.
 */
export type KindMiddlewareMap = {
  [K in EventKind]?: Middleware<Extract<StreamEvent, { kind: K }>>;
};

// ---------------------------------------------------------------------------
// 4. AGGREGATION TYPES
// ---------------------------------------------------------------------------

export interface UserActionSummary {
  totalEvents: number;
  uniqueUsers: Set<string>;
  actionCounts: Record<string, number>;   // action → count
  avgDurationMs: number;
}

export interface SystemAlertSummary {
  totalEvents: number;
  bySeverity: Record<Severity, number>;
  mostRecentMessage: string;
  mostRecentTimestamp: number;
}

export interface MetricSummary {
  totalSnapshots: number;
  byMetric: Record<string, { min: number; max: number; avg: number; unit: string }>;
}

/**
 * The final aggregated output — one summary per event kind.
 * Use a mapped type so the keys are tied directly to EventKind.
 *
 * TODO (Requirement 6): define `StreamSummary` as a mapped type over EventKind
 * that maps each kind to its corresponding summary interface.
 * Hint: you will need a helper type that associates each kind to its summary.
 */

/** Helper: maps each EventKind to its summary type. */
export type KindSummaryMap = {
  user_action:     UserActionSummary;
  system_alert:    SystemAlertSummary;
  metric_snapshot: MetricSummary;
};

// TODO (Requirement 6): replace `unknown` with the correct mapped type.
export type StreamSummary = unknown;

// ---------------------------------------------------------------------------
// 5. PARSE FUNCTION
// ---------------------------------------------------------------------------

/**
 * TODO (Requirement 1): Implement `parseEvent`.
 *
 * Given a raw `unknown` value, validate and narrow it to a `StreamEvent`.
 * Return `Ok<StreamEvent>` on success or `Err<ParseError>` on failure.
 *
 * Requirements:
 *  - R1a. If `kind` is missing or not a string → MISSING_FIELD
 *  - R1b. If `kind` is a string but not one of the three known kinds → UNKNOWN_KIND
 *  - R1c. For each known kind, validate all required fields exist and have the
 *         correct runtime type (string / number). Return WRONG_TYPE on mismatch.
 *         For system_alert, also validate that `severity` is one of the three
 *         Severity values.
 */
export function parseEvent(raw: unknown): Result<StreamEvent, ParseError> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 6. PIPELINE RUNNER
// ---------------------------------------------------------------------------

/**
 * TODO (Requirement 2): Implement `runPipeline`.
 *
 * Given a `StreamEvent` and a `KindMiddlewareMap`, look up the middleware
 * registered for the event's `kind` (if any) and run it.
 *
 * - If no middleware is registered for that kind, return the event unchanged.
 * - If middleware returns `null`, propagate `null` (event dropped).
 * - The `next` function passed to middleware is the identity: it returns
 *   whatever event it receives unchanged (single-middleware pipeline).
 *
 * The return type must be `StreamEvent | null` — use a generic + Extract
 * so the internal call is fully type-safe without assertions.
 */
export function runPipeline(
  event: StreamEvent,
  middlewareMap: KindMiddlewareMap
): StreamEvent | null {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 7. AGGREGATOR
// ---------------------------------------------------------------------------

/**
 * TODO (Requirement 3): Implement `buildSummary`.
 *
 * Perform a single-pass aggregation over an array of `StreamEvent`s and
 * return a `StreamSummary`.
 *
 * Requirements per kind:
 *  - user_action:
 *      R3a. Count total events.
 *      R3b. Collect unique userIds in a Set.
 *      R3c. Count occurrences of each action string.
 *      R3d. Compute average durationMs across all user_action events.
 *  - system_alert:
 *      R3e. Count total events.
 *      R3f. Count events per Severity level.
 *      R3g. Track the message and timestamp of the most recent alert
 *           (highest timestamp).
 *  - metric_snapshot:
 *      R3h. Count total snapshots.
 *      R3i. Per metricName, track min, max, running avg, and unit.
 */
export function buildSummary(events: StreamEvent[]): StreamSummary {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 8. ORCHESTRATOR
// ---------------------------------------------------------------------------

/**
 * TODO (Requirement 4): Implement `processStream`.
 *
 * Given an array of raw `unknown` payloads and a `KindMiddlewareMap`:
 *  R4a. Parse each payload with `parseEvent`.
 *  R4b. Collect all parse errors (do NOT throw — accumulate them).
 *  R4c. For successfully parsed events, run them through `runPipeline`.
 *  R4d. Discard `null` results (dropped by middleware).
 *  R4e. Pass surviving events to `buildSummary`.
 *  R4f. Return both the summary and the array of parse errors.
 */
export function processStream(
  rawPayloads: unknown[],
  middlewareMap: KindMiddlewareMap
): { summary: StreamSummary; parseErrors: ParseError[] } {
  // TODO: implement
  throw new Error("Not implemented");
}
