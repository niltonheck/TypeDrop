// challenge.test.ts
import {
  validateCommand,
  applyEvent,
  handleCommand,
  replayEvents,
  buildSnapshot,
  projectOrderTotal,
  projectEventLog,
  toOrderId,
  toProductId,
  toEventSeq,
  type DomainEvent,
  type OrderState,
  type CommandHandlerMap,
  type ApplyError,
  type Result,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
function assertOk<T, E>(r: Result<T, E>, label: string): T {
  console.assert(r.ok === true, `[FAIL] ${label} — expected Ok, got Err: ${JSON.stringify(!r.ok && r)}`);
  if (!r.ok) throw new Error(label);
  return r.value;
}

function assertErr<T, E>(r: Result<T, E>, label: string): E {
  console.assert(r.ok === false, `[FAIL] ${label} — expected Err, got Ok: ${JSON.stringify(r.ok && r)}`);
  if (r.ok) throw new Error(label);
  return r.error;
}

// ── Mock handler map ──────────────────────────────────────────
const NOW = "2026-11-23T09:00:00.000Z";

const handlers: CommandHandlerMap = {
  PlaceOrder: (cmd, _state) =>
    ({ ok: true, value: {
      type: "OrderPlaced" as const,
      seq: toEventSeq(1),
      orderId: toOrderId(cmd.orderId),
      customerId: cmd.customerId,
      items: cmd.items.map(i => ({
        productId: toProductId(i.productId),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      occurredAt: NOW,
    }}),
  AddItem: (cmd, _state) =>
    ({ ok: true, value: {
      type: "ItemAdded" as const,
      seq: toEventSeq(2),
      orderId: toOrderId(cmd.orderId),
      item: { productId: toProductId(cmd.productId), quantity: cmd.quantity, unitPrice: cmd.unitPrice },
      occurredAt: NOW,
    }}),
  RemoveItem: (cmd, state) => {
    if (!state) return { ok: false, error: { kind: "OrderNotFound", orderId: toOrderId(cmd.orderId) } };
    const found = state.items.find(i => i.productId === toProductId(cmd.productId));
    if (!found) return { ok: false, error: { kind: "ProductNotInOrder", productId: toProductId(cmd.productId) } };
    return { ok: true, value: {
      type: "ItemRemoved" as const,
      seq: toEventSeq(3),
      orderId: toOrderId(cmd.orderId),
      productId: toProductId(cmd.productId),
      occurredAt: NOW,
    }};
  },
  ConfirmOrder: (cmd, _state) =>
    ({ ok: true, value: {
      type: "OrderConfirmed" as const,
      seq: toEventSeq(4),
      orderId: toOrderId(cmd.orderId),
      occurredAt: NOW,
    }}),
  CancelOrder: (cmd, _state) =>
    ({ ok: true, value: {
      type: "OrderCancelled" as const,
      seq: toEventSeq(5),
      orderId: toOrderId(cmd.orderId),
      reason: cmd.reason,
      occurredAt: NOW,
    }}),
};

// ── Test 1: validateCommand — valid PlaceOrder ────────────────
const rawPlaceOrder = {
  type: "PlaceOrder",
  orderId: "ord-001",
  customerId: "cust-42",
  items: [{ productId: "prod-A", quantity: 2, unitPrice: 19.99 }],
};
const validatedCmd = assertOk(validateCommand(rawPlaceOrder), "T1: validateCommand PlaceOrder");
console.assert(
  validatedCmd.type === "PlaceOrder",
  "[FAIL] T1: type should be PlaceOrder"
);
console.log("[PASS] T1: validateCommand — valid PlaceOrder");

// ── Test 2: validateCommand — rejects bad command ─────────────
const badCmd = { type: "LaunchRocket", orderId: "ord-001" };
const validationErr = assertErr(validateCommand(badCmd), "T2: validateCommand unknown type");
console.assert(
  validationErr.kind === "UnknownCommand",
  `[FAIL] T2: expected UnknownCommand, got ${validationErr.kind}`
);
console.log("[PASS] T2: validateCommand — unknown command rejected");

// ── Test 3: validateCommand — rejects empty items ─────────────
const emptyItems = { type: "PlaceOrder", orderId: "ord-001", customerId: "c1", items: [] };
const emptyItemsErr = assertErr(validateCommand(emptyItems), "T3: empty items");
console.assert(
  emptyItemsErr.kind === "EmptyItems",
  `[FAIL] T3: expected EmptyItems, got ${emptyItemsErr.kind}`
);
console.log("[PASS] T3: validateCommand — empty items rejected");

// ── Test 4: applyEvent — full lifecycle replay ────────────────
const events: ReadonlyArray<DomainEvent> = [
  {
    type: "OrderPlaced",
    seq: toEventSeq(1),
    orderId: toOrderId("ord-001"),
    customerId: "cust-42",
    items: [{ productId: toProductId("prod-A"), quantity: 2, unitPrice: 19.99 }],
    occurredAt: NOW,
  },
  {
    type: "ItemAdded",
    seq: toEventSeq(2),
    orderId: toOrderId("ord-001"),
    item: { productId: toProductId("prod-B"), quantity: 1, unitPrice: 9.50 },
    occurredAt: NOW,
  },
  {
    type: "OrderConfirmed",
    seq: toEventSeq(3),
    orderId: toOrderId("ord-001"),
    occurredAt: NOW,
  },
];

const finalState = assertOk(replayEvents(events), "T4: replayEvents");
console.assert(finalState.status === "Confirmed",   "[FAIL] T4: status should be Confirmed");
console.assert(finalState.items.length === 2,       "[FAIL] T4: should have 2 items");
console.assert(finalState.lastSeq === 3,            "[FAIL] T4: lastSeq should be 3");
console.log("[PASS] T4: replayEvents — full lifecycle");

// ── Test 5: replayEvents with snapshot ───────────────────────
const snap = buildSnapshot(finalState);
console.assert(snap.atSeq === finalState.lastSeq, "[FAIL] T5: snapshot atSeq mismatch");

// Add one more event after the snapshot
const lateEvents: ReadonlyArray<DomainEvent> = [
  ...events,
  {
    type: "OrderCancelled",
    seq: toEventSeq(4),
    orderId: toOrderId("ord-001"),
    reason: "Customer request",
    occurredAt: NOW,
  },
];
const stateFromSnap = assertOk(replayEvents(lateEvents, snap), "T5: replayEvents from snapshot");
console.assert(stateFromSnap.status === "Cancelled", "[FAIL] T5: status should be Cancelled");
console.assert(stateFromSnap.lastSeq === 4,          "[FAIL] T5: lastSeq should be 4");
console.log("[PASS] T5: replayEvents — snapshot + incremental replay");

// ── Test 6: projectOrderTotal ─────────────────────────────────
const total = projectOrderTotal(finalState);
// 2 * 19.99 + 1 * 9.50 = 49.48
console.assert(
  Math.abs(total - 49.48) < 0.001,
  `[FAIL] T6: total should be 49.48, got ${total}`
);
console.log("[PASS] T6: projectOrderTotal");

// ── Test 7: projectEventLog ───────────────────────────────────
const summary = projectEventLog(lateEvents);
console.assert(summary.eventCount === 4,                         "[FAIL] T7: eventCount should be 4");
console.assert(summary.eventTypes.length === 4,                  "[FAIL] T7: 4 unique event types");
console.assert(summary.eventTypes[0] === "OrderPlaced",          "[FAIL] T7: first type should be OrderPlaced");
console.assert(summary.eventTypes[3] === "OrderCancelled",       "[FAIL] T7: last type should be OrderCancelled");
console.assert(summary.firstSeq === 1,                           "[FAIL] T7: firstSeq should be 1");
console.assert(summary.lastSeq  === 4,                           "[FAIL] T7: lastSeq should be 4");
console.log("[PASS] T7: projectEventLog");

console.log("\n✅ All tests passed!");
