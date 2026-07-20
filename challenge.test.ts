// challenge.test.ts
import {
  runWithRetry,
  runQueue,
  type Task,
  type TaskResult,
  type RetryPolicy,
  type QueueResult,
} from "./challenge";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSucceedAfter<I>(failTimes: number): Task<I, string>["execute"] {
  let calls = 0;
  return async (_input: I, _signal: AbortSignal) => {
    calls++;
    if (calls <= failTimes) throw new Error(`Transient failure #${calls}`);
    return `ok-after-${failTimes}-failures`;
  };
}

function makeAlwaysFail<I>(): Task<I, string>["execute"] {
  return async (_input: I, _signal: AbortSignal) => {
    throw new Error("Permanent failure");
  };
}

const policy: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 10,   // keep tests fast
  backoffFactor: 2,
};

// ─── Test 1: task succeeds on first attempt ───────────────────────────────────
async function test1() {
  const task: Task<number, string> = {
    id: "t1",
    input: 42,
    execute: async (input, _signal) => `result-${input}`,
  };
  const controller = new AbortController();
  const result = await runWithRetry(task, policy, controller.signal);

  console.assert(result.status === "fulfilled", "Test 1a: status should be fulfilled");
  if (result.status === "fulfilled") {
    console.assert(result.value === "result-42", "Test 1b: value should be 'result-42'");
  }
  console.log("✅ Test 1 passed: immediate success");
}

// ─── Test 2: task succeeds after 2 transient failures ────────────────────────
async function test2() {
  const task: Task<string, string> = {
    id: "t2",
    input: "hello",
    execute: makeSucceedAfter<string>(2),
  };
  const controller = new AbortController();
  const result = await runWithRetry(task, policy, controller.signal);

  console.assert(result.status === "fulfilled", "Test 2a: status should be fulfilled");
  if (result.status === "fulfilled") {
    console.assert(
      result.value === "ok-after-2-failures",
      "Test 2b: value should be 'ok-after-2-failures'",
    );
  }
  console.log("✅ Test 2 passed: success after 2 retries");
}

// ─── Test 3: task exhausts all attempts ──────────────────────────────────────
async function test3() {
  const task: Task<boolean, string> = {
    id: "t3",
    input: true,
    execute: makeAlwaysFail<boolean>(),
  };
  const controller = new AbortController();
  const result = await runWithRetry(task, policy, controller.signal);

  console.assert(result.status === "failed", "Test 3a: status should be failed");
  if (result.status === "failed") {
    console.assert(
      result.attempts === policy.maxAttempts,
      `Test 3b: attempts should be ${policy.maxAttempts}, got ${result.attempts}`,
    );
    console.assert(
      result.lastError.message === "Permanent failure",
      "Test 3c: lastError message should be 'Permanent failure'",
    );
  }
  console.log("✅ Test 3 passed: exhausted all attempts");
}

// ─── Test 4: runQueue returns results in order, mixed outcomes ────────────────
async function test4() {
  const tasks: ReadonlyArray<Task<number, string>> = [
    { id: "q1", input: 1, execute: async (n, _s) => `val-${n}` },
    { id: "q2", input: 2, execute: makeAlwaysFail<number>() },
    { id: "q3", input: 3, execute: makeSucceedAfter<number>(1) },
  ];
  const controller = new AbortController();
  const results = await runQueue(tasks, policy, controller.signal);

  console.assert(results.length === 3, "Test 4a: should have 3 results");
  console.assert(results[0].id === "q1", "Test 4b: first result id should be q1");
  console.assert(results[0].result.status === "fulfilled", "Test 4c: q1 should be fulfilled");
  console.assert(results[1].id === "q2", "Test 4d: second result id should be q2");
  console.assert(results[1].result.status === "failed", "Test 4e: q2 should be failed");
  console.assert(results[2].id === "q3", "Test 4f: third result id should be q3");
  console.assert(results[2].result.status === "fulfilled", "Test 4g: q3 should be fulfilled");
  console.log("✅ Test 4 passed: runQueue returns ordered mixed results");
}

// ─── Test 5: abort mid-retry stops the queue task early ──────────────────────
async function test5() {
  // Task always fails — but we abort the controller after a short time
  const controller = new AbortController();
  const task: Task<null, string> = {
    id: "t5",
    input: null,
    execute: async (_input, _signal) => {
      throw new Error("Always fails");
    },
  };
  const slowPolicy: RetryPolicy = {
    maxAttempts: 5,
    baseDelayMs: 200, // long enough that we can abort during backoff
    backoffFactor: 2,
  };
  // Abort after first attempt's backoff begins
  setTimeout(() => controller.abort(), 50);
  const result = await runWithRetry(task, slowPolicy, controller.signal);

  console.assert(result.status === "failed", "Test 5a: aborted task should be failed");
  if (result.status === "failed") {
    console.assert(
      result.attempts < slowPolicy.maxAttempts,
      `Test 5b: should have fewer than ${slowPolicy.maxAttempts} attempts, got ${result.attempts}`,
    );
    console.assert(
      result.lastError.message === "Aborted",
      `Test 5c: lastError.message should be "Aborted", got "${result.lastError.message}"`,
    );
  }
  console.log("✅ Test 5 passed: abort signal respected during backoff");
}

// ─── Runner ───────────────────────────────────────────────────────────────────
(async () => {
  await test1();
  await test2();
  await test3();
  await test4();
  await test5();
  console.log("\n🎉 All tests passed!");
})().catch((err) => {
  console.error("❌ Test suite error:", err);
  process.exit(1);
});
