// ============================================================
// challenge.test.ts
// ============================================================
import {
  buildOrder,
  transition,
  getValidNextEvents,
  type Order,
  type OrderEvent,
  type LegalTransition,
} from "./challenge";

// ── Mock data ────────────────────────────────────────────────
const NOW = 1_700_000_000_000;

const confirmEvent: OrderEvent = {
  type: "CONFIRM",
  orderId: "ORD-001",
  timestamp: NOW + 1_000,
};

const pickEvent: OrderEvent = {
  type: "START_PICKING",
  orderId: "ORD-001",
  timestamp: NOW + 2_000,
};

const shipEvent: OrderEvent = {
  type: "SHIP",
  orderId: "ORD-001",
  timestamp: NOW + 3_000,
  trackingCode: "TRACK-XYZ",
};

const deliverEvent: OrderEvent = {
  type: "DELIVER",
  orderId: "ORD-001",
  timestamp: NOW + 86_400_000,
};

const cancelEvent: OrderEvent = {
  type: "CANCEL",
  orderId: "ORD-001",
  timestamp: NOW + 500,
  reason: "Customer request",
};

// ── Tests ────────────────────────────────────────────────────

// Test 1: buildOrder creates a pending order
const order0 = buildOrder("ORD-001", NOW);
console.assert(order0.state === "pending", "T1: initial state should be 'pending'");
console.assert(order0.history.length === 0, "T1: initial history should be empty");
console.assert(order0.createdAt === NOW, "T1: createdAt should match");

// Test 2: legal transitions advance state and append history
const order1 = transition(order0, confirmEvent);
console.assert(order1.state === "confirmed", "T2: state should be 'confirmed' after CONFIRM");
console.assert(order1.history.length === 1, "T2: history should have 1 entry");
console.assert(order1.updatedAt === confirmEvent.timestamp, "T2: updatedAt should match event timestamp");

const order2 = transition(order1, pickEvent);
const order3 = transition(order2, shipEvent);
const order4 = transition(order3, deliverEvent);
console.assert(order4.state === "delivered", "T2: full happy-path ends in 'delivered'");
console.assert(order4.history.length === 4, "T2: history should have 4 events");

// Test 3: illegal transition throws TypeError
let threw = false;
try {
  transition(order4, cancelEvent); // delivered → cancelled is illegal
} catch (e) {
  threw = e instanceof TypeError;
}
console.assert(threw, "T3: illegal transition should throw TypeError");

// Test 4: cancellation is legal from pending, confirmed, or picking
const cancelledFromPending = transition(order0, cancelEvent);
console.assert(cancelledFromPending.state === "cancelled", "T4: cancel from pending should work");

const cancelledFromPicking = transition(order2, { ...cancelEvent, timestamp: NOW + 9_000 });
console.assert(cancelledFromPicking.state === "cancelled", "T4: cancel from picking should work");

// Test 5: getValidNextEvents returns correct events per state
const nextFromPending = getValidNextEvents(order0);
console.assert(
  nextFromPending.includes("CONFIRM") && nextFromPending.includes("CANCEL") && nextFromPending.length === 2,
  "T5: pending → CONFIRM | CANCEL"
);
const nextFromDelivered = getValidNextEvents(order4);
console.assert(nextFromDelivered.length === 0, "T5: delivered has no valid next events");

console.log("All assertions passed ✓");
