// ============================================================
// challenge.ts — Typed Event Log Aggregator
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every section marked TODO.
// ============================================================

// -----------------------------------------------------------
// 1. CORE EVENT TYPES
// -----------------------------------------------------------

/** Every event that comes off the wire must have these fields. */
export interface BaseEvent {
  eventId: string;
  userId: string;
  occurredAt: string; // ISO-8601
}

// TODO 1 — Define three concrete event interfaces that extend BaseEvent:
//
//   PageViewEvent  : kind = "page_view"
//                   payload: { path: string; durationMs: number }
//
//   ApiCallEvent   : kind = "api_call"
//                   payload: { endpoint: string; statusCode: number; latencyMs: number }
//
//   ErrorEvent     : kind = "error"
//                   payload: { code: string; message: string; fatal: boolean }
//
// Each interface must extend BaseEvent and carry a `kind` discriminant.

export interface PageViewEvent extends BaseEvent {
  // TODO 1a
}

export interface ApiCallEvent extends BaseEvent {
  // TODO 1b
}

export interface ErrorEvent extends BaseEvent {
  // TODO 1c
}

// TODO 2 — Create a discriminated union `AuditEvent` from the three types above.
export type AuditEvent = never; // replace `never`

// -----------------------------------------------------------
// 2. RESULT MONAD
// -----------------------------------------------------------

// TODO 3 — Define a generic Result<T, E> discriminated union with:
//   Ok<T>  : { ok: true;  value: T }
//   Err<E> : { ok: false; error: E }
// Then alias Result<T, E> as the union of the two.

export type Result<T, E> = never; // replace `never`

// -----------------------------------------------------------
// 3. VALIDATION ERRORS
// -----------------------------------------------------------

/** Structured error returned when an unknown payload fails validation. */
export interface ValidationError {
  rawInput: unknown;
  reason: string;
}

// -----------------------------------------------------------
// 4. VALIDATION / PARSING
// -----------------------------------------------------------

// TODO 4 — Implement `parseEvent`.
//
// Requirements:
//   4-a. Accept `unknown` input; return Result<AuditEvent, ValidationError>.
//   4-b. Reject (Err) if input is not a non-null object.
//   4-c. Reject if `eventId`, `userId`, or `occurredAt` are not non-empty strings.
//   4-d. Reject if `kind` is not one of "page_view" | "api_call" | "error".
//   4-e. Reject if `payload` is not a non-null object.
//   4-f. For each `kind`, validate the payload fields:
//        - page_view : path (string), durationMs (number)
//        - api_call  : endpoint (string), statusCode (number), latencyMs (number)
//        - error     : code (string), message (string), fatal (boolean)
//   4-g. On success, return Ok wrapping a correctly typed AuditEvent.
//
// Hint: use type-guard helper functions to keep parseEvent readable.

export function parseEvent(raw: unknown): Result<AuditEvent, ValidationError> {
  // TODO 4
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 5. AGGREGATION TYPES
// -----------------------------------------------------------

/** Per-user summary produced by the aggregator. */
export interface UserSummary {
  userId: string;
  totalEvents: number;
  pageViews: number;
  apiCalls: number;
  errors: number;
  fatalErrors: number;
  avgApiLatencyMs: number | null; // null when no api_call events exist
  uniquePaths: string[];          // de-duplicated, sorted alphabetically
  failedApiCalls: number;         // api_call events where statusCode >= 400
}

// Map of userId → UserSummary
export type UserSummaryMap = Record<string, UserSummary>;

// -----------------------------------------------------------
// 6. AGGREGATION
// -----------------------------------------------------------

// TODO 5 — Implement `aggregateEvents`.
//
// Requirements:
//   5-a. Accept an array of already-validated AuditEvent objects.
//   5-b. Group events by `userId`.
//   5-c. For each user, compute all fields of UserSummary:
//        - totalEvents   : count of all events for this user
//        - pageViews     : count of page_view events
//        - apiCalls      : count of api_call events
//        - errors        : count of error events
//        - fatalErrors   : count of error events where payload.fatal === true
//        - avgApiLatencyMs : mean of payload.latencyMs across api_call events,
//                            or null if the user has no api_call events
//        - uniquePaths   : distinct payload.path values from page_view events,
//                          sorted alphabetically
//        - failedApiCalls: count of api_call events where payload.statusCode >= 400
//   5-d. Return a UserSummaryMap (Record<string, UserSummary>).
//   5-e. Compute everything in a SINGLE pass over the events array
//        (one `reduce` or `for…of` loop — no multiple `.filter` chains).

export function aggregateEvents(events: AuditEvent[]): UserSummaryMap {
  // TODO 5
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. PIPELINE
// -----------------------------------------------------------

// TODO 6 — Implement `processEventLog`.
//
// Requirements:
//   6-a. Accept `rawEvents: unknown[]`.
//   6-b. Run each element through `parseEvent`.
//   6-c. Collect all Err results into a `failures: ValidationError[]` array.
//   6-d. Collect all Ok results into a `validEvents: AuditEvent[]` array.
//   6-e. Run `aggregateEvents` on the valid events.
//   6-f. Return an object with shape:
//        { summary: UserSummaryMap; failures: ValidationError[] }
//
// The return type must be written explicitly — no inference shortcuts.

export function processEventLog(rawEvents: unknown[]): {
  summary: UserSummaryMap;
  failures: ValidationError[];
} {
  // TODO 6
  throw new Error("Not implemented");
}
