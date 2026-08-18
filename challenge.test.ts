// ============================================================
// challenge.test.ts — Test Harness
// ============================================================
import {
  makeConcurrency,
  sortByPriority,
  isSuccess,
  runScheduler,
  PRIORITY_WEIGHT,
  type Task,
  type TaskResult,
  type Concurrency,
} from "./challenge";

// ── helpers ────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeTask<T>(
  id: string,
  priority: Task<T>["priority"],
  run: () => Promise<T>
): Task<T> {
  return { id, priority, run };
}

// ── mock tasks ─────────────────────────────────────────────────────

const successTask = makeTask("t1", "normal", async () => {
  await delay(20);
  return 42;
});

const failTask = makeTask<number>("t2", "high", async () => {
  await delay(10);
  throw new Error("boom");
});

const criticalTask = makeTask("t3", "critical", async () => {
  await delay(5);
  return 99;
});

const lowTask = makeTask("t4", "low", async () => {
  await delay(5);
  return 1;
});

// ── test 1: makeConcurrency ────────────────────────────────────────
{
  let threw = false;
  try {
    makeConcurrency(0);
  } catch (e) {
    threw = e instanceof TypeError;
  }
  console.assert(threw, "TEST 1 FAILED: makeConcurrency(0) should throw TypeError");

  let threw2 = false;
  try {
    makeConcurrency(1.5);
  } catch (e) {
    threw2 = e instanceof TypeError;
  }
  console.assert(threw2, "TEST 1b FAILED: makeConcurrency(1.5) should throw TypeError");

  const c = makeConcurrency(2);
  console.assert(c === 2, "TEST 1c FAILED: makeConcurrency(2) should equal 2");
  console.log("TEST 1 passed ✓");
}

// ── test 2: sortByPriority ─────────────────────────────────────────
{
  const tasks: Task<number>[] = [lowTask, successTask, failTask, criticalTask];
  const sorted = sortByPriority(tasks);

  console.assert(sorted[0].id === "t3", "TEST 2 FAILED: critical should be first");
  console.assert(sorted[1].id === "t2", "TEST 2 FAILED: high should be second");
  console.assert(sorted[2].id === "t1", "TEST 2 FAILED: normal should be third");
  console.assert(sorted[3].id === "t4", "TEST 2 FAILED: low should be last");
  // must not mutate
  console.assert(tasks[0].id === "t4", "TEST 2 FAILED: original array should not be mutated");
  console.log("TEST 2 passed ✓");
}

// ── test 3: isSuccess type predicate ──────────────────────────────
{
  const ok: TaskResult<number> = {
    status: "fulfilled",
    id: "x",
    priority: "normal",
    value: 7,
    durationMs: 10,
  };
  const fail: TaskResult<number> = {
    status: "rejected",
    id: "y",
    priority: "low",
    reason: new Error("oops"),
    durationMs: 5,
  };

  console.assert(isSuccess(ok) === true, "TEST 3 FAILED: fulfilled result should be success");
  console.assert(isSuccess(fail) === false, "TEST 3 FAILED: rejected result should not be success");
  console.log("TEST 3 passed ✓");
}

// ── test 4: runScheduler — mixed success/failure + report shape ────
(async () => {
  const concurrency = makeConcurrency(2);
  const tasks: Task<number>[] = [lowTask, successTask, failTask, criticalTask];

  const report = await runScheduler(tasks, concurrency);

  console.assert(report.results.length === 4, "TEST 4 FAILED: should have 4 results");
  console.assert(report.successCount === 3, "TEST 4 FAILED: 3 tasks should succeed");
  console.assert(report.failureCount === 1, "TEST 4 FAILED: 1 task should fail");
  console.assert(
    report.topResult !== null && report.topResult.id === "t3",
    "TEST 4 FAILED: topResult should be the critical task (t3)"
  );
  console.assert(
    report.totalDurationMs > 0,
    "TEST 4 FAILED: totalDurationMs should be positive"
  );
  console.log("TEST 4 passed ✓");
})().catch((e) => console.error("TEST 4 ERROR:", e));

// ── test 5: runScheduler — empty tasks ────────────────────────────
(async () => {
  const concurrency = makeConcurrency(3);
  const report = await runScheduler<string>([], concurrency);

  console.assert(report.results.length === 0, "TEST 5 FAILED: results should be empty");
  console.assert(report.successCount === 0, "TEST 5 FAILED: successCount should be 0");
  console.assert(report.failureCount === 0, "TEST 5 FAILED: failureCount should be 0");
  console.assert(report.topResult === null, "TEST 5 FAILED: topResult should be null");
  console.assert(report.totalDurationMs === 0, "TEST 5 FAILED: totalDurationMs should be 0");
  console.log("TEST 5 passed ✓");
})().catch((e) => console.error("TEST 5 ERROR:", e));
