// ============================================================
// challenge.test.ts
// ============================================================
import {
  makeJobId,
  makeStepId,
  validateStep,
  validateJob,
  createStepExecutor,
  runStep,
  runJob,
  buildJobReport,
  processJobFromQueue,
  type StepExecution,
  type JobExecution,
  type Job,
  type JobState,
} from "./challenge";

// ------------------------------------------------------------------
// Helper
// ------------------------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ------------------------------------------------------------------
// TEST 1 — validateStep rejects bad input
// ------------------------------------------------------------------
console.log("\nTEST 1: validateStep rejects bad input");
{
  const result = validateStep({
    id: "",
    name: 42,
    maxAttempts: 10,
    durationMs: 0,
    alwaysFails: "yes",
  });
  assert(result.ok === false, "invalid step should fail validation");
  if (!result.ok) {
    assert(result.error.length >= 4, "should report at least 4 errors");
    assert(
      result.error.some((e) => e.kind === "InvalidType" && e.field === "name"),
      "should report InvalidType for name"
    );
    assert(
      result.error.some(
        (e) => e.kind === "OutOfRange" && e.field === "maxAttempts"
      ),
      "should report OutOfRange for maxAttempts"
    );
  }
}

// ------------------------------------------------------------------
// TEST 2 — validateJob collects all step errors
// ------------------------------------------------------------------
console.log("\nTEST 2: validateJob collects all step errors");
{
  const result = validateJob({
    id: "job-1",
    name: "My Job",
    steps: [
      { id: "s1", name: "Step 1", maxAttempts: 1, durationMs: 10, alwaysFails: false },
      { id: "",   name: 99,       maxAttempts: 6, durationMs: 10, alwaysFails: false }, // bad
    ],
  });
  assert(result.ok === false, "job with bad step should fail validation");
  if (!result.ok) {
    const stepErrors = result.error.find((e) => e.kind === "InvalidSteps");
    assert(stepErrors !== undefined, "should include InvalidSteps error");
  }
}

// ------------------------------------------------------------------
// TEST 3 — runStep succeeds for a normal step
// ------------------------------------------------------------------
console.log("\nTEST 3: runStep succeeds for a normal step");
(async () => {
  const step = {
    id: makeStepId("s1"),
    name: "quick step",
    maxAttempts: 1,
    durationMs: 20,
    alwaysFails: false,
  };
  const execution: StepExecution = { step, state: { status: "pending" } };
  const executor = createStepExecutor();
  const ctrl = new AbortController();
  const result = await runStep(execution, executor, ctrl.signal);
  assert(result.ok === true, "step should succeed");
  if (result.ok) {
    assert(
      result.value.state.status === "succeeded",
      "step state should be succeeded"
    );
  }
})().catch(console.error);

// ------------------------------------------------------------------
// TEST 4 — runStep retries and eventually fails
// ------------------------------------------------------------------
console.log("\nTEST 4: runStep retries and eventually fails");
(async () => {
  const step = {
    id: makeStepId("s2"),
    name: "flaky step",
    maxAttempts: 3,
    durationMs: 10,
    alwaysFails: true,
  };
  const execution: StepExecution = { step, state: { status: "pending" } };
  const executor = createStepExecutor();
  const ctrl = new AbortController();
  const result = await runStep(execution, executor, ctrl.signal);
  assert(result.ok === false, "always-failing step should fail");
  if (!result.ok) {
    assert(result.error.kind === "StepFailed", "error kind should be StepFailed");
    assert(result.error.attempts === 3, "should have attempted 3 times");
  }
})().catch(console.error);

// ------------------------------------------------------------------
// TEST 5 — runJob cancels remaining steps after a failure
// ------------------------------------------------------------------
console.log("\nTEST 5: runJob cancels remaining steps after failure");
(async () => {
  const validJob: Job = {
    id: makeJobId("job-cancel"),
    name: "Cancel Test Job",
    steps: [
      { id: makeStepId("s1"), name: "good step",  maxAttempts: 1, durationMs: 10, alwaysFails: false },
      { id: makeStepId("s2"), name: "bad step",   maxAttempts: 1, durationMs: 10, alwaysFails: true  },
      { id: makeStepId("s3"), name: "never runs", maxAttempts: 1, durationMs: 10, alwaysFails: false },
    ],
  };
  const executor = createStepExecutor();
  const jobExecution = await runJob(validJob, executor);

  assert(
    jobExecution.state.status === "failed",
    "job should be in failed state"
  );
  assert(
    jobExecution.stepExecutions[0].state.status === "succeeded",
    "first step should have succeeded"
  );
  assert(
    jobExecution.stepExecutions[1].state.status === "failed",
    "second step should have failed"
  );
  // Third step was never attempted — it should remain pending or be cancelled
  const s3Status = jobExecution.stepExecutions[2].state.status;
  assert(
    s3Status === "pending" || s3Status === "cancelled",
    "third step should be pending or cancelled"
  );

  const report = buildJobReport(jobExecution);
  assert(report.succeededSteps === 1, "report: 1 succeeded step");
  assert(report.failedSteps === 1, "report: 1 failed step");
  assert(report.executionError !== null, "report: executionError should be set");
})().catch(console.error);

// ------------------------------------------------------------------
// TEST 6 — processJobFromQueue full happy path
// ------------------------------------------------------------------
console.log("\nTEST 6: processJobFromQueue full happy path");
(async () => {
  const rawJob = {
    id: "job-happy",
    name: "Happy Path Job",
    steps: [
      { id: "s1", name: "Step A", maxAttempts: 2, durationMs: 15, alwaysFails: false },
      { id: "s2", name: "Step B", maxAttempts: 1, durationMs: 10, alwaysFails: false },
    ],
  };
  const result = await processJobFromQueue(rawJob);
  assert(result.ok === true, "full pipeline should succeed");
  if (result.ok) {
    assert(
      result.value.finalStatus === "completed",
      "job report finalStatus should be completed"
    );
    assert(result.value.totalSteps === 2, "report should have 2 total steps");
    assert(result.value.succeededSteps === 2, "report should have 2 succeeded steps");
    assert(
      result.value.stepReports.every((r) => r.summary.outcome === "success"),
      "all step summaries should have outcome=success"
    );
  }
})().catch(console.error);

// ------------------------------------------------------------------
// TEST 7 — processJobFromQueue returns error on invalid input
// ------------------------------------------------------------------
console.log("\nTEST 7: processJobFromQueue rejects invalid input");
(async () => {
  const result = await processJobFromQueue({ id: 123, name: null, steps: [] });
  assert(result.ok === false, "invalid raw job should return error result");
  if (!result.ok) {
    assert(typeof result.error === "string", "error should be a string summary");
    assert(result.error.length > 0, "error string should be non-empty");
  }
})().catch(console.error);
