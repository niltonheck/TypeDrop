// challenge.test.ts
import {
  makeTaskId,
  createScheduler,
  type TaskId,
  type TaskResult,
  type TaskDefinition,
  type SchedulerConfig,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────
const delay = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

function makeTask<T>(
  raw: string,
  priority: TaskDefinition<T>["priority"],
  resourceGroup: string,
  run: () => Promise<T>,
  timeoutMs?: number
): TaskDefinition<T> {
  return { id: makeTaskId(raw), priority, resourceGroup, run, timeoutMs };
}

const config: SchedulerConfig = {
  maxConcurrencyPerGroup: 2,
  globalConcurrencyLimit: 4,
  maxQueueSizePerGroup: 3,
};

// ── Test 1: fulfilled result ──────────────────────────────────
async function testFulfilled() {
  const scheduler = createScheduler(config);
  const result = await scheduler.submit(
    makeTask("t1", "normal", "groupA", async () => 42)
  );
  console.assert(result.status === "fulfilled", "Test 1 FAILED: expected fulfilled");
  if (result.status === "fulfilled") {
    console.assert(result.value === 42, "Test 1 FAILED: expected value 42");
  }
  console.log("Test 1 PASSED: fulfilled result");
}

// ── Test 2: runtime rejection ─────────────────────────────────
async function testRuntimeRejection() {
  const scheduler = createScheduler(config);
  const result = await scheduler.submit(
    makeTask("t2", "high", "groupB", async () => {
      throw new Error("boom");
    })
  );
  console.assert(result.status === "rejected", "Test 2 FAILED: expected rejected");
  if (result.status === "rejected") {
    console.assert(
      result.error.kind === "runtime",
      "Test 2 FAILED: expected runtime error kind"
    );
  }
  console.log("Test 2 PASSED: runtime rejection");
}

// ── Test 3: timeout rejection ─────────────────────────────────
async function testTimeout() {
  const scheduler = createScheduler(config);
  const result = await scheduler.submit(
    makeTask(
      "t3",
      "critical",
      "groupC",
      () => delay(500).then(() => "done"),
      50 // 50 ms timeout
    )
  );
  console.assert(result.status === "rejected", "Test 3 FAILED: expected rejected");
  if (result.status === "rejected") {
    console.assert(
      result.error.kind === "timeout",
      "Test 3 FAILED: expected timeout error kind"
    );
  }
  console.log("Test 3 PASSED: timeout rejection");
}

// ── Test 4: cancel a queued task ──────────────────────────────
async function testCancel() {
  const scheduler = createScheduler({ ...config, maxConcurrencyPerGroup: 1 });

  // Fill the one slot so the second task queues
  const blocker = makeTask(
    "blocker",
    "normal",
    "groupD",
    () => delay(300).then(() => "blocker done")
  );
  const toBeCancelled = makeTask(
    "cancel-me",
    "low",
    "groupD",
    async () => "should not run"
  );

  const [, cancelResult] = await Promise.all([
    scheduler.submit(blocker),
    (async () => {
      const p = scheduler.submit(toBeCancelled);
      await delay(10); // let the event loop tick so blocker starts
      const found = scheduler.cancel(makeTaskId("cancel-me"));
      console.assert(found === true, "Test 4 FAILED: cancel should return true");
      return p;
    })(),
  ]);

  console.assert(
    cancelResult.status === "cancelled",
    "Test 4 FAILED: expected cancelled status"
  );
  console.log("Test 4 PASSED: cancel queued task");
}

// ── Test 5: overflow when queue is full ───────────────────────
async function testOverflow() {
  const tightConfig: SchedulerConfig = {
    maxConcurrencyPerGroup: 1,
    globalConcurrencyLimit: 10,
    maxQueueSizePerGroup: 1, // only 1 queued slot
  };
  const scheduler = createScheduler(tightConfig);

  // 1 running + 1 queued = full; the 3rd must overflow
  const tasks = [
    makeTask("o1", "normal", "groupE", () => delay(200).then(() => 1)),
    makeTask("o2", "normal", "groupE", () => delay(200).then(() => 2)),
    makeTask("o3", "normal", "groupE", () => delay(200).then(() => 3)), // overflow
  ];

  const results = await Promise.all(tasks.map((t) => scheduler.submit(t)));
  const overflowed = results.filter((r) => r.status === "cancelled");
  console.assert(overflowed.length >= 1, "Test 5 FAILED: expected at least 1 overflow");
  console.log("Test 5 PASSED: overflow cancellation");
}

// ── Run all ───────────────────────────────────────────────────
(async () => {
  await testFulfilled();
  await testRuntimeRejection();
  await testTimeout();
  await testCancel();
  await testOverflow();
  console.log("\nAll tests complete.");
})();
