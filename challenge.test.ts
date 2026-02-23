// ============================================================
// challenge.test.ts — Typed Reactive State Machine
// ============================================================
import {
  CartItem,
  CheckoutMachine,
  CheckoutState,
  cartTotal,
} from "./challenge";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockCart: CartItem[] = [
  { sku: "SHOE-42", quantity: 2, unitPriceCents: 8999 },
  { sku: "SOCK-M",  quantity: 4, unitPriceCents:  499 },
];

// ---------------------------------------------------------------------------
// Test 1: Initial state is "idle" with the provided cart
// ---------------------------------------------------------------------------
const machine = new CheckoutMachine(mockCart);
const initial = machine.getState();
console.assert(initial.kind === "idle", `[T1] Expected 'idle', got '${initial.kind}'`);
console.assert(
  initial.kind === "idle" && initial.cart === mockCart,
  "[T1] Initial cart reference should match"
);

// ---------------------------------------------------------------------------
// Test 2: Happy-path full transition sequence
// ---------------------------------------------------------------------------
machine.send({ type: "START_VALIDATION" });
console.assert(machine.getState().kind === "validating", "[T2] Should be 'validating'");

machine.send({ type: "VALIDATION_SUCCESS", method: "card" });
console.assert(machine.getState().kind === "payment", "[T2] Should be 'payment'");

machine.send({ type: "SUBMIT_PAYMENT", orderId: "ORD-2026-001" });
const confirmed = machine.getState();
console.assert(confirmed.kind === "confirmed", "[T2] Should be 'confirmed'");
console.assert(
  confirmed.kind === "confirmed" && confirmed.orderId === "ORD-2026-001",
  "[T2] orderId should be 'ORD-2026-001'"
);

// ---------------------------------------------------------------------------
// Test 3: Subscriber is notified on transition, unsubscribe works
// ---------------------------------------------------------------------------
const machine2 = new CheckoutMachine(mockCart);
const transitions: Array<{ from: string; to: string }> = [];

const unsub = machine2.subscribe((next: CheckoutState, prev: CheckoutState) => {
  transitions.push({ from: prev.kind, to: next.kind });
});

machine2.send({ type: "START_VALIDATION" });
machine2.send({ type: "VALIDATION_FAILURE", reason: "Address mismatch" });

console.assert(transitions.length === 2, `[T3] Expected 2 transitions, got ${transitions.length}`);
console.assert(transitions[0].from === "idle" && transitions[0].to === "validating", "[T3] First transition wrong");
console.assert(transitions[1].from === "validating" && transitions[1].to === "failed", "[T3] Second transition wrong");

unsub();
machine2.reset(); // no further subscriber calls expected
console.assert(transitions.length === 2, "[T3] Subscriber should NOT be called after unsubscribe");

// ---------------------------------------------------------------------------
// Test 4: Invalid transition throws TypeError
// ---------------------------------------------------------------------------
const machine3 = new CheckoutMachine(mockCart);
let threw = false;
try {
  // Sending SUBMIT_PAYMENT from "idle" is illegal
  machine3.send({ type: "SUBMIT_PAYMENT", orderId: "FAKE" });
} catch (e) {
  threw = e instanceof TypeError;
}
console.assert(threw, "[T4] Should throw TypeError on illegal transition");

// ---------------------------------------------------------------------------
// Test 5: cartTotal computes correctly
// ---------------------------------------------------------------------------
const total = cartTotal(mockCart);
// 2 * 8999 + 4 * 499 = 17998 + 1996 = 19994
console.assert(total === 19994, `[T5] Expected 19994, got ${total}`);

console.log("All assertions passed ✓");
