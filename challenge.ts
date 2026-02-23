// ============================================================
// challenge.ts — Typed Reactive State Machine
// ============================================================
// Goal: implement a fully type-safe finite state machine (FSM)
// that drives an e-commerce checkout flow.
//
// Rules:
//   • No `any`, no `as` casts, no type assertion tricks
//   • strict: true must pass with zero errors
//   • All transition validity must be enforced at the TYPE level
// ============================================================

// ---------------------------------------------------------------------------
// 1. DOMAIN TYPES
// ---------------------------------------------------------------------------

export type CartItem = {
  sku: string;
  quantity: number;
  unitPriceCents: number;
};

export type PaymentMethod = "card" | "paypal" | "bank_transfer";

// ---------------------------------------------------------------------------
// 2. STATE DEFINITIONS  (discriminated union — add the "kind" discriminant)
// ---------------------------------------------------------------------------

export type IdleState = {
  kind: "idle";
  cart: CartItem[];
};

export type ValidatingState = {
  kind: "validating";
  cart: CartItem[];
  startedAt: number; // Date.now()
};

export type PaymentState = {
  kind: "payment";
  cart: CartItem[];
  validatedAt: number;
  method: PaymentMethod;
};

export type ConfirmedState = {
  kind: "confirmed";
  cart: CartItem[];
  method: PaymentMethod;
  orderId: string;
  confirmedAt: number;
};

export type FailedState = {
  kind: "failed";
  cart: CartItem[];
  reason: string;
  failedAt: number;
};

/** Union of all possible states */
export type CheckoutState =
  | IdleState
  | ValidatingState
  | PaymentState
  | ConfirmedState
  | FailedState;

// ---------------------------------------------------------------------------
// 3. EVENT / TRANSITION DEFINITIONS
// ---------------------------------------------------------------------------

// TODO: Define a discriminated union `CheckoutEvent` that covers every valid
//       transition below. Each variant must carry only the payload it needs.
//
//   Event name           Allowed from        Allowed to        Extra payload
//   ─────────────────    ──────────────────  ──────────────    ─────────────────────────
//   START_VALIDATION     idle                validating        (none beyond what state holds)
//   VALIDATION_SUCCESS   validating          payment           method: PaymentMethod
//   VALIDATION_FAILURE   validating          failed            reason: string
//   SUBMIT_PAYMENT       payment             confirmed         orderId: string
//   PAYMENT_FAILURE      payment             failed            reason: string
//   RESET                confirmed | failed  idle              newCart?: CartItem[]
//
// Requirement 3a: The union must be a proper discriminated union on a `type` field.

export type CheckoutEvent = never; // TODO: replace with your discriminated union

// ---------------------------------------------------------------------------
// 4. TRANSITION TABLE TYPE
// ---------------------------------------------------------------------------

// TODO: Define `TransitionMap` — a mapped type that, for every CheckoutEvent
//       variant (keyed by its `type` field), describes:
//         • `from`: the State `kind`(s) from which this event is valid
//         • `reduce`: a pure function (currentState, event) => nextState
//
// Requirement 4a: Use conditional types or mapped types so that `reduce`
//   receives the *narrowed* state type (e.g. IdleState, not CheckoutState)
//   and the *narrowed* event type matching the key — not the full unions.
//
// Hint: You will need a helper that maps an event's `type` literal to its
//   corresponding event object type and its valid "from" state type.

// ---------------------------------------------------------------------------
// 5. THE STATE MACHINE CLASS
// ---------------------------------------------------------------------------

// TODO: Requirement 5a — Subscriber type
// A subscriber receives (nextState, prevState) — both fully typed as CheckoutState.
export type Subscriber = (next: CheckoutState, prev: CheckoutState) => void;

export class CheckoutMachine {
  // TODO: store current state (starts as IdleState)
  // TODO: store a Set of subscribers

  // Requirement 5b: Constructor accepts an initial cart.
  constructor(_initialCart: CartItem[]) {
    // TODO
  }

  // Requirement 5c: `getState()` returns the current CheckoutState.
  getState(): CheckoutState {
    // TODO
    throw new Error("Not implemented");
  }

  // Requirement 5d: `send(event)` dispatches a CheckoutEvent.
  //   • If the current state's `kind` is NOT in the event's allowed `from` list,
  //     throw a TypeError with a descriptive message.
  //   • Otherwise compute the next state via the transition's `reduce` function,
  //     update internal state, and notify all subscribers.
  //   • Returns the new CheckoutState.
  send(_event: CheckoutEvent): CheckoutState {
    // TODO
    throw new Error("Not implemented");
  }

  // Requirement 5e: `subscribe(fn)` registers a subscriber.
  //   Returns an `unsubscribe` function (no-arg, returns void).
  subscribe(_fn: Subscriber): () => void {
    // TODO
    throw new Error("Not implemented");
  }

  // Requirement 5f: `reset(newCart?)` is a convenience wrapper that sends a
  //   RESET event. It must only be callable when in "confirmed" or "failed" state;
  //   otherwise throw a TypeError.
  reset(_newCart?: CartItem[]): CheckoutState {
    // TODO
    throw new Error("Not implemented");
  }
}

// ---------------------------------------------------------------------------
// 6. HELPER — `cartTotal`
// ---------------------------------------------------------------------------

// TODO: Requirement 6 — implement `cartTotal(cart: CartItem[]): number`
//   Returns the total price in cents (sum of quantity * unitPriceCents).
//   Must use a single `reduce` call.
export function cartTotal(_cart: CartItem[]): number {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 7. HELPER — `assertNeverState`
// ---------------------------------------------------------------------------

// TODO: Requirement 7 — implement an exhaustive check helper.
//   `assertNeverState(state: never): never` should throw a runtime error.
//   Use it inside `send()` or your transition reducer to guarantee exhaustiveness.
export function assertNeverState(_state: never): never {
  throw new Error(`Unhandled state: ${JSON.stringify(_state)}`);
}
