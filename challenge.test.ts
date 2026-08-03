// challenge.test.ts
import {
  createScheduler,
  makeTaskId,
  taskBuilder,
  extractFulfilled,
  TimeoutError,
  RetryExhaustedError,
  type TaskResult,
  type AnyResult,
} from "./challenge";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------------
// Test 1: Basic concurrency — at most N tasks run simultaneously
// ------------------------------------------------------------------
async function testConcurrencyLimit(): Promise<void> {
  let running = 0;
  let maxObserved = 0;

  const makeWork = () => async (_attempt: number): Promise<number> => {
    running++;
    maxObserved = Math.max(maxObserved, running);
    await delay(30);
    running--;
    return 1;
  };

  const scheduler = createScheduler({ concurrency: 2 });
  for (let i = 0; i < 5; i++) {
    scheduler.register({
      id: makeTaskId(`t${i}`),
      priority: 5,
      retry: { kind: "none" },
      work: makeWork(),
    });
  }

  await scheduler.run();
  console.assert(maxObserved <= 2, `Test 1 FAILED: max concurrency exceeded (got ${maxObserved})`);
  console.log("Test 1 passed: concurrency limit respected");
}

// ------------------------------------------------------------------
// Test 2: Priority ordering — higher-priority tasks start first
// ------------------------------------------------------------------
async function testPriorityOrdering(): Promise<void> {
  const startOrder: string[] = [];

  const scheduler = createScheduler({ concurrency: 1 }); // serial, so order is deterministic
  const priorities: Array<[string, 1 | 5 | 10]> = [
    ["low", 1],
    ["high", 10],
    ["mid", 5],
  ];

  for (const [name, priority] of priorities) {
    scheduler.register({
      id: makeTaskId(name),
      priority,
      retry: { kind: "none" },
      work: async (_attempt) => {
        startOrder.push(name);
        return name;
      },
    });
  }

  await scheduler.run();
  console.assert(
    JSON.stringify(startOrder) === JSON.stringify(["high", "mid", "low"]),
    `Test 2 FAILED: expected ["high","mid","low"], got ${JSON.stringify(startOrder)}`
  );
  console.log("Test 2 passed: priority ordering correct");
}

// ------------------------------------------------------------------
// Test 3: Exponential retry — eventually succeeds
// ------------------------------------------------------------------
async function testExponentialRetry(): Promise<void> {
  let attempts = 0;

  const scheduler = createScheduler({ concurrency: 1 });
  scheduler.register({
    id: makeTaskId("flaky"),
    priority: 5,
    retry: { kind: "exponential", maxAttempts: 4, baseDelayMs: 10, maxDelayMs: 100 },
    work: async (attempt) => {
      attempts = attempt;
      if (attempt < 3) throw new Error("transient");
      return "ok";
    },
  });

  const results = await scheduler.run();
  console.assert(results.length === 1, "Test 3 FAILED: expected 1 result");
  console.assert(results[0].status === "fulfilled", `Test 3 FAILED: expected fulfilled, got ${results[0].status}`);
  console.assert(attempts === 3, `Test 3 FAILED: expected 3 attempts, got ${attempts}`);
  console.log("Test 3 passed: exponential retry succeeded on attempt 3");
}

// ------------------------------------------------------------------
// Test 4: Retry exhaustion — task rejected with RetryExhaustedError
// ------------------------------------------------------------------
async function testRetryExhaustion(): Promise<void> {
  const scheduler = createScheduler({ concurrency: 1 });
  scheduler.register({
    id: makeTaskId("always-fails"),
    priority: 5,
    retry: { kind: "fixed", maxAttempts: 3, delayMs: 10 },
    work: async (_attempt) => {
      throw new Error("boom");
    },
  });

  const results = await scheduler.run();
  console.assert(results.length === 1, "Test 4 FAILED: expected 1 result");
  const r = results[0];
  console.assert(r.status === "rejected", `Test 4 FAILED: expected rejected, got ${r.status}`);
  if (r.status === "rejected") {
    console.assert(
      r.reason instanceof RetryExhaustedError,
      `Test 4 FAILED: expected RetryExhaustedError, got ${r.reason}`
    );
    console.assert(
      (r.reason as RetryExhaustedError).attempts === 3,
      `Test 4 FAILED: expected 3 attempts`
    );
  }
  console.log("Test 4 passed: retry exhaustion produces RetryExhaustedError");
}

