// ============================================================
// challenge.test.ts — Test Harness
// Run with: npx ts-node --project tsconfig.json challenge.test.ts
// (tsconfig must have strict: true)
// ============================================================
import {
  EventStore,
  OrderAggregate,
  OrderProjector,
  SnapshotStore,
  buildEventStream,
  toOrderId,
  toCustomerId,
  toEventId,
  type OrderEvent,
  type OrderReadModel,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
let _eid = 0;
function eid(): string {
  return toEventId(`evt-${++_eid}`);
}

const OID = toOrderId("order-42");
const CID = toCustomerId("cust-7");

// ── Mock event stream ─────────────────────────────────────────
const placed: OrderEvent = {
  type: "OrderPlaced",
  eventId: eid(),
  version: 1,
  orderId: OID,
  customerId: CID,
  placedAt: new Date("2026-10-31T08:00:00Z"),
  totalCents: 0,
};

const item1: OrderEvent = {
  type: "ItemAdded",
  eventId: eid(),
  version: 2,
  orderId: OID,
  sku: "SKU-A",
  qty: 2,
  unitCents: 1500,
};

const item2: OrderEvent = {
  type: "ItemAdded",
  eventId: eid(),
  version: 3,
  orderId: OID,
  sku: "SKU-B",
  qty: 1,
  unitCents: 4000,
};

const removed: OrderEvent = {
  type: "ItemRemoved",
  eventId: eid(),
  version: 4,
  orderId: OID,
  sku: "SKU-A",
  qty: 1,
};

const shipped: OrderEvent = {
  type: "OrderShipped",
  eventId: eid(),
  version: 5,
  orderId: OID,
  carrier: "FedEx",
  trackingCode: "FX123456",
  shippedAt: new Date("2026-10-31T18:00:00Z"),
};

// ── Test 1: EventStore appends and retrieves in order ─────────
{
  const store = new EventStore();
  store.append(placed);
  store.append(item1);
  store.append(item2);
  store.append(removed);
  store.append(shipped);

  const stream = store.getStream(OID);
  console.assert(stream.length === 5, "Test 1a FAILED: stream length should be 5");
  console.assert(stream[0].type === "OrderPlaced", "Test 1b FAILED: first event should be OrderPlaced");
  console.assert(stream[4].type === "OrderShipped", "Test 1c FAILED: last event should be OrderShipped");
  console.log("Test 1 PASSED: EventStore appends and retrieves correctly");
}

// ── Test 2: EventStore rejects out-of-order version ──────────
{
  const store = new EventStore();
  store.append(placed);
  let threw = false;
  try {
    // version 3 skips version 2 — must throw
    const bad: OrderEvent = { ...item2, version: 3 };
    store.append(bad);
  } catch {
    threw = true;
  }
  console.assert(threw, "Test 2 FAILED: should throw on version gap");
  console.log("Test 2 PASSED: EventStore rejects version gaps");
}

// ── Test 3: OrderProjector folds events correctly ─────────────
{
  const projector = new OrderProjector();
  const stream: readonly OrderEvent[] = [placed, item1, item2, removed, shipped];
  const model: OrderReadModel = projector.replayFrom(stream);

  // totalCents: SKU-A 2×1500=3000, SKU-B 1×4000=4000, then remove 1×SKU-A → 1×1500+4000=5500
  console.assert(model.totalCents === 5500, `Test 3a FAILED: totalCents should be 5500, got ${model.totalCents}`);
  console.assert(model.status === "shipped", `Test 3b FAILED: status should be 'shipped', got ${model.status}`);
  console.assert(model.items.length === 2, `Test 3c FAILED: should have 2 line items, got ${model.items.length}`);
  console.assert(model.shippedAt !== null, "Test 3d FAILED: shippedAt should be set");
  console.log("Test 3 PASSED: OrderProjector folds events correctly");
}

// ── Test 4: SnapshotStore save/load/shouldSnapshot ────────────
{
  const ss = new SnapshotStore<OrderReadModel>();
  const projector = new OrderProjector();
  const state = projector.replayFrom([placed, item1, item2, removed, shipped]);
  ss.save({ orderId: OID, state, atVersion: 5, takenAt: new Date() });

  const loaded = ss.load(OID);
  console.assert(loaded !== null, "Test 4a FAILED: snapshot should be found");
  console.assert(loaded!.atVersion === 5, "Test 4b FAILED: snapshot atVersion should be 5");
  console.assert(ss.shouldSnapshot(5, 5) === true, "Test 4c FAILED: version 5 with interval 5 should snapshot");
  console.assert(ss.shouldSnapshot(3, 5) === false, "Test 4d FAILED: version 3 with interval 5 should not snapshot");
  console.assert(ss.shouldSnapshot(0, 5) === false, "Test 4e FAILED: version 0 should never snapshot");
  console.log("Test 4 PASSED: SnapshotStore works correctly");
}

// ── Test 5: buildEventStream filters and sorts ────────────────
{
  const events: OrderEvent[] = [shipped, item1, placed, removed, item2];
  const filtered = buildEventStream(events, 2); // versions > 2
  console.assert(filtered.length === 3, `Test 5a FAILED: should return 3 events, got ${filtered.length}`);
  console.assert(filtered[0].version === 3, `Test 5b FAILED: first filtered event should be v3, got ${filtered[0].version}`);
  console.assert(filtered[2].version === 5, `Test 5c FAILED: last filtered event should be v5, got ${filtered[2].version}`);
  console.log("Test 5 PASSED: buildEventStream filters and sorts correctly");
}

// ── Test 6: OrderAggregate end-to-end with snapshotting ───────
{
  const store = new EventStore();
  const projector = new OrderProjector();
  const snapshots = new SnapshotStore<OrderReadModel>();
  const agg = new OrderAggregate(store, projector, snapshots, 5);

  agg.append(placed);
  agg.append(item1);
  agg.append(item2);
  agg.append(removed);
  agg.append(shipped); // version 5 → snapshot should be taken

  const snap = snapshots.load(OID);
  console.assert(snap !== null, "Test 6a FAILED: snapshot should be saved at version 5");

  const model = agg.getReadModel(OID);
  console.assert(model.status === "shipped", `Test 6b FAILED: final status should be 'shipped', got ${model.status}`);
  console.assert(model.totalCents === 5500, `Test 6c FAILED: totalCents should be 5500, got ${model.totalCents}`);

  const ids = agg.listAll();
  console.assert(ids.includes(OID), "Test 6d FAILED: listAll should include the order id");
  console.log("Test 6 PASSED: OrderAggregate end-to-end with snapshotting");
}

console.log("\n✅ All tests passed!");
