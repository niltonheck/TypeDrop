// challenge.test.ts — run with: npx ts-node --project tsconfig.json challenge.test.ts
import {
  makeServiceId,
  parsePlugin,
  makeFilterPlugin,
  enrichPlugin,
  buildPipeline,
  aggregateLogs,
  runPipelineWithResult,
  type RawLogEntry,
  type LogEntry,
  type ServiceSummary,
  type Result,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------
const svcA = makeServiceId("auth-service");
const svcB = makeServiceId("payment-service");

const rawEntries: RawLogEntry[] = [
  {
    id: "1",
    serviceId: svcA,
    timestamp: 1_000,
    level: "info",
    message: "User logged in",
    meta: {},
  },
  {
    id: "2",
    serviceId: svcA,
    timestamp: 2_000,
    level: "warn",
    message: "Token expiring soon",
    meta: { warnCode: "TOKEN_EXPIRY" },
  },
  {
    id: "3",
    serviceId: svcA,
    timestamp: 3_000,
    level: "error",
    message: "DB connection failed",
    meta: { errorCode: "DB_CONN", stack: "Error: ...\n  at connect()" },
  },
  {
    id: "4",
    serviceId: svcB,
    timestamp: 4_000,
    level: "fatal",
    message: "Payment gateway unreachable",
    meta: {
      errorCode: "GW_UNREACHABLE",
      stack: "Error: timeout",
      affectedServiceIds: "auth-service,payment-service,invalid svc",
    },
  },
  {
    id: "5",
    serviceId: svcB,
    timestamp: 5_000,
    level: "debug",
    message: "Polling heartbeat",
    meta: {},
  },
  {
    id: "6",
    serviceId: svcA,
    timestamp: 6_000,
    level: "error",
    message: "Auth token invalid",
    meta: { errorCode: "AUTH_TOKEN", stack: "Error: invalid" },
  },
];

// -----------------------------------------------------------
// Helper
// -----------------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// -----------------------------------------------------------
// Tests
// -----------------------------------------------------------
(async () => {
  // ── TEST 1: parsePlugin produces correct discriminated variants ──
  const parsed = await parsePlugin.process(rawEntries);

  const warnEntry = parsed.find((e) => e.id === "2");
  assert(
    warnEntry !== undefined &&
      warnEntry.level === "warn" &&
      "warnCode" in warnEntry &&
      (warnEntry as Extract<LogEntry, { level: "warn" }>).warnCode ===
        "TOKEN_EXPIRY",
    "parsePlugin: warn entry has correct warnCode"
  );

  const fatalEntry = parsed.find((e) => e.id === "4");
  assert(
    fatalEntry !== undefined &&
      fatalEntry.level === "fatal" &&
      "affectedServiceIds" in fatalEntry &&
      (fatalEntry as Extract<LogEntry, { level: "fatal" }>).affectedServiceIds
        .length === 2, // "invalid svc" should be skipped
    "parsePlugin: fatal entry has 2 valid affectedServiceIds (invalid one skipped)"
  );

  // ── TEST 2: filterPlugin keeps only specified levels ──
  const filterWarnError = makeFilterPlugin(new Set(["warn", "error"]));
  const filtered = await filterWarnError.process(parsed);
  assert(
    filtered.every((e) => e.level === "warn" || e.level === "error"),
    "filterPlugin: only warn/error entries pass through"
  );
  assert(
    filtered.length === 3, // entries 2, 3, 6
    "filterPlugin: correct count (3 warn+error entries)"
  );

  // ── TEST 3: enrichPlugin stamps processedAt on every entry ──
  const enriched = await enrichPlugin.process(parsed);
  assert(
    enriched.every(
      (e) =>
        typeof e.meta["processedAt"] === "string" &&
        e.meta["processedAt"].length > 0
    ),
    "enrichPlugin: every entry has a non-empty processedAt meta key"
  );
  // originals must be unmodified
  assert(
    parsed.every((e) => e.meta["processedAt"] === undefined),
    "enrichPlugin: original entries are not mutated"
  );

  // ── TEST 4: buildPipeline + aggregateLogs end-to-end ──
  const pipeline = buildPipeline(parsePlugin, enrichPlugin);
  const result = await runPipelineWithResult(pipeline, rawEntries);

  assert(result.ok === true, "runPipelineWithResult: pipeline succeeds");

  if (result.ok) {
    const summaries: Map<string, ServiceSummary> = aggregateLogs(result.value);

    const authSummary = summaries.get(svcA);
    assert(
      authSummary !== undefined &&
        authSummary.counts.info === 1 &&
        authSummary.counts.warn === 1 &&
        authSummary.counts.error === 2 &&
        authSummary.counts.debug === 0 &&
        authSummary.counts.fatal === 0,
      "aggregateLogs: auth-service level counts are correct"
    );

    assert(
      authSummary !== undefined && authSummary.status === "critical",
      "aggregateLogs: auth-service status is 'critical' (has errors, no fatals)"
    );

    const paymentSummary = summaries.get(svcB);
    assert(
      paymentSummary !== undefined &&
        paymentSummary.status === "down" &&
        paymentSummary.topErrors.length === 1 &&
        paymentSummary.topErrors[0] === "Payment gateway unreachable",
      "aggregateLogs: payment-service status is 'down' with correct topErrors"
    );
  }

  // ── TEST 5: runPipelineWithResult captures thrown errors ──
  const badPlugin = {
    name: "bad",
    async process(_entries: RawLogEntry[]): Promise<RawLogEntry[]> {
      throw new Error("Simulated plugin failure");
    },
  };
  const badPipeline = buildPipeline(badPlugin);
  const failResult = await runPipelineWithResult(badPipeline, rawEntries);
  assert(
    failResult.ok === false &&
      failResult.error.message === "Simulated plugin failure",
    "runPipelineWithResult: captures plugin error as Result { ok: false }"
  );
})();
