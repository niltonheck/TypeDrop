// ============================================================
// Challenge: Typed Event Log Parser
// Date: 2026-02-22 | Difficulty: Easy
// ============================================================
//
// SCENARIO:
// You're building a monitoring dashboard for a cloud platform.
// Raw event logs arrive as untyped JSON blobs. Your job is to
// safely parse them into a discriminated union of strongly-typed
// events, then aggregate counts and the latest timestamp per kind.
//
// ============================================================
// 1. TYPES — complete the discriminated union and result types
// ============================================================

/** All supported event kinds */
export type EventKind = "deploy" | "error" | "scale" | "alert";

/** A deploy event: records which service and version was deployed */
export interface DeployEvent {
  kind: "deploy";
  timestamp: number; // Unix ms
  service: string;
  version: string;
}

/** An error event: records a service error with an HTTP status code */
export interface ErrorEvent {
  kind: "error";
  timestamp: number;
  service: string;
  statusCode: number;
}

/** A scale event: records a replica count change for a service */
export interface ScaleEvent {
  kind: "scale";
  timestamp: number;
  service: string;
  replicas: number;
}

/** An alert event: records a named alert with a severity level */
export interface AlertEvent {
  kind: "alert";
  timestamp: number;
  alertName: string;
  severity: "low" | "medium" | "high" | "critical";
}

/** Discriminated union of all event types */
export type AppEvent = DeployEvent | ErrorEvent | ScaleEvent | AlertEvent;

// ============================================================
// 2. REQUIREMENT — parseEvent
// ============================================================
//
// Parse a single unknown value into an AppEvent, or return null
// if the value is missing required fields or has an unknown kind.
//
// Requirements:
//   R1. Accept `unknown` as input — NO type assertions (`as`), NO `any`.
//   R2. Return `AppEvent | null` — null signals an invalid/unknown record.
//   R3. Validate that `kind` is one of the four EventKind values.
//   R4. Validate that `timestamp` is a number on every event.
//   R5. Validate the fields specific to each event kind (see interfaces above).
//   R6. For AlertEvent, `severity` must be one of the four allowed literals.
//
export function parseEvent(raw: unknown): AppEvent | null {
  // TODO: implement runtime validation and narrowing — no `any`, no `as`
  throw new Error("Not implemented");
}

// ============================================================
// 3. REQUIREMENT — parseEventLog
// ============================================================
//
// Parse an array of unknown values, silently dropping invalid entries.
//
// Requirements:
//   R7. Accept `unknown` as input.
//   R8. If the input is not an array, return an empty array.
//   R9. Map each element through `parseEvent`, keeping only non-null results.
//
export function parseEventLog(raw: unknown): AppEvent[] {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// 4. TYPES — EventSummary
// ============================================================
//
// Requirements:
//   R10. `EventSummary` must be a mapped type over `EventKind` so that
//        adding a new EventKind automatically extends the summary shape.
//   R11. Each key maps to an object with:
//          - `count`      : number  — total events of that kind
//          - `latestTimestamp` : number | null  — highest timestamp seen, or null if none

export type EventSummary = {
  // TODO: use a mapped type over EventKind
  [K in EventKind]: {
    count: number;
    latestTimestamp: number | null;
  };
};

// ============================================================
// 5. REQUIREMENT — summariseEvents
// ============================================================
//
// Aggregate a list of parsed AppEvents into an EventSummary.
//
// Requirements:
//   R12. Every EventKind must appear in the result (count 0, null timestamp if absent).
//   R13. `count` is the total number of events of that kind.
//   R14. `latestTimestamp` is the maximum timestamp across events of that kind.
//   R15. Must use the `EventKind` union to initialise the summary so that
//        a new kind added to the union causes a compile-time error if forgotten.
//
export function summariseEvents(events: AppEvent[]): EventSummary {
  // TODO: implement — hint: initialise with all EventKind keys first
  throw new Error("Not implemented");
}
