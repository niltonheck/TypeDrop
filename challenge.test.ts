// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validateJobDescriptor,
  scheduleJobs,
  executeJob,
  runQueue,
  type HandlerRegistry,
  type RetryPolicyRegistry,
  type JobDescriptor,
} from "./challenge";

// -----------------------------------------------------------
// Mock handler registry
// -----------------------------------------------------------
const handlers: HandlerRegistry = {
  send_email: async ({ to }) => `Email sent to ${to}`,
  resize_image: async ({ imageUrl, width, height }) =>
    `Resized ${imageUrl} to ${width}x${height}`,
  generate_report: async ({ reportId, format }) =>
    `Report ${reportId} generated as ${format}`,
};

// -----------------------------------------------------------
// Mock retry policy registry
// -----------------------------------------------------------
const policies: RetryPolicyRegistry = {
  send_email:      { maxAttempts: 3, delayMs: 10 },
  resize_image:    { maxAttempts: 2, delayMs: 10 },
  generate_report: { maxAttempts: 1, delayMs: 0  },
};

// -----------------------------------------------------------
// Mock raw job submissions (some invalid)
// -----------------------------------------------------------
const rawJobs: unknown[] = [
  // Valid — priority 2
  { id: "job-1", kind: "generate_report", payload: { reportId: "r42", format: "pdf" }, priority: 2, enqueuedAt: 1000 },
  // Valid — priority 1 (should run first)
  { id: "job-2", kind: "send_email", payload: { to: "a@b.com", subject: "Hi", body: "Hello!" }, priority: 1, enqueuedAt: 2000 },
  // Valid — priority 1, earlier timestamp (should run before job-2)
  { id: "job-3", kind: "resize_image", payload: { imageUrl: "http://img.png", width: 800, height: 600 }, priority: 1, enqueuedAt: 500 },
  // Invalid — unknown kind
  { id: "job-4", kind: "unknown_kind", payload: {}, priority: 1, enqueuedAt: 100 },
  // Invalid — missing payload field
  { id: "job-5", kind: "send_email", payload: { to: "x@y.com" }, priority: 2, enqueuedAt: 300 },
  // Invalid — bad priority
  { id: "job-6", kind: "resize_image", payload: { imageUrl: "http://x.png", width: 100, height: 100 }, priority: 5, enqueuedAt: 100 },
  // Invalid — null
  null,
];

// -----------------------------------------------------------
// TEST 1: validateJobDescriptor — valid input
// -----------------------------------------------------------
const validRaw = rawJobs[0];
const validated = validateJobDescriptor(validRaw);
console.assert(validated !== null, "TEST 1 FAILED: valid job should not be null");
console.assert(validated?.id === "job-1", "TEST 1 FAILED: id should be 'job-1'");
console.assert(validated?.kind === "generate_report", "TEST 1 FAILED: kind mismatch");

// -----------------------------------------------------------
// TEST 2: validateJobDescriptor — invalid inputs return null
// -----------------------------------------------------------
const invalidResults = [rawJobs[3], rawJobs[4], rawJobs[5], rawJobs[6]].map(validateJobDescriptor);
console.assert(
  invalidResults.every((r) => r === null),
  "TEST 2 FAILED: all invalid inputs should return null"
);

// -----------------------------------------------------------
// TEST 3: scheduleJobs — correct ordering
// -----------------------------------------------------------
const descriptors: JobDescriptor[] = [rawJobs[0], rawJobs[1], rawJobs[2]]
  .map(validateJobDescriptor)
  .filter((d): d is JobDescriptor => d !== null);

const scheduled = scheduleJobs(descriptors);
console.assert(scheduled[0].id === "job-3", `TEST 3 FAILED: expected job-3 first, got ${scheduled[0]?.id}`);
console.assert(scheduled[1].id === "job-2", `TEST 3 FAILED: expected job-2 second, got ${scheduled[1]?.id}`);
console.assert(scheduled[2].id === "job-1", `TEST 3 FAILED: expected job-1 third, got ${scheduled[2]?.id}`);

// -----------------------------------------------------------
// TEST 4: executeJob — success result
// -----------------------------------------------------------
(async () => {
  const desc = validateJobDescriptor(rawJobs[0]);
  if (!desc) throw new Error("TEST 4 setup failed");
  const result = await executeJob(desc, handlers, policies);
  console.assert(result.status === "success", `TEST 4 FAILED: expected success, got ${result.status}`);
  console.assert(result.jobId === "job-1", `TEST 4 FAILED: jobId mismatch`);
  console.assert(result.attempts === 1, `TEST 4 FAILED: expected 1 attempt, got ${result.attempts}`);

  // -----------------------------------------------------------
  // TEST 5: executeJob — retry then failure
  // -----------------------------------------------------------
  let callCount = 0;
  const failingHandlers: HandlerRegistry = {
    ...handlers,
    generate_report: async () => {
      callCount++;
      throw new Error("Simulated failure");
    },
  };
  const failPolicies: RetryPolicyRegistry = {
    ...policies,
    generate_report: { maxAttempts: 3, delayMs: 5 },
  };
  const failResult = await executeJob(desc, failingHandlers, failPolicies);
  console.assert(failResult.status === "failure", `TEST 5 FAILED: expected failure, got ${failResult.status}`);
  console.assert(failResult.attempts === 3, `TEST 5 FAILED: expected 3 attempts, got ${failResult.attempts}`);
  console.assert(callCount === 3, `TEST 5 FAILED: handler called ${callCount} times, expected 3`);

  // -----------------------------------------------------------
  // TEST 6: runQueue — end-to-end ordering and results
  // -----------------------------------------------------------
  const results = await runQueue(rawJobs, handlers, policies);
  // 3 valid jobs → 3 results
  console.assert(results.length === 3, `TEST 6 FAILED: expected 3 results, got ${results.length}`);
  // Execution order: job-3, job-2, job-1
  console.assert(results[0].jobId === "job-3", `TEST 6 FAILED: first result should be job-3, got ${results[0]?.jobId}`);
  console.assert(results[1].jobId === "job-2", `TEST 6 FAILED: second result should be job-2, got ${results[1]?.jobId}`);
  console.assert(results[2].jobId === "job-1", `TEST 6 FAILED: third result should be job-1, got ${results[2]?.jobId}`);
  console.assert(results.every((r) => r.status === "success"), "TEST 6 FAILED: all jobs should succeed");

  console.log("All tests passed! ✅");
})();
