// challenge.test.ts
// Run with: npx ts-node --project tsconfig.json challenge.test.ts
// (tsconfig must have strict:true)

import {
  toTaskId,
  toMs,
  retryDelay,
  topologicalSort,
  schedule,
  manifestSummary,
  collectSuccesses,
  type TaskDefinition,
  type TaskRegistry,
  type SchedulerConfig,
  type RetryPolicy,
} from "./challenge";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

function assertThrows(fn: () => unknown, label: string): void {
  try {
    fn();
    console.error(`  ❌  ${label} (expected throw, got none)`);
    failed++;
  } catch {
    console.log(`  ✅  ${label}`);
    passed++;
  }
}

// ------------------------------------------------------------------
// Suite 1 — Branded constructors
// ------------------------------------------------------------------
console.log("\n── Suite 1: Branded constructors ──");

assert(toTaskId("task-1") === "task-1", "toTaskId returns the raw string value");
assertThrows(() => toTaskId(""), "toTaskId throws on empty string");

assert(toMs(500) === 500, "toMs returns the raw number value");
assertThrows(() => toMs(0), "toMs throws on 0");
assertThrows(() => toMs(-1), "toMs throws on negative");

// ------------------------------------------------------------------
// Suite 2 — retryDelay
// ------------------------------------------------------------------
console.log("\n── Suite 2: retryDelay ──");

const nonePolicy: RetryPolicy = { kind: "none" };
const fixedPolicy: RetryPolicy = { kind: "fixed", attempts: 3, delayMs: toMs(200) };
const expPolicy: RetryPolicy = {
  kind: "exponential",
  attempts: 5,
  baseDelayMs: toMs(100),
  maxDelayMs: toMs(1600),
};

assert(retryDelay(nonePolicy, 1) === 0, "none policy → 0 ms");
assert(retryDelay(fixedPolicy, 1) === 200, "fixed policy attempt 1 → 200 ms");
assert(retryDelay(fixedPolicy, 3) === 200, "fixed policy attempt 3 → 200 ms");
assert(retryDelay(expPolicy, 1) === 100, "exponential attempt 1 → 100 ms");
assert(retryDelay(expPolicy, 2) === 200, "exponential attempt 2 → 200 ms");
assert(retryDelay(expPolicy, 4) === 800, "exponential attempt 4 → 800 ms");
assert(retryDelay(expPolicy, 5) === 1600, "exponential attempt 5 → 1600 ms (capped)");
assert(retryDelay(expPolicy, 6) === 1600, "exponential attempt 6 → 1600 ms (still capped)");

// ------------------------------------------------------------------
// Suite 3 — topologicalSort
// ------------------------------------------------------------------
console.log("\n── Suite 3: topologicalSort ──");

const makeTask = <T>(
  id: string,
  deps: string[],
  work: () => Promise<T>
): TaskDefinition<T> => ({
  id: toTaskId(id),
  priority: "normal",
  dependsOn: deps.map(toTaskId),
  retry: { kind: "none" },
  timeoutMs: toMs(5000),
  work: (_signal) => work(),
});

const linearRegistry: TaskRegistry = {
  a: makeTask("a", [], () => Promise.resolve(1)),
  b: makeTask("b", ["a"], () => Promise.resolve(2)),
  c: makeTask("c", ["b"], () => Promise.resolve(3)),
};

const linearOrder = topologicalSort(linearRegistry);
const aIdx = linearOrder.indexOf(toTaskId("a"));
const bIdx = linearOrder.indexOf(toTaskId("b"));
const cIdx = linearOrder.indexOf(toTaskId("c"));
assert(aIdx < bIdx && bIdx < cIdx, "linear: a → b → c order preserved");

// Diamond: a → b, a → c, b + c → d
const diamondRegistry: TaskRegistry = {
  a: makeTask("a", [], () => Promise.resolve("a")),
  b: makeTask("b", ["a"], () => Promise.resolve("b")),
  c: makeTask("c", ["a"], () => Promise.resolve("c")),
  d: makeTask("d", ["b", "c"], () => Promise.resolve("d")),
};
const diamondOrder = topologicalSort(diamondRegistry);
const dA = diamondOrder.indexOf(toTaskId("a"));
const dB = diamondOrder.indexOf(toTaskId("b"));
const dC = diamondOrder.indexOf(toTaskId("c"));
const dD = diamondOrder.indexOf(toTaskId("d"));
assert(dA < dB && dA < dC && dB < dD && dC < dD, "diamond: all deps before dependents");

// Cycle detection
const cycleRegistry: TaskRegistry = {
  x: makeTask("x", ["y"], () => Promise.resolve(0)),
  y: makeTask("y", ["x"], () => Promise.resolve(0)),
};
assertThrows(() => topologicalSort(cycleRegistry), "cycle detected → throws TypeError");

// Unknown dep
const unknownDepRegistry: TaskRegistry = {
  z: makeTask("z", ["nonexistent"], () => Promise.resolve(0)),
};
assertThrows(() => topologicalSort(unknownDepRegistry), "unknown dependency → throws TypeError");

