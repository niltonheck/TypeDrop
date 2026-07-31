// ============================================================
// challenge.test.ts
// ============================================================
import {
  createOrder,
  applyEvent,
  rehydrate,
  isTerminal,
  getEventsByType,
  TRANSITIONS,
  type OrderAggregate,
  type LegalEvents,
  type OrderState,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

// ── Mock Events ───────────────────────────────────────────────────────────────

const placed = {
  type: "OrderPlaced" as const,
  occurredAt: now(),
  orderId: "ord-001",
  customerId: "cust-42",
  totalCents: 4999,
};

const confirmed = {
  type: "OrderConfirmed" as const,
  occurredAt: now(),
  confirmedBy: "agent-7",
};

const shipped = {
  type: "OrderShipped" as const,
  occurredAt: now(),
  trackingNumber: "1Z999AA10123456784",
  carrier: "UPS",
};

const delivered = {
  type: "OrderDelivered" as const,
  occurredAt: now(),
  signedBy: "Jane Doe",
};

const refunded = {
  type: "OrderRefunded" as const,
  occurredAt: now(),
  amountCents: 4999,
  refundId: "ref-88",
};

const cancelled = {
  type: "OrderCancelled" as const,
  occurredAt: now(),
  reason: "Customer request",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

// Test 1: createOrder sets correct initial state
const order0 = createOrder(placed);
console.assert(order0.state === "Pending",      "T1a: initial state should be Pending");
console.assert(order0.orderId === "ord-001",    "T1b: orderId should be set");
console.assert(order0.events.length === 1,      "T1c: events should contain exactly one event");
console.assert(order0.trackingNumber === null,  "T1d: trackingNumber should start null");
console.assert(order0.refundId === null,        "T1e: refundId should start null");

// Test 2: applyEvent transitions through the happy path
const order1 = applyEvent(order0, confirmed);   // Pending → Confirmed
const order2 = applyEvent(order1, shipped);     // Confirmed → Shipped
const order3 = applyEvent(order2, delivered);   // Shipped → Delivered
const order4 = applyEvent(order3, refunded);    // Delivered → Refunded

console.assert(order1.state === "Confirmed",                    "T2a: state should be Confirmed");
console.assert(order2.state === "Shipped",                      "T2b: state should be Shipped");
console.assert(order2.trackingNumber === "1Z999AA10123456784",  "T2c: trackingNumber should be set");
console.assert(order3.state === "Delivered",                    "T2d: state should be Delivered");
console.assert(order4.state === "Refunded",                     "T2e: state should be Refunded");
console.assert(order4.refundId === "ref-88",                    "T2f: refundId should be set");

// Test 3: rehydrate replays a full event log
const log = [placed, confirmed, shipped, delivered, refunded] as const;
const rehydrated = rehydrate(log);
console.assert(rehydrated.state === "Refunded",      "T3a: rehydrated state should be Refunded");
console.assert(rehydrated.events.length === 5,       "T3b: rehydrated events length should be 5");
console.assert(rehydrated.refundId === "ref-88",     "T3c: rehydrated refundId should be set");

// Test 4: isTerminal correctly identifies terminal states
console.assert(isTerminal("Cancelled") === true,  "T4a: Cancelled is terminal");
console.assert(isTerminal("Refunded")  === true,  "T4b: Refunded is terminal");
console.assert(isTerminal("Pending")   === false, "T4c: Pending is not terminal");
console.assert(isTerminal("Shipped")   === false, "T4d: Shipped is not terminal");

// Test 5: getEventsByType filters and narrows correctly
const fullLog = [placed, confirmed, shipped, delivered, refunded] as const;
const rehydrated2 = rehydrate(fullLog);
const shippedEvents = getEventsByType(rehydrated2, "OrderShipped");
console.assert(shippedEvents.length === 1,                              "T5a: one shipped event");
console.assert(shippedEvents[0].trackingNumber === "1Z999AA10123456784","T5b: trackingNumber present on narrowed type");

// Test 6: rehydrate throws on illegal transition in event log
let threwOnBadLog = false;
try {
  // Skips Confirmed — illegal jump from Pending to Shipped
  rehydrate([placed, shipped]);
} catch {
  threwOnBadLog = true;
}
console.assert(threwOnBadLog, "T6: rehydrate should throw on illegal transition");

// Test 7: TRANSITIONS runtime map sanity checks
console.assert(TRANSITIONS["Pending"].includes("OrderConfirmed"),  "T7a: Pending allows OrderConfirmed");
console.assert(!TRANSITIONS["Cancelled"].includes("OrderShipped"), "T7b: Cancelled allows nothing");
console.assert(TRANSITIONS["Delivered"].includes("OrderRefunded"), "T7c: Delivered allows OrderRefunded");

// ── Compile-time checks (these should NOT compile if you uncomment them) ──────
// Uncomment each block one at a time to verify type errors:

// ❌ Should be a type error — OrderShipped is not legal from Pending
// applyEvent(order0, shipped);

// ❌ Should be a type error — OrderConfirmed is not legal from Delivered
// applyEvent(order3, confirmed);

// ❌ Should be a type error — OrderPlaced is never a LegalEvent from any state
// const _x: LegalEvents<"Pending"> = placed;

console.log("All assertions passed ✅");
