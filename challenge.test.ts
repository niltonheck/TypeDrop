// challenge.test.ts
import {
  makeJobId,
  runJob,
  runQueue,
  summariseOutcomes,
  type Job,
  type JobOutcome,
  type QueueSummary,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────

function alwaysSucceed<T>(value: T): (payload: T) => Promise<T> {
  return async (_payload) => value;
}

function failTimes(times: number, finalValue: string) {
  let calls = 0;
  return async (_payload: string): Promise<string> => {
    calls++;
    if (calls <= times) throw new Error(`Attempt ${calls} failed`);
    return finalValue;
  };
}

function alwaysFail(msg: string) {
  return async (_payload: string): Promise<string> => {
    throw new Error(msg);
  };
}

// ── mock jobs ────────────────────────────────────────────────

const jSuccess: Job<string> = {
  id: makeJobId("job-1"),
  priority: "high",
  maxRetries: 0,
  payload: "hello",
  execute: alwaysSucceed("hello"),
};

const jRetrySuccess: Job<string> = {
  id: makeJobId("job-2"),
  priority: "normal",
  maxRetries: 3,
  payload: "world",
  execute: failTimes(2, "world"), // fails twice, succeeds on 3rd attempt
};

const jNoRetryFail: Job<string> = {
  id: makeJobId("job-3"),
  priority: "low",
  maxRetries: 0,
  payload: "oops",
  execute: alwaysFail("instant failure"),
};

const jExhausted: Job<string> = {
  id: makeJobId("job-4"),
  priority: "normal",
  maxRetries: 2,
  payload: "gone",
  execute: alwaysFail("always fails"),
};

// ── tests ────────────────────────────────────────────────────

async function main() {
  // Test 1: successful job returns "succeeded" with attempts === 1
  const out1 = await runJob(jSuccess);
  console.assert(
    out1.status === "succeeded",
    `[T1] Expected succeeded, got ${out1.status}`
  );
  if (out1.status === "succeeded") {
    console.assert(
      out1.attempts === 1,
      `[T1] Expected 1 attempt, got ${out1.attempts}`
    );
    console.assert(
      out1.result === "hello",
      `[T1] Expected result "hello", got ${out1.result}`
    );
  }

  // Test 2: job that fails twice then succeeds → "succeeded", attempts === 3
  const out2 = await runJob(jRetrySuccess);
  console.assert(
    out2.status === "succeeded",
    `[T2] Expected succeeded, got ${out2.status}`
  );
  if (out2.status === "succeeded") {
    console.assert(
      out2.attempts === 3,
      `[T2] Expected 3 attempts, got ${out2.attempts}`
    );
  }

  // Test 3: maxRetries === 0, single failure → "failed"
  const out3 = await runJob(jNoRetryFail);
  console.assert(
    out3.status === "failed",
    `[T3] Expected failed, got ${out3.status}`
  );
  if (out3.status === "failed") {
    console.assert(
      out3.attempts === 1,
      `[T3] Expected 1 attempt, got ${out3.attempts}`
    );
    console.assert(
      out3.error.includes("instant failure"),
      `[T3] Error message mismatch: ${out3.error}`
    );
  }

  // Test 4: all retries consumed → "exhausted", totalAttempts === maxRetries + 1
  const out4 = await runJob(jExhausted);
  console.assert(
    out4.status === "exhausted",
    `[T4] Expected exhausted, got ${out4.status}`
  );
  if (out4.status === "exhausted") {
    console.assert(
      out4.totalAttempts === 3,
      `[T4] Expected totalAttempts 3, got ${out4.totalAttempts}`
    );
  }

  // Test 5: runQueue + summariseOutcomes
  const outcomes = await runQueue(
    [jSuccess, jNoRetryFail, jExhausted],
    2 // concurrency = 2
  );

  // outcomes must be in original input order
  console.assert(
    outcomes[0].jobId === makeJobId("job-1"),
    `[T5] outcomes[0] should be job-1, got ${outcomes[0].jobId}`
  );
  console.assert(
    outcomes[1].jobId === makeJobId("job-3"),
    `[T5] outcomes[1] should be job-3, got ${outcomes[1].jobId}`
  );
  console.assert(
    outcomes[2].jobId === makeJobId("job-4"),
    `[T5] outcomes[2] should be job-4, got ${outcomes[2].jobId}`
  );

  const summary: QueueSummary = summariseOutcomes(outcomes);
  console.assert(
    summary.succeeded === 1,
    `[T5] Expected 1 succeeded, got ${summary.succeeded}`
  );
  console.assert(
    summary.failed === 1,
    `[T5] Expected 1 failed, got ${summary.failed}`
  );
  console.assert(
    summary.exhausted === 1,
    `[T5] Expected 1 exhausted, got ${summary.exhausted}`
  );
  console.assert(
    summary.failedJobIds.length === 2,
    `[T5] Expected 2 failedJobIds, got ${summary.failedJobIds.length}`
  );

  console.log("All tests complete — check for assertion failures above.");
}

main().catch(console.error);
