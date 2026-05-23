// =============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// =============================================================
import {
  isValidPriority,
  validateTask,
  TaskQueue,
  buildExecutionPlan,
  PRIORITY_ORDER,
  type Task,
  type ExecutionPlan,
} from "./challenge";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

function throws(label: string, fn: () => unknown, msgIncludes: string): void {
  try {
    fn();
    console.error(`  ❌  ${label} — expected throw, but did not throw`);
    failed++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes(msgIncludes)) {
      console.log(`  ✅  ${label}`);
      passed++;
    } else {
      console.error(`  ❌  ${label} — threw "${msg}", expected to include "${msgIncludes}"`);
      failed++;
    }
  }
}

// ------------------------------------------------------------------
console.log("\n── isValidPriority ──");
check("accepts 'low'",      isValidPriority("low"));
check("accepts 'critical'", isValidPriority("critical"));
check("rejects 'urgent'",   !isValidPriority("urgent"));
check("rejects number",     !isValidPriority(3));
check("rejects null",       !isValidPriority(null));

// ------------------------------------------------------------------
console.log("\n── validateTask ──");

const rawGood = {
  id: "t1",
  title: "Write tests",
  priority: "high",
  durationMin: 30,
  tags: ["qa", "backend"],
};

const t1 = validateTask(rawGood);
check("returns correct id",          t1.id === "t1");
check("returns correct priority",    t1.priority === "high");
check("returns correct durationMin", t1.durationMin === 30);
check("tags are preserved",          t1.tags.length === 2 && t1.tags[0] === "qa");

throws("rejects null raw",            () => validateTask(null),                "Invalid task");
throws("rejects bad id",              () => validateTask({ ...rawGood, id: "" }),          "Invalid task.id");
throws("rejects bad priority",        () => validateTask({ ...rawGood, priority: "asap" }), "Invalid task.priority");
throws("rejects zero durationMin",    () => validateTask({ ...rawGood, durationMin: 0 }),   "Invalid task.durationMin");
throws("rejects non-array tags",      () => validateTask({ ...rawGood, tags: "qa" }),        "Invalid task.tags");

// ------------------------------------------------------------------
console.log("\n── TaskQueue ──");

const queue = new TaskQueue();
check("empty queue size is 0", queue.size === 0);

const tasks: Task[] = [
  { id: "a", title: "A", priority: "low",      durationMin: 10, tags: [] },
  { id: "b", title: "B", priority: "critical", durationMin: 5,  tags: [] },
  { id: "c", title: "C", priority: "medium",   durationMin: 20, tags: [] },
  { id: "d", title: "D", priority: "high",     durationMin: 15, tags: [] },
  { id: "e", title: "E", priority: "critical", durationMin: 8,  tags: [] }, // second critical
];

tasks.forEach(t => queue.insert(t));
check("size after inserts", queue.size === 5);

const drained = queue.drain();
check("drain returns 5 tasks",          drained.length === 5);
check("queue empty after drain",        queue.size === 0);
check("first task is critical (b)",     drained[0].id === "b");
check("second task is critical (e)",    drained[1].id === "e"); // stable sort
check("third task is high (d)",         drained[2].id === "d");
check("fourth task is medium (c)",      drained[3].id === "c");
check("last task is low (a)",           drained[4].id === "a");

// ------------------------------------------------------------------
console.log("\n── buildExecutionPlan ──");

const rawTasks = [
  { id: "p1", title: "Plan sprint", priority: "high",     durationMin: 60, tags: ["planning"] },
  { id: "p2", title: "Fix bug",     priority: "critical", durationMin: 45, tags: ["bug"] },
  { id: "p3", title: "Write docs",  priority: "low",      durationMin: 90, tags: ["docs"] },
  { id: "p4", title: "Code review", priority: "medium",   durationMin: 30, tags: [] },
];

const plan: ExecutionPlan = buildExecutionPlan(rawTasks);

check("orderedTasks has 4 items",             plan.orderedTasks.length === 4);
check("first ordered task is critical (p2)",  plan.orderedTasks[0].id === "p2");
check("last ordered task is low (p3)",        plan.orderedTasks[3].id === "p3");
check("totalDurationMin is 225",              plan.totalDurationMin === 225);
check("taskCountByPriority.critical === 1",   plan.taskCountByPriority.critical === 1);
check("taskCountByPriority.high === 1",       plan.taskCountByPriority.high === 1);
check("taskCountByPriority.medium === 1",     plan.taskCountByPriority.medium === 1);
check("taskCountByPriority.low === 1",        plan.taskCountByPriority.low === 1);

// All Priority keys present even if count is 0
const sparseRaw = [
  { id: "s1", title: "Only task", priority: "critical", durationMin: 10, tags: [] },
];
const sparsePlan: ExecutionPlan = buildExecutionPlan(sparseRaw);
check("missing priority keys default to 0 (high)",   sparsePlan.taskCountByPriority.high === 0);
check("missing priority keys default to 0 (medium)", sparsePlan.taskCountByPriority.medium === 0);
check("missing priority keys default to 0 (low)",    sparsePlan.taskCountByPriority.low === 0);

throws(
  "buildExecutionPlan propagates validateTask error",
  () => buildExecutionPlan([{ id: "bad", title: "X", priority: "INVALID", durationMin: 5, tags: [] }]),
  "Invalid task.priority"
);

// ------------------------------------------------------------------
console.log(`\n${"─".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} checks.\n`);
if (failed > 0) process.exit(1);
