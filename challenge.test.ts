// ============================================================
// Typed Streaming ETL Pipeline — challenge.test.ts
// ============================================================
import {
  runPipeline,
  validateEvent,
  runMiddlewares,
  makeEventId,
  makeTopicName,
  makeSourceId,
  ok,
  err,
  type PipelineConfig,
  type TopicName,
  type Middleware,
  type TransformedEvent,
  type PipelineError,
  type Result,
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

function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok;
}

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const TOPIC_CLICKS  = "clicks"  as TopicName;
const TOPIC_ORDERS  = "orders"  as TopicName;

const rawBatch: unknown[] = [
  // Valid click event
  { id: "evt-001", source: "web-app", topic: "clicks",  payload: { button: "buy" },    timestamp: 1715000000000 },
  // Valid order event
  { id: "evt-002", source: "mobile",  topic: "orders",  payload: { sku: "ABC-99" },     timestamp: 1715000001000 },
  // Invalid — missing id
  { source: "api", topic: "clicks", payload: {}, timestamp: 1715000002000 },
  // Invalid — timestamp is a string
  { id: "evt-004", source: "web-app", topic: "clicks", payload: {}, timestamp: "bad" },
  // Valid click event for concurrency test
  { id: "evt-005", source: "web-app", topic: "clicks",  payload: { button: "share" },  timestamp: 1715000003000 },
  // Valid event with unknown topic (no sink registered)
  { id: "evt-006", source: "iot",     topic: "sensors", payload: { temp: 22.5 },        timestamp: 1715000004000 },
];

// ------------------------------------------------------------------
// Middlewares
// ------------------------------------------------------------------

const addProcessingMeta: Middleware<Record<string, unknown>, Record<string, unknown>> = async (event) => {
  return ok({ ...event, payload: { ...event.payload, _pipeline: "v2" } });
};

const rejectEmptyPayload: Middleware<Record<string, unknown>, Record<string, unknown>> = async (event) => {
  if (Object.keys(event.payload).length === 0) {
    return err<PipelineError>({ kind: "TransformError", stage: "rejectEmptyPayload", message: "Payload must not be empty" });
  }
  return ok(event);
};

// ------------------------------------------------------------------
// Sinks (only clicks + orders registered)
// ------------------------------------------------------------------

const clicksSink: Record<string, number> = {};
const ordersSink: Record<string, number> = {};

const sinks = {
  [TOPIC_CLICKS]: async (event: TransformedEvent<Record<string, unknown>>) => {
    clicksSink[event.id] = (clicksSink[event.id] ?? 0) + 1;
    return ok(undefined as void);
  },
  [TOPIC_ORDERS]: async (event: TransformedEvent<Record<string, unknown>>) => {
    ordersSink[event.id] = (ordersSink[event.id] ?? 0) + 1;
    return ok(undefined as void);
  },
} as const;

const config: PipelineConfig<typeof TOPIC_CLICKS | typeof TOPIC_ORDERS> = {
  concurrencyLimit: 2,
  middlewares: [addProcessingMeta, rejectEmptyPayload],
  sinks,
};

// ------------------------------------------------------------------
// TEST 1 — validateEvent rejects missing id
// ------------------------------------------------------------------
(function testValidationRejectsMissingId() {
  const result = validateEvent({ source: "api", topic: "clicks", payload: {}, timestamp: 123 });
  assert(!result.ok, "validateEvent: rejects event with missing id");
  if (!result.ok) {
    assert(result.error.kind === "ValidationError", "validateEvent: error kind is ValidationError for missing id");
  }
})();

// ------------------------------------------------------------------
// TEST 2 — validateEvent rejects bad timestamp
// ------------------------------------------------------------------
(function testValidationRejectsBadTimestamp() {
  const result = validateEvent({ id: "x", source: "s", topic: "t", payload: {}, timestamp: "not-a-number" });
  assert(!result.ok, "validateEvent: rejects non-numeric timestamp");
  if (!result.ok) {
    assert(result.error.kind === "ValidationError", "validateEvent: error kind is ValidationError for bad timestamp");
  }
})();

// ------------------------------------------------------------------
// TEST 3 — validateEvent accepts a well-formed event
// ------------------------------------------------------------------
(function testValidationAcceptsGoodEvent() {
  const result = validateEvent({ id: "e1", source: "s1", topic: "clicks", payload: { a: 1 }, timestamp: 9999 });
  assert(result.ok, "validateEvent: accepts a well-formed event");
  if (result.ok) {
    assert(result.value.topic === "clicks", "validateEvent: preserves topic value");
  }
})();

// ------------------------------------------------------------------
// TEST 4 — runMiddlewares short-circuits on TransformError
// ------------------------------------------------------------------
(async function testMiddlewareShortCircuit() {
  const validated = validateEvent({ id: "e2", source: "s2", topic: "clicks", payload: {}, timestamp: 1000 });
  if (!validated.ok) { assert(false, "middleware test: validated unexpectedly failed"); return; }

  // rejectEmptyPayload will fire first (after addProcessingMeta adds _pipeline key)
  // BUT addProcessingMeta adds _pipeline, so payload won't be empty after it runs.
  // Let's use a middleware that always errors to test short-circuit.
  const alwaysFail: Middleware<Record<string, unknown>, Record<string, unknown>> = async (_e) =>
    err<PipelineError>({ kind: "TransformError", stage: "alwaysFail", message: "forced" });

  const neverRun: Middleware<Record<string, unknown>, Record<string, unknown>> = async (e) => {
    assert(false, "middleware short-circuit: neverRun middleware should not have been called");
    return ok(e);
  };

  const result = await runMiddlewares(validated.value, [alwaysFail, neverRun]);
  assert(!result.ok, "runMiddlewares: short-circuits on first error");
  if (!result.ok) {
    assert(result.error.kind === "TransformError", "runMiddlewares: propagates TransformError kind");
  }
})();

// ------------------------------------------------------------------
// TEST 5 — Full pipeline report
// ------------------------------------------------------------------
(async function testFullPipeline() {
  const report = await runPipeline(rawBatch, config);

  assert(report.totalReceived === rawBatch.length, `runPipeline: totalReceived === ${rawBatch.length}`);

  // 2 invalid (missing id, bad timestamp) → failed at validation
  // evt-006 has no sink → failed at sink
  // evt-001, evt-002, evt-005 → success
  // Note: rejectEmptyPayload runs AFTER addProcessingMeta which adds _pipeline key,
  //       so no events are rejected by that middleware.
  assert(report.totalSucceeded === 3, "runPipeline: 3 events succeed end-to-end");
  assert(report.totalFailed    === 3, "runPipeline: 3 events fail (2 validation + 1 no-sink)");
  assert(report.totalReceived === report.totalSucceeded + report.totalFailed,
    "runPipeline: totalReceived = totalSucceeded + totalFailed");

  assert(typeof report.byTopic["clicks"] === "number" && report.byTopic["clicks"] === 2,
    "runPipeline: byTopic.clicks === 2");
  assert(typeof report.byTopic["orders"] === "number" && report.byTopic["orders"] === 1,
    "runPipeline: byTopic.orders === 1");

  // Concurrency limit respected — sinks should each have been called exactly once per event
  assert(clicksSink["evt-001"] === 1, "fanOutToSinks: clicks sink called once for evt-001");
  assert(ordersSink["evt-002"] === 1, "fanOutToSinks: orders sink called once for evt-002");
})();
