// ============================================================
// Typed State Machine Engine
// challenge.ts
// ============================================================
// RULES:
//   - No `any`, no `as`, no unsafe casts
//   - Must compile under strict: true
//   - Fill in all TODOs; do not change existing signatures
// ============================================================

// ---------------------------------------------------------------------------
// 1. Core vocabulary types
// ---------------------------------------------------------------------------

/** All valid states an order can be in. */
export type OrderState =
  | "pending"
  | "payment_processing"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/** All events that can drive state transitions. */
export type OrderEvent =
  | "SUBMIT_PAYMENT"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "START_PREPARING"
  | "SHIP"
  | "DELIVER"
  | "CANCEL"
  | "REFUND";

// ---------------------------------------------------------------------------
// 2. Context — the data carried alongside the machine
// ---------------------------------------------------------------------------

export interface OrderContext {
  orderId: string;
  totalAmount: number;
  /** Set once payment is confirmed. */
  paymentRef?: string;
  /** Set once the order is shipped. */
  trackingNumber?: string;
  /** Reason provided when cancelling or refunding. */
  reason?: string;
  /** Number of payment attempts so far. */
  paymentAttempts: number;
}

// ---------------------------------------------------------------------------
// 3. Transition definition
// ---------------------------------------------------------------------------

/**
 * Describes a single valid transition in the machine.
 *
 * @typeParam S - The specific `from` state (narrowed)
 * @typeParam E - The specific event that triggers this transition (narrowed)
 * @typeParam C - The full context type
 */
export interface Transition<
  S extends OrderState,
  E extends OrderEvent,
  C extends OrderContext
> {
  from: S;
  event: E;
  to: OrderState;
  /**
   * Optional guard — return `true` to allow the transition.
   * Receives the current context; must return a boolean.
   */
  // TODO (requirement 1): Add a `guard` property that is an optional function
  //   accepting `context: C` and returning `boolean`.

  /**
   * Optional side-effect action run AFTER the transition succeeds.
   * Receives both the previous state and the updated context.
   */
  // TODO (requirement 2): Add an `action` property that is an optional function
  //   accepting `from: S`, `to: OrderState`, and `context: C`
  //   and returning `void`.
}

// ---------------------------------------------------------------------------
// 4. Machine snapshot — what the machine exposes at any point in time
// ---------------------------------------------------------------------------

/**
 * TODO (requirement 3): Define `MachineSnapshot<S extends OrderState>` as an
 * interface with:
 *   - `state: S`           — the current state
 *   - `context: OrderContext` — the current context
 *   - `can: (event: OrderEvent) => boolean`  — returns true if the event is
 *       applicable FROM the current state AND its guard passes
 */

// ---------------------------------------------------------------------------
// 5. Transition result — discriminated union
// ---------------------------------------------------------------------------

/**
 * TODO (requirement 4): Define `TransitionResult` as a discriminated union
 * with two variants:
 *   - `{ ok: true;  snapshot: MachineSnapshot<OrderState> }`
 *   - `{ ok: false; reason: "NO_TRANSITION" | "GUARD_FAILED" }`
 */

// ---------------------------------------------------------------------------
// 6. StateMachine class
// ---------------------------------------------------------------------------

export class StateMachine {
  // TODO (requirement 5): Declare private fields:
  //   - `_state`   : OrderState
  //   - `_context` : OrderContext
  //   - `_transitions` : ReadonlyArray<Transition<OrderState, OrderEvent, OrderContext>>

  /**
   * TODO (requirement 6): Implement the constructor.
   * Parameters:
   *   - `initialState: OrderState`
   *   - `initialContext: OrderContext`
   *   - `transitions: ReadonlyArray<Transition<OrderState, OrderEvent, OrderContext>>`
   */
  constructor(
    initialState: OrderState,
    initialContext: OrderContext,
    transitions: ReadonlyArray<Transition<OrderState, OrderEvent, OrderContext>>
  ) {
    // TODO
  }

  /**
   * TODO (requirement 7): Implement `snapshot()`.
   * Returns a `MachineSnapshot<OrderState>` reflecting the current state.
   * The `can` method must check for a matching transition AND run its guard
   * (if present) against the current context.
   */
  snapshot(): MachineSnapshot<OrderState> {
    // TODO
    throw new Error("Not implemented");
  }

  /**
   * TODO (requirement 8): Implement `send(event: OrderEvent): TransitionResult`.
   *
   * Steps:
   *   1. Find the first transition where `from === _state` and `event === event`.
   *   2. If none found → return `{ ok: false, reason: "NO_TRANSITION" }`.
   *   3. If a guard exists and returns `false` → return `{ ok: false, reason: "GUARD_FAILED" }`.
   *   4. Update `_state` to `transition.to`.
   *   5. Run `action` (if present) with old state, new state, and current context.
   *   6. Return `{ ok: true, snapshot: this.snapshot() }`.
   */
  send(event: OrderEvent): TransitionResult {
    // TODO
    throw new Error("Not implemented");
  }

  /**
   * TODO (requirement 9): Implement `patchContext(patch: Partial<OrderContext>): void`.
   * Merges the given patch into the current context (shallow merge).
   */
  patchContext(patch: Partial<OrderContext>): void {
    // TODO
  }
}

// ---------------------------------------------------------------------------
// 7. Factory — build a pre-configured order machine
// ---------------------------------------------------------------------------

/**
 * TODO (requirement 10): Implement `createOrderMachine`.
 *
 * Returns a `StateMachine` pre-loaded with the following transitions
 * (wire up guard / action where noted):
 *
 *  from               | event            | to                  | guard / action
 *  -------------------|------------------|---------------------|------------------------------------------
 *  pending            | SUBMIT_PAYMENT   | payment_processing  | —
 *  payment_processing | PAYMENT_SUCCESS  | paid                | action: increment paymentAttempts, set paymentRef to "PAY-OK"
 *  payment_processing | PAYMENT_FAILED   | pending             | guard: paymentAttempts < 3 (retry cap); action: increment paymentAttempts
 *  paid               | START_PREPARING  | preparing           | —
 *  preparing          | SHIP             | shipped             | action: set trackingNumber to "TRACK-001"
 *  shipped            | DELIVER          | delivered           | —
 *  pending            | CANCEL           | cancelled           | —
 *  paid               | CANCEL           | cancelled           | —
 *  preparing          | CANCEL           | cancelled           | —
 *  delivered          | REFUND           | refunded            | guard: context.totalAmount > 0
 *
 * The initial state is "pending".
 * The initial context is passed in as a parameter.
 */
export function createOrderMachine(initialContext: OrderContext): StateMachine {
  // TODO
  throw new Error("Not implemented");
}
