// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts  –  Typed Real-Time Event Aggregator with Windowed Metrics
// Compile with: tsc --strict --noEmit challenge.ts
// ─────────────────────────────────────────────────────────────────────────────

// ─── 1. BRANDED TYPES ────────────────────────────────────────────────────────

/** Opaque millisecond timestamp */
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type TimestampMs = Brand<number, "TimestampMs">;
export type WindowId    = Brand<string, "WindowId">;

/** Helper — cast a plain number to TimestampMs (only allowed in this file / tests) */
export function toTs(n: number): TimestampMs {
  return n as TimestampMs;
}

// ─── 2. EVENT DISCRIMINATED UNION ────────────────────────────────────────────

export interface ViewEvent {
  kind: "view";
  streamId: string;
  userId: string;
  durationMs: number;
  ts: TimestampMs;
}

export interface ReactionEvent {
  kind: "reaction";
  streamId: string;
  userId: string;
  emoji: string;
  ts: TimestampMs;
}

export interface ChatEvent {
  kind: "chat";
  streamId: string;
  userId: string;
  messageLength: number;
  ts: TimestampMs;
}

export interface ErrorEvent {
  kind: "error";
  streamId: string;
  code: number;
  message: string;
  ts: TimestampMs;
}

export type TelemetryEvent = ViewEvent | ReactionEvent | ChatEvent | ErrorEvent;

// ─── 3. PER-KIND METRIC SHAPES ───────────────────────────────────────────────

export interface ViewMetrics {
  count: number;
  uniqueUsers: number;
  totalDurationMs: number;
  avgDurationMs: number;
}

export interface ReactionMetrics {
  count: number;
  uniqueUsers: number;
  topEmoji: string | null;       // most-frequent emoji, null if no events
  emojiBreakdown: Record<string, number>;
}

export interface ChatMetrics {
  count: number;
  uniqueUsers: number;
  avgMessageLength: number;
}

export interface ErrorMetrics {
  count: number;
  uniqueCodes: number;
  mostFrequentCode: number | null; // null if no events
}

// ─── 4. MAPPED TYPE: EventMetrics<K> ─────────────────────────────────────────

/** Maps each event `kind` string to its corresponding metrics shape. */
export type EventKind = TelemetryEvent["kind"];

// TODO (requirement 1):
// Define a mapped / conditional type `EventMetrics<K extends EventKind>` that
// resolves to the correct metrics shape for the given kind.
// e.g. EventMetrics<"view"> === ViewMetrics
//      EventMetrics<"error"> === ErrorMetrics
export type EventMetrics<K extends EventKind> = never; // ← replace `never`

// ─── 5. WINDOW SNAPSHOT ──────────────────────────────────────────────────────

/** A fully-computed snapshot for one time window. */
export interface WindowSnapshot {
  windowId: WindowId;
  startTs: TimestampMs;
  endTs: TimestampMs;
  /** Metrics keyed by event kind — only kinds that had ≥1 event are present. */
  metrics: {
    [K in EventKind]?: EventMetrics<K>;
  };
}

// ─── 6. RESULT TYPE ──────────────────────────────────────────────────────────

