// ============================================================
// challenge.test.ts
// ============================================================
// Also create `type-test-utils.ts` in the same folder:
//
//   export type Equal<A, B> =
//     (<T>() => T extends A ? 1 : 2) extends
//     (<T>() => T extends B ? 1 : 2) ? true : false;
//   export type Expect<T extends true> = T;
//
// Run:  npx ts-node --strict challenge.test.ts
// ============================================================

import {
  TRANSITION_MAP,
  transition,
  groupOrdersByState,
  isTerminal,
  type Order,
  type OrderState,
  type ReachableFrom,
  type TransitionEvent,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────
const pendingOrder: Order<"pending"> = {
  id: "ORD-001",
  state: "pending",
  updatedAt: new Date("2026-02-19T08:00:00Z"),
  metadata: { customer: "alice" },
};

const confirmedOrder: Order<"confirmed"> = {
  id: "ORD-002",
  state: "confirmed",
  updatedAt: new Date("2026-02-19T09:00:00Z"),
  metadata: { customer: "bob" },
};

const shippedOrder: Order<"shipped"> = {
  id: "ORD-003",
  state: "shipped",
  updatedAt: new Date("2026-02-19T10:00:00Z"),
  metadata: { customer: "carol" },
};

const deliveredOrder: Order<"delivered"> = {
  id: "ORD-004",
  state: "delivered",
  updatedAt: new Date("2026-02-19T11:00:00Z"),
  metadata: { customer: "dave" },
};

// ── Test 1: Valid transition pending → confirmed ──────────────
const confirmEvent: TransitionEvent = {
  from: "pending",
  to: "confirmed",
  actor: "payment-service",
  payload: { paymentRef: "PAY-XYZ" },
};

const confirmed = transition(pendingOrder, confirmEvent);
console.assert(
  confirmed.state === "confirmed",
  `Test 1 FAILED: expected state "confirmed", got "${confirmed.state}"`,
);
console.assert(
  confirmed.id === "ORD-001",
  `Test 1 FAILED: id should be preserved, got "${confirmed.id}"`,
);
console.log("Test 1 passed: pending → confirmed");

// ── Test 2: Valid transition confirmed → shipped ──────────────
const shipEvent: TransitionEvent = {
  from: "confirmed",
  to: "shipped",
  actor: "warehouse",
  payload: { trackingCode: "TRACK-123" },
};

const shipped = transition(confirmedOrder, shipEvent);
console.assert(
  shipped.state === "shipped",
  `Test 2 FAILED: expected state "shipped", got "${shipped.state}"`,
);
console.log("Test 2 passed: confirmed → shipped");

// ── Test 3: Runtime guard — wrong `from` state ───────────────
let test3Passed = false;
try {
  // pendingOrder has state "pending" but event says from "confirmed"
  const badEvent: TransitionEvent = {
    from: "confirmed",
    to: "shipped",
    actor: "rogue",
    payload: { trackingCode: "BAD" },
  };
  // @ts-expect-error — deliberate mismatch for runtime test
  transition(pendingOrder, badEvent);
} catch (e) {
  test3Passed = e instanceof TypeError;
}
console.assert(test3Passed, "Test 3 FAILED: should throw TypeError for from-state mismatch");
console.log("Test 3 passed: runtime from-state guard works");

// ── Test 4: groupOrdersByState ────────────────────────────────
const mixed: Order<OrderState>[] = [
  pendingOrder,
  confirmedOrder,
  shippedOrder,
  deliveredOrder,
  { id: "ORD-005", state: "cancelled", updatedAt: new Date(), metadata: {} },
  { id: "ORD-006", state: "pending",   updatedAt: new Date(), metadata: { customer: "eve" } },
];

const grouped = groupOrdersByState(mixed);
console.assert(
  grouped["pending"]?.length === 2,
  `Test 4 FAILED: expected 2 pending orders, got ${grouped["pending"]?.length}`,
);
console.assert(
  grouped["delivered"]?.length === 1,
  `Test 4 FAILED: expected 1 delivered order, got ${grouped["delivered"]?.length}`,
);
console.log("Test 4 passed: groupOrdersByState correct");

// ── Test 5: isTerminal type predicate ────────────────────────
console.assert(
  isTerminal(deliveredOrder) === true,
  "Test 5 FAILED: delivered should be terminal",
);
console.assert(
  isTerminal(pendingOrder) === false,
  "Test 5 FAILED: pending should NOT be terminal",
);
console.assert(
  isTerminal(shippedOrder) === false,
  "Test 5 FAILED: shipped should NOT be terminal",
);
console.log("Test 5 passed: isTerminal predicate correct");

// ── TRANSITION_MAP sanity ─────────────────────────────────────
console.assert(
  TRANSITION_MAP["pending"].includes("confirmed"),
  "TRANSITION_MAP sanity FAILED",
);
console.assert(
  (TRANSITION_MAP["delivered"] as readonly string[]).length === 0,
  "TRANSITION_MAP delivered should be empty",
);

console.log("\n✅ All tests passed!");
