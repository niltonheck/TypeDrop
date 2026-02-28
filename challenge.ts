// ============================================================
// Typed Event Aggregator with Windowed Rollups
// ============================================================
// GOAL: Implement a strongly-typed event aggregator that:
//   1. Accepts a discriminated union of telemetry events
//   2. Buckets events into fixed-width time windows (by minute)
//   3. Computes a per-event-type rollup using a generic reducer
//   4. Returns a fully-typed summary keyed by event kind
// ============================================================

// ------ Domain types ----------------------------------------

export type PageViewEvent = {
  kind: "pageView";
  timestamp: number; // Unix ms
  path: string;
  durationMs: number;
};

export type ClickEvent = {
  kind: "click";
  timestamp: number;
  elementId: string;
  x: number;
  y: number;
};

export type ErrorEvent = {
  kind: "error";
  timestamp: number;
  message: string;
  fatal: boolean;
};

export type PurchaseEvent = {
  kind: "purchase";
  timestamp: number;
  orderId: string;
  amountCents: number;
};

// Requirement 1 — Build a discriminated union of ALL four event types.
export type TelemetryEvent =
  // TODO: union of PageViewEvent | ClickEvent | ErrorEvent | PurchaseEvent
  never;

// Requirement 2 — Extract the string literal `kind` values from TelemetryEvent.
// Use a conditional/utility type — do NOT hand-write the union.
export type EventKind =
  // TODO: derive from TelemetryEvent (hint: TelemetryEvent["kind"])
  never;

// Requirement 3 — Given an EventKind K, extract the matching event type.
// Must work as: ExtractEvent<"click"> === ClickEvent
export type ExtractEvent<K extends EventKind> =
  // TODO: use Extract<> or a conditional type
  never;

// ------ Rollup shapes ----------------------------------------

export type PageViewRollup = {
  count: number;
  totalDurationMs: number;
  uniquePaths: Set<string>;
};

export type ClickRollup = {
  count: number;
  uniqueElements: Set<string>;
};

export type ErrorRollup = {
  count: number;
  fatalCount: number;
  messages: string[];
};

export type PurchaseRollup = {
  count: number;
  totalAmountCents: number;
  orderIds: string[];
};

// Requirement 4 — Map each EventKind to its rollup type.
// Use a mapped type — do NOT write overloads or if/else.
export type RollupMap = {
  // TODO: map "pageView" → PageViewRollup, "click" → ClickRollup, etc.
  [K in EventKind]: never; // replace `never` with the correct rollup type
};

// ------ Reducer type ----------------------------------------

// Requirement 5 — A Reducer is a generic interface:
//   given the current accumulator (or undefined on first call) and one event,
//   it returns the next accumulator.
export interface Reducer<K extends EventKind> {
  // TODO: declare a single method `reduce` that:
  //   - accepts (acc: RollupMap[K] | undefined, event: ExtractEvent<K>)
  //   - returns RollupMap[K]
}

// ------ Window bucket key -----------------------------------

// Requirement 6 — Implement windowKey(timestamp: number, windowMs: number): string
// Returns a stable string key representing which window the timestamp falls into.
// Example: windowKey(61_500, 60_000) === "60000" (floor to nearest windowMs)
export function windowKey(timestamp: number, windowMs: number): string {
  // TODO
  return "";
}

// ------ Core aggregator -------------------------------------

// A windowed bucket holds one rollup per event kind, for one time window.
export type WindowBucket = Partial<RollupMap>;

// Requirement 7 — Implement aggregateEvents:
//
//   function aggregateEvents<K extends EventKind>(
//     events: TelemetryEvent[],
//     kind: K,
//     reducer: Reducer<K>,
//     windowMs?: number,   // defaults to 60_000 (one minute)
//   ): Map<string, RollupMap[K]>
//
// - Filter events to only those matching `kind`
// - Group them into time windows using windowKey()
// - Within each window, fold events through reducer.reduce()
// - Return a Map<windowKey, RollupMap[K]>
export function aggregateEvents<K extends EventKind>(
  events: TelemetryEvent[],
  kind: K,
  reducer: Reducer<K>,
  windowMs?: number
): Map<string, RollupMap[K]> {
  // TODO
  return new Map();
}

// ------ Concrete reducers (implement all four) ---------------

// Requirement 8 — Implement pageViewReducer satisfying Reducer<"pageView">
export const pageViewReducer: Reducer<"pageView"> = {
  // TODO
  reduce(_acc, _event) {
    return _acc!; // replace with real implementation
  },
};

// Requirement 9 — Implement clickReducer satisfying Reducer<"click">
export const clickReducer: Reducer<"click"> = {
  // TODO
  reduce(_acc, _event) {
    return _acc!;
  },
};

// Requirement 10 — Implement errorReducer satisfying Reducer<"error">
export const errorReducer: Reducer<"error"> = {
  // TODO
  reduce(_acc, _event) {
    return _acc!;
  },
};

// Requirement 11 — Implement purchaseReducer satisfying Reducer<"purchase">
export const purchaseReducer: Reducer<"purchase"> = {
  // TODO
  reduce(_acc, _event) {
    return _acc!;
  },
};
