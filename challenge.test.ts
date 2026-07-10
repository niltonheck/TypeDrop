// ============================================================
// challenge.test.ts  —  run with:  npx ts-node challenge.test.ts
// ============================================================
import {
  parseEvent,
  getBucketKey,
  aggregateEvents,
  groupBy,
  type MonitoringEvent,
  type AggregationResult,
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

// ── Mock Data ────────────────────────────────────────────────

const BASE_MS = new Date("2026-07-10T12:00:00.000Z").getTime(); // 1_752_148_800_000
const WINDOW  = 60_000; // 1-minute buckets

// Window 0 → 12:00:00 – 12:00:59
const raw_error: unknown = {
  id: "e1",
  category: "error",
  source: "auth-service",
  timestampMs: BASE_MS + 5_000,   // 12:00:05
  severity: "high",
  message: "Token validation failed",
};

const raw_warning: unknown = {
  id: "w1",
  category: "warning",
  source: "auth-service",
  timestampMs: BASE_MS + 30_000,  // 12:00:30
  severity: "low",
  message: "Rate limit approaching",
};

const raw_metric_a: unknown = {
  id: "m1",
  category: "metric",
  source: "billing-service",
  timestampMs: BASE_MS + 45_000,  // 12:00:45
  metricName: "request_duration_ms",
  value: 120,
};

// Window 1 → 12:01:00 – 12:01:59
const raw_metric_b: unknown = {
  id: "m2",
  category: "metric",
  source: "billing-service",
  timestampMs: BASE_MS + 60_000,  // 12:01:00
  metricName: "request_duration_ms",
  value: 200,
};

const raw_info: unknown = {
  id: "i1",
  category: "info",
  source: "deploy-agent",
  timestampMs: BASE_MS + 90_000,  // 12:01:30
  description: "Deployment v2.3.1 completed",
};

// Invalid payloads
const raw_missing_severity: unknown = {
  id: "bad1",
  category: "error",
  source: "x",
  timestampMs: BASE_MS,
  // severity missing!
  message: "oops",
};

const raw_wrong_category: unknown = {
  id: "bad2",
  category: "CRITICAL", // not a valid EventCategory
  source: "x",
  timestampMs: BASE_MS,
};

const raw_not_object: unknown = "just a string";

// ── Test 1: parseEvent ───────────────────────────────────────
console.log("\n── Test 1: parseEvent ──");

const parsed = parseEvent(raw_error);
assert(parsed !== null, "valid error event parses successfully");
assert(parsed?.category === "error", "parsed category is 'error'");
assert(
  parsed !== null && "severity" in parsed && parsed.severity === "high",
  "parsed severity is 'high'"
);

assert(parseEvent(raw_missing_severity) === null, "missing severity → null");
assert(parseEvent(raw_wrong_category) === null, "invalid category → null");
assert(parseEvent(raw_not_object) === null, "non-object → null");

const parsedInfo = parseEvent(raw_info);
assert(parsedInfo !== null, "valid info event parses successfully");
assert(
  parsedInfo !== null && "description" in parsedInfo,
  "info event has description field"
);

// ── Test 2: getBucketKey ─────────────────────────────────────
console.log("\n── Test 2: getBucketKey ──");

const key0 = getBucketKey(BASE_MS + 5_000, WINDOW);
const key1 = getBucketKey(BASE_MS + 60_000, WINDOW);

assert(key0 === "2026-07-10T12:00:00.000Z", `bucket key for +5s is ${key0}`);
assert(key1 === "2026-07-10T12:01:00.000Z", `bucket key for +60s is ${key1}`);
assert(
  getBucketKey(BASE_MS + 59_999, WINDOW) === key0,
  "timestamp 1ms before boundary stays in window 0"
);

// ── Test 3: aggregateEvents ──────────────────────────────────
console.log("\n── Test 3: aggregateEvents ──");

const allRaw: unknown[] = [
  raw_error,
  raw_warning,
  raw_metric_a,
  raw_metric_b,
  raw_info,
  raw_missing_severity,   // invalid
  raw_wrong_category,     // invalid
  raw_not_object,         // invalid
];

const result: AggregationResult = aggregateEvents(allRaw, WINDOW);

assert(result.validCount === 5, `validCount should be 5, got ${result.validCount}`);
assert(result.invalidCount === 3, `invalidCount should be 3, got ${result.invalidCount}`);
assert(result.windows.length === 2, `should produce 2 windows, got ${result.windows.length}`);

const win0 = result.windows[0];
const win1 = result.windows[1];

assert(
  win0?.windowStart === "2026-07-10T12:00:00.000Z",
  `window[0] start = ${win0?.windowStart}`
);
assert(win0?.totalEvents === 3, `window[0] totalEvents = ${win0?.totalEvents}`);
assert(win0?.categoryCounts.error === 1, "window[0] has 1 error");
assert(win0?.categoryCounts.warning === 1, "window[0] has 1 warning");
assert(win0?.categoryCounts.metric === 1, "window[0] has 1 metric");
assert(win0?.categoryCounts.info === 0, "window[0] has 0 info");
assert(win0?.severityCounts.high === 1, "window[0] severity.high = 1");
assert(win0?.severityCounts.low === 1, "window[0] severity.low = 1");
assert(win0?.severityCounts.critical === 0, "window[0] severity.critical = 0");

const stats0 = win0?.metricStats["request_duration_ms"];
assert(stats0?.count === 1, `win0 metric count = ${stats0?.count}`);
assert(stats0?.sum === 120, `win0 metric sum = ${stats0?.sum}`);
assert(stats0?.min === 120 && stats0?.max === 120, "win0 metric min/max = 120");

assert(
  JSON.stringify(win0?.sources.slice().sort()) ===
    JSON.stringify(["auth-service", "billing-service"]),
  "window[0] sources are auth-service and billing-service"
);

assert(win1?.totalEvents === 2, `window[1] totalEvents = ${win1?.totalEvents}`);
assert(win1?.categoryCounts.info === 1, "window[1] has 1 info");
const stats1 = win1?.metricStats["request_duration_ms"];
assert(stats1?.value === undefined, "MetricStats has no 'value' field");
assert(stats1?.sum === 200, `win1 metric sum = ${stats1?.sum}`);

// ── Test 4: groupBy helper ───────────────────────────────────
console.log("\n── Test 4: groupBy ──");

const events: MonitoringEvent[] = [
  parseEvent(raw_error)!,
  parseEvent(raw_warning)!,
  parseEvent(raw_metric_a)!,
];

const grouped = groupBy(events, (e) => e.category);
assert(grouped.get("error")?.length === 1, "groupBy: 1 error event");
assert(grouped.get("warning")?.length === 1, "groupBy: 1 warning event");
assert(grouped.get("metric")?.length === 1, "groupBy: 1 metric event");
assert(grouped.get("info") === undefined, "groupBy: no info key when none present");

console.log("\nAll tests complete.\n");
