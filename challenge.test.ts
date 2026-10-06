// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  type Priority,
  type Task,
  type SummaryResult,
  PRIORITY_ORDER,
  createQueue,
  enqueue,
  dequeue,
  summarize,
} from "./challenge";

// ── Mock data ───────────────────────────────────────────────
const now = new Date("2026-10-06T09:00:00Z");

const taskA: Task = {
  id: "t1",
  title: "Fix critical login bug",
  priority: "high",
  tags: ["bug", "auth"],
  createdAt: new Date("2026-10-06T08:00:00Z"),
};

const taskB: Task = {
  id: "t2",
  title: "Update README",
  priority: "low",
  tags: ["docs"],
  createdAt: new Date("2026-10-06T08:05:00Z"),
};

const taskC: Task = {
  id: "t3",
  title: "Refactor auth module",
  priority: "medium",
  tags: ["refactor", "auth"],
  createdAt: new Date("2026-10-06T08:10:00Z"),
};

const taskD: Task = {
  id: "t4",
  title: "Deploy hotfix",
  priority: "high",
  tags: ["deploy"],
  createdAt: new Date("2026-10-06T08:15:00Z"), // later than taskA
};

// ── Test 1: PRIORITY_ORDER covers all three levels ──────────
console.assert(
  PRIORITY_ORDER["low"] < PRIORITY_ORDER["medium"] &&
    PRIORITY_ORDER["medium"] < PRIORITY_ORDER["high"],
  "❌ Test 1 FAILED: PRIORITY_ORDER weights must satisfy low < medium < high"
);
console.log("✅ Test 1 passed: PRIORITY_ORDER weights are correct");

// ── Test 2: dequeue returns highest-priority task ────────────
const q1 = createQueue<Task>();
enqueue(q1, taskB); // low
enqueue(q1, taskC); // medium
enqueue(q1, taskA); // high  (earlier createdAt than taskD)
enqueue(q1, taskD); // high  (later createdAt)

const first = dequeue(q1);
console.assert(
  first?.id === "t1",
  `❌ Test 2 FAILED: expected t1 (earliest high), got ${first?.id}`
);
console.log("✅ Test 2 passed: dequeue returns highest-priority, earliest task");

// ── Test 3: dequeue reduces queue size ───────────────────────
console.assert(
  q1.size === 3,
  `❌ Test 3 FAILED: expected size 3 after one dequeue, got ${q1.size}`
);
console.log("✅ Test 3 passed: queue size decremented correctly");

// ── Test 4: summarize on a non-empty queue ──────────────────
const q2 = createQueue<Task>();
enqueue(q2, taskA); // high
enqueue(q2, taskB); // low
enqueue(q2, taskC); // medium
enqueue(q2, taskD); // high

const report = summarize(q2);
console.assert(
  report.status === "ok",
  `❌ Test 4a FAILED: expected status "ok", got "${report.status}"`
);

// Narrow to the "ok" variant to access topTask
if (report.status === "ok") {
  console.assert(
    report.topTask.id === "t1",
    `❌ Test 4b FAILED: expected topTask t1, got ${report.topTask.id}`
  );
  console.assert(
    report.counts["high"] === 2 &&
      report.counts["medium"] === 1 &&
      report.counts["low"] === 1,
    `❌ Test 4c FAILED: counts mismatch — ${JSON.stringify(report.counts)}`
  );
}
console.log("✅ Test 4 passed: summarize returns correct status, topTask, and counts");

// ── Test 5: summarize on an empty queue ──────────────────────
const q3 = createQueue<Task>();
const emptyReport = summarize(q3);
console.assert(
  emptyReport.status === "empty",
  `❌ Test 5 FAILED: expected status "empty", got "${emptyReport.status}"`
);
console.log('✅ Test 5 passed: summarize returns "empty" for an empty queue');

console.log("\n🎉 All tests passed!");
