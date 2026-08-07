// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts  —  Typed Event Emitter State Machine
// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO
// You are building the order-lifecycle engine for a fulfilment platform.
// Orders move through a strict set of states. Only certain transitions are
// legal. On every transition the machine emits a typed event so that
// downstream listeners always receive the correct payload.
//
// YOUR TASK
// Implement the four items marked TODO below.  Do NOT add `any`, `as`, or
// non-null assertions (!).  The file must compile under strict: true.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. State & Transition Definitions ────────────────────────────────────────

export type OrderState =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

/**
 * TODO 1 — Define `LegalTransitions`.
 *
 * A mapped type (keyed on OrderState) where each key maps to a
 * **read-only tuple** of the states that are reachable FROM that key.
 *
 * Legal transitions:
 *   pending   → confirmed | cancelled
 *   confirmed → shipped   | cancelled
 *   shipped   → delivered
 *   delivered → (none)
 *   cancelled → (none)
 *
 * Requirements:
 *  - Every OrderState must appear as a key (mapped type, not a plain object).
 *  - Each value must be a readonly tuple of the reachable states (NOT a broad
 *    union or array — use `readonly [...]` tuple syntax so TypeScript can
 *    narrow individual elements later).
 *  - Terminal states map to `readonly []`.
 */
export type LegalTransitions = /* TODO 1 */ {
  [S in OrderState]: readonly OrderState[];
};

// ── 2. Event Payloads ─────────────────────────────────────────────────────────

/**
 * Each transition produces a discriminated-union event.
 * The `from` and `to` fields carry the *exact* literal types of the states
 * involved, not the broad `OrderState` union.
 *
 * TODO 2 — Define `TransitionEvent<F extends OrderState, T extends OrderState>`.
 *
 * It must be a discriminated union with three variants:
 *
 *   kind: "transition"
 *     from: F
 *     to:   T
 *     timestamp: number        // Date.now()
 *
 *   kind: "error"
 *     from:    F
 *     attempted: T
 *     reason:  string
 *
 *   kind: "noop"
 *     state: F                 // transition attempted to the same state
 *
 * All variants must include a readonly `orderId: string` field.
 */
export type TransitionEvent<
  F extends OrderState,
  T extends OrderState
> = /* TODO 2 */ {
  kind: "transition" | "error" | "noop";
  orderId: string;
  from?: F;
  to?: T;
  attempted?: T;
  timestamp?: number;
  reason?: string;
  state?: F;
};

// ── 3. Listener Map ───────────────────────────────────────────────────────────

/**
 * TODO 3 — Define `EventMap`.
 *
 * A mapped type over all pairs (F, T) of OrderState that produces a map from
 * event-name strings to listener function signatures.
 *
 * Event names follow the template literal pattern:  `${F}:${T}`
 *
 * Each key maps to:
 *   (event: TransitionEvent<F, T>) => void
 *
 * Hint: You will need a *distributive* mapped type — map over F first, then
 * over T inside, and use a template literal key.
 *
 * The resulting type should allow:
 *   emitter.on("pending:confirmed",  e => { ... })  // e is TransitionEvent<"pending","confirmed">
 *   emitter.on("shipped:delivered",  e => { ... })  // e is TransitionEvent<"shipped","delivered">
 *   emitter.on("foo:bar", ...)                      // ❌ compile error
 */
export type EventMap = {
  // TODO 3
  [key: string]: (event: TransitionEvent<OrderState, OrderState>) => void;
};

// ── 4. The State Machine ──────────────────────────────────────────────────────

/**
 * `LEGAL_TRANSITIONS` is the runtime mirror of LegalTransitions.
 * You may use it inside `transition()` to validate moves at runtime.
 * Do NOT change this object.
 */
export const LEGAL_TRANSITIONS = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["shipped",   "cancelled"],
  shipped:   ["delivered"],
  delivered: [],
  cancelled: [],
} as const satisfies Record<OrderState, readonly OrderState[]>;

/**
 * TODO 4 — Implement `OrderStateMachine`.
 *
 * class OrderStateMachine
 *
 * Constructor: (orderId: string, initial: OrderState)
 *
 * Properties (all private):
 *   - current state
 *   - orderId
 *   - listener store  (use EventMap or a compatible structure)
 *
 * Methods:
 *
 *   getState(): OrderState
 *     Returns the current state.
 *
 *   on<K extends keyof EventMap>(event: K, listener: EventMap[K]): this
 *     Registers a listener for the given event name.
 *     Supports multiple listeners per event (push, don't replace).
 *     Returns `this` for chaining.
 *
 *   off<K extends keyof EventMap>(event: K, listener: EventMap[K]): this
 *     Removes a specific listener for the given event name.
 *     Returns `this` for chaining.
 *
 *   transition<T extends OrderState>(to: T): TransitionEvent<OrderState, T>
 *     Attempts to move to state `to`.
 *     - If `to === current`  → emit & return a "noop" event.
 *     - If `to` is legal     → update state, emit & return a "transition" event.
 *     - Otherwise            → emit & return an "error" event (do NOT throw).
 *     Emits the event to ALL listeners registered under `${current}:${to}`.
 *
 * Requirements:
 *   - No `any`, no `as`, no `!`.
 *   - `on` / `off` must be generic so the listener receives the narrowed
 *     TransitionEvent<F, T> (not the broad union).
 *   - `transition` must return the specific TransitionEvent variant, not `void`.
 */
export class OrderStateMachine {
  // TODO 4 — implement the class
}
