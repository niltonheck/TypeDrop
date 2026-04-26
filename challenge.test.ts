// ============================================================
// challenge.test.ts — Typed Real-Time Metrics Aggregator
// ============================================================
import {
  validateEvent,
  MetricsAggregator,
  CounterStrategy,
  GaugeStrategy,
  HistogramStrategy,
  SummaryStrategy,
  summariseReports,
  formatReport,
  type FlushReport,
  type WindowMs,
  type StrategyRegistry,
} from "./challenge";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

const W = 5000 as WindowMs;

// ------------------------------------------------------------------
// Mock StrategyRegistry
// ------------------------------------------------------------------
const registry: StrategyRegistry = {
  counter:   () => new CounterStrategy(),
  gauge:     () => new GaugeStrategy(),
  histogram: () => new HistogramStrategy(),
  summary:   () => new SummaryStrategy(),
};

// ------------------------------------------------------------------
// TEST 1 — validateEvent rejects invalid input
// ------------------------------------------------------------------
{
  const r1 = validateEvent(null);
  assert(!r1.ok, "validateEvent rejects null");

  const r2 = validateEvent({ kind: "counter", name: 42, agentId: "a1", value: 1, timestampMs: 1000 });
  assert(!r2.ok, "validateEvent rejects non-string name");

  const r3 = validateEvent({ kind: "unknown_kind", name: "cpu", agentId: "a1", value: 1, timestampMs: 1000 });
  assert(!r3.ok, "validateEvent rejects unknown kind");

  const r4 = validateEvent({ kind: "histogram", name: "latency", agentId: "a1", buckets: "not-array", timestampMs: 1000 });
  assert(!r4.ok, "validateEvent rejects histogram with non-array buckets");
}

// ------------------------------------------------------------------
// TEST 2 — validateEvent accepts valid events
// ------------------------------------------------------------------
{
  const r1 = validateEvent({ kind: "counter", name: "requests", agentId: "agent-1", value: 5, timestampMs: 1000 });
  assert(r1.ok, "validateEvent accepts valid counter event");

  const r2 = validateEvent({ kind: "gauge", name: "cpu_usage", agentId: "agent-2", value: 72.5, timestampMs: 2000 });
  assert(r2.ok, "validateEvent accepts valid gauge event");

  const r3 = validateEvent({ kind: "histogram", name: "latency_ms", agentId: "agent-1", buckets: [10, 50, 200, 500], timestampMs: 3000 });
  assert(r3.ok, "validateEvent accepts valid histogram event");

  const r4 = validateEvent({ kind: "summary", name: "response_size", agentId: "agent-3", quantiles: [[0.5, 128], [0.99, 512]], timestampMs: 4000 });
  assert(r4.ok, "validateEvent accepts valid summary event");
}

// ------------------------------------------------------------------
// TEST 3 — CounterStrategy accumulates correctly
// ------------------------------------------------------------------
{
  const strategy = new CounterStrategy();
  const e1 = validateEvent({ kind: "counter", name: "hits", agentId: "a1", value: 3, timestampMs: 1000 });
  const e2 = validateEvent({ kind: "counter", name: "hits", agentId: "a1", value: 7, timestampMs: 2000 });

  if (e1.ok && e1.value.kind === "counter") strategy.ingest(e1.value);
  if (e2.ok && e2.value.kind === "counter") strategy.ingest(e2.value);

  const result = await strategy.flush(W);
  assert(result !== null, "CounterStrategy flush returns non-null after ingestion");
  assert(result?.totalCount === 10, `CounterStrategy totalCount should be 10, got ${result?.totalCount}`);
}

// ------------------------------------------------------------------
// TEST 4 — GaugeStrategy min/max/avg
// ------------------------------------------------------------------
{
  const strategy = new GaugeStrategy();
  for (const v of [10, 20, 30]) {
    const e = validateEvent({ kind: "gauge", name: "temp", agentId: "a2", value: v, timestampMs: Date.now() });
    if (e.ok && e.value.kind === "gauge") strategy.ingest(e.value);
  }
  const result = await strategy.flush(W);
  assert(result !== null, "GaugeStrategy flush returns non-null");
  assert(result?.min === 10, `GaugeStrategy min should be 10, got ${result?.min}`);
  assert(result?.max === 30, `GaugeStrategy max should be 30, got ${result?.max}`);
  assert(result?.avg === 20, `GaugeStrategy avg should be 20, got ${result?.avg}`);
}

