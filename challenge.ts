// ============================================================
// Typed Event-Sourced State Machine
// challenge.ts
// ============================================================
// RULES
//  - No `any`, no type assertions (`as`), no `@ts-ignore`
//  - Must compile under strict: true
//  - All TODOs must be implemented
// ============================================================

// -----------------------------------------------------------
// 1. BRANDED TYPES
// -----------------------------------------------------------

/** Requirement 1a: Create a branded `OrderId` type (string brand). */
export type OrderId = string & { readonly __brand: "OrderId" };

/** Requirement 1b: Create a branded `EventId` type (string brand). */
export type EventId = string & { readonly __brand: "EventId" };

/** Requirement 1c: Implement a safe constructor that casts a plain string to OrderId. */
export function makeOrderId(raw: string): OrderId {
  // TODO: validate non-empty, throw if invalid, return branded value
  throw new Error("Not implemented");
}

/** Requirement 1d: Implement a safe constructor that casts a plain string to EventId. */
export function makeEventId(raw: string): EventId {
  // TODO: validate non-empty, throw if invalid, return branded value
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 2. STATE & EVENT DEFINITIONS
// -----------------------------------------------------------

/**
 * Requirement 2a: Define the OrderState discriminated union.
 * Allowed states (each is an object with a `kind` discriminant):
 *   - "Pending"    — no extra fields
 *   - "Confirmed"  — confirmedAt: Date
 *   - "Shipped"    — confirmedAt: Date, shippedAt: Date, trackingCode: string
 *   - "Delivered"  — confirmedAt: Date, shippedAt: Date, trackingCode: string, deliveredAt: Date
 *   - "Cancelled"  — cancelledAt: Date, reason: string
 */
export type OrderState =
  // TODO: replace with your discriminated union
  never;

/**
 * Requirement 2b: Define the OrderEvent discriminated union.
 * Each event has: id: EventId, occurredAt: Date, and a `type` discriminant.
 * Events and the fields they carry:
 *   - "OrderPlaced"    — (no extra fields beyond id/occurredAt)
 *   - "OrderConfirmed" — (no extra fields beyond id/occurredAt)
 *   - "OrderShipped"   — trackingCode: string
 *   - "OrderDelivered" — (no extra fields beyond id/occurredAt)
 *   - "OrderCancelled" — reason: string
 */
export type OrderEvent =
  // TODO: replace with your discriminated union
  never;

// -----------------------------------------------------------
// 3. TRANSITION TABLE (Mapped + Conditional Types)
// -----------------------------------------------------------

/**
 * Requirement 3a: Define a `LegalTransitions` type that maps each
 * OrderEvent["type"] to the set of OrderState["kind"] values from which
 * that event is allowed to fire.
 *
 * Legal transition table:
 *   OrderPlaced     -> from: []              (initial event; no prior state required — represented as empty tuple)
 *   OrderConfirmed  -> from: ["Pending"]
 *   OrderShipped    -> from: ["Confirmed"]
 *   OrderDelivered  -> from: ["Shipped"]
 *   OrderCancelled  -> from: ["Pending", "Confirmed"]
 *
 * The type must be a `Record` keyed by OrderEvent["type"].
 * The value for each key must be a readonly array of OrderState["kind"].
 */
export type LegalTransitions = Record<
  OrderEvent["type"],
  ReadonlyArray<OrderState["kind"]>
>;

/**
 * Requirement 3b: Declare the runtime transition table as a `const`
 * satisfying `LegalTransitions`. Name it `LEGAL_TRANSITIONS`.
 */
export const LEGAL_TRANSITIONS: LegalTransitions =
  // TODO: fill in the runtime object using `satisfies` or explicit annotation
  {} as LegalTransitions; // replace this placeholder

// -----------------------------------------------------------
// 4. RESULT TYPE
// -----------------------------------------------------------

/** Requirement 4: Define a Result<T, E> discriminated union. */
export type Result<T, E> =
  // TODO: replace with your Ok/Err discriminated union
  never;

export function ok<T>(value: T): Result<T, never> {
  // TODO
  throw new Error("Not implemented");
}

export function err<E>(error: E): Result<never, E> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 5. MACHINE ERRORS
// -----------------------------------------------------------

/**
 * Requirement 5: Define a `MachineError` discriminated union with these variants:
 *   - "EmptyEventLog"       — no fields
 *   - "IllegalTransition"   — fromState: OrderState["kind"], event: OrderEvent["type"]
 *   - "UnexpectedFirstEvent"— event: OrderEvent["type"]
 */
export type MachineError =
  // TODO: replace with your discriminated union
  never;

// -----------------------------------------------------------
// 6. CORE STATE MACHINE
// -----------------------------------------------------------

/**
 * Requirement 6: Implement `applyEvent`.
 *
 * Given the CURRENT state and an incoming event, validate the transition
 * against LEGAL_TRANSITIONS and return:
 *   - ok(nextState)  if the transition is legal
 *   - err(MachineError) if the transition is illegal
 *
 * Transition logic (what the NEXT state looks like):
 *   OrderPlaced     → { kind: "Pending" }
 *   OrderConfirmed  → { kind: "Confirmed",  confirmedAt: event.occurredAt, ...prev fields }
 *   OrderShipped    → { kind: "Shipped",    shippedAt: event.occurredAt, trackingCode, ...prev fields }
 *   OrderDelivered  → { kind: "Delivered",  deliveredAt: event.occurredAt, ...prev fields }
 *   OrderCancelled  → { kind: "Cancelled",  cancelledAt: event.occurredAt, reason }
 *
 * For `OrderPlaced`, `currentState` will be `null` (no prior state).
 * For all other events, `currentState` must be non-null and the state's `kind`
 * must be in LEGAL_TRANSITIONS[event.type].
 */
export function applyEvent(
  currentState: OrderState | null,
  event: OrderEvent
): Result<OrderState, MachineError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Requirement 7: Implement `foldEvents`.
 *
 * Given an ordered array of OrderEvents (oldest → newest), replay them all
 * through `applyEvent` sequentially and return:
 *   - ok(finalState)       if every transition succeeds
 *   - err(MachineError)    at the first failure (short-circuit)
 *   - err({ kind: "EmptyEventLog" }) if the array is empty
 *
 * The generic signature must NOT use `any`.
 */
export function foldEvents(
  events: ReadonlyArray<OrderEvent>
): Result<OrderState, MachineError> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 8. QUERY HELPERS  (Conditional & Mapped Types)
// -----------------------------------------------------------

/**
 * Requirement 8a: Define a conditional type `StateByKind<K>` that,
 * given a `K extends OrderState["kind"]`, resolves to the exact
 * OrderState variant whose `kind` is K.
 *
 * e.g. StateByKind<"Shipped"> → the Shipped variant object type
 */
export type StateByKind<K extends OrderState["kind"]> =
  // TODO: use `Extract` or a conditional `infer`-based approach
  never;

/**
 * Requirement 8b: Implement `assertState`.
 *
 * Given a Result<OrderState, MachineError> and a target `kind` K,
 * return the narrowed state as `StateByKind<K>` if:
 *   1. The result is Ok
 *   2. The state's `kind` matches K
 * Otherwise return `null`.
 *
 * The function must be generic over K and must NOT use `any` or `as`.
 */
export function assertState<K extends OrderState["kind"]>(
  result: Result<OrderState, MachineError>,
  kind: K
): StateByKind<K> | null {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Requirement 8c: Implement `isTerminal`.
 *
 * Returns true if the given OrderState is in a terminal state
 * ("Delivered" or "Cancelled") — use a type predicate so the
 * caller's type narrows correctly.
 */
export function isTerminal(
  state: OrderState
): state is Extract<OrderState, { kind: "Delivered" | "Cancelled" }> {
  // TODO
  throw new Error("Not implemented");
}
