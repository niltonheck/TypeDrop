// ============================================================
// Typed State Machine with Transition Guards & Effect Hooks
// ============================================================
// SCENARIO: Order lifecycle engine for an e-commerce platform.
// Orders move through a strict set of states. Only configured
// transitions are legal — illegal transitions must be caught at
// compile time, not just at runtime.
// ============================================================

// ------------------------------------
// 1. Core domain types
// ------------------------------------

/** All possible states an order can occupy. */
export type OrderState =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/**
 * The shared context object that travels with every order.
 * Guards and effects receive this (plus state-specific extensions).
 */
export interface OrderContext {
  orderId: string;
  totalCents: number;
  customerId: string;
  /** ISO-8601 timestamp of the last transition. */
  lastTransitionAt: string;
}

// ------------------------------------
// 2. Transition map — the schema
// ------------------------------------

/**
 * Declare which transitions are legal.
 * Key = "FROM->TO", value = extra payload the event carries.
 *
 * TODO: Fill in the payload types for each legal transition.
 *       Use `Record<string, never>` for transitions with no payload.
 */
export type OrderTransitions = {
  "pending->paid": { paymentRef: string };
  "pending->cancelled": { reason: string };
  "paid->processing": Record<string, never>;
  "paid->cancelled": { reason: string };
  "processing->shipped": { trackingNumber: string; carrier: string };
  "processing->cancelled": { reason: string };
  "shipped->delivered": { deliveredAt: string };
  "shipped->cancelled": { reason: string };
  "delivered->refunded": { refundRef: string; amountCents: number };
};

// ------------------------------------
// 3. Utility types — YOU implement these
// ------------------------------------

/**
 * TODO 1 — `TransitionKey`
 * Extract the union of all key strings from OrderTransitions.
 * e.g. "pending->paid" | "pending->cancelled" | ...
 */
export type TransitionKey = keyof OrderTransitions;

/**
 * TODO 2 — `FromState<K>`
 * Given a TransitionKey K (e.g. "pending->paid"),
 * extract the "from" state as an OrderState.
 * Hint: use template literal inference with `infer`.
 */
export type FromState<K extends TransitionKey> =
  K extends `${infer F}->${string}` ? (F extends OrderState ? F : never) : never;

/**
 * TODO 3 — `ToState<K>`
 * Given a TransitionKey K, extract the "to" state as an OrderState.
 */
export type ToState<K extends TransitionKey> =
  K extends `${string}->${infer T}` ? (T extends OrderState ? T : never) : never;

/**
 * TODO 4 — `LegalTransitionsFrom<S>`
 * Given a state S, produce the union of TransitionKeys whose
 * "from" side equals S.
 * e.g. LegalTransitionsFrom<"paid"> → "paid->processing" | "paid->cancelled"
 */
export type LegalTransitionsFrom<S extends OrderState> = {
  [K in TransitionKey]: FromState<K> extends S ? K : never;
}[TransitionKey];

/**
 * TODO 5 — `PayloadFor<K>`
 * Given a TransitionKey K, return the payload type for that transition.
 */
export type PayloadFor<K extends TransitionKey> = OrderTransitions[K];

// ------------------------------------
// 4. Guard & Effect types
// ------------------------------------

/**
 * A guard is a synchronous predicate. If it returns false the
 * transition is rejected (no state change, no effect fires).
 *
 * TODO 6 — complete the Guard type so that:
 *   - `from` is typed as the exact "from" state (not just OrderState)
 *   - `to`   is typed as the exact "to"   state
 *   - `payload` is the correct payload type for K
 */
export type Guard<K extends TransitionKey> = (params: {
  from: FromState<K>;
  to: ToState<K>;
  context: OrderContext;
  payload: PayloadFor<K>;
}) => boolean;

/**
 * An effect fires after a successful (guarded) transition.
 * It may be async — the machine awaits it before resolving.
 *
 * TODO 7 — same typing requirements as Guard, but returns Promise<void> | void.
 */
