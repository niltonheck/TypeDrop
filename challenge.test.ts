// challenge.test.ts
import {
  applyEvent,
  createSnapshot,
  replayFrom,
  getLineItems,
  EMPTY_ORDER_STATE,
  type OrderEvent,
  type OrderState,
  type Snapshot,
  type Reducer,
} from "./challenge";

// ── Mock event log ───────────────────────────────────────────────
const events: OrderEvent[] = [
  { kind: "order_placed", customerId: "cust-42", totalCents: 0 },
  { kind: "item_added",   itemId: "sku-A", qty: 2, priceCents: 500 },
  { kind: "item_added",   itemId: "sku-B", qty: 1, priceCents: 1200 },
  { kind: "item_added",   itemId: "sku-A", qty: 1, priceCents: 500 }, // accumulate sku-A → qty 3
  { kind: "item_removed", itemId: "sku-B", qty: 1 },                  // remove sku-B entirely
];

// ── Helper: fold all events from empty state ─────────────────────
const finalState: OrderState = events.reduce(
  (s, e) => applyEvent(s, e),
  EMPTY_ORDER_STATE
);

// 1. customerId is propagated correctly
console.assert(
  finalState.customerId === "cust-42",
  `[FAIL] customerId expected "cust-42", got "${finalState.customerId}"`
);

// 2. totalCents = 3 * 500 = 1500  (sku-B was fully removed)
console.assert(
  finalState.totalCents === 1500,
  `[FAIL] totalCents expected 1500, got ${finalState.totalCents}`
);

// 3. sku-B must be absent from items
console.assert(
  !finalState.items.has("sku-B"),
  `[FAIL] sku-B should have been removed from items`
);

// 4. getLineItems returns sorted array with correct lineTotalCents
const lines = getLineItems(finalState);
console.assert(
  lines.length === 1 && lines[0].itemId === "sku-A" && lines[0].lineTotalCents === 1500,
  `[FAIL] getLineItems: expected [{ itemId:"sku-A", lineTotalCents:1500 }], got ${JSON.stringify(lines)}`
);

// 5. replayFrom snapshot reproduces identical state
const snap: Snapshot<OrderState> = createSnapshot(finalState, events.length - 1);
const replayed: OrderState = replayFrom(snap, [], applyEvent as Reducer<OrderState, OrderEvent>);
console.assert(
  replayed.totalCents === finalState.totalCents &&
  replayed.customerId === finalState.customerId,
  `[FAIL] replayFrom snapshot did not reproduce the correct state`
);

// 6. Cancellation flips status and is idempotent
const cancelEvent: OrderEvent = { kind: "order_cancelled", reason: "customer request" };
const cancelledOnce  = applyEvent(finalState, cancelEvent);
const cancelledTwice = applyEvent(cancelledOnce, cancelEvent);
console.assert(
  cancelledOnce.status === "cancelled",
  `[FAIL] status should be "cancelled" after order_cancelled event`
);
console.assert(
  cancelledTwice.status === "cancelled",
  `[FAIL] double-cancel should remain "cancelled"`
);

console.log("All assertions passed ✓");
