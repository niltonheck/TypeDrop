// challenge.test.ts
import {
  createJobRunner,
  type AnyJob,
  type JobRegistry,
  type JobResult,
  type RunSummary,
  type JobOutcome,
} from "./challenge";

// ─── Mock handlers ──────────────────────────────────────────────────────────

let emailCallCount = 0;
let reportCallCount = 0;
let webhookCallCount = 0;

const mockRegistry: JobRegistry = {
  email: async (payload) => {
    emailCallCount++;
    if (!payload.to.includes("@")) {
      return { status: "failure", error: "Invalid email address" };
    }
    return { status: "success" };
  },
  report: async (payload) => {
    reportCallCount++;
    // Simulate a transient failure on the first attempt for csv reports
    if (payload.format === "csv" && reportCallCount === 1) {
      return { status: "failure", error: "Temporary report generation error" };
    }
    return { status: "success" };
  },
  webhook: async (payload) => {
    webhookCallCount++;
    return { status: "success" };
  },
};

// ─── Mock jobs ───────────────────────────────────────────────────────────────

const validEmailJob: AnyJob = {
  id: "job-1",
  kind: "email",
  payload: { to: "alice@example.com", subject: "Hello", body: "Hi!" },
  priority: "high",
  maxRetries: 1,
};

const invalidEmailJob: AnyJob = {
  id: "job-2",
  kind: "email",
  payload: { to: "not-an-email", subject: "Oops", body: "..." },
  priority: "low",
  maxRetries: 0,
};

const csvReportJob: AnyJob = {
  id: "job-3",
  kind: "report",
  payload: { reportId: "rpt-42", format: "csv" },
  priority: "normal",
  maxRetries: 2, // should succeed on the retry
};

const webhookJob: AnyJob = {
  id: "job-4",
  kind: "webhook",
  payload: { url: "https://hooks.example.com/notify", data: { event: "signup" } },
  priority: "normal",
  maxRetries: 1,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

async function runTests() {
  const runner = createJobRunner(mockRegistry, { maxConcurrency: 2, baseDelayMs: 10 });

  runner.enqueue(validEmailJob);
  runner.enqueue(invalidEmailJob);
  runner.enqueue(csvReportJob);
  runner.enqueue(webhookJob);

  const summary: RunSummary = await runner.run();

  // Test 1: total count matches enqueued jobs
  console.assert(
    summary.total === 4,
    `FAIL Test 1 — expected total=4, got ${summary.total}`
  );
  console.log(summary.total === 4 ? "PASS Test 1: total count" : "FAIL Test 1: total count");

  // Test 2: succeeded count (validEmail + csvReport-after-retry + webhook = 3)
  console.assert(
    summary.succeeded === 3,
    `FAIL Test 2 — expected succeeded=3, got ${summary.succeeded}`
  );
  console.log(summary.succeeded === 3 ? "PASS Test 2: succeeded count" : "FAIL Test 2: succeeded count");

  // Test 3: failed count (invalidEmail = 1)
  console.assert(
    summary.failed === 1,
    `FAIL Test 3 — expected failed=1, got ${summary.failed}`
  );
  console.log(summary.failed === 1 ? "PASS Test 3: failed count" : "FAIL Test 3: failed count");

  // Test 4: the invalidEmail job outcome is "failed" with a lastError
  const emailFailOutcome = summary.results.find(
    (r) => r.job.id === "job-2"
  ) as Extract<JobOutcome, { status: "failed" }> | undefined;

  console.assert(
    emailFailOutcome?.status === "failed" && typeof emailFailOutcome.lastError === "string",
    `FAIL Test 4 — expected failed outcome for job-2`
  );
  console.log(
    emailFailOutcome?.status === "failed"
      ? "PASS Test 4: failed job outcome shape"
      : "FAIL Test 4: failed job outcome shape"
  );

  // Test 5: csv report job succeeded after at least 1 retry (attempts > 1)
  const reportOutcome = summary.results.find(
    (r) => r.job.id === "job-3"
  ) as Extract<JobOutcome, { status: "succeeded" }> | undefined;

  console.assert(
    reportOutcome?.status === "succeeded" && reportOutcome.attempts >= 2,
    `FAIL Test 5 — expected csvReport to succeed after retry, attempts=${reportOutcome?.attempts}`
  );
  console.log(
    reportOutcome?.status === "succeeded" && reportOutcome.attempts >= 2
      ? "PASS Test 5: retry succeeded"
      : "FAIL Test 5: retry succeeded"
  );
}

runTests().catch(console.error);
