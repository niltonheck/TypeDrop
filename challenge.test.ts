// challenge.test.ts
import {
  aggregateEvents,
  pageViewReducer,
  clickReducer,
  errorReducer,
  purchaseReducer,
  windowKey,
  type TelemetryEvent,
  type EventKind,
  type ExtractEvent,
  type RollupMap,
} from "./challenge";

// ── Compile-time checks ───────────────────────────────────────────────────────

// EventKind must be a union of the four string literals
const _k1: EventKind = "pageView";
const _k2: EventKind = "click";
const _k3: EventKind = "error";
const _k4: EventKind = "purchase";

// ExtractEvent must narrow correctly
const _e1: ExtractEvent<"click"> = {
  kind: "click",
  timestamp: 0,
  elementId: "btn",
  x: 0,
  y: 0,
};

// RollupMap must have all four keys
const _rm: RollupMap = {
  pageView: { count: 0, totalDurationMs: 0, uniquePaths: new Set() },
  click: { count: 0, uniqueElements: new Set() },
  error: { count: 0, fatalCount: 0, messages: [] },
  purchase: { count: 0, totalAmountCents: 0, orderIds: [] },
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const BASE = 0; // epoch start for easy math
const WIN = 60_000; // 1-minute windows

const events: TelemetryEvent[] = [
  // Window 0 (0–59 999 ms)
  { kind: "pageView", timestamp: BASE + 1_000, path: "/home", durationMs: 200 },
  { kind: "pageView", timestamp: BASE + 2_000, path: "/home", durationMs: 300 },
  { kind: "pageView", timestamp: BASE + 3_000, path: "/about", durationMs: 150 },
  { kind: "click", timestamp: BASE + 5_000, elementId: "btn-cta", x: 10, y: 20 },
  { kind: "click", timestamp: BASE + 6_000, elementId: "btn-cta", x: 12, y: 22 },
  { kind: "click", timestamp: BASE + 7_000, elementId: "nav-logo", x: 0, y: 0 },
  { kind: "error", timestamp: BASE + 10_000, message: "Unhandled rejection", fatal: false },
  { kind: "error", timestamp: BASE + 11_000, message: "Segfault", fatal: true },
  { kind: "purchase", timestamp: BASE + 20_000, orderId: "ORD-001", amountCents: 4999 },

  // Window 1 (60 000–119 999 ms)
  { kind: "pageView", timestamp: BASE + 61_000, path: "/pricing", durationMs: 500 },
  { kind: "error", timestamp: BASE + 62_000, message: "Timeout", fatal: false },
  { kind: "purchase", timestamp: BASE + 65_000, orderId: "ORD-002", amountCents: 1999 },
  { kind: "purchase", timestamp: BASE + 66_000, orderId: "ORD-003", amountCents: 2999 },
];

// ── windowKey tests ───────────────────────────────────────────────────────────

console.assert(
  windowKey(0, WIN) === "0",
  "windowKey: timestamp 0 should map to bucket '0'"
);

console.assert(
  windowKey(59_999, WIN) === "0",
  "windowKey: 59 999 ms should still be in bucket '0'"
);

console.assert(
  windowKey(60_000, WIN) === "60000",
  "windowKey: 60 000 ms should open a new bucket '60000'"
);

console.assert(
  windowKey(61_500, WIN) === "60000",
  "windowKey: 61 500 ms should map to bucket '60000'"
);

// ── pageView rollup ───────────────────────────────────────────────────────────

const pvResult = aggregateEvents(events, "pageView", pageViewReducer, WIN);

const pv0 = pvResult.get("0");
console.assert(pv0 !== undefined, "pageView: window '0' must exist");
console.assert(pv0!.count === 3, `pageView window 0: count should be 3, got ${pv0?.count}`);
console.assert(
  pv0!.totalDurationMs === 650,
  `pageView window 0: totalDurationMs should be 650, got ${pv0?.totalDurationMs}`
);
console.assert(
  pv0!.uniquePaths.size === 2,
  `pageView window 0: uniquePaths should have 2 entries, got ${pv0?.uniquePaths.size}`
);

const pv1 = pvResult.get("60000");
console.assert(pv1 !== undefined, "pageView: window '60000' must exist");
console.assert(pv1!.count === 1, `pageView window 1: count should be 1, got ${pv1?.count}`);

// ── click rollup ──────────────────────────────────────────────────────────────

const clResult = aggregateEvents(events, "click", clickReducer, WIN);
const cl0 = clResult.get("0");
console.assert(cl0 !== undefined, "click: window '0' must exist");
console.assert(cl0!.count === 3, `click window 0: count should be 3, got ${cl0?.count}`);
console.assert(
  cl0!.uniqueElements.size === 2,
  `click window 0: uniqueElements should have 2, got ${cl0?.uniqueElements.size}`
);

// ── error rollup ──────────────────────────────────────────────────────────────

const errResult = aggregateEvents(events, "error", errorReducer, WIN);
const err0 = errResult.get("0");
console.assert(err0 !== undefined, "error: window '0' must exist");
console.assert(err0!.count === 2, `error window 0: count should be 2, got ${err0?.count}`);
console.assert(
  err0!.fatalCount === 1,
  `error window 0: fatalCount should be 1, got ${err0?.fatalCount}`
);
console.assert(
  err0!.messages.length === 2,
  `error window 0: messages should have 2 entries, got ${err0?.messages.length}`
);

// ── purchase rollup ───────────────────────────────────────────────────────────

const purResult = aggregateEvents(events, "purchase", purchaseReducer, WIN);
const pur0 = purResult.get("0");
const pur1 = purResult.get("60000");
console.assert(pur0 !== undefined, "purchase: window '0' must exist");
console.assert(
  pur0!.totalAmountCents === 4999,
  `purchase window 0: totalAmountCents should be 4999, got ${pur0?.totalAmountCents}`
);
console.assert(pur1 !== undefined, "purchase: window '60000' must exist");
console.assert(
  pur1!.count === 2,
  `purchase window 1: count should be 2, got ${pur1?.count}`
);
console.assert(
  pur1!.totalAmountCents === 4998,
  `purchase window 1: totalAmountCents should be 4998, got ${pur1?.totalAmountCents}`
);

console.log("All assertions passed ✅");
