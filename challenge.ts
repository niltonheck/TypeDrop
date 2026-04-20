// ============================================================
// Typed Event Stream Aggregator
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`)
// ============================================================

// ------------------------------------------------------------
// 1. DOMAIN TYPES
// ------------------------------------------------------------

/** All recognised event kinds in the telemetry feed. */
export type EventKind =
  | "page_view"
  | "button_click"
  | "error"
  | "purchase"
  | "session_end";

// TODO (1): Define a discriminated union `TelemetryEvent` with a
//   shared `sessionId: string` and `timestamp: number` field on
//   every member, plus the following per-kind payloads:
//
//   • "page_view"    → { url: string; referrer: string | null }
//   • "button_click" → { buttonId: string; label: string }
//   • "error"        → { code: number; message: string; fatal: boolean }
//   • "purchase"     → { orderId: string; amountCents: number; currency: string }
//   • "session_end"  → { durationMs: number }
//
// export type TelemetryEvent = ...

// ------------------------------------------------------------
// 2. VALIDATION
// ------------------------------------------------------------

// TODO (2): Implement a type-guard function:
//
//   export function parseTelemetryEvent(raw: unknown): TelemetryEvent | null
//
// It must return a fully-typed TelemetryEvent when `raw` is a
// valid object, or null when any required field is missing /
// has the wrong type. Use narrowing only — no `as`.

// ------------------------------------------------------------
// 3. HANDLER MAP  (mapped type + generics)
// ------------------------------------------------------------

// TODO (3): Define a mapped type:
//
//   export type EventHandlerMap = { [K in EventKind]: (event: Extract<TelemetryEvent, { kind: K }>) => void }
//
// Then implement `createHandlerMap(summary: SessionSummary): EventHandlerMap`
// that returns a handler for each kind which mutates `summary`
// according to the rules in section 5.

// ------------------------------------------------------------
// 4. SESSION SUMMARY TYPE
// ------------------------------------------------------------

// TODO (4): Define the `SessionSummary` type:
//
//   {
//     sessionId      : string
//     pageViews      : string[]           // ordered list of visited URLs
//     clicks         : Record<string, number>  // buttonId → click count
//     errors         : Array<{ code: number; message: string; fatal: boolean }>
//     totalSpentCents: number
//     currencies     : Set<string>        // distinct currencies seen
//     endedAt        : number | null      // timestamp of session_end, or null
//   }
//
// export type SessionSummary = ...

// ------------------------------------------------------------
// 5. AGGREGATION RULES (enforced by your handler map)
// ------------------------------------------------------------
// • page_view    → push event.url onto pageViews
// • button_click → increment clicks[buttonId] by 1 (initialise to 0 if absent)
// • error        → push { code, message, fatal } onto errors
// • purchase     → add amountCents to totalSpentCents; add currency to currencies
// • session_end  → set endedAt to event.timestamp
// ------------------------------------------------------------

// ------------------------------------------------------------
// 6. MAIN AGGREGATOR
// ------------------------------------------------------------

// TODO (5): Implement the main function:
//
//   export function aggregateSession(
//     sessionId : string,
//     rawEvents : unknown[],
//   ): AggregationReport
//
// It must:
//   a) Parse each raw event with parseTelemetryEvent(); skip invalids and count them.
//   b) Only process events whose sessionId matches the provided sessionId; count mismatches.
//   c) Route each valid, matching event to the correct handler in your EventHandlerMap.
//   d) Return an AggregationReport (see below).

// ------------------------------------------------------------
// 7. REPORT TYPE
// ------------------------------------------------------------

// TODO (6): Define `AggregationReport`:
//
//   {
//     summary        : SessionSummary
//     totalProcessed : number   // valid + matching events routed to handlers
//     totalSkipped   : number   // invalid (parse failures) + session-id mismatches
//     kindCounts     : Record<EventKind, number>   // how many of each kind were processed
//   }
//
// export type AggregationReport = ...
