// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  createTransformMiddleware,
  createFilterMiddleware,
  createEnrichMiddleware,
  composeMiddleware,
  validateRecord,
  runPipeline,
  type PipelineRecord,
  type ProcessableRecord,
  type ValidatedRecord,
  type TransformedRecord,
  type DroppedRecord,
  type FailedRecord,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

// ── mock data ────────────────────────────────────────────────

const validRaw1 = {
  id: "rec-001",
  source: "clickstream",
  timestamp: 1_715_000_000_000,
  payload: { userId: "u1", event: "click", value: 42 },
};

const validRaw2 = {
  id: "rec-002",
  source: "purchases",
  timestamp: 1_715_000_001_000,
  payload: { userId: "u2", event: "buy", value: 99 },
};

const validRaw3 = {
  id: "rec-003",
  source: "clickstream",
  timestamp: 1_715_000_002_000,
  payload: { userId: "u3", event: "scroll", value: 0 },
};

// Missing `id` field
const invalidRaw1 = {
  source: "clickstream",
  timestamp: 1_715_000_003_000,
  payload: {},
};

// `timestamp` is a string, not a number
const invalidRaw2 = {
  id: "rec-bad",
  source: "clickstream",
  timestamp: "not-a-number",
  payload: {},
};

// ── TEST 1: validateRecord ────────────────────────────────────

const v1 = validateRecord(validRaw1);
assert(v1.stage === "validated", "TEST 1a: valid raw record → stage 'validated'");
assert(
  v1.stage === "validated" && v1.id === "rec-001",
  "TEST 1b: validated record has correct branded id"
);

const f1 = validateRecord(invalidRaw1);
assert(f1.stage === "failed", "TEST 1c: missing id → stage 'failed'");
assert(
  f1.stage === "failed" && f1.id === null,
  "TEST 1d: missing id → FailedRecord.id is null"
);

const f2 = validateRecord(invalidRaw2);
assert(f2.stage === "failed", "TEST 1e: bad timestamp → stage 'failed'");
assert(
  f2.stage === "failed" && f2.id === "rec-bad",
  "TEST 1f: bad timestamp → best-effort id extracted"
);

// ── TEST 2: composeMiddleware + transform + filter ────────────

(async () => {
  // Transform: uppercase the `event` field
  const upperEvent = createTransformMiddleware("upperEvent", (payload) => ({
    event: typeof payload["event"] === "string"
      ? payload["event"].toUpperCase()
      : payload["event"],
  }));

  // Filter: drop records with value === 0
  const dropZeroValue = createFilterMiddleware(
    (rec) => (rec.payload["value"] as number) !== 0,
    "value is zero"
  );

  // Enrich: add a `processedAt` timestamp
  const addProcessedAt = createEnrichMiddleware(async (_rec) => ({
    processedAt: "2026-05-15T00:00:00Z",
  }));

  const pipeline = composeMiddleware([upperEvent, dropZeroValue, addProcessedAt]);

  const report = await runPipeline(
    [validRaw1, validRaw2, validRaw3, invalidRaw1, invalidRaw2],
    { concurrency: 2, middleware: pipeline }
  );

  // ── TEST 2a: counts
  assert(report.totalInput === 5,  "TEST 2a: totalInput === 5");
  assert(report.validated  === 3,  "TEST 2b: validated  === 3");
  assert(report.failed     === 2,  "TEST 2c: failed     === 2");
  assert(report.dropped    === 1,  "TEST 2d: dropped    === 1 (value=0 record)");
  assert(report.transformed === 2, "TEST 2e: transformed === 2");

  // ── TEST 2b: order preserved
  const ids = report.records.map((r) =>
    r.stage !== "failed" || r.id !== null ? r.id : "__null__"
  );
  assert(
    ids[0] === "rec-001" && ids[1] === "rec-002" && ids[2] === "rec-003",
    "TEST 2f: input order preserved for first three records"
  );

  // ── TEST 2c: transform applied
  const rec1 = report.records[0];
  assert(
    rec1.stage === "transformed" && rec1.payload["event"] === "CLICK",
    "TEST 2g: event uppercased by transform middleware"
  );

  // ── TEST 2d: enrich applied
  assert(
    rec1.stage === "transformed" && rec1.payload["processedAt"] === "2026-05-15T00:00:00Z",
    "TEST 2h: processedAt added by enrich middleware"
  );

  // ── TEST 2e: mutations tracked
  assert(
    rec1.stage === "transformed" &&
      rec1.mutations.includes("upperEvent") &&
      rec1.mutations.includes("processedAt"),
    "TEST 2i: mutations array contains 'upperEvent' and 'processedAt'"
  );

  // ── TEST 2f: dropped record
  const dropped = report.records[2];
  assert(
    dropped.stage === "dropped" && dropped.reason === "value is zero",
    "TEST 2j: rec-003 dropped with correct reason"
  );

  // ── TEST 2g: duration measured
  assert(
    typeof report.durationMs === "number" && report.durationMs >= 0,
    "TEST 2k: durationMs is a non-negative number"
  );

  console.log("\nAll tests complete.");
})();
