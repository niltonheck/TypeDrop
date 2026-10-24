// ============================================================
// Typed Event-Sourced State Machine
// Fulfillment Platform — Order Lifecycle Engine
// ============================================================
//
// REQUIREMENTS
//
// 1. Define a discriminated union `OrderState` covering every possible
//    order state. Each variant must carry only the data that is
//    meaningful in that state (see state definitions below).
//
// 2. Define a discriminated union `OrderEvent` covering every domain
//    event. Each variant must carry exactly the payload described below.
//
// 3. Define a `Transition<From, Event, To>` type that describes a single
//    valid state-machine edge. Use it to build a `TransitionMap` —
//    a compile-time structure that lists ALL valid transitions.
//    (Hint: consider a mapped/conditional type or a tuple/array of
//    Transition objects combined with `satisfies`.)
//
// 4. Implement `transition(state: OrderState, event: OrderEvent): OrderState`
//    — applies ONE event to the current state and returns the next state.
//    • Throw a `MachineError` (see below) for any invalid transition.
//    • The function must be exhaustive: the compiler must warn if a new
//      state or event variant is added but not handled.
//    • You may NOT use `as`, `any`, or non-null assertions (`!`).
//
// 5. Implement `replay(events: ReadonlyArray<OrderEvent>): OrderState`
//    — reconstructs the current state by folding the event log starting
//    from the implicit `{ kind: "Pending" }` initial state.
//
// 6. Implement `project<K extends keyof OrderSnapshot>(
//      state: OrderState,
//      keys: ReadonlyArray<K>
//    ): Pick<OrderSnapshot, K>`
//    — extracts a read-model snapshot from any state. Fields that are not
//    yet meaningful in the current state must be typed as `undefined` in
//    `OrderSnapshot` and returned as `undefined` at runtime.
//
// ────────────────────────────────────────────────────────────
// STATE DEFINITIONS
// ────────────────────────────────────────────────────────────
// Pending    — order created; holds { orderId, customerId, createdAt }
// Confirmed  — payment authorised; adds { confirmedAt, totalCents }
// Picking    — warehouse started picking; adds { warehouseId, startedAt }
// Shipped    — parcel dispatched; adds { trackingCode, shippedAt }
// Delivered  — parcel delivered; adds { deliveredAt }
// Cancelled  — order cancelled at any pre-ship stage; adds { reason, cancelledAt }
// Refunded   — post-delivery refund issued; adds { refundedAt, refundCents }
//
// ────────────────────────────────────────────────────────────
// EVENT DEFINITIONS  (event kind → payload fields)
// ────────────────────────────────────────────────────────────
// PlaceOrder      → { orderId: string; customerId: string; createdAt: Date }
// ConfirmPayment  → { confirmedAt: Date; totalCents: number }
// StartPicking    → { warehouseId: string; startedAt: Date }
// DispatchParcel  → { trackingCode: string; shippedAt: Date }
// MarkDelivered   → { deliveredAt: Date }
// CancelOrder     → { reason: string; cancelledAt: Date }
// IssueRefund     → { refundedAt: Date; refundCents: number }
//
// ────────────────────────────────────────────────────────────
// VALID TRANSITIONS
// ────────────────────────────────────────────────────────────
//  (no state)  + PlaceOrder     → Pending
//  Pending     + ConfirmPayment → Confirmed
//  Pending     + CancelOrder    → Cancelled
//  Confirmed   + StartPicking   → Picking
//  Confirmed   + CancelOrder    → Cancelled
//  Picking     + DispatchParcel → Shipped
//  Picking     + CancelOrder    → Cancelled
//  Shipped     + MarkDelivered  → Delivered
//  Delivered   + IssueRefund    → Refunded
//
// ────────────────────────────────────────────────────────────
// TYPES YOU MUST DEFINE / COMPLETE
// ────────────────────────────────────────────────────────────

/** All possible states an order can be in. */
export type OrderState =
  // TODO: define each variant as an object with a `kind` discriminant
  // plus the cumulative data fields described above.
  never;

