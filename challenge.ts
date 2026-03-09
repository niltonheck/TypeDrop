// ============================================================
// Typed State Machine Executor with Transition Guards
// challenge.ts
// ============================================================
// Requirement 1: Define the finite set of order states and events
//   as string-literal union types.

export type OrderState =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderEvent =
  | "CONFIRM"
  | "START_PROCESSING"
  | "SHIP"
  | "DELIVER"
  | "CANCEL";

// ============================================================
// Requirement 2: Define a branded `OrderId` type so raw strings
//   cannot be passed where an OrderId is expected.

declare const __orderIdBrand: unique symbol;
export type OrderId = string & { readonly [__orderIdBrand]: true };

export function makeOrderId(raw: string): OrderId {
  // TODO: return raw cast to OrderId using a type-safe brand helper
  // (you may use a single type assertion ONLY inside this factory — nowhere else)
  throw new Error("Not implemented");
}

// ============================================================
// Requirement 3: Model the context that travels with an order.

export interface OrderContext {
  readonly id: OrderId;
  readonly customerId: string;
  /** Arbitrary metadata that guards may read */
  readonly meta: Readonly<Record<string, string>>;
}

// ============================================================
// Requirement 4: Define typed guard functions.
//   A Guard receives the current context and returns either
//   `true` (allow) or a string reason (deny).

export type GuardResult = true | string;
export type Guard = (ctx: OrderContext) => GuardResult;

// ============================================================
// Requirement 5: Define the transition table type.
//   TransitionMap must be an exhaustive mapping of
//   every (state, event) pair that is LEGAL in the system.
//   Illegal pairs must simply be absent — do NOT use a full
//   cartesian product with `never`.
//
//   Shape:
//     { [S in OrderState]?: { [E in OrderEvent]?: TransitionDef<S> } }

export interface TransitionDef<S extends OrderState> {
  /** The state to move to when the transition succeeds */
  readonly target: Exclude<OrderState, S>;
  /** Optional guards — ALL must pass for the transition to fire */
  readonly guards?: readonly Guard[];
}

export type TransitionMap = {
  readonly [S in OrderState]?: {
    readonly [E in OrderEvent]?: TransitionDef<S>;
  };
};

// ============================================================
// Requirement 6: Typed audit log entry — discriminated union.

export type AuditEntry =
  | {
      readonly kind: "transition";
      readonly orderId: OrderId;
      readonly from: OrderState;
      readonly event: OrderEvent;
      readonly to: OrderState;
      readonly timestamp: number;
    }
  | {
      readonly kind: "guard_denied";
      readonly orderId: OrderId;
      readonly from: OrderState;
      readonly event: OrderEvent;
      readonly guardReason: string;
      readonly timestamp: number;
    }
  | {
      readonly kind: "invalid_transition";
      readonly orderId: OrderId;
      readonly from: OrderState;
      readonly event: OrderEvent;
      readonly timestamp: number;
    };

// ============================================================
// Requirement 7: Result type for a transition attempt.

export type TransitionSuccess = {
  readonly ok: true;
  readonly newState: OrderState;
  readonly auditEntry: Extract<AuditEntry, { kind: "transition" }>;
};

export type TransitionFailure = {
  readonly ok: false;
  readonly reason: "guard_denied" | "invalid_transition";
  readonly auditEntry: Extract<AuditEntry, { kind: "guard_denied" | "invalid_transition" }>;
};

export type TransitionResult = TransitionSuccess | TransitionFailure;

// ============================================================
// Requirement 8: The StateMachine class.
//
//   constructor(map: TransitionMap)
//
//   - Holds an internal audit log (AuditEntry[]).
//
//   transition(
//     ctx: OrderContext,
//     currentState: OrderState,
//     event: OrderEvent,
//   ): TransitionResult
//
//   - Looks up (currentState, event) in the map.
//   - If no definition exists → returns a TransitionFailure with
//     reason "invalid_transition" and appends to the audit log.
//   - Runs each guard in order; first denial → returns a
//     TransitionFailure with reason "guard_denied" and appends
//     to the audit log.
//   - On success → returns a TransitionSuccess and appends to
//     the audit log.
//
//   getAuditLog(): readonly AuditEntry[]
//   - Returns the accumulated audit log (immutable view).
//
//   getAuditLogFor(orderId: OrderId): readonly AuditEntry[]
//   - Returns only entries matching the given orderId.

export class StateMachine {
  // TODO: implement

  constructor(_map: TransitionMap) {
    throw new Error("Not implemented");
  }

  transition(
    _ctx: OrderContext,
    _currentState: OrderState,
    _event: OrderEvent,
  ): TransitionResult {
    throw new Error("Not implemented");
  }

  getAuditLog(): readonly AuditEntry[] {
    throw new Error("Not implemented");
  }

  getAuditLogFor(_orderId: OrderId): readonly AuditEntry[] {
    throw new Error("Not implemented");
  }
}

// ============================================================
// Requirement 9: Implement `replayToState`.
//
//   Given an initial state, a list of (event, context) pairs,
//   and a StateMachine instance, replay every event in order
//   and return the final OrderState reached plus a typed
//   summary of how many transitions succeeded and how many
//   failed (with a breakdown by failure reason).

export interface ReplaySummary {
  readonly finalState: OrderState;
  readonly succeeded: number;
  readonly failed: {
    readonly guard_denied: number;
    readonly invalid_transition: number;
  };
}

export function replayToState(
  machine: StateMachine,
  ctx: OrderContext,
  initialState: OrderState,
  events: readonly OrderEvent[],
): ReplaySummary {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// Requirement 10: Implement `buildTransitionMap` — a type-safe
//   builder helper that returns a validated TransitionMap.
//
//   It must accept a plain object literal and return it
//   typed as TransitionMap, using `satisfies` so the
//   compiler catches any unknown state/event keys while
//   still preserving the literal types for `target`.
//
//   Signature:
//     function buildTransitionMap<T extends TransitionMap>(map: T & TransitionMap): T
//
//   (The dual constraint lets `satisfies`-style checking happen
//    at the call site without losing narrowed literal types.)

export function buildTransitionMap<T extends TransitionMap>(
  map: T & TransitionMap,
): T {
  // TODO: implement (hint: this can be a one-liner)
  throw new Error("Not implemented");
}
