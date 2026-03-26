// challenge.test.ts
import { delay, scheduleJob, runQueue } from "./challenge";
import type { Job, JobError, Result, RunReport, JobOutcome } from "./challenge";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/** Creates a job whose execute() resolves successfully on the given attempt. */
function makeSucceedingJob(succeedOnAttempt: number): Job<{ value: number }> {
  let calls = 0;
  return {
    id: "job-ok",
    name: "Succeeding Job",
    payload: { value: 42 },
    policy: { maxAttempts: 3, backoffMs: 10, timeoutMs: 500 },
    execute: async (_payload) => {
      calls += 1;
      if (calls < succeedOnAttempt) {
        return { ok: false, error: { kind: "retryable", message: "not ready", retryAfterMs: 10 } };
      }
      return { ok: true, value: "done" };
    },
  };
}

/** Creates a job that always fails fatally. */
function makeFatalJob(): Job<null> {
  return {
    id: "job-fatal",
    name: "Fatal Job",
    payload: null,
    policy: { maxAttempts: 3, backoffMs: 10, timeoutMs: 500 },
    execute: async (_payload) => ({
      ok: false,
      error: { kind: "fatal", message: "unrecoverable", code: "ERR_FATAL" },
    }),
  };
}

/** Creates a job that always returns a retryable error (exhausts all attempts). */
function makeExhaustingJob(): Job<string> {
  return {
    id: "job-exhaust",
    name: "Exhausting Job",
    payload: "data",
    policy: { maxAttempts: 2, backoffMs: 10, timeoutMs: 500 },
    execute: async (_payload) => ({
      ok: false,
      error: { kind: "retryable", message: "keep trying", retryAfterMs: 10 },
    }),
  };
}

/** Creates a job whose execute() never resolves (triggers timeout). */
function makeTimingOutJob(): Job<void> {
  return {
    id: "job-timeout",
    name: "Timeout Job",
    payload: undefined,
    policy: { maxAttempts: 1, backoffMs: 0, timeoutMs: 50 },
    execute: async (_payload) => {
      await delay(10_000); // effectively never resolves in test time
      return { ok: true, value: "too late" };
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function runTests(): Promise<void> {
  // Test 1: Job succeeds on the first attempt — 1 attempt recorded
  {
    const job = makeSucceedingJob(1);
    const outcome: JobOutcome<{ value: number }> = await scheduleJob(job);
    console.assert(outcome.result.ok === true, "Test 1 FAILED: expected ok=true");
    console.assert(outcome.attempts === 1, `Test 1 FAILED: expected 1 attempt, got ${outcome.attempts}`);
    console.log("Test 1 PASSED: immediate success");
  }

  // Test 2: Job fails once (retryable) then succeeds — 2 attempts recorded
  {
    const job = makeSucceedingJob(2);
    const outcome: JobOutcome<{ value: number }> = await scheduleJob(job);
    console.assert(outcome.result.ok === true, "Test 2 FAILED: expected ok=true after retry");
    console.assert(outcome.attempts === 2, `Test 2 FAILED: expected 2 attempts, got ${outcome.attempts}`);
    console.log("Test 2 PASSED: retry then success");
  }

  // Test 3: Fatal error — stops immediately, 1 attempt, result is not ok
  {
    const job = makeFatalJob();
    const outcome: JobOutcome<null> = await scheduleJob(job);
    console.assert(outcome.result.ok === false, "Test 3 FAILED: expected ok=false");
    console.assert(outcome.attempts === 1, `Test 3 FAILED: expected 1 attempt (fatal), got ${outcome.attempts}`);
    if (!outcome.result.ok) {
      console.assert(outcome.result.error.kind === "fatal", "Test 3 FAILED: expected fatal kind");
    }
    console.log("Test 3 PASSED: fatal error stops immediately");
  }

  // Test 4: Retryable error exhausts all attempts — attempts === maxAttempts
  {
    const job = makeExhaustingJob();
    const outcome: JobOutcome<string> = await scheduleJob(job);
    console.assert(outcome.result.ok === false, "Test 4 FAILED: expected ok=false");
    console.assert(
      outcome.attempts === job.policy.maxAttempts,
      `Test 4 FAILED: expected ${job.policy.maxAttempts} attempts, got ${outcome.attempts}`
    );
    console.log("Test 4 PASSED: retryable exhausts all attempts");
  }

  // Test 5: Timeout — attempt races and loses, outcome is not ok with kind=timeout
  {
    const job = makeTimingOutJob();
    const outcome: JobOutcome<void> = await scheduleJob(job);
    console.assert(outcome.result.ok === false, "Test 5 FAILED: expected ok=false on timeout");
    if (!outcome.result.ok) {
      console.assert(outcome.result.error.kind === "timeout", "Test 5 FAILED: expected timeout kind");
    }
    console.log("Test 5 PASSED: timeout produces timeout error");
  }

  // Test 6: runQueue aggregates outcomes into a correct RunReport
  {
    const jobs: Job<unknown>[] = [
      makeSucceedingJob(1) as Job<unknown>,
      makeFatalJob() as Job<unknown>,
      makeExhaustingJob() as Job<unknown>,
    ];
    const report: RunReport = await runQueue(jobs);
    console.assert(report.totalJobs === 3, `Test 6 FAILED: expected totalJobs=3, got ${report.totalJobs}`);
    console.assert(report.succeeded === 1, `Test 6 FAILED: expected succeeded=1, got ${report.succeeded}`);
    console.assert(report.failed === 2, `Test 6 FAILED: expected failed=2, got ${report.failed}`);
    console.assert(report.outcomes.length === 3, `Test 6 FAILED: expected 3 outcomes`);
    console.log("Test 6 PASSED: RunReport totals are correct");
  }

  console.log("\nAll tests complete.");
}

runTests().catch(console.error);
