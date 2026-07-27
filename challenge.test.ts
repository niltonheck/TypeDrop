// ─── challenge.test.ts ───────────────────────────────────────────────────────
import {
  type Task,
  type TaskReport,
  type RunnerConfig,
  withRetry,
  runWithConcurrencyLimit,
  sleep,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTask<T>(name: string, fn: () => Promise<T>): Task<T> {
  return { name, run: fn };
}

/** Creates a task that fails `failTimes` times then succeeds with `value`. */
function flakyTask<T>(name: string, failTimes: number, value: T): Task<T> {
  let attempts = 0;
  return makeTask(name, async () => {
    attempts++;
    if (attempts <= failTimes) throw new Error(`${name}: transient failure #${attempts}`);
    return value;
  });
}

/** Creates a task that always rejects. */
function alwaysFailTask(name: string): Task<never> {
  return makeTask(name, async () => {
    throw new Error(`${name}: permanent failure`);
  });
}

// ── Test 1: withRetry — succeeds on 3rd attempt ───────────────────────────────
(async () => {
  const task = flakyTask("fetch-user", 2, { id: 42, name: "Alice" });
  const report = await withRetry(task, { maxAttempts: 5, baseDelayMs: 10 });

  console.assert(report.status === "fulfilled", "Test 1a: status should be fulfilled");
  if (report.status === "fulfilled") {
    console.assert(report.value.id === 42, "Test 1b: value.id should be 42");
    console.assert(report.name === "fetch-user", "Test 1c: name should be 'fetch-user'");
  }
  console.log("✅ Test 1 passed — withRetry succeeds after transient failures");
})();

// ── Test 2: withRetry — exhausts all attempts ─────────────────────────────────
(async () => {
  const task = alwaysFailTask("bad-job");
  const report = await withRetry(task, { maxAttempts: 3, baseDelayMs: 10 });

  console.assert(report.status === "rejected", "Test 2a: status should be rejected");
  if (report.status === "rejected") {
    console.assert(report.attempts === 3, `Test 2b: attempts should be 3, got ${report.attempts}`);
    console.assert(report.name === "bad-job", "Test 2c: name should be 'bad-job'");
    console.assert(report.error instanceof Error, "Test 2d: error should be an Error");
  }
  console.log("✅ Test 2 passed — withRetry rejects after exhausting all attempts");
})();

// ── Test 3: runWithConcurrencyLimit — order preserved ────────────────────────
(async () => {
  const config: RunnerConfig = { maxAttempts: 1, baseDelayMs: 0, concurrency: 2 };

  // Tasks complete in reverse order of submission (last is fastest)
  const tasks: Task<string>[] = [
    makeTask("slow", async () => { await sleep(60); return "slow"; }),
    makeTask("medium", async () => { await sleep(30); return "medium"; }),
    makeTask("fast", async () => { await sleep(5); return "fast"; }),
  ];

  const reports = await runWithConcurrencyLimit(tasks, config);

  console.assert(reports.length === 3, "Test 3a: should have 3 reports");
  console.assert(reports[0].name === "slow",   "Test 3b: report[0] should be 'slow'");
  console.assert(reports[1].name === "medium", "Test 3c: report[1] should be 'medium'");
  console.assert(reports[2].name === "fast",   "Test 3d: report[2] should be 'fast'");
  console.log("✅ Test 3 passed — results returned in submission order");
})();

// ── Test 4: runWithConcurrencyLimit — mixed success & failure ─────────────────
(async () => {
  const config: RunnerConfig = { maxAttempts: 2, baseDelayMs: 10, concurrency: 3 };

  const tasks: Task<number>[] = [
    flakyTask("t1", 1, 100),   // succeeds on 2nd attempt
    alwaysFailTask("t2") as unknown as Task<number>, // always fails
    makeTask("t3", async () => 300),                 // always succeeds
  ];

  const reports = await runWithConcurrencyLimit(tasks, config);

  console.assert(reports[0].status === "fulfilled", "Test 4a: t1 should be fulfilled");
  console.assert(reports[1].status === "rejected",  "Test 4b: t2 should be rejected");
  console.assert(reports[2].status === "fulfilled", "Test 4c: t3 should be fulfilled");

  if (reports[0].status === "fulfilled") {
    console.assert(reports[0].value === 100, "Test 4d: t1 value should be 100");
  }
  if (reports[1].status === "rejected") {
    console.assert(reports[1].attempts === 2, "Test 4e: t2 should have 2 attempts");
  }
  console.log("✅ Test 4 passed — mixed success/failure reports correct");
})();

// ── Test 5: concurrency cap is respected ─────────────────────────────────────
(async () => {
  let inFlight = 0;
  let maxObserved = 0;
  const concurrency = 2;

  const tasks: Task<void>[] = Array.from({ length: 6 }, (_, i) =>
    makeTask(`task-${i}`, async () => {
      inFlight++;
      maxObserved = Math.max(maxObserved, inFlight);
      await sleep(20);
      inFlight--;
    })
  );

  await runWithConcurrencyLimit(tasks, { maxAttempts: 1, baseDelayMs: 0, concurrency });

  console.assert(
    maxObserved <= concurrency,
    `Test 5: max in-flight was ${maxObserved}, expected <= ${concurrency}`
  );
  console.log(`✅ Test 5 passed — concurrency cap respected (max in-flight: ${maxObserved})`);
})();