// ------------------------------------------------------------------
// TEST 5 — HistogramStrategy percentiles
// ------------------------------------------------------------------
{
  const strategy = new HistogramStrategy();
  // Two events: buckets [1,3,5] and [2,4,6] → merged+sorted: [1,2,3,4,5,6]
  // p50 = index floor(0.50 * 6) = 3 → value 4
  // p95 = index floor(0.95 * 6) = 5 → value 6
  // p99 = index floor(0.99 * 6) = 5 → value 6
  const e1 = validateEvent({ kind: "histogram", name: "lat", agentId: "a1", buckets: [1, 3, 5], timestampMs: 1000 });
  const e2 = validateEvent({ kind: "histogram", name: "lat", agentId: "a1", buckets: [2, 4, 6], timestampMs: 2000 });
  if (e1.ok && e1.value.kind === "histogram") strategy.ingest(e1.value);
  if (e2.ok && e2.value.kind === "histogram") strategy.ingest(e2.value);
  const result = await strategy.flush(W);
  assert(result !== null, "HistogramStrategy flush returns non-null");
  assert(result?.p50 === 4, `HistogramStrategy p50 should be 4, got ${result?.p50}`);
  assert(result?.p95 === 6, `HistogramStrategy p95 should be 6, got ${result?.p95}`);
}

// ------------------------------------------------------------------
// TEST 6 — MetricsAggregator.ingest + flushAll
// ------------------------------------------------------------------
{
  const engine = new MetricsAggregator(registry, W);

  engine.ingest({ kind: "counter", name: "api_calls", agentId: "agent-1", value: 4, timestampMs: 1000 });
  engine.ingest({ kind: "counter", name: "api_calls", agentId: "agent-1", value: 6, timestampMs: 2000 });
  engine.ingest({ kind: "gauge",   name: "memory_mb",  agentId: "agent-2", value: 512, timestampMs: 1000 });

  const series = engine.activeSeries();
  assert(series.length === 2, `activeSeries should have 2 entries, got ${series.length}`);
  assert(series.includes("api_calls::agent-1" as ReturnType<typeof engine.activeSeries>[number]),
    "activeSeries includes api_calls::agent-1");

  const reports = await engine.flushAll();
  assert(reports.length === 2, `flushAll should return 2 reports, got ${reports.length}`);
  assert(engine.activeSeries().length === 0, "activeSeries is empty after flushAll");

  const okReports = reports.filter(r => r.status === "ok");
  assert(okReports.length === 2, "Both reports should be ok");

  const counterReport = okReports.find(r => r.status === "ok" && r.seriesKey === "api_calls::agent-1");
  assert(
    counterReport?.status === "ok" && counterReport.result.kind === "counter" && counterReport.result.totalCount === 10,
    "Counter series totalCount should be 10"
  );
}

// ------------------------------------------------------------------
// TEST 7 — summariseReports partitions correctly
// ------------------------------------------------------------------
{
  const reports: FlushReport[] = [
    { status: "ok",    seriesKey: "a::b" as FlushReport["seriesKey"], result: { kind: "counter", name: "a" as FlushReport["seriesKey"], totalCount: 1, windowMs: W } as Extract<import("./challenge").AggregationResult, { kind: "counter" }> & { name: import("./challenge").MetricName } } as Extract<FlushReport, { status: "ok" }>,
    { status: "empty", seriesKey: "c::d" as FlushReport["seriesKey"] },
    { status: "error", seriesKey: "e::f" as FlushReport["seriesKey"], reason: "timeout" },
    { status: "error", seriesKey: "g::h" as FlushReport["seriesKey"], reason: "oom" },
  ];
  const summary = summariseReports(reports);
  assert(summary.ok.length    === 1, `summariseReports: ok count should be 1, got ${summary.ok.length}`);
  assert(summary.empty.length === 1, `summariseReports: empty count should be 1, got ${summary.empty.length}`);
  assert(summary.error.length === 2, `summariseReports: error count should be 2, got ${summary.error.length}`);
}

// ------------------------------------------------------------------
// TEST 8 — formatReport produces non-empty strings exhaustively
// ------------------------------------------------------------------
{
  const okReport:    FlushReport = { status: "ok",    seriesKey: "x::y" as FlushReport["seriesKey"], result: { kind: "counter", name: "x" as import("./challenge").MetricName, totalCount: 5, windowMs: W } };
  const emptyReport: FlushReport = { status: "empty", seriesKey: "a::b" as FlushReport["seriesKey"] };
  const errorReport: FlushReport = { status: "error", seriesKey: "c::d" as FlushReport["seriesKey"], reason: "crash" };

  assert(formatReport(okReport).length > 0,    "formatReport produces output for ok");
  assert(formatReport(emptyReport).length > 0,  "formatReport produces output for empty");
  assert(formatReport(errorReport).length > 0,  "formatReport produces output for error");
  assert(formatReport(errorReport).includes("crash"), "formatReport includes error reason");
}

console.log("\nAll tests complete.");
