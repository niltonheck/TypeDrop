// ============================================================
// challenge.test.ts
// ============================================================
import {
  validateJob,
  buildQueues,
  executeLane,
  runScheduler,
  type Job,
  type JobRunner,
  type JobResult,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const validRawJobs: unknown[] = [
  { id: "j1", name: "Send email",      priority: "high",   durationMs: 100, payload: { to: "a@b.com", retry: true } },
  { id: "j2", name: "Resize image",    priority: "normal", durationMs: 200, payload: { width: 800, height: 600 } },
  { id: "j3", name: "Generate report", priority: "low",    durationMs: 300, payload: { format: "pdf" } },
  { id: "j4", name: "Notify webhook",  priority: "high",   durationMs: 150, payload: { url: "https://x.io", secure: true } },
  { id: "j5", name: "Sync contacts",   priority: "normal", durationMs: 250, payload: { source: "crm" } },
];

const invalidRawJobs: unknown[] = [
  null,
  { id: "",   name: "No id",        priority: "high",   durationMs: 100, payload: {} },
  { id: "x",  name: "Bad priority", priority: "urgent", durationMs: 50,  payload: {} },
  { id: "y",  name: "Zero dur",     priority: "low",    durationMs: 0,   payload: {} },
  { id: "z",  name: "Bad payload",  priority: "normal", durationMs: 80,  payload: { nested: { a: 1 } } },
  "not-an-object",
  42,
];

// -----------------------------------------------------------
// Deterministic runner: always succeeds, echoes durationMs
// -----------------------------------------------------------
const successRunner: JobRunner = (job) =>
  Promise.resolve({ status: "success", jobId: job.id, jobName: job.name, durationMs: job.durationMs });

// -----------------------------------------------------------
// Failing runner: fails jobs whose id ends with an odd digit
// -----------------------------------------------------------
const mixedRunner: JobRunner = (job) => {
  const lastChar = job.id.slice(-1);
  const num = parseInt(lastChar, 10);
  if (!isNaN(num) && num % 2 !== 0) {
    return Promise.reject(new Error(`Job ${job.id} failed intentionally`));
  }
  return Promise.resolve({ status: "success", jobId: job.id, jobName: job.name, durationMs: job.durationMs });
};

// -----------------------------------------------------------
// Test 1: validateJob — valid input produces a typed Job
// -----------------------------------------------------------
const validatedJob = validateJob(validRawJobs[0]);
console.assert(validatedJob !== null, "Test 1a FAILED: valid job should not be null");
console.assert(validatedJob?.id === "j1", "Test 1b FAILED: id should be 'j1'");
console.assert(validatedJob?.priority === "high", "Test 1c FAILED: priority should be 'high'");
console.log("Test 1 passed ✓ — validateJob accepts valid input");

// -----------------------------------------------------------
// Test 2: validateJob — all invalid inputs return null
// -----------------------------------------------------------
const allNull = invalidRawJobs.every((raw) => validateJob(raw) === null);
console.assert(allNull, "Test 2 FAILED: every invalid raw job should return null");
console.log("Test 2 passed ✓ — validateJob rejects all invalid inputs");

// -----------------------------------------------------------
// Test 3: buildQueues — correct bucketing and lane keys
// -----------------------------------------------------------
const queues = buildQueues([...validRawJobs, ...invalidRawJobs]);
console.assert(queues.high.length   === 2, `Test 3a FAILED: expected 2 high jobs, got ${queues.high.length}`);
console.assert(queues.normal.length === 2, `Test 3b FAILED: expected 2 normal jobs, got ${queues.normal.length}`);
console.assert(queues.low.length    === 1, `Test 3c FAILED: expected 1 low job, got ${queues.low.length}`);
console.log("Test 3 passed ✓ — buildQueues buckets correctly and discards invalids");

// -----------------------------------------------------------
// Test 4: executeLane — success runner, order preserved
// -----------------------------------------------------------
(async () => {
  const highJobs: Job[] = queues.high;
  const results = await executeLane(highJobs, successRunner, 2);

  console.assert(results.length === 2, `Test 4a FAILED: expected 2 results, got ${results.length}`);
  console.assert(results[0].status === "success", "Test 4b FAILED: first result should be success");
  console.assert(results[0].jobId === "j1", `Test 4c FAILED: first result jobId should be 'j1', got '${results[0].jobId}'`);
  console.assert(results[1].jobId === "j4", `Test 4d FAILED: second result jobId should be 'j4', got '${results[1].jobId}'`);
  console.log("Test 4 passed ✓ — executeLane preserves order and captures successes");

  // -----------------------------------------------------------
  // Test 5: runScheduler — full pipeline with mixed runner
  // -----------------------------------------------------------
  const report = await runScheduler(validRawJobs, mixedRunner, 2);

  // j1(high,odd→fail), j4(high,even→ok), j2(normal,even→ok), j5(normal,odd→fail), j3(low,odd→fail)
  console.assert(report.totalJobs === 5, `Test 5a FAILED: totalJobs should be 5, got ${report.totalJobs}`);
  console.assert(report.succeeded === 2, `Test 5b FAILED: succeeded should be 2, got ${report.succeeded}`);
  console.assert(report.failed    === 3, `Test 5c FAILED: failed should be 3, got ${report.failed}`);
  console.assert(report.results.length === 5, `Test 5d FAILED: results.length should be 5, got ${report.results.length}`);
  // High lane results come first
  console.assert(report.results[0].jobId === "j1", `Test 5e FAILED: first result should be j1, got ${report.results[0].jobId}`);
  // totalSuccessfulDurationMs: j4(150) + j2(200) = 350
  console.assert(
    report.totalSuccessfulDurationMs === 350,
    `Test 5f FAILED: totalSuccessfulDurationMs should be 350, got ${report.totalSuccessfulDurationMs}`
  );
  console.log("Test 5 passed ✓ — runScheduler full pipeline, report correct");
})();
