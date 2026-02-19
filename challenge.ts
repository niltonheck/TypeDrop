// ============================================================
// challenge.ts — Typed Workflow State Machine
// ============================================================
// RULES:
//   • No `any`, no type assertions (`as`), no `@ts-ignore`
//   • Must compile under strict: true
//   • The hardest part is the TYPING — make illegal transitions
//     impossible to express at compile time.
// ============================================================

// ── 1. States ────────────────────────────────────────────────
// Requirement 1: Define a union type `OrderState` for all
// possible order states:
//   "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export type OrderState = TODO; // replace TODO

// ── 2. Allowed Transitions Map ───────────────────────────────
// Requirement 2: Define `TransitionMap` as a mapped type over
// OrderState where each key maps to a ReadonlyArray of the
// states that key is ALLOWED to transition INTO.
// Allowed transitions:
//   pending   → confirmed | cancelled
//   confirmed → shipped   | cancelled
//   shipped   → delivered
//   delivered → (none — terminal state)
//   cancelled → (none — terminal state)
//
// Use `satisfies` to enforce the shape while keeping the
// narrowest literal types inferred.

export type TransitionMap = TODO; // replace TODO

export const TRANSITION_MAP = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["shipped",   "cancelled"],
  shipped:   ["delivered"],
  delivered: [],
  cancelled: [],
} satisfies TransitionMap; // must compile without errors

// ── 3. Reachable States ──────────────────────────────────────
// Requirement 3: Define a conditional / indexed-access type
// `ReachableFrom<S extends OrderState>` that resolves to the
// union of states reachable in ONE step from S, derived
// directly from `TRANSITION_MAP` (not hardcoded).
// e.g. ReachableFrom<"pending">  → "confirmed" | "cancelled"
//      ReachableFrom<"delivered"> → never

export type ReachableFrom<S extends OrderState> = TODO; // replace TODO

// ── 4. Order & Event types ───────────────────────────────────
// Requirement 4: Model an `Order<S extends OrderState>` that
// carries the current state as a generic parameter so callers
// always have the precise state in the type.

export interface Order<S extends OrderState> {
  id: string;
  state: S;
  updatedAt: Date;
  metadata: Record<string, string>;
}

// Requirement 5: Define a discriminated union `TransitionEvent`
// covering every VALID transition. Each variant must have:
//   • `from`    — the source state (literal)
//   • `to`      — the destination state (literal, must be
//                 reachable from `from`)
//   • `actor`   — string (who triggered it)
//   • `payload` — a per-transition-specific shape (see below)
//
// Payload shapes:
//   pending   → confirmed : { paymentRef: string }
//   pending   → cancelled : { reason: string }
//   confirmed → shipped   : { trackingCode: string }
//   confirmed → cancelled : { reason: string }
//   shipped   → delivered : { signedBy: string }
//
// Hint: Define each variant as its own interface, then union them.

export type TransitionEvent = TODO; // replace TODO

// ── 5. Core transition function ──────────────────────────────
// Requirement 6: Implement `transition`.
//
// Signature (you must fill in the generics & return type):
//
//   function transition<S extends OrderState, E extends TransitionEvent & { from: S }>(
//     order: Order<S>,
//     event: E,
//   ): Order<E["to"]>
//
// Behaviour:
//   a) Verify at RUNTIME that `event.from === order.state`.
//      If not, throw a TypeError with a descriptive message.
//   b) Verify at RUNTIME that `event.to` is in
//      TRANSITION_MAP[event.from].
//      If not, throw a TypeError with a descriptive message.
//   c) Return a NEW Order object (do not mutate) with:
//        • state    = event.to
//        • updatedAt = new Date()
//        • id & metadata copied from the input order

export function transition<
  S extends OrderState,
  E extends TransitionEvent & { from: S }
>(
  order: Order<S>,
  event: E,
): Order<E["to"]> {
  // TODO: implement runtime guards (a) and (b)

  // TODO: return new Order with updated state
  throw new Error("Not implemented");
}

// ── 6. Aggregation helper ────────────────────────────────────
// Requirement 7: Implement `groupOrdersByState`.
//
// Given a mixed array of orders with UNKNOWN states at the
// call site (i.e. Order<OrderState>[]), return a
// `Partial<Record<OrderState, Order<OrderState>[]>>` where
// each key holds only the orders in that state.
//
// Constraint: Use a single-pass reduce — no multiple iterations.

export function groupOrdersByState(
  orders: Order<OrderState>[],
): Partial<Record<OrderState, Order<OrderState>[]>> {
  // TODO: implement single-pass reduce
  throw new Error("Not implemented");
}

// ── 7. Terminal state guard ───────────────────────────────────
// Requirement 8: Define a type predicate `isTerminal` that
// narrows an `Order<OrderState>` to
// `Order<"delivered"> | Order<"cancelled">`.

export function isTerminal(
  order: Order<OrderState>,
): order is Order<"delivered"> | Order<"cancelled"> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 8. Type-level tests (must compile — do NOT change) ───────
// These lines must compile without errors once your types are correct.
import type { Equal, Expect } from "./type-test-utils"; // provided below

type _T1 = Expect<Equal<ReachableFrom<"pending">,   "confirmed" | "cancelled">>;
type _T2 = Expect<Equal<ReachableFrom<"shipped">,   "delivered">>;
type _T3 = Expect<Equal<ReachableFrom<"delivered">, never>>;
type _T4 = Expect<Equal<ReachableFrom<"cancelled">, never>>;
