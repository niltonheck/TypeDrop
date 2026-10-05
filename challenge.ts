// ============================================================
// Typed Event Store with Aggregation & Snapshot
// ============================================================
// REQUIREMENTS
// 1. Define a discriminated union `OrderEvent` covering the four
//    event kinds below. Each variant must carry only the fields
//    that are meaningful for that event — no optional "catch-all"
//    fields allowed.
//
//    | kind              | extra fields                                 |
//    |-------------------|----------------------------------------------|
//    | "order_placed"    | customerId: string, totalCents: number        |
//    | "item_added"      | itemId: string, qty: number, priceCents: number |
//    | "item_removed"    | itemId: string, qty: number                  |
//    | "order_cancelled" | reason: string                               |
//
// 2. Define the `OrderState` interface — the aggregate shape after
//    folding events. It must include:
//      - status: "open" | "cancelled"
//      - customerId: string
//      - items: Map<string, { qty: number; priceCents: number }>
//      - totalCents: number
//
// 3. Implement `applyEvent`:
//    A pure reducer — given the current state and ONE event, return
//    the NEXT state. Rules:
//      - "order_placed"    → set customerId, set status "open",
//                            set totalCents from the event
//      - "item_added"      → upsert the item (accumulate qty if
//                            already present), recalculate totalCents
//                            as the sum of qty * priceCents across all items
//      - "item_removed"    → reduce item qty (remove entry when qty ≤ 0),
//                            recalculate totalCents
//      - "order_cancelled" → set status "cancelled" (ignore if already cancelled)
//    Must be exhaustively type-safe (no fallthrough / no `default` escape hatch).
//
// 4. Define the branded type `Snapshot<S>` that wraps a state `S`
//    together with:
//      - snapshotAt: number   (event-log index, 0-based)
//      - createdMs: number    (Date.now() timestamp)
//    Use a brand so that plain `OrderState` objects cannot be
//    accidentally passed where a `Snapshot<OrderState>` is expected.
//
// 5. Implement `createSnapshot`:
//    Given a state and the current event-log index, produce a
//    `Snapshot<OrderState>`.
//
// 6. Implement `replayFrom`:
//    Given an optional `Snapshot<OrderState>` (or `null`), a slice
//    of events (starting right after the snapshot index), and a
//    typed `reducer` function, fold all events and return the final
//    `OrderState`.
//    - If no snapshot is provided, start from `EMPTY_ORDER_STATE`.
//    - The `reducer` parameter must be typed as the same signature
//      as `applyEvent` (use a type alias `Reducer<S, E>`).
//
// 7. Implement `getLineItems`:
//    Given an `OrderState`, return an array of
//    `{ itemId: string; qty: number; priceCents: number; lineTotalCents: number }`
//    sorted ascending by `itemId`.
// ============================================================

// --- Type aliases & interfaces -----------------------------------

// TODO: Define OrderEvent discriminated union (Requirement 1)

// TODO: Define OrderState interface (Requirement 2)

// TODO: Define Reducer<S, E> type alias (used in Requirement 6)

// TODO: Define Snapshot<S> branded type (Requirement 4)

// --- Constants ---------------------------------------------------

// The "zero" state before any events are applied.
// TODO: export const EMPTY_ORDER_STATE: OrderState = { ... }

// --- Functions ---------------------------------------------------

// TODO: Requirement 3
export function applyEvent(state: OrderState, event: OrderEvent): OrderState {
  throw new Error("Not implemented");
}

// TODO: Requirement 5
export function createSnapshot(
  state: OrderState,
  eventIndex: number
): Snapshot<OrderState> {
  throw new Error("Not implemented");
}

// TODO: Requirement 6
export function replayFrom(
  snapshot: Snapshot<OrderState> | null,
  events: OrderEvent[],
  reducer: Reducer<OrderState, OrderEvent>
): OrderState {
  throw new Error("Not implemented");
}

// TODO: Requirement 7
export function getLineItems(
  state: OrderState
): { itemId: string; qty: number; priceCents: number; lineTotalCents: number }[] {
  throw new Error("Not implemented");
}