export type Effect<K extends TransitionKey> = (params: {
  from: FromState<K>;
  to: ToState<K>;
  context: OrderContext;
  payload: PayloadFor<K>;
}) => Promise<void> | void;

// ------------------------------------
// 5. Per-transition configuration
// ------------------------------------

/** Optional guard + zero-or-more effects per transition. */
export interface TransitionConfig<K extends TransitionKey> {
  guard?: Guard<K>;
  effects?: ReadonlyArray<Effect<K>>;
}

// ------------------------------------
// 6. Machine definition
// ------------------------------------

/**
 * The full machine config: a partial map from TransitionKey → TransitionConfig.
 * Transitions with no entry are always allowed (no guard, no effects).
 */
export type MachineConfig = {
  [K in TransitionKey]?: TransitionConfig<K>;
};

// ------------------------------------
// 7. Transition result
// ------------------------------------

export type TransitionResult<K extends TransitionKey> =
  | { ok: true; from: FromState<K>; to: ToState<K>; context: OrderContext }
  | { ok: false; reason: "illegal_transition" | "guard_rejected" | "wrong_state"; detail: string };

// ------------------------------------
// 8. The state machine class — YOU implement the body
// ------------------------------------

export class OrderStateMachine {
  private state: OrderState;
  private context: OrderContext;
  private config: MachineConfig;

  constructor(
    initialState: OrderState,
    context: OrderContext,
    config: MachineConfig
  ) {
    this.state = initialState;
    this.context = context;
    this.config = config;
  }

  /** Returns the current state. */
  getState(): OrderState {
    // TODO 8 — return the current state
    throw new Error("Not implemented");
  }

  /** Returns a snapshot of the current context. */
  getContext(): Readonly<OrderContext> {
    // TODO 9 — return a readonly snapshot of context
    throw new Error("Not implemented");
  }

  /**
   * Attempt a transition.
   *
   * TODO 10 — implement this method:
   *   1. Verify the current state matches FromState<K> (return wrong_state if not).
   *   2. Verify K is a key of OrderTransitions (always true by type, but guard at runtime too).
   *   3. Run the guard if configured — if it returns false, return guard_rejected.
   *   4. Run all effects in order (await each one).
   *   5. Update this.state, update context.lastTransitionAt to new Date().toISOString().
   *   6. Return an ok:true result.
   *
   * The overloads below ensure callers can only pass a K that is
   * legal from the *current* state — enforced structurally via the
   * LegalTransitionsFrom mapped type.
   */
  async transition<K extends TransitionKey>(
    key: K,
    payload: PayloadFor<K>
  ): Promise<TransitionResult<K>> {
    // TODO 10 — implement transition logic
    throw new Error("Not implemented");
  }

  /**
   * TODO 11 — `canTransition`
   * Synchronously check whether a transition key is currently possible:
   *   - current state must match FromState<K>
   *   - if a guard is configured, it must return true
   * Returns true / false — never throws.
   */
  canTransition<K extends TransitionKey>(key: K, payload: PayloadFor<K>): boolean {
    // TODO 11 — implement
    throw new Error("Not implemented");
  }

  /**
   * TODO 12 — `availableTransitions`
   * Return the array of TransitionKeys that are structurally reachable
   * from the current state (i.e. their FromState matches this.state),
   * regardless of guards.
   */
  availableTransitions(): TransitionKey[] {
    // TODO 12 — implement
    throw new Error("Not implemented");
  }
}

// ------------------------------------
// 9. Factory helper — YOU implement
// ------------------------------------

/**
 * TODO 13 — `createOrderMachine`
 * Convenience factory. Accepts initial state, context fields (minus
 * lastTransitionAt, which is set to now), and an optional config.
 * Returns a fully initialised OrderStateMachine.
 */
export function createOrderMachine(
  initialState: OrderState,
  context: Omit<OrderContext, "lastTransitionAt">,
  config?: MachineConfig
): OrderStateMachine {
  // TODO 13 — implement
  throw new Error("Not implemented");
}
