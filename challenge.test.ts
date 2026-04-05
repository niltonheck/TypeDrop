// ============================================================
// challenge.test.ts — Typed Event Stream Aggregator
// ============================================================
import {
  validateEvent,
  aggregateEvents,
  lookupStream,
  type RawEvent,
  type StreamEvent,
  type AggregationReport,
  type Result,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const validRaws: RawEvent[] = [
  { id: "evt-1", streamId: "stream-A", kind: "view",     value: 30,   timestamp: 1_700_000_000_000 },
  { id: "evt-2", streamId: "stream-A", kind: "like",     value: 1,    timestamp: 1_700_000_001_000 },
  { id: "evt-3", streamId: "stream-A", kind: "donation", value: 5.50, timestamp: 1_700_000_002_000 },
  { id: "evt-4", streamId: "stream-B", kind: "view",     value: 120,  timestamp: 1_700_000_000_500 },
  { id: "evt-5", streamId: "stream-B", kind: "comment",  value: 1,    timestamp: 1_700_000_003_000 },
];

const invalidRaws: RawEvent[] = [
  { id: "",          streamId: "stream-A", kind: "view",    value: 10,       timestamp: 1_700_000_000_000 }, // empty id
  { id: "evt-bad1",  streamId: "stream-A", kind: "explode", value: 10,       timestamp: 1_700_000_000_000 }, // bad kind
  { id: "evt-bad2",  streamId: "stream-B", kind: "like",    value: Infinity, timestamp: 1_700_000_000_000 }, // non-finite value
  { id: "evt-bad3",  streamId: "stream-B", kind: "share",   value: 1,        timestamp: -1               }, // negative timestamp
  { id: "evt-bad4",  streamId: null,       kind: "comment", value: 1,        timestamp: 1_700_000_000_000 }, // null streamId
];

// A no-op processor (simulates async side-effect)
const noopProcessor = async (_event: StreamEvent): Promise<void> => {
  await Promise.resolve();
};

// -----------------------------------------------------------
// Helper to unwrap Result (works for both Ok and Err shapes)
// -----------------------------------------------------------
function isOk<T, E>(r: Result<T, E>): boolean {
  // Works regardless of whether the user chose { ok: true, value } or { tag: "ok", value } etc.
  // We inspect the object shape at runtime.
  const obj = r as Record<string, unknown>;
  return (
    ("ok" in obj && obj["ok"] === true) ||
    ("tag" in obj && obj["tag"] === "ok") ||
    ("type" in obj && obj["type"] === "ok")
  );
}

function unwrapValue<T, E>(r: Result<T, E>): T {
  const obj = r as Record<string, unknown>;
  const val = obj["value"] ?? obj["data"];
  return val as T;
}

function unwrapError<T, E>(r: Result<T, E>): E {
  const obj = r as Record<string, unknown>;
  const err = obj["error"] ?? obj["err"] ?? obj["message"];
  return err as E;
}

// -----------------------------------------------------------
// Test 1: validateEvent — valid input returns Ok
// -----------------------------------------------------------
const validResult = validateEvent(validRaws[0]);
console.assert(
  isOk(validResult),
  "TEST 1 FAILED: validateEvent should return Ok for a valid raw event",
);
const validEvent = unwrapValue<StreamEvent, string>(validResult);
console.assert(
  validEvent.kind === "view" && validEvent.value === 30,
  "TEST 1 FAILED: validated event should have kind='view' and value=30",
);
console.log("TEST 1 PASSED: validateEvent returns Ok for valid input");

// -----------------------------------------------------------
// Test 2: validateEvent — invalid inputs return Err
// -----------------------------------------------------------
let failCount = 0;
for (const raw of invalidRaws) {
  const r = validateEvent(raw);
  if (!isOk(r)) failCount++;
}
console.assert(
  failCount === invalidRaws.length,
  `TEST 2 FAILED: expected ${invalidRaws.length} failures, got ${failCount}`,
);
console.log(`TEST 2 PASSED: validateEvent correctly rejects all ${failCount} invalid events`);

// -----------------------------------------------------------
// Test 3: aggregateEvents — counts and totals per stream
// -----------------------------------------------------------
(async () => {
  const allRaws = [...validRaws, ...invalidRaws];
  const report: AggregationReport = await aggregateEvents(allRaws, noopProcessor, 2);

  // processedCount should equal validRaws.length
  console.assert(
    report.processedCount === validRaws.length,
    `TEST 3 FAILED: processedCount should be ${validRaws.length}, got ${report.processedCount}`,
  );

  // failedEvents should equal invalidRaws.length
  console.assert(
    report.failedEvents.length === invalidRaws.length,
    `TEST 3 FAILED: failedEvents length should be ${invalidRaws.length}, got ${report.failedEvents.length}`,
  );

  // stream-A: 3 events, totalValue = 30 + 1 + 5.5 = 36.5
  const streamAResult = lookupStream(report, "stream-A");
  console.assert(isOk(streamAResult), "TEST 3 FAILED: stream-A should exist in report");
  const statsA = unwrapValue(streamAResult);
  console.assert(
    (statsA as { totalValue: number }).totalValue === 36.5,
    `TEST 3 FAILED: stream-A totalValue should be 36.5, got ${(statsA as { totalValue: number }).totalValue}`,
  );

  console.log("TEST 3 PASSED: aggregateEvents produces correct counts and totals");

  // -----------------------------------------------------------
  // Test 4: aggregateEvents — per-kind event counts for stream-B
  // -----------------------------------------------------------
  const streamBResult = lookupStream(report, "stream-B");
  console.assert(isOk(streamBResult), "TEST 4 FAILED: stream-B should exist in report");
  const statsB = unwrapValue(streamBResult) as { eventCounts: Record<string, number> };
  console.assert(
    statsB.eventCounts["view"] === 1 && statsB.eventCounts["comment"] === 1,
    `TEST 4 FAILED: stream-B should have 1 view and 1 comment`,
  );
  console.log("TEST 4 PASSED: per-kind event counts are correct for stream-B");

  // -----------------------------------------------------------
  // Test 5: lookupStream — missing stream returns Err
  // -----------------------------------------------------------
  const missingResult = lookupStream(report, "stream-DOES-NOT-EXIST");
  console.assert(
    !isOk(missingResult),
    "TEST 5 FAILED: lookupStream should return Err for an unknown streamId",
  );
  const errMsg = unwrapError<unknown, string>(missingResult);
  console.assert(
    typeof errMsg === "string" && errMsg.length > 0,
    "TEST 5 FAILED: error message should be a non-empty string",
  );
  console.log("TEST 5 PASSED: lookupStream returns Err for unknown stream");
})();
