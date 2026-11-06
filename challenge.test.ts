// challenge.test.ts
import {
  validateEvent,
  assignWindow,
  groupByWindow,
  aggregate,
  processEventStream,
  type MetricAggregationConfig,
  type TelemetryEvent,
  type RollupRecord,
  type ValidationResult,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const WINDOW = 60_000; // 1-minute windows

const raw = [
  // valid — window 0 (0–60000), service "api"
  { serviceId: "api", metric: "cpu_usage",       value: 42,  timestampMs: 5_000,  aggregation: "avg"   },
  { serviceId: "api", metric: "cpu_usage",       value: 58,  timestampMs: 30_000, aggregation: "avg"   },
  { serviceId: "api", metric: "request_latency", value: 120, timestampMs: 15_000, aggregation: "avg"   },

  // valid — window 0, service "db"
  { serviceId: "db",  metric: "memory_usage",    value: 70,  timestampMs: 45_000, aggregation: "max"   },
  { serviceId: "db",  metric: "memory_usage",    value: 85,  timestampMs: 55_000, aggregation: "max"   },

  // valid — window 1 (60000–120000), service "api"
  { serviceId: "api", metric: "error_rate",      value: 0.05, timestampMs: 65_000, aggregation: "sum"  },
  { serviceId: "api", metric: "error_rate",      value: 0.02, timestampMs: 90_000, aggregation: "sum"  },

  // invalid entries
  { serviceId: "",    metric: "cpu_usage",       value: 10,  timestampMs: 1_000,  aggregation: "avg"   }, // empty serviceId
  { serviceId: "api", metric: "disk_io",         value: 10,  timestampMs: 1_000,  aggregation: "avg"   }, // unknown metric
  { serviceId: "api", metric: "cpu_usage",       value: NaN, timestampMs: 1_000,  aggregation: "avg"   }, // non-finite value
  null,                                                                                                     // not an object
];

const config: MetricAggregationConfig = {
  cpu_usage:       "avg",
  memory_usage:    "max",
  request_latency: "avg",
  error_rate:      "sum",
  throughput:      "sum",
};

// ------------------------------------------------------------------
// Test 1 — validateEvent rejects invalid inputs
// ------------------------------------------------------------------
const badServiceId = validateEvent({ serviceId: "", metric: "cpu_usage", value: 10, timestampMs: 1000, aggregation: "avg" });
console.assert(!badServiceId.ok, "TEST 1a FAILED: empty serviceId should be rejected");

const badMetric = validateEvent({ serviceId: "api", metric: "disk_io", value: 10, timestampMs: 1000, aggregation: "avg" });
console.assert(!badMetric.ok, "TEST 1b FAILED: unknown metric should be rejected");

const goodEvent = validateEvent({ serviceId: "api", metric: "cpu_usage", value: 42, timestampMs: 5000, aggregation: "avg" });
console.assert(goodEvent.ok, "TEST 1c FAILED: valid event should pass validation");

// ------------------------------------------------------------------
// Test 2 — assignWindow buckets correctly
// ------------------------------------------------------------------
const win = assignWindow(75_000, WINDOW);
console.assert(win.startMs === 60_000 && win.endMs === 120_000,
  `TEST 2 FAILED: expected {60000, 120000} got {${win.startMs}, ${win.endMs}}`);

// ------------------------------------------------------------------
// Test 3 — aggregate computes correctly
// ------------------------------------------------------------------
console.assert(aggregate([10, 20, 30], "sum") === 60,   "TEST 3a FAILED: sum");
console.assert(aggregate([10, 20, 30], "avg") === 20,   "TEST 3b FAILED: avg");
console.assert(aggregate([10, 20, 30], "min") === 10,   "TEST 3c FAILED: min");
console.assert(aggregate([10, 20, 30], "max") === 30,   "TEST 3d FAILED: max");
console.assert(aggregate([10, 20, 30], "count") === 3,  "TEST 3e FAILED: count");

// ------------------------------------------------------------------
// Test 4 — processEventStream produces correct rollup count & rejects
// ------------------------------------------------------------------
const { rollups, rejected } = processEventStream(raw, WINDOW, config);

// 4 invalid inputs → 4 rejections
console.assert(rejected.length === 4,
  `TEST 4a FAILED: expected 4 rejected, got ${rejected.length}`);

// Expect rollups for:
//   window0 × api  × cpu_usage       (avg of 42, 58 → 50)
//   window0 × api  × request_latency (avg of 120 → 120)
//   window0 × db   × memory_usage    (max of 70, 85 → 85)
//   window1 × api  × error_rate      (sum of 0.05, 0.02 → 0.07)
console.assert(rollups.length === 4,
  `TEST 4b FAILED: expected 4 rollups, got ${rollups.length}`);

const cpuRollup = rollups.find(
  r => r.metric === "cpu_usage" && r.serviceId === "api"
);
console.assert(cpuRollup !== undefined && Math.abs(cpuRollup.result - 50) < 0.001,
  `TEST 4c FAILED: cpu_usage avg should be 50, got ${cpuRollup?.result}`);

const memRollup = rollups.find(
  r => r.metric === "memory_usage" && r.serviceId === "db"
);
console.assert(memRollup !== undefined && memRollup.result === 85,
  `TEST 4d FAILED: memory_usage max should be 85, got ${memRollup?.result}`);

console.log("All tests passed! ✅");
