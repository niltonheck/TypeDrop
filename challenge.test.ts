// ============================================================
// challenge.test.ts — Test harness for the Task Scheduler
// ============================================================
import {
  makeJobId, makeTagName,
  runJobWithRetry, runScheduler, summarizeByTag,
  Job, SchedulerConfig, SchedulerReport, JobOutcome,
  ok, err, PRIORITY_WEIGHT,
} from "./challenge";

// ─── helpers ───────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const infra  = makeTagName("infra");
const etl    = makeTagName("etl");
const report = makeTagName("report");

// ─── mock jobs ─────────────────────────────────────────────────────────────

// Always succeeds immediately
const successJob: Job<string> = {
  id:         makeJobId("job-success"),
  priority:   "high",
  tags:       [infra, etl],
  maxRetries: 1,
  run:        async () => "done",
};

// Fails once, then succeeds on retry
let attempt_flaky = 0;
const flakyJob: Job<string> = {
  id:         makeJobId("job-flaky"),
  priority:   "normal",
  tags:       [etl],
  maxRetries: 2,
  run: async () => {
    attempt_flaky++;
    if (attempt_flaky < 2) throw new Error("transient");
    return "recovered";
  },
};

// Always fails
const alwaysFailJob: Job<string> = {
  id:         makeJobId("job-fail"),
  priority:   "low",
  tags:       [report],
  maxRetries: 1,
  run:        async () => { throw new Error("permanent"); },
};

// Invalid job (negative maxRetries)
const invalidJob: Job<string> = {
  id:         makeJobId("job-invalid"),
  priority:   "critical",
  tags:       [],
  maxRetries: -1,
  run:        async () => "never",
};

// ─── TEST 1: runJobWithRetry — immediate success ────────────────────────────
{
  const outcome = await runJobWithRetry(successJob);
  console.assert(
    outcome.result.status === "ok",
    "TEST 1 FAILED: successJob should resolve with status 'ok'",
  );
  console.assert(
    outcome.attempts === 1,
    "TEST 1 FAILED: successJob should complete in exactly 1 attempt",
  );
  console.log("TEST 1 passed — immediate success");
}

// ─── TEST 2: runJobWithRetry — retry then succeed ──────────────────────────
{
  const outcome = await runJobWithRetry(flakyJob);
  console.assert(
    outcome.result.status === "ok",
    "TEST 2 FAILED: flakyJob should eventually resolve with status 'ok'",
  );
  console.assert(
    outcome.attempts === 2,
    `TEST 2 FAILED: flakyJob expected 2 attempts, got ${outcome.attempts}`,
  );
  console.log("TEST 2 passed — retry then succeed");
}

// ─── TEST 3: runJobWithRetry — retries exhausted ───────────────────────────
{
  const outcome = await runJobWithRetry(alwaysFailJob);
  console.assert(
    outcome.result.status === "error",
    "TEST 3 FAILED: alwaysFailJob should resolve with status 'error'",
  );
  if (outcome.result.status === "error") {
    console.assert(
      outcome.result.error.kind === "retries_exhausted",
      "TEST 3 FAILED: error kind should be 'retries_exhausted'",
    );
    console.assert(
      (outcome.result.error as Extract<typeof outcome.result.error, { kind: "retries_exhausted" }>).totalAttempts === 2,
      "TEST 3 FAILED: totalAttempts should be 2 (1 initial + 1 retry)",
    );
  }
  console.log("TEST 3 passed — retries exhausted");
}

// ─── TEST 4: runScheduler — full report ────────────────────────────────────
{
  const jobs: ReadonlyArray<Job<string>> = [successJob, alwaysFailJob, invalidJob];
  const config: SchedulerConfig = { concurrency: 2 };
  const rpt = await runScheduler(jobs, config);

  console.assert(
    rpt.succeeded.length === 1,
    `TEST 4 FAILED: expected 1 succeeded, got ${rpt.succeeded.length}`,
  );
  console.assert(
    rpt.failed.length === 2,
    `TEST 4 FAILED: expected 2 failed (alwaysFail + invalid), got ${rpt.failed.length}`,
  );
  console.assert(
    typeof rpt.elapsedMs === "number" && rpt.elapsedMs >= 0,
    "TEST 4 FAILED: elapsedMs should be a non-negative number",
  );
  console.log("TEST 4 passed — full scheduler report");
}

// ─── TEST 5: summarizeByTag ────────────────────────────────────────────────
{
  const jobs: ReadonlyArray<Job<string>> = [successJob, alwaysFailJob];
  const config: SchedulerConfig = { concurrency: 2 };
  const rpt = await runScheduler(jobs, config);
  const tagMap = summarizeByTag(jobs, rpt);

  const infraStats  = tagMap.get(infra);
  const etlStats    = tagMap.get(etl);
  const reportStats = tagMap.get(report);

  console.assert(
    infraStats?.succeeded === 1 && infraStats?.failed === 0,
    `TEST 5 FAILED: infra tag — expected {succeeded:1, failed:0}, got ${JSON.stringify(infraStats)}`,
  );
  console.assert(
    etlStats?.succeeded === 1 && etlStats?.failed === 0,
    `TEST 5 FAILED: etl tag — expected {succeeded:1, failed:0}, got ${JSON.stringify(etlStats)}`,
  );
  console.assert(
    reportStats?.succeeded === 0 && reportStats?.failed === 1,
    `TEST 5 FAILED: report tag — expected {succeeded:0, failed:1}, got ${JSON.stringify(reportStats)}`,
  );
  console.log("TEST 5 passed — summarizeByTag");
}

console.log("\n✅ All tests completed.");
