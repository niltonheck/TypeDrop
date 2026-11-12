// ============================================================
// Typed Event Analytics Aggregator
// challenge.ts — fill in every TODO; do NOT use `any` or `as`
// ============================================================

// ── 1. Raw event shapes (discriminated union) ─────────────────────────────

export type PageViewEvent = {
  kind: "page_view";
  sessionId: string;
  url: string;
  durationMs: number;
  timestamp: number;
};

export type ClickEvent = {
  kind: "click";
  sessionId: string;
  elementId: string;
  timestamp: number;
};

export type FormSubmitEvent = {
  kind: "form_submit";
  sessionId: string;
  formId: string;
  success: boolean;
  timestamp: number;
};

export type ErrorEvent = {
  kind: "error";
  sessionId: string;
  message: string;
  timestamp: number;
};

/** The full union of all trackable events */
export type AnalyticsEvent =
  | PageViewEvent
  | ClickEvent
  | FormSubmitEvent
  | ErrorEvent;

// ── 2. Result / validation types ─────────────────────────────────────────

export type ParseOk<T> = { ok: true; value: T };
export type ParseErr  = { ok: false; error: string };
export type ParseResult<T> = ParseOk<T> | ParseErr;

// ── 3. Per-session summary ────────────────────────────────────────────────

export type SessionSummary = {
  sessionId: string;
  pageViews: number;
  totalDurationMs: number;
  clicks: number;
  formSubmissions: number;
  formSuccessRate: number;   // 0–1; NaN when formSubmissions === 0
  errors: number;
  firstEventAt: number;      // earliest timestamp in session
  lastEventAt: number;       // latest timestamp in session
};

// ── 4. Aggregation report ─────────────────────────────────────────────────

export type AggregationReport = {
  /** One summary per unique sessionId, sorted ascending by firstEventAt */
  sessions: SessionSummary[];
  /** Total number of successfully parsed events across all sessions */
  totalEvents: number;
  /** Total number of events that failed validation */
  totalParseErrors: number;
};

// ── 5. Mapped type: extract only the events of a specific kind ────────────

/**
 * TODO A — Mapped / conditional utility
 *
 * Define `EventOfKind<K>` so that:
 *   EventOfKind<"page_view">  →  PageViewEvent
 *   EventOfKind<"click">      →  ClickEvent
 *   … etc.
 *
 * Must be derived purely from `AnalyticsEvent` (no manual mapping).
 * Hint: use `Extract` with a shape that constrains the `kind` discriminant.
 */
export type EventOfKind<K extends AnalyticsEvent["kind"]> = TODO_A; // replace TODO_A

// ── 6. Generic single-pass group-by ──────────────────────────────────────

/**
 * TODO B — Generic groupBy
 *
 * Implement `groupBy` so that:
 *   groupBy(events, e => e.sessionId)
 *   → Map<string, AnalyticsEvent[]>
 *
 * The function must be fully generic — key type K, item type T.
 * Signature is provided; implement the body.
 */
export function groupBy<T, K extends string | number | symbol>(
  items: readonly T[],
  keyFn: (item: T) => K
): Map<K, T[]> {
  // TODO B: implement single-pass groupBy using Map
  throw new Error("Not implemented");
}

// ── 7. Runtime validation ─────────────────────────────────────────────────

/**
 * TODO C — Runtime parser / validator
 *
 * `parseEvent(raw: unknown): ParseResult<AnalyticsEvent>`
 *
 * Requirements:
 *  C1. Return ParseErr if `raw` is not a plain object.
 *  C2. Return ParseErr if `raw.kind` is not one of the four known kinds.
 *  C3. Return ParseErr if `raw.sessionId` is not a non-empty string.
 *  C4. Return ParseErr if `raw.timestamp` is not a finite number.
 *  C5. For "page_view":  url must be a non-empty string; durationMs must be a
 *      non-negative finite number.
 *  C6. For "click":      elementId must be a non-empty string.
 *  C7. For "form_submit": formId must be a non-empty string; success must be boolean.
 *  C8. For "error":      message must be a non-empty string.
 *  C9. On success, return ParseOk<AnalyticsEvent> with a correctly typed value.
 *
 * No `any` or type assertions allowed.
 */
export function parseEvent(raw: unknown): ParseResult<AnalyticsEvent> {
  // TODO C: implement validation
  throw new Error("Not implemented");
}

// ── 8. Core aggregation ───────────────────────────────────────────────────

/**
 * TODO D — Aggregation pipeline
 *
 * `aggregateEvents(raws: readonly unknown[]): AggregationReport`
 *
 * Requirements:
 *  D1. Parse every element with `parseEvent`; track successes & failures.
 *  D2. Group valid events by sessionId using `groupBy`.
 *  D3. For each session, compute a `SessionSummary` in a SINGLE pass over
 *      the session's events (no multiple array scans per field).
 *  D4. Sort the resulting sessions ascending by `firstEventAt`.
 *  D5. Return the full `AggregationReport`.
 *
 * Hint: use a mutable accumulator object inside the reduce / loop.
 */
export function aggregateEvents(raws: readonly unknown[]): AggregationReport {
  // TODO D: implement aggregation pipeline
  throw new Error("Not implemented");
}

// ── 9. Typed event filter ─────────────────────────────────────────────────

/**
 * TODO E — Generic kind filter
 *
 * `filterByKind<K>(events, kind): EventOfKind<K>[]`
 *
 * Given a mixed array of AnalyticsEvent, return only the events whose
 * `kind` matches the supplied literal, narrowed to the correct subtype.
 *
 * Requirements:
 *  E1. The return type must be `EventOfKind<K>[]` (use your type from TODO A).
 *  E2. Use a type predicate inside the filter — no casts.
 */
export function filterByKind<K extends AnalyticsEvent["kind"]>(
  events: readonly AnalyticsEvent[],
  kind: K
): EventOfKind<K>[] {
  // TODO E: implement using a type-predicate filter
  throw new Error("Not implemented");
}