/** All domain events that drive state transitions. */
export type OrderEvent =
  // TODO: define each variant as an object with a `kind` discriminant
  // plus the payload fields described above.
  never;

/**
 * Describes one valid edge in the state machine.
 * `From` is the state kind string, `Evt` is the event kind string,
 * `To` is the resulting state kind string.
 */
export type Transition<
  From extends string,
  Evt extends string,
  To extends string,
> = {
  readonly from: From;
  readonly on: Evt;
  readonly to: To;
};

/**
 * A compile-time list of every valid transition.
 * Use `satisfies` to keep the array narrowly typed while
 * still asserting it conforms to `ReadonlyArray<Transition<string,string,string>>`.
 *
 * TODO: fill in all valid transitions from the spec above.
 */
export const TRANSITIONS = [
  // e.g. { from: "Pending", on: "ConfirmPayment", to: "Confirmed" },
] satisfies ReadonlyArray<Transition<string, string, string>>;

/**
 * Derives the union of all `{ from, on }` pairs that are legal,
 * directly from `TRANSITIONS`.
 * TODO: implement this conditional/mapped type.
 */
export type LegalMove = (typeof TRANSITIONS)[number] extends Transition<
  infer F,
  infer E,
  infer _T
>
  ? // TODO: produce a union of `{ from: F; on: E }` pairs
    never
  : never;

/** Read-model: a flat projection of the maximum possible order data. */
export type OrderSnapshot = {
  readonly orderId: string | undefined;
  readonly customerId: string | undefined;
  readonly createdAt: Date | undefined;
  readonly confirmedAt: Date | undefined;
  readonly totalCents: number | undefined;
  readonly warehouseId: string | undefined;
  readonly startedAt: Date | undefined;
  readonly trackingCode: string | undefined;
  readonly shippedAt: Date | undefined;
  readonly deliveredAt: Date | undefined;
  readonly cancelledAt: Date | undefined;
  readonly reason: string | undefined;
  readonly refundedAt: Date | undefined;
  readonly refundCents: number | undefined;
};

/** Thrown when an event is applied to an incompatible state. */
export class MachineError extends Error {
  constructor(
    public readonly fromState: string,
    public readonly event: string,
  ) {
    super(`Invalid transition: ${fromState} + ${event}`);
    this.name = "MachineError";
  }
}

// ────────────────────────────────────────────────────────────
// FUNCTIONS TO IMPLEMENT
// ────────────────────────────────────────────────────────────

/**
 * Apply a single event to the current state and return the next state.
 * Throws `MachineError` for invalid transitions.
 *
 * Requirements:
 * - Must be exhaustive over all `OrderState` and `OrderEvent` variants.
 * - No `any`, no `as`, no `!`.
 */
export function transition(state: OrderState, event: OrderEvent): OrderState {
  // TODO
  throw new MachineError(state.kind, event.kind);
}

/**
 * Reconstruct the current state by replaying an ordered event log.
 * The log MUST start with a `PlaceOrder` event.
 * Throws `MachineError` if any event in the log is invalid for the
 * accumulated state at that point.
 *
 * Hint: fold over the events, but the very first event is special —
 * it bootstraps the machine from a virtual "no state" into `Pending`.
 */
export function replay(events: ReadonlyArray<OrderEvent>): OrderState {
  // TODO
  throw new MachineError("(none)", "(empty log)");
}

/**
 * Extract a typed read-model snapshot from any order state.
 * Only the keys listed in `keys` are returned; all others are omitted.
 * Fields not yet populated in the current state are `undefined`.
 *
 * @param state  — the current `OrderState`
 * @param keys   — the subset of `OrderSnapshot` keys to project
 */
export function project<K extends keyof OrderSnapshot>(
  state: OrderState,
  keys: ReadonlyArray<K>,
): Pick<OrderSnapshot, K> {
  // TODO
  throw new Error("not implemented");
}
