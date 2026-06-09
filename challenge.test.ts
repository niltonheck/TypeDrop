// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parseJobDefinition,
  runScheduler,
  defaultHandlers,
  type JobDefinition,
  type Result,
  type SchedulerReport,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

function isOk<T, E>(r: Result<T, E>): r is Extract<Result<T, E>, { ok: true }> {
  return r.ok === true;
}

// ── mock data ────────────────────────────────────────────────
const validHttp: unknown = {
  id: "job-1",
  kind: "http",
  priority: "critical",
  url: "https://api.example.com/data",
  method: "GET",
  timeoutMs: 100,
};

const validCompute: unknown = {
  id: "job-2",
  kind: "compute",
  priority: "normal",
  fn: "processData",
  args: [1, 2, 3],
};

const validNotification: unknown = {
  id: "job-3",
  kind: "notification",
  priority: "low",
  channel: "email",
  recipient: "user@example.com",
  message: "Your report is ready.",
};

const invalidMissingKind: unknown = {
  id: "job-bad-1",
  priority: "high",
  // kind is missing
};

const invalidBadPriority: unknown = {
  id: "job-bad-2",
  kind: "http",
  priority: "urgent", // not a valid Priority
  url: "https://example.com",
  method: "GET",
  timeoutMs: 200,
};

const invalidHttpMethod: unknown = {
  id: "job-bad-3",
  kind: "http",
  priority: "high",
  url: "https://example.com",
  method: "PATCH", // not allowed
  timeoutMs: 200,
};

// ── Test 1: parseJobDefinition — valid jobs ───────────────────
const r1 = parseJobDefinition(validHttp);
assert(isOk(r1), "parseJobDefinition accepts a valid http job");
if (isOk(r1)) {
  const job = r1.value;
  assert(job.kind === "http" && job.id === "job-1" && job.priority === "critical",
    "Parsed http job has correct fields");
}

const r2 = parseJobDefinition(validCompute);
assert(isOk(r2), "parseJobDefinition accepts a valid compute job");

const r3 = parseJobDefinition(validNotification);
assert(isOk(r3), "parseJobDefinition accepts a valid notification job");

// ── Test 2: parseJobDefinition — invalid jobs ─────────────────
const r4 = parseJobDefinition(invalidMissingKind);
assert(!r4.ok, "parseJobDefinition rejects job with missing kind");

const r5 = parseJobDefinition(invalidBadPriority);
assert(!r5.ok, "parseJobDefinition rejects job with invalid priority");

const r6 = parseJobDefinition(invalidHttpMethod);
assert(!r6.ok, "parseJobDefinition rejects http job with invalid method");

const r7 = parseJobDefinition(null);
assert(!r7.ok, "parseJobDefinition rejects null input");

// ── Test 3: runScheduler — basic report shape ─────────────────
const rawJobs: unknown[] = [
  validHttp,
  validCompute,
  validNotification,
  invalidMissingKind,   // should be rejected at parse
  invalidBadPriority,   // should be rejected at parse
];

runScheduler(rawJobs, { concurrency: 2, handlers: defaultHandlers }).then(
  (report: SchedulerReport) => {
    assert(report.totalJobs === 5, `totalJobs should be 5, got ${report.totalJobs}`);
    assert(report.fulfilled === 3, `fulfilled should be 3, got ${report.fulfilled}`);
    assert(report.rejected === 2, `rejected should be 2, got ${report.rejected}`);
    assert(report.outcomes.length === 5, `outcomes.length should be 5, got ${report.outcomes.length}`);
    assert(typeof report.wallTimeMs === "number" && report.wallTimeMs >= 0,
      "wallTimeMs is a non-negative number");

    // ── Test 4: priority ordering ─────────────────────────────
    // critical (job-1) should appear before normal (job-2) and low (job-3) in outcomes
    const fulfilledOutcomes = report.outcomes.filter((o) => o.status === "fulfilled");
    const criticalIdx = fulfilledOutcomes.findIndex((o) => o.jobId === "job-1");
    const normalIdx   = fulfilledOutcomes.findIndex((o) => o.jobId === "job-2");
    const lowIdx      = fulfilledOutcomes.findIndex((o) => o.jobId === "job-3");
    assert(
      criticalIdx < normalIdx && normalIdx < lowIdx,
      "Jobs start in priority order: critical → normal → low"
    );

    // ── Test 5: concurrency limit respected ───────────────────
    // With concurrency=1 and 3 valid jobs, total wall time must be ≥ sum of each job's min delay.
    // We just verify the report is still correct when concurrency=1.
    return runScheduler([validHttp, validCompute, validNotification], {
      concurrency: 1,
      handlers: defaultHandlers,
    });
  }
).then((report2: SchedulerReport) => {
  assert(report2.totalJobs === 3, `concurrency=1: totalJobs should be 3, got ${report2.totalJobs}`);
  assert(report2.fulfilled === 3, `concurrency=1: all 3 fulfilled, got ${report2.fulfilled}`);
  console.log("\nAll tests complete.");
}).catch((err: unknown) => {
  console.error("Unexpected error during async tests:", err);
  process.exitCode = 1;
});
