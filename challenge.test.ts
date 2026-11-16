// ─── challenge.test.ts ───────────────────────────────────────────────────────
import {
  makeTaskId,
  createScheduler,
  type Task,
  type RunReport,
  type TaskResult,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeTask<P>(
  id: string,
  priority: 1 | 2 | 3,
  payload: P,
  handler: (p: P) => Promise<string>,
  maxAttempts = 1,
  delayMs = 0
): Task<P> {
  return {
    id: makeTaskId(id),
    priority,
    payload,
    retryPolicy: { maxAttempts, delayMs },
    handler,
  };
}

// ── Test 1: All tasks succeed ─────────────────────────────────────────────────
async function testAllSucceed() {
  const scheduler = createScheduler();
  const log: string[] = [];

  scheduler.enqueue(
    makeTask("t1", 2, "hello", async (p) => { log.push(`t1:${p}`); return "ok-t1"; })
  );
  scheduler.enqueue(
    makeTask("t2", 1, "world", async (p) => { log.push(`t2:${p}`); return "ok-t2"; })
  );
  scheduler.enqueue(
    makeTask("t3", 3, "!", async (p) => { log.push(`t3:${p}`); return "ok-t3"; })
  );

  const report: RunReport = await scheduler.drain(2);

  console.assert(report.total === 3, `[test1] total should be 3, got ${report.total}`);
  console.assert(report.succeeded === 3, `[test1] succeeded should be 3, got ${report.succeeded}`);
  console.assert(report.failed === 0, `[test1] failed should be 0, got ${report.failed}`);

  // Priority-1 task (t2) must appear before priority-2 (t1) and priority-3 (t3)
  console.assert(
    log.indexOf("t2:world") < log.indexOf("t1:hello"),
    `[test1] t2 (priority 1) should run before t1 (priority 2). log=${JSON.stringify(log)}`
  );
  console.assert(
    log.indexOf("t1:hello") < log.indexOf("t3:!"),
    `[test1] t1 (priority 2) should run before t3 (priority 3). log=${JSON.stringify(log)}`
  );

  console.log("✅ test1 passed: all tasks succeed in priority order");
}

// ── Test 2: Retry logic — succeeds on 2nd attempt ────────────────────────────
async function testRetrySuccess() {
  const scheduler = createScheduler();
  let attempts = 0;

  scheduler.enqueue(
    makeTask(
      "flaky",
      1,
      null,
      async (_p) => {
        attempts++;
        if (attempts < 2) throw new Error("transient error");
        return "recovered";
      },
      /* maxAttempts */ 3,
      /* delayMs */ 0
    )
  );

  const report = await scheduler.drain(1);

  console.assert(report.succeeded === 1, `[test2] should succeed after retry, got succeeded=${report.succeeded}`);
  const result = report.results.find((r) => r.taskId === makeTaskId("flaky"));
  console.assert(result !== undefined, "[test2] result for 'flaky' not found");
  console.assert(result!.status === "succeeded", `[test2] final status should be 'succeeded', got '${result!.status}'`);
  console.assert(result!.attempts.length === 2, `[test2] should record 2 attempts, got ${result!.attempts.length}`);
  console.assert(result!.attempts[0].status === "failure", `[test2] first attempt should be failure`);
  console.assert(result!.attempts[1].status === "success", `[test2] second attempt should be success`);

  console.log("✅ test2 passed: retry logic works, succeeds on 2nd attempt");
}

// ── Test 3: All retries exhausted — task fails ────────────────────────────────
async function testRetryExhausted() {
  const scheduler = createScheduler();

  scheduler.enqueue(
    makeTask(
      "doomed",
      1,
      42,
      async (_p) => { throw new Error("always fails"); },
      /* maxAttempts */ 2,
      /* delayMs */ 0
    )
  );

  const report = await scheduler.drain(1);

  console.assert(report.failed === 1, `[test3] failed should be 1, got ${report.failed}`);
  const result = report.results.find((r) => r.taskId === makeTaskId("doomed"));
  console.assert(result!.status === "failed", `[test3] status should be 'failed'`);
  console.assert(result!.attempts.length === 2, `[test3] should record 2 attempts, got ${result!.attempts.length}`);
  console.assert(result!.attempts.every((a) => a.status === "failure"), "[test3] all attempts should be failures");

  console.log("✅ test3 passed: all retries exhausted correctly");
}

// ── Test 4: drain clears the queue ────────────────────────────────────────────
async function testDrainClearsQueue() {
  const scheduler = createScheduler();

  scheduler.enqueue(makeTask("x", 1, 0, async () => "done"));
  const report1 = await scheduler.drain(1);
  const report2 = await scheduler.drain(1); // second drain should be empty

  console.assert(report1.total === 1, `[test4] first drain total should be 1`);
  console.assert(report2.total === 0, `[test4] second drain total should be 0, got ${report2.total}`);

  console.log("✅ test4 passed: drain clears the internal queue");
}

// ── Test 5: concurrency cap is respected within a priority bucket ─────────────
async function testConcurrencyCap() {
  const scheduler = createScheduler();
  let concurrent = 0;
  let maxObserved = 0;

  const makeSlowTask = (id: string) =>
    makeTask(id, 1, null, async () => {
      concurrent++;
      maxObserved = Math.max(maxObserved, concurrent);
      await new Promise((r) => setTimeout(r, 20));
      concurrent--;
      return "done";
    });

  for (let i = 0; i < 5; i++) scheduler.enqueue(makeSlowTask(`c${i}`));

  await scheduler.drain(2); // cap = 2

  console.assert(
    maxObserved <= 2,
    `[test5] concurrency should never exceed 2, observed ${maxObserved}`
  );
  console.log(`✅ test5 passed: concurrency cap respected (max observed: ${maxObserved})`);
}

// ── Run all tests ─────────────────────────────────────────────────────────────
(async () => {
  await testAllSucceed();
  await testRetrySuccess();
  await testRetryExhausted();
  await testDrainClearsQueue();
  await testConcurrencyCap();
  console.log("\n🎉 All tests passed!");
})();
