// ============================================================
// challenge.test.ts — Typed Real-Time Event Stream Processor
// ============================================================
import {
  parseEvent,
  runPipeline,
  buildSummary,
  processStream,
  type StreamEvent,
  type KindMiddlewareMap,
  type StreamSummary,
  type UserActionSummary,
  type SystemAlertSummary,
  type MetricSummary,
} from "./challenge";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const rawUserAction = {
  kind: "user_action",
  userId: "u1",
  action: "click",
  timestamp: 1_000,
  durationMs: 120,
};

const rawUserAction2 = {
  kind: "user_action",
  userId: "u2",
  action: "click",
  timestamp: 2_000,
  durationMs: 80,
};

const rawUserAction3 = {
  kind: "user_action",
  userId: "u1",
  action: "submit",
  timestamp: 3_000,
  durationMs: 200,
};

const rawAlert = {
  kind: "system_alert",
  alertId: "a1",
  severity: "warning",
  message: "High memory usage",
  timestamp: 1_500,
};

const rawAlertCritical = {
  kind: "system_alert",
  alertId: "a2",
  severity: "critical",
  message: "Disk full",
  timestamp: 5_000,
};

const rawMetric = {
  kind: "metric_snapshot",
  metricName: "cpu",
  value: 42,
  unit: "%",
  timestamp: 2_500,
};

const rawMetric2 = {
  kind: "metric_snapshot",
  metricName: "cpu",
  value: 78,
  unit: "%",
  timestamp: 4_000,
};

const rawMetric3 = {
  kind: "metric_snapshot",
  metricName: "memory",
  value: 60,
  unit: "%",
  timestamp: 4_500,
};

// Bad payloads
const missingKind    = { userId: "u3", action: "click", timestamp: 1, durationMs: 10 };
const unknownKind    = { kind: "payment_event", id: "x" };
const wrongTypeAlert = { kind: "system_alert", alertId: 99, severity: "info", message: "ok", timestamp: 1 };
const badSeverity    = { kind: "system_alert", alertId: "a3", severity: "extreme", message: "!", timestamp: 1 };

// ---------------------------------------------------------------------------
// Test 1 — parseEvent: valid and invalid inputs
// ---------------------------------------------------------------------------
(function testParseEvent() {
  const ok = parseEvent(rawUserAction);
  console.assert(ok.ok === true, "Test 1a FAILED: valid user_action should parse ok");
  if (ok.ok) {
    console.assert(ok.value.kind === "user_action", "Test 1b FAILED: kind should be user_action");
  }

  const errMissing = parseEvent(missingKind);
  console.assert(errMissing.ok === false, "Test 1c FAILED: missing kind should fail");
  if (!errMissing.ok) {
    console.assert(errMissing.error.code === "MISSING_FIELD", "Test 1d FAILED: code should be MISSING_FIELD");
  }

  const errUnknown = parseEvent(unknownKind);
  console.assert(errUnknown.ok === false, "Test 1e FAILED: unknown kind should fail");
  if (!errUnknown.ok) {
    console.assert(errUnknown.error.code === "UNKNOWN_KIND", "Test 1f FAILED: code should be UNKNOWN_KIND");
  }

  const errWrongType = parseEvent(wrongTypeAlert);
  console.assert(errWrongType.ok === false, "Test 1g FAILED: wrong-type field should fail");
  if (!errWrongType.ok) {
    console.assert(errWrongType.error.code === "WRONG_TYPE", "Test 1h FAILED: code should be WRONG_TYPE");
  }

  const errBadSev = parseEvent(badSeverity);
  console.assert(errBadSev.ok === false, "Test 1i FAILED: invalid severity should fail");

  console.log("Test 1 (parseEvent) done.");
})();

// ---------------------------------------------------------------------------
// Test 2 — runPipeline: middleware routing and drop
// ---------------------------------------------------------------------------
(function testRunPipeline() {
  const parsed = parseEvent(rawUserAction);
  console.assert(parsed.ok, "Test 2 setup FAILED");
  if (!parsed.ok) return;

  const event = parsed.value;

  // No middleware registered → event passes through unchanged
  const noOp: KindMiddlewareMap = {};
  const result1 = runPipeline(event, noOp);
  console.assert(result1 !== null && result1.kind === "user_action", "Test 2a FAILED: event should pass through");

  // Middleware that drops the event
  const dropMap: KindMiddlewareMap = {
    user_action: (_e, _next) => null,
  };
  const result2 = runPipeline(event, dropMap);
  console.assert(result2 === null, "Test 2b FAILED: middleware should drop the event");

  // Middleware that mutates and forwards
  const mutateMap: KindMiddlewareMap = {
    user_action: (e, next) => next({ ...e, action: "mutated" }),
  };
  const result3 = runPipeline(event, mutateMap);
  console.assert(
    result3 !== null && result3.kind === "user_action" && (result3 as { action: string }).action === "mutated",
    "Test 2c FAILED: middleware should mutate action"
  );

  console.log("Test 2 (runPipeline) done.");
})();

