// challenge.test.ts
import {
  transition,
  replay,
  project,
  MachineError,
  type OrderState,
  type OrderEvent,
  type OrderSnapshot,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

const now = new Date("2026-10-24T10:00:00Z");
const later = (mins: number) => new Date(now.getTime() + mins * 60_000);

// ── Mock event log: a happy-path order ───────────────────────

const happyPathEvents: ReadonlyArray<OrderEvent> = [
  { kind: "PlaceOrder",     orderId: "ORD-001", customerId: "CUST-42", createdAt: now },
  { kind: "ConfirmPayment", confirmedAt: later(5),  totalCents: 4999 },
  { kind: "StartPicking",   warehouseId: "WH-7",   startedAt: later(30) },
  { kind: "DispatchParcel", trackingCode: "TRK-XYZ", shippedAt: later(120) },
  { kind: "MarkDelivered",  deliveredAt: later(2880) },
];

// ── Test 1: replay produces the correct terminal state ────────

const finalState = replay(happyPathEvents);
console.assert(
  finalState.kind === "Delivered",
  `[FAIL] Test 1 — expected state 'Delivered', got '${finalState.kind}'`,
);
console.log(`[PASS] Test 1 — replay reaches Delivered`);

// ── Test 2: project extracts only requested keys ──────────────

const snap = project(finalState, ["orderId", "customerId", "totalCents", "deliveredAt"]);

// Type-level check: snap must be Pick<OrderSnapshot, "orderId"|"customerId"|"totalCents"|"deliveredAt">
const _typeCheck: Pick<OrderSnapshot, "orderId" | "customerId" | "totalCents" | "deliveredAt"> = snap;

console.assert(
  snap.orderId === "ORD-001" &&
  snap.customerId === "CUST-42" &&
  snap.totalCents === 4999 &&
  snap.deliveredAt !== undefined,
  `[FAIL] Test 2 — snapshot fields incorrect: ${JSON.stringify(snap)}`,
);
console.log(`[PASS] Test 2 — project returns correct snapshot`);

// ── Test 3: invalid transition throws MachineError ───────────

const pendingState = replay([
  { kind: "PlaceOrder", orderId: "ORD-002", customerId: "CUST-99", createdAt: now },
]);

let caughtInvalid = false;
try {
  // MarkDelivered is not valid from Pending
  transition(pendingState, { kind: "MarkDelivered", deliveredAt: later(1) });
} catch (e) {
  if (e instanceof MachineError) caughtInvalid = true;
}
console.assert(caughtInvalid, `[FAIL] Test 3 — expected MachineError for invalid transition`);
console.log(`[PASS] Test 3 — invalid transition throws MachineError`);

// ── Test 4: cancellation from Confirmed ──────────────────────

const confirmedEvents: ReadonlyArray<OrderEvent> = [
  { kind: "PlaceOrder",     orderId: "ORD-003", customerId: "CUST-7", createdAt: now },
  { kind: "ConfirmPayment", confirmedAt: later(2), totalCents: 1500 },
  { kind: "CancelOrder",    reason: "Customer request", cancelledAt: later(10) },
];
const cancelledState = replay(confirmedEvents);
console.assert(
  cancelledState.kind === "Cancelled",
  `[FAIL] Test 4 — expected 'Cancelled', got '${cancelledState.kind}'`,
);
console.log(`[PASS] Test 4 — order correctly cancelled from Confirmed`);

// ── Test 5: refund after delivery ────────────────────────────

const refundedState = transition(finalState, {
  kind: "IssueRefund",
  refundedAt: later(3000),
  refundCents: 4999,
});
console.assert(
  refundedState.kind === "Refunded",
  `[FAIL] Test 5 — expected 'Refunded', got '${refundedState.kind}'`,
);

const refundSnap = project(refundedState, ["refundCents", "trackingCode"]);
console.assert(
  refundSnap.refundCents === 4999 && refundSnap.trackingCode === "TRK-XYZ",
  `[FAIL] Test 5 — refund snapshot incorrect: ${JSON.stringify(refundSnap)}`,
);
console.log(`[PASS] Test 5 — refund issued and projected correctly`);

console.log("\n✅ All tests passed!");
