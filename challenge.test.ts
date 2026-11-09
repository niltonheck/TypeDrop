// challenge.test.ts
import {
  computeNextDelay,
  runScheduler,
  partitionOutcomes,
  type RetryPolicy,
  type Task,
  type TaskExecutor,
  type SchedulerConfig,
  type HttpPayload,
  type ComputePayload,
  type NotifyPayload,
} from "./challenge";

// ── Mock tasks ────────────────────────────────────────────────────────────────

const httpTask: Task<HttpPayload> = {
  type: "http",
  id: "t1",
  payload: { url: "https://api.example.com/data", method: "GET", body: "" },
  retryPolicy: { kind: "fixed", delayMs: 10, maxAttempts: 3 },
};

const computeTask: Task<ComputePayload> = {
  type: "compute",
  id: "t2",
  payload: { expression: "2 + 2", timeoutMs: 500 },
  retryPolicy: { kind: "none" },
};

const notifyTask: Task<NotifyPayload> = {
  type: "notify",
  id: "t3",
  payload: { channel: "email", recipient: "user@example.com", message: "Hello!" },
  retryPolicy: { kind: "exponential", baseDelayMs: 10, maxAttempts: 2, factor: 2 },
};

const config: SchedulerConfig = {
  concurrencyLimit: 2,
  globalTimeoutMs: 5_000,
};

// ── Test 1: computeNextDelay — "none" policy always returns null ───────────────
const nonePolicy: RetryPolicy = { kind: "none" };
console.assert(
  computeNextDelay(nonePolicy, 1) === null,
  'FAIL Test 1: "none" policy should return null',
);
console.log("Test 1 passed: computeNextDelay with 'none' returns null");

// ── Test 2: computeNextDelay — "fixed" policy respects maxAttempts ────────────
const fixedPolicy: RetryPolicy = { kind: "fixed", delayMs: 100, maxAttempts: 3 };
console.assert(
  computeNextDelay(fixedPolicy, 1) === 100,
  "FAIL Test 2a: fixed delay should be 100 on attempt 1",
);
console.assert(
  computeNextDelay(fixedPolicy, 3) === null,
  "FAIL Test 2b: fixed policy should return null when attempts exhausted (attempt === maxAttempts)",
);
console.log("Test 2 passed: computeNextDelay with 'fixed' policy");

// ── Test 3: computeNextDelay — "exponential" backoff formula ─────────────────
const expPolicy: RetryPolicy = { kind: "exponential", baseDelayMs: 50, maxAttempts: 4, factor: 3 };
// attempt 1 → 50 * 3^(1-1) = 50 * 1 = 50
// attempt 2 → 50 * 3^(2-1) = 50 * 3 = 150
console.assert(
  computeNextDelay(expPolicy, 1) === 50,
  "FAIL Test 3a: exponential delay on attempt 1 should be 50",
);
console.assert(
  computeNextDelay(expPolicy, 2) === 150,
  "FAIL Test 3b: exponential delay on attempt 2 should be 150",
);
console.assert(
  computeNextDelay(expPolicy, 4) === null,
  "FAIL Test 3c: exponential policy should return null when attempts exhausted",
);
console.log("Test 3 passed: computeNextDelay with 'exponential' policy");

// ── Test 4: runScheduler — all tasks succeed ──────────────────────────────────
const alwaysSucceedExecutor: TaskExecutor<HttpPayload> = async (_task) =>
  "ok";

const httpTasks: Task<HttpPayload>[] = [
  httpTask,
  {
    type: "http",
    id: "t4",
    payload: { url: "https://api.example.com/other", method: "POST", body: '{"x":1}' },
    retryPolicy: { kind: "none" },
  },
];

const report = await runScheduler(httpTasks, alwaysSucceedExecutor, config);
console.assert(
  report.succeeded === 2,
  `FAIL Test 4a: expected 2 succeeded, got ${report.succeeded}`,
);
console.assert(
  report.exhausted === 0 && report.cancelled === 0,
  "FAIL Test 4b: expected 0 exhausted and 0 cancelled",
);
console.assert(
  report.outcomes.length === 2,
  `FAIL Test 4c: expected 2 outcomes, got ${report.outcomes.length}`,
);
console.log("Test 4 passed: runScheduler with all-succeed executor");

// ── Test 5: runScheduler — executor always fails → exhausted outcomes ─────────
let callCount = 0;
const alwaysFailExecutor: TaskExecutor<HttpPayload> = async (_task) => {
  callCount++;
  throw new Error("service unavailable");
};

const failReport = await runScheduler([httpTask], alwaysFailExecutor, {
  concurrencyLimit: 1,
  globalTimeoutMs: 10_000,
});
console.assert(
  failReport.exhausted === 1,
  `FAIL Test 5a: expected 1 exhausted, got ${failReport.exhausted}`,
);
// httpTask has fixed retry with maxAttempts: 3, so executor should be called 3 times
console.assert(
  callCount === 3,
  `FAIL Test 5b: expected 3 executor calls (1 initial + 2 retries), got ${callCount}`,
);
console.log("Test 5 passed: runScheduler exhausts retries correctly");

// ── Test 6: partitionOutcomes — correct narrowing ─────────────────────────────
const { succeeded, exhausted, cancelled } = partitionOutcomes(failReport);
console.assert(
  exhausted.length === 1,
  `FAIL Test 6a: expected 1 in exhausted partition, got ${exhausted.length}`,
);
console.assert(
  succeeded.length === 0 && cancelled.length === 0,
  "FAIL Test 6b: succeeded and cancelled partitions should be empty",
);
// Type narrowing check: lastError must be accessible without casting
const errMsg: string = exhausted[0].lastError;
console.assert(
  typeof errMsg === "string",
  "FAIL Test 6c: lastError should be a string on exhausted outcome",
);
console.log("Test 6 passed: partitionOutcomes narrows correctly");

console.log("\n✅ All tests passed!");