// ---------------------------------------------------------------------------
// Test 3 — buildSummary: aggregation correctness
// ---------------------------------------------------------------------------
(function testBuildSummary() {
  const events: StreamEvent[] = [];
  const toAdd = [rawUserAction, rawUserAction2, rawUserAction3, rawAlert, rawAlertCritical, rawMetric, rawMetric2, rawMetric3];
  for (const r of toAdd) {
    const p = parseEvent(r);
    if (p.ok) events.push(p.value);
  }

  const summary = buildSummary(events) as {
    user_action: UserActionSummary;
    system_alert: SystemAlertSummary;
    metric_snapshot: MetricSummary;
  };

  // user_action checks
  console.assert(summary.user_action.totalEvents === 3, "Test 3a FAILED: expected 3 user_action events");
  console.assert(summary.user_action.uniqueUsers.size === 2, "Test 3b FAILED: expected 2 unique users");
  console.assert(summary.user_action.actionCounts["click"] === 2, "Test 3c FAILED: expected 2 clicks");
  const expectedAvg = (120 + 80 + 200) / 3;
  console.assert(
    Math.abs(summary.user_action.avgDurationMs - expectedAvg) < 0.01,
    `Test 3d FAILED: expected avgDurationMs ${expectedAvg}, got ${summary.user_action.avgDurationMs}`
  );

  // system_alert checks
  console.assert(summary.system_alert.totalEvents === 2, "Test 3e FAILED: expected 2 alerts");
  console.assert(summary.system_alert.bySeverity["warning"] === 1, "Test 3f FAILED: expected 1 warning");
  console.assert(summary.system_alert.bySeverity["critical"] === 1, "Test 3g FAILED: expected 1 critical");
  console.assert(summary.system_alert.mostRecentMessage === "Disk full", "Test 3h FAILED: most recent message should be 'Disk full'");

  // metric_snapshot checks
  console.assert(summary.metric_snapshot.totalSnapshots === 3, "Test 3i FAILED: expected 3 snapshots");
  console.assert(summary.metric_snapshot.byMetric["cpu"].min === 42, "Test 3j FAILED: cpu min should be 42");
  console.assert(summary.metric_snapshot.byMetric["cpu"].max === 78, "Test 3k FAILED: cpu max should be 78");
  console.assert(
    Math.abs(summary.metric_snapshot.byMetric["cpu"].avg - 60) < 0.01,
    "Test 3l FAILED: cpu avg should be 60"
  );
  console.assert(summary.metric_snapshot.byMetric["memory"].avg === 60, "Test 3m FAILED: memory avg should be 60");

  console.log("Test 3 (buildSummary) done.");
})();

// ---------------------------------------------------------------------------
// Test 4 — processStream: end-to-end with errors and middleware
// ---------------------------------------------------------------------------
(function testProcessStream() {
  const rawPayloads: unknown[] = [
    rawUserAction,
    rawUserAction2,
    rawAlert,
    rawMetric,
    missingKind,       // parse error
    unknownKind,       // parse error
    rawAlertCritical,
  ];

  // Drop all system_alert events via middleware
  const middlewareMap: KindMiddlewareMap = {
    system_alert: (_e, _next) => null,
  };

  const { summary, parseErrors } = processStream(rawPayloads, middlewareMap);

  console.assert(parseErrors.length === 2, `Test 4a FAILED: expected 2 parse errors, got ${parseErrors.length}`);

  const s = summary as {
    user_action: UserActionSummary;
    system_alert: SystemAlertSummary;
    metric_snapshot: MetricSummary;
  };

  // Alerts were dropped by middleware → totalEvents should be 0
  console.assert(s.system_alert.totalEvents === 0, "Test 4b FAILED: all alerts should have been dropped");
  console.assert(s.user_action.totalEvents === 2, `Test 4c FAILED: expected 2 user_action events, got ${s.user_action.totalEvents}`);
  console.assert(s.metric_snapshot.totalSnapshots === 1, "Test 4d FAILED: expected 1 metric snapshot");

  console.log("Test 4 (processStream) done.");
})();