// ------------------------------------------------------------------
// Suite 4 — schedule (integration, async)
// ------------------------------------------------------------------
console.log("\n── Suite 4: schedule (integration) ──");

async function runScheduleTests(): Promise<void> {
  const cfg: SchedulerConfig = { concurrency: 2, failFast: false };

  // 4a — all succeed
  const successRegistry = {
    t1: makeTask("t1", [], () => Promise.resolve(42)),
    t2: makeTask("t2", ["t1"], () => Promise.resolve("hello")),
    t3: makeTask("t3", ["t1"], () => Promise.resolve(true)),
  };
  const manifest1 = await schedule(successRegistry, cfg);
  assert(manifest1.t1.status === "success", "4a: t1 succeeds");
  assert(manifest1.t2.status === "success", "4a: t2 succeeds after t1");
  assert(manifest1.t3.status === "success", "4a: t3 succeeds after t1");
  if (manifest1.t2.status === "success") {
    assert(manifest1.t2.output === "hello", "4a: t2 output is 'hello'");
  }

  // 4b — dependency-failed cancellation
  const depFailRegistry = {
    base: makeTask("base", [], () => Promise.reject(new Error("boom"))),
    child: makeTask("child", ["base"], () => Promise.resolve("never")),
  };
  const manifest2 = await schedule(depFailRegistry, cfg);
  assert(manifest2.base.status === "failure", "4b: base is failure");
  assert(manifest2.child.status === "cancelled", "4b: child is cancelled");
  if (manifest2.child.status === "cancelled") {
    assert(manifest2.child.reason === "dependency-failed", "4b: reason is dependency-failed");
  }

  // 4c — retry (fixed, 2 attempts total)
  let callCount = 0;
  const retryRegistry = {
    flaky: {
      id: toTaskId("flaky"),
      priority: "normal" as const,
      dependsOn: [],
      retry: { kind: "fixed" as const, attempts: 1, delayMs: toMs(10) },
      timeoutMs: toMs(3000),
      work: (_signal: AbortSignal) => {
        callCount++;
        if (callCount < 2) return Promise.reject(new Error("transient"));
        return Promise.resolve("recovered");
      },
    },
  };
  const manifest3 = await schedule(retryRegistry, cfg);
  assert(manifest3.flaky.status === "success", "4c: flaky task recovers after 1 retry");
  if (manifest3.flaky.status === "success") {
    assert((manifest3.flaky as { attempts: number }).attempts === 2, "4c: attempt count is 2");
  }

  // 4d — timeout cancellation
  const timeoutRegistry = {
    slow: {
      id: toTaskId("slow"),
      priority: "normal" as const,
      dependsOn: [],
      retry: { kind: "none" as const },
      timeoutMs: toMs(50),
      work: (_signal: AbortSignal) =>
        new Promise<never>((_, reject) => {
          const t = setTimeout(() => reject(new Error("should have been aborted")), 10_000);
          _signal.addEventListener("abort", () => clearTimeout(t));
        }),
    },
  };
  const manifest4 = await schedule(timeoutRegistry, cfg);
  assert(manifest4.slow.status === "cancelled", "4d: slow task is cancelled on timeout");
  if (manifest4.slow.status === "cancelled") {
    assert(manifest4.slow.reason === "timeout", "4d: reason is timeout");
  }

  // 4e — manifestSummary
  const summary = manifestSummary(manifest2 as Parameters<typeof manifestSummary>[0]);
  assert(summary.total === 2, "4e: summary total = 2");
  assert(summary.failed === 1, "4e: summary failed = 1");
  assert(summary.cancelled === 1, "4e: summary cancelled = 1");
  assert(summary.succeeded === 0, "4e: summary succeeded = 0");

  // 4f — collectSuccesses filters correctly
  const successes = collectSuccesses(manifest1);
  const keys = Object.keys(successes);
  assert(keys.length === 3, "4f: all 3 successes collected");
  assert(keys.includes("t1") && keys.includes("t2") && keys.includes("t3"), "4f: correct keys");

  // 4g — external AbortSignal cancels pending tasks
  const abortController = new AbortController();
  const abortRegistry = {
    quick: makeTask("quick", [], () => Promise.resolve("done")),
    pending: makeTask("pending", ["quick"], () => new Promise<string>(() => { /* never resolves */ })),
  };
  // Abort after a short delay
  setTimeout(() => abortController.abort(), 30);
  const manifest5 = await schedule(abortRegistry, { concurrency: 1, failFast: false }, abortController.signal);
  // quick may succeed or be aborted depending on timing; pending should be aborted or cancelled
  const pendingResult = manifest5.pending;
  assert(
    pendingResult.status === "cancelled",
    "4g: pending task is cancelled when external signal fires"
  );
}

runScheduleTests()
  .then(() => {
    console.log(`\n══════════════════════════════════`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
  })
  .catch((err: unknown) => {
    console.error("Unexpected error in test runner:", err);
    process.exit(1);
  });
