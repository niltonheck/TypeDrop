// ============================================================
// Typed Workflow State Machine
// challenge.ts
// ============================================================
// Requirement 1 — Define the exhaustive set of order states as a
// string-literal union called `OrderState`.
// States: "pending" | "confirmed" | "picking" | "shipped" |
//         "delivered" | "cancelled"
export type OrderState = TODO;

// Requirement 2 — Define `TransitionMap` as a mapped type over
// `OrderState` where each key maps to a ReadonlyArray of the
// states it is *legally* allowed to transition to.
// Allowed transitions:
//   pending   → confirmed | cancelled
//   confirmed → picking   | cancelled
//   picking   → shipped   | cancelled
//   shipped   → delivered
//   delivered → (none — terminal)
//   cancelled → (none — terminal)
export type TransitionMap = TODO;

// Requirement 3 — Derive `LegalTransition<S extends OrderState>`
// as a conditional/indexed type that resolves to the union of
// states reachable from S according to `TransitionMap`.
// If S is a terminal state the result should be `never`.
export type LegalTransition<S extends OrderState> = TODO;

// Requirement 4 — Define a discriminated-union event type.
// Each event carries:
//   - `type`: one of "CONFIRM" | "START_PICKING" | "SHIP" |
//             "DELIVER" | "CANCEL"
//   - `orderId`: string
//   - `timestamp`: number  (Unix ms)
//   - Any event-specific extra fields shown below:
//       SHIP   → `trackingCode: string`
//       CANCEL → `reason: string`
//       (all others carry no extra fields)
export type OrderEvent = TODO;

// Requirement 5 — Define the `Order` interface.
// Fields:
//   id        : string
//   state     : OrderState
//   history   : ReadonlyArray<OrderEvent>
//   createdAt : number
//   updatedAt : number
export interface Order extends TODO {}

// Requirement 6 — Implement `transition`.
// Given the current order and an incoming event, return a NEW
// `Order` with:
//   • state updated according to the event type
//   • history extended with the event
//   • updatedAt set to event.timestamp
// THROW a `TypeError` with a descriptive message if the
// transition is not legal for the current state.
//
// The function signature must use the overload form so that
// TypeScript narrows the return type per event:
//   transition(order, CONFIRM event)      → Order in "confirmed"
//   transition(order, START_PICKING)      → Order in "picking"
//   … etc.
// Implement at least the general overload + implementation sig.
export function transition(order: Order, event: OrderEvent): Order;
// TODO: add per-event overloads above the implementation
export function transition(order: Order, event: OrderEvent): Order {
  // TODO: implement
  throw new Error("Not implemented");
}

// Requirement 7 — Implement `buildOrder`.
// Creates a brand-new Order in "pending" state.
// Signature: buildOrder(id: string, createdAt: number): Order
export function buildOrder(id: string, createdAt: number): Order {
  // TODO: implement
  throw new Error("Not implemented");
}

// Requirement 8 — Implement `getValidNextEvents`.
// Given an order, return the array of `OrderEvent["type"]`
// values that are currently legal to dispatch.
// Hint: derive the answer from `TransitionMap` at runtime too.
// Signature: getValidNextEvents(order: Order): ReadonlyArray<OrderEvent["type"]>
export function getValidNextEvents(order: Order): ReadonlyArray<OrderEvent["type"]> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Internal helper (provided — do not modify) ───────────────
// Maps an event type string to the resulting OrderState.
// You may use this inside `transition`.
export const EVENT_TO_STATE: Record<OrderEvent["type"], OrderState> = {
  CONFIRM:       "confirmed",
  START_PICKING: "picking",
  SHIP:          "shipped",
  DELIVER:       "delivered",
  CANCEL:        "cancelled",
};

// Maps each OrderState to the event types that are legal from it.
export const STATE_LEGAL_EVENTS: Record<OrderState, ReadonlyArray<OrderEvent["type"]>> = {
  pending:   ["CONFIRM", "CANCEL"],
  confirmed: ["START_PICKING", "CANCEL"],
  picking:   ["SHIP", "CANCEL"],
  shipped:   ["DELIVER"],
  delivered: [],
  cancelled: [],
};

// ── Type-level tests (must not produce TS errors) ────────────
// Uncomment these once you have filled in the TODOs to verify
// your types compile correctly.
//
// type _T1 = LegalTransition<"pending">;    // → "confirmed" | "cancelled"
// type _T2 = LegalTransition<"shipped">;    // → "delivered"
// type _T3 = LegalTransition<"delivered">; // → never
// type _T4 = LegalTransition<"cancelled">; // → never