export type Ok<T>  = { ok: true;  value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export type AggregatorError =
  | { kind: "EMPTY_WINDOW";   windowId: WindowId }
  | { kind: "WINDOW_NOT_FOUND"; windowId: WindowId }
  | { kind: "INVALID_RANGE";  startTs: TimestampMs; endTs: TimestampMs };

// ─── 7. AGGREGATOR CLASS STUB ─────────────────────────────────────────────────

export class EventAggregator {
  /**
   * @param windowSizeMs  Duration of each fixed window in milliseconds.
   *                      Events are bucketed by Math.floor(ts / windowSizeMs).
   */
  constructor(private readonly windowSizeMs: number) {}

  // ── 7a. ingest ──────────────────────────────────────────────────────────────
  /**
   * TODO (requirement 2):
   * Accept a batch of raw TelemetryEvents and store them internally,
   * grouped by their computed WindowId.
   *
   * WindowId formula: String(Math.floor(event.ts / this.windowSizeMs))
   * cast to WindowId branded type.
   *
   * No return value.
   */
  ingest(events: readonly TelemetryEvent[]): void {
    throw new Error("Not implemented");
  }

  // ── 7b. computeWindow ───────────────────────────────────────────────────────
  /**
   * TODO (requirement 3):
   * Compute and return a WindowSnapshot for the given windowId.
   *
   * - Return Err({ kind: "WINDOW_NOT_FOUND", windowId }) if no events exist
   *   for that window.
   * - For each EventKind present in the window, compute the correct
   *   EventMetrics<K> shape (see interfaces above).
   * - The `metrics` field must satisfy the mapped type — TypeScript must
   *   verify that each key maps to the right metrics shape at compile time.
   *
   * Metric computation rules:
   *   view:     count, uniqueUsers (distinct userId), totalDurationMs (sum),
   *             avgDurationMs (totalDurationMs / count)
   *   reaction: count, uniqueUsers, topEmoji (mode emoji or null),
   *             emojiBreakdown (emoji → count map)
   *   chat:     count, uniqueUsers, avgMessageLength (sum / count)
   *   error:    count, uniqueCodes (distinct codes), mostFrequentCode (mode or null)
   */
  computeWindow(
    windowId: WindowId
  ): Result<WindowSnapshot, AggregatorError> {
    throw new Error("Not implemented");
  }

  // ── 7c. queryRange ──────────────────────────────────────────────────────────
  /**
   * TODO (requirement 4):
   * Return all WindowSnapshots whose startTs falls within [startTs, endTs].
   *
   * - Return Err({ kind: "INVALID_RANGE", startTs, endTs }) if startTs > endTs.
   * - For each window that overlaps the range, call computeWindow internally.
   * - Collect only Ok results; skip windows that return Err (e.g. empty windows
   *   that somehow ended up in the index — shouldn't happen but be defensive).
   * - Return Ok([...snapshots]) sorted ascending by startTs.
   */
  queryRange(
    startTs: TimestampMs,
    endTs: TimestampMs
  ): Result<WindowSnapshot[], AggregatorError> {
    throw new Error("Not implemented");
  }

  // ── 7d. getMetricsForKind ───────────────────────────────────────────────────
  /**
   * TODO (requirement 5):
   * Generic helper — given a windowId and an event kind K, return
   * Result<EventMetrics<K>, AggregatorError>.
   *
   * - Call computeWindow internally.
   * - If the window snapshot has no entry for kind K, return
   *   Err({ kind: "EMPTY_WINDOW", windowId }).
   * - Otherwise return Ok(metrics) with the correct EventMetrics<K> type
   *   inferred — no type assertions allowed.
   *
   * The return type must be generic: Result<EventMetrics<K>, AggregatorError>
   */
  getMetricsForKind<K extends EventKind>(
    windowId: WindowId,
    kind: K
  ): Result<EventMetrics<K>, AggregatorError> {
    throw new Error("Not implemented");
  }
}

// ─── 8. EXHAUSTIVE HELPER (requirement 6) ────────────────────────────────────

/**
 * TODO (requirement 6):
 * Implement `renderMetrics` — a function that accepts a WindowSnapshot and
 * returns a Record<EventKind, string> containing a human-readable summary
 * for each kind present in the snapshot.
 *
 * You MUST use an exhaustive switch (or equivalent) over EventKind so that
 * adding a new event kind to the union causes a compile-time error here.
 * Use the `assertNever` helper below for exhaustiveness.
 *
 * Output format (one string per kind, examples):
 *   view:     "Views: 42 | Unique users: 10 | Avg duration: 3200ms"
 *   reaction: "Reactions: 7 | Top emoji: 🔥"
 *   chat:     "Chats: 15 | Avg length: 80 chars"
 *   error:    "Errors: 3 | Unique codes: 2 | Top code: 500"
 */
export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

export function renderMetrics(snapshot: WindowSnapshot): Partial<Record<EventKind, string>> {
  throw new Error("Not implemented");
}
