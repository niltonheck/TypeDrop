// ─────────────────────────────────────────────────────────────────────────────
// Typed Hierarchical State Machine — challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO: You are building the order-lifecycle engine for an e-commerce
// platform. Orders flow through a strict set of states and each transition
// carries a typed payload. Implement a strongly-typed state machine where:
//   • Invalid transitions are caught at the TYPE level (not just runtime).
//   • Each transition's `payload` is narrowed to the correct type automatically.
//   • Entry and exit hooks receive a fully-typed context object.
//   • `send()` returns a typed Result so callers know whether the transition
//     succeeded or was rejected by a guard.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Order domain types ────────────────────────────────────────────────────

export type OrderState =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

/** Each event name maps to its payload shape. */
export interface OrderEventMap {
  CONFIRM:  { paymentRef: string; totalCents: number };
  SHIP:     { trackingCode: string; carrier: string };
  DELIVER:  { signedBy: string; deliveredAt: Date };
  CANCEL:   { reason: string; refundEligible: boolean };
}

export type OrderEventName = keyof OrderEventMap;

/** A discriminated-union event: name + its specific payload. */
export type OrderEvent = {
  [K in OrderEventName]: { name: K; payload: OrderEventMap[K] };
}[OrderEventName];

// ── 2. Transition definition ──────────────────────────────────────────────────

/**
 * Describes one legal transition.
 *   from  – the state(s) this transition may originate from
 *   to    – the state the machine moves to on success
 *   on    – which event triggers this transition
 *   guard – optional predicate; returning false blocks the transition
 */
export interface TransitionDef<
  From extends OrderState,
  To extends OrderState,
  Ev extends OrderEventName,
> {
  from: From | readonly From[];
  to: To;
  on: Ev;
  guard?: (ctx: TransitionContext<From, Ev>) => boolean;
}

/** Context passed to guards, entry hooks, and exit hooks. */
export interface TransitionContext<
  S extends OrderState,
  Ev extends OrderEventName,
> {
  currentState: S;
  event: { name: Ev; payload: OrderEventMap[Ev] };
  orderId: string;
}

// ── 3. Hook map ───────────────────────────────────────────────────────────────

/**
 * Per-state lifecycle hooks.
 * `onEntry` fires after entering the state; `onExit` fires before leaving it.
 * Both receive a TransitionContext whose `currentState` is the relevant state.
 */
export type StateHooks = {
  [S in OrderState]?: {
    onEntry?: (ctx: TransitionContext<S, OrderEventName>) => void;
    onExit?:  (ctx: TransitionContext<S, OrderEventName>) => void;
  };
};

// ── 4. Result type ────────────────────────────────────────────────────────────

export type TransitionResult<To extends OrderState> =
  | { ok: true;  newState: To }
  | { ok: false; reason: "NO_TRANSITION" | "GUARD_REJECTED" };

// ── 5. StateMachine class ─────────────────────────────────────────────────────

/**
 * TODO – Implement the StateMachine class.
 *
 * Requirements:
 *   R1. The constructor accepts:
 *         • `orderId`      – string identifier threaded through all contexts
 *         • `initial`      – the starting OrderState
 *         • `transitions`  – readonly array of TransitionDef (any From/To/Ev combo)
 *         • `hooks`        – optional StateHooks
 *
 *   R2. `getState()` returns the current OrderState.
 *
 *   R3. `send(event: OrderEvent): TransitionResult<OrderState>`
 *         • Finds the first TransitionDef whose `on` matches event.name AND
 *           whose `from` includes the current state.
 *         • If no such transition exists → return { ok: false, reason: "NO_TRANSITION" }.
 *         • Runs the guard (if present) with a fully-typed TransitionContext.
 *           If the guard returns false → return { ok: false, reason: "GUARD_REJECTED" }.
 *         • Fires `hooks[currentState]?.onExit` before moving.
 *         • Updates the current state.
 *         • Fires `hooks[newState]?.onEntry` after moving.
 *         • Returns { ok: true, newState }.
 *
 *   R4. `canSend(eventName: OrderEventName): boolean`
 *         • Returns true if at least one matching transition exists from the
 *           current state for that event name (guards are NOT evaluated here).
 *
 *   R5. `history(): readonly { state: OrderState; event: OrderEvent }[]`
 *         • Returns an immutable log of every successful transition:
 *           the state entered and the event that caused it.
 *
 *   R6. No `any`, no type assertions (`as`), no non-null assertions (`!`).
 */

// TODO: Replace this stub with your full implementation.
export class StateMachine {
  // TODO: declare private fields

  constructor(
    orderId: string,
    initial: OrderState,
    transitions: readonly TransitionDef<OrderState, OrderState, OrderEventName>[],
    hooks?: StateHooks,
  ) {
    // TODO
    void orderId; void initial; void transitions; void hooks;
  }

  getState(): OrderState {
    // TODO
    throw new Error("Not implemented");
  }

  send(event: OrderEvent): TransitionResult<OrderState> {
    // TODO
    void event;
    throw new Error("Not implemented");
  }

  canSend(eventName: OrderEventName): boolean {
    // TODO
    void eventName;
    throw new Error("Not implemented");
  }

  history(): readonly { state: OrderState; event: OrderEvent }[] {
    // TODO
    throw new Error("Not implemented");
  }
}

// ── 6. Order machine factory ──────────────────────────────────────────────────

/**
 * TODO – Implement `createOrderMachine`.
 *
 * Requirements:
 *   R7. Returns a fully configured StateMachine for the order lifecycle with
 *       these legal transitions (and no others):
 *
 *         Pending   --[CONFIRM]--> Confirmed
 *         Confirmed --[SHIP]-----> Shipped
 *         Shipped   --[DELIVER]--> Delivered
 *         Pending   --[CANCEL]--> Cancelled    (guard: refundEligible must be true)
 *         Confirmed --[CANCEL]--> Cancelled    (guard: refundEligible must be true)
 *
 *   R8. Accepts `orderId` and optional `hooks` so callers can observe lifecycle.
 *   R9. The machine must start in the "Pending" state.
 */
export function createOrderMachine(
  orderId: string,
  hooks?: StateHooks,
): StateMachine {
  // TODO
  void orderId; void hooks;
  throw new Error("Not implemented");
}
