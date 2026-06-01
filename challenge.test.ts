// ============================================================
// challenge.test.ts — Typed Real-Time Event Stream Aggregator
// ============================================================
import {
  parseEvent,
  createDeduplicator,
  aggregateStream,
  type TelemetryEvent,
  type DeduplicationConfig,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ── Mock raw events ──────────────────────────────────────────
const RAW_METRIC = {
  id: "ev-001", sourceId: "srv-alpha", kind: "metric", timestamp: 1_000,
  payload: { metricName: "cpu_usage", value: 72.5, unit: "%" },
};
const RAW_LOG = {
  id: "ev-002", sourceId: "srv-alpha", kind: "log", timestamp: 1_500,
  payload: { level: "warn", message: "High memory pressure" },
};
const RAW_ALERT = {
  id: "ev-003", sourceId: "srv-beta", kind: "alert", timestamp: 2_000,
  payload: { severity: "high", code: "MEM_OVERFLOW", description: "OOM imminent" },
};
const RAW_METRIC_DUP = { ...RAW_METRIC, timestamp: 1_100 }; // same id, within window
const RAW_INVALID_1 = { id: 99, sourceId: "srv-x", kind: "metric", timestamp: 3_000, payload: {} };
const RAW_INVALID_2 = { id: "ev-004", sourceId: "srv-x", kind: "unknown_kind", timestamp: 3_000, payload: {} };
const RAW_METRIC_2 = {
  id: "ev-005", sourceId: "srv-alpha", kind: "metric", timestamp: 3_000,
  payload: { metricName: "cpu_usage", value: 90.0, unit: "%" },
};

// ── Test 1: parseEvent — valid events ────────────────────────
console.log("\nTest 1: parseEvent — valid events");
const parsedMetric = parseEvent(RAW_METRIC);
assert(parsedMetric !== null, "RAW_METRIC should parse successfully");
assert(parsedMetric?.kind === "metric", "parsed kind should be 'metric'");
assert((parsedMetric as Extract<TelemetryEvent, { kind: "metric" }>)?.payload?.value === 72.5,
  "metric payload value should be 72.5");

// ── Test 2: parseEvent — invalid events ──────────────────────
console.log("\nTest 2: parseEvent — invalid events");
assert(parseEvent(RAW_INVALID_1) === null, "non-string id should return null");
assert(parseEvent(RAW_INVALID_2) === null, "unknown kind should return null");
assert(parseEvent(null) === null, "null input should return null");
assert(parseEvent("not-an-object") === null, "string input should return null");

// ── Test 3: createDeduplicator ────────────────────────────────
console.log("\nTest 3: createDeduplicator");
const dedupConfig: DeduplicationConfig = { windowMs: 5_000, maxSeen: 100 };
const dedup = createDeduplicator(dedupConfig);
const ev1 = parseEvent(RAW_METRIC)!;
const ev2 = parseEvent(RAW_METRIC_DUP)!; // same id, timestamp 1_100 (within 5s of 1_000)
assert(!dedup.isSeen(ev1), "first occurrence should NOT be seen");
assert(dedup.isSeen(ev2), "duplicate id within window SHOULD be seen");

// ── Test 4: aggregateStream — counts & accumulators ──────────
console.log("\nTest 4: aggregateStream — counts & accumulators");
const rawStream: unknown[] = [
  RAW_METRIC,       // valid  — srv-alpha metric
  RAW_LOG,          // valid  — srv-alpha log
  RAW_ALERT,        // valid  — srv-beta  alert
  RAW_METRIC_DUP,   // dup    — dropped
  RAW_INVALID_1,    // invalid — dropped
  RAW_METRIC_2,     // valid  — srv-alpha metric
];
const report = aggregateStream(rawStream, { windowMs: 5_000, maxSeen: 100 });

assert(report.totalIngested === 4, `totalIngested should be 4, got ${report.totalIngested}`);
assert(report.totalDropped  === 2, `totalDropped should be 2, got ${report.totalDropped}`);
assert(report.sources.size  === 2, `sources map should have 2 entries, got ${report.sources.size}`);

// ── Test 5: per-source accumulator correctness ───────────────
console.log("\nTest 5: per-source accumulator correctness");
const alphaReport = report.sources.get("srv-alpha" as ReturnType<typeof String>);
// Note: SourceId is branded — the test accesses via the Map; cast is unavoidable in test code.
const alpha = [...report.sources.values()].find(s => (s.sourceId as string) === "srv-alpha");
const beta  = [...report.sources.values()].find(s => (s.sourceId as string) === "srv-beta");

assert(alpha !== undefined, "srv-alpha should have a report");
assert(alpha?.eventCounts["metric"] === 2, `srv-alpha metric count should be 2, got ${alpha?.eventCounts["metric"]}`);
assert(alpha?.eventCounts["log"]    === 1, `srv-alpha log count should be 1`);
assert(alpha?.accumulators["metric"].count === 2, "srv-alpha metric accumulator count should be 2");
assert(alpha?.accumulators["metric"].sum   === 162.5, `srv-alpha metric sum should be 162.5, got ${alpha?.accumulators["metric"].sum}`);
assert(alpha?.accumulators["metric"].min   === 72.5,  "srv-alpha metric min should be 72.5");
assert(alpha?.accumulators["metric"].max   === 90.0,  "srv-alpha metric max should be 90.0");
assert(beta?.eventCounts["alert"]   === 1, "srv-beta alert count should be 1");
assert(beta?.accumulators["alert"].high === 1, "srv-beta high alert count should be 1");

console.log("\nAll tests complete.");