// ------------------------------------------------------------------
// Test 5: Global timeout — in-flight tasks rejected with TimeoutError
// ------------------------------------------------------------------
async function testGlobalTimeout(): Promise<void> {
  const scheduler = createScheduler({ concurrency: 2, globalTimeoutMs: 50 });

  // These tasks take longer than the global timeout
  for (let i = 0; i < 3; i++) {
    scheduler.register({
      id: makeTaskId(`slow-${i}`),
      priority: 5,
      retry: { kind: "none" },
      work: async () => {
        await delay(500);
        return i;
      },
    });
  }

  const results = await scheduler.run();
  console.assert(results.length === 3, `Test 5 FAILED: expected 3 results, got ${results.length}`);
  const allTimedOut = results.every(
    (r) => r.status === "rejected" && r.reason instanceof TimeoutError
  );
  console.assert(allTimedOut, "Test 5 FAILED: expected all tasks to be rejected with TimeoutError");
  console.log("Test 5 passed: global timeout rejects all tasks");
}

// ------------------------------------------------------------------
// Test 6: extractFulfilled — type guard narrows correctly
// ------------------------------------------------------------------
async function testExtractFulfilled(): Promise<void> {
  const scheduler = createScheduler({ concurrency: 3 });
  scheduler.register({
    id: makeTaskId("num"),
    priority: 5,
    retry: { kind: "none" },
    work: async () => 42,
  });
  scheduler.register({
    id: makeTaskId("str"),
    priority: 5,
    retry: { kind: "none" },
    work: async () => "hello",
  });
  scheduler.register({
    id: makeTaskId("fail"),
    priority: 5,
    retry: { kind: "none" },
    work: async (): Promise<number> => {
      throw new Error("nope");
    },
  });

  const results = await scheduler.run();
  const numbers = extractFulfilled(results, (v): v is number => typeof v === "number");
  console.assert(numbers.length === 1 && numbers[0] === 42, `Test 6 FAILED: expected [42], got ${JSON.stringify(numbers)}`);
  console.log("Test 6 passed: extractFulfilled narrows type correctly");
}

// ------------------------------------------------------------------
// Test 7: TaskBuilder — compile-time safety (build requires priority + work)
// ------------------------------------------------------------------
function testTaskBuilder(): void {
  // This should compile and produce a valid Task<string>
  const task = taskBuilder<string>()
    .withId(makeTaskId("builder-task"))
    .withPriority(7)
    .withRetry({ kind: "fixed", maxAttempts: 2, delayMs: 50 })
    .withWork(async (_attempt) => "result")
    .build(); // only available after withPriority + withWork

  console.assert(task.priority === 7, `Test 7 FAILED: expected priority 7, got ${task.priority}`);
  console.assert(task.id === "builder-task", `Test 7 FAILED: wrong id`);
  console.log("Test 7 passed: TaskBuilder produces correct Task");

  // The following should be a compile-time error (uncomment to verify):
  // taskBuilder<string>().withPriority(5).build();  // ❌ missing work
  // taskBuilder<string>().withWork(async () => "x").build(); // ❌ missing priority
}

// ------------------------------------------------------------------
// Run all tests
// ------------------------------------------------------------------
(async () => {
  try {
    await testConcurrencyLimit();
    await testPriorityOrdering();
    await testExponentialRetry();
    await testRetryExhaustion();
    await testGlobalTimeout();
    await testExtractFulfilled();
    testTaskBuilder();
    console.log("\n✅ All tests passed!");
  } catch (err) {
    console.error("\n❌ Unexpected error:", err);
    process.exit(1);
  }
})();
