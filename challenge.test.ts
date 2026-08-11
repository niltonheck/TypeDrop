// challenge.test.ts
import {
  makeTaskId,
  runScheduler,
  handleSettlement,
  type Task,
  type TaskError,
  type TaskSettlement,
  type RetryPolicy,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function makeError(kind: TaskError["kind"], message: string): TaskError {
  return { kind, message };
}

// ── Mock tasks ───────────────────────────────────────────────

/** Task A: always succeeds, returns a number */
const taskA: Task<number, number> = {
  id: makeTaskId("task-a"),
  input: 7,
  priority: "low",
  timeoutMs: 500,
  retryPolicy: { kind: "none" },
  execute: async (n, _signal) => {
    await delay(10);
    return n * 2;
  },
  classify: (e) => makeError("unknown", String(e)),
};

/** Task B: always succeeds, returns a string */
const taskB: Task<string, string> = {
  id: makeTaskId("task-b"),
  input: "hello",
  priority: "high",
  timeoutMs: 500,
  retryPolicy: { kind: "none" },
  execute: async (s, _signal) => {
    await delay(10);
    return s.toUpperCase();
  },
  classify: (e) => makeError("unknown", String(e)),
};

/** Task C: fails once with a transient error, then succeeds on retry */
let taskCAttempts = 0;
const taskC: Task<void, string> = {
  id: makeTaskId("task-c"),
  input: undefined,
  priority: "medium",
  timeoutMs: 500,
  retryPolicy: { kind: "fixed", attempts: 2, delayMs: 20 },
  execute: async (_input, _signal) => {
    taskCAttempts++;
    if (taskCAttempts === 1) {
      throw makeError("transient", "first attempt failed");
    }
    return "recovered";
  },
  classify: (e) => {
    const err = e as TaskError;
    return makeError(err.kind ?? "unknown", err.message ?? String(e));
  },
};

/** Task D: always fails with a permanent error — must NOT retry */
let taskDAttempts = 0;
const taskD: Task<void, never> = {
  id: makeTaskId("task-d"),
  input: undefined,
  priority: "medium",
  timeoutMs: 500,
  retryPolicy: { kind: "fixed", attempts: 3, delayMs: 10 },
  execute: async (_input, _signal) => {
    taskDAttempts++;
    throw makeError("permanent", "bad input");
  },
  classify: (e) => {
    const err = e as TaskError;
    return makeError(err.kind ?? "unknown", err.message ?? String(e));
  },
};

/** Task E: times out */
const taskE: Task<void, string> = {
  id: makeTaskId("task-e"),
  input: undefined,
  priority: "low",
  timeoutMs: 50,
  retryPolicy: { kind: "none" },
  execute: async (_input, _signal) => {
    await delay(500); // way longer than timeoutMs
    return "should not reach";
  },
  classify: (e) => makeError("unknown", String(e)),
};

// ── Tests ─────────────────────────────────────────────────────

async function runTests() {
  // Test 1: basic success — taskA and taskB both fulfill with correct outputs
  {
    const results = await runScheduler([taskA, taskB] as const, { concurrency: 2 });

    const [a, b] = results;

    console.assert(a.status === "fulfilled", "Test 1a: taskA should be fulfilled");
    console.assert(
      a.status === "fulfilled" && a.output === 14,
      "Test 1b: taskA output should be 14 (7 * 2)"
    );
    console.assert(b.status === "fulfilled", "Test 1c: taskB should be fulfilled");
    console.assert(
      b.status === "fulfilled" && b.output === "HELLO",
      "Test 1d: taskB output should be 'HELLO'"
    );
    console.assert(a.taskId === makeTaskId("task-a"), "Test 1e: taskA id preserved");
    console.assert(b.taskId === makeTaskId("task-b"), "Test 1f: taskB id preserved");
    console.log("✓ Test 1 passed: basic success");
  }

  // Test 2: retry logic — taskC should recover on second attempt
  {
    taskCAttempts = 0;
    const results = await runScheduler([taskC] as const, { concurrency: 1 });
    const [c] = results;

    console.assert(c.status === "fulfilled", "Test 2a: taskC should be fulfilled after retry");
    console.assert(
      c.status === "fulfilled" && c.output === "recovered",
      "Test 2b: taskC output should be 'recovered'"
    );
    console.assert(
      c.attempts === 2,
      `Test 2c: taskC should have taken 2 attempts, got ${c.attempts}`
    );
    console.log("✓ Test 2 passed: retry recovers transient error");
  }

  // Test 3: permanent error — taskD must NOT retry despite fixed policy
  {
    taskDAttempts = 0;
    const results = await runScheduler([taskD] as const, { concurrency: 1 });
    const [d] = results;

    console.assert(d.status === "rejected", "Test 3a: taskD should be rejected");
    console.assert(
      taskDAttempts === 1,
      `Test 3b: taskD must not retry permanent errors (got ${taskDAttempts} attempts)`
    );
    console.assert(
      d.status === "rejected" && d.error.kind === "permanent",
      "Test 3c: taskD error kind should be 'permanent'"
    );
    console.log("✓ Test 3 passed: permanent errors are not retried");
  }

  // Test 4: timeout — taskE should be rejected with kind "timeout"
  {
    const results = await runScheduler([taskE] as const, { concurrency: 1 });
    const [e] = results;

    console.assert(e.status === "rejected", "Test 4a: taskE should be rejected (timeout)");
    console.assert(
      e.status === "rejected" && e.error.kind === "timeout",
      "Test 4b: taskE error kind should be 'timeout'"
    );
    console.log("✓ Test 4 passed: timeout produces rejected settlement");
  }

  // Test 5: handleSettlement helper + positional order preserved
  {
    const results = await runScheduler([taskA, taskB] as const, { concurrency: 2 });
    const [a, b] = results;

    const labelA = handleSettlement(a, {
      onFulfilled: (s) => `ok:${s.output}`,
      onRejected: (s) => `err:${s.error.message}`,
    });
    const labelB = handleSettlement(b, {
      onFulfilled: (s) => `ok:${s.output}`,
      onRejected: (s) => `err:${s.error.message}`,
    });

    console.assert(labelA === "ok:14", `Test 5a: handleSettlement for taskA, got "${labelA}"`);
    console.assert(labelB === "ok:HELLO", `Test 5b: handleSettlement for taskB, got "${labelB}"`);
    console.log("✓ Test 5 passed: handleSettlement dispatches correctly");
  }

  console.log("\n✅ All tests completed.");
}

runTests().catch(console.error);
