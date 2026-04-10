// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validateTask,
  computeRank,
  scheduleTasks,
  PRIORITY_WEIGHTS,
  type Task,
  type Priority,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const VALID_HIGH: unknown = {
  id: "t1",
  title: "Fix critical bug",
  priority: "high",
  deadline: "2026-04-20",
  estimatedMinutes: 30,
};

const VALID_LOW: unknown = {
  id: "t2",
  title: "Update README",
  priority: "low",
  deadline: "2026-05-01",
  estimatedMinutes: 15,
};

const VALID_MEDIUM: unknown = {
  id: "t3",
  title: "Write unit tests",
  priority: "medium",
  deadline: "2026-04-18",
  estimatedMinutes: 90,
};

const INVALID_MISSING_TITLE: unknown = {
  id: "t4",
  // title intentionally omitted
  priority: "medium",
  deadline: "2026-04-22",
  estimatedMinutes: 60,
};

const INVALID_BAD_PRIORITY: unknown = {
  id: "t5",
  title: "Deploy hotfix",
  priority: "urgent", // not a valid Priority
  deadline: "2026-04-11",
  estimatedMinutes: 45,
};

const INVALID_BAD_DEADLINE: unknown = {
  id: "t6",
  title: "Refactor module",
  priority: "low",
  deadline: "not-a-date",
  estimatedMinutes: 120,
};

const INVALID_ZERO_MINUTES: unknown = {
  id: "t7",
  title: "Instant task",
  priority: "high",
  deadline: "2026-04-25",
  estimatedMinutes: 0,
};

// -----------------------------------------------------------
// Test 1: PRIORITY_WEIGHTS covers all priorities with correct values
// -----------------------------------------------------------
const priorities: Priority[] = ["low", "medium", "high"];
const allWeightsDefined = priorities.every(
  (p) => typeof PRIORITY_WEIGHTS[p] === "number"
);
console.assert(allWeightsDefined, "TEST 1 FAILED: PRIORITY_WEIGHTS missing keys or non-numeric values");
console.assert(
  PRIORITY_WEIGHTS["high"] < PRIORITY_WEIGHTS["medium"] &&
  PRIORITY_WEIGHTS["medium"] < PRIORITY_WEIGHTS["low"],
  "TEST 1 FAILED: PRIORITY_WEIGHTS ordering is wrong (high < medium < low expected)"
);
console.log("TEST 1 passed: PRIORITY_WEIGHTS shape & ordering ✓");

// -----------------------------------------------------------
// Test 2: validateTask — valid blobs produce ok: true Tasks
// -----------------------------------------------------------
const r1 = validateTask(VALID_HIGH);
console.assert(r1.ok === true, "TEST 2 FAILED: VALID_HIGH should pass validation");
if (r1.ok) {
  console.assert(r1.value.id === "t1", "TEST 2 FAILED: id mismatch");
  console.assert(r1.value.priority === "high", "TEST 2 FAILED: priority mismatch");
}
console.log("TEST 2 passed: validateTask accepts valid task ✓");

// -----------------------------------------------------------
// Test 3: validateTask — invalid blobs produce ok: false with correct kind
// -----------------------------------------------------------
const rMissingTitle = validateTask(INVALID_MISSING_TITLE);
console.assert(rMissingTitle.ok === false, "TEST 3 FAILED: missing title should fail");
if (!rMissingTitle.ok) {
  console.assert(
    rMissingTitle.error.field === "title",
    "TEST 3 FAILED: error field should be 'title'"
  );
}

const rBadPriority = validateTask(INVALID_BAD_PRIORITY);
console.assert(rBadPriority.ok === false, "TEST 3 FAILED: bad priority should fail");
if (!rBadPriority.ok) {
  console.assert(
    rBadPriority.error.kind === "invalid_value",
    "TEST 3 FAILED: error kind should be 'invalid_value'"
  );
}

const rBadDeadline = validateTask(INVALID_BAD_DEADLINE);
console.assert(rBadDeadline.ok === false, "TEST 3 FAILED: bad deadline should fail");

const rZeroMinutes = validateTask(INVALID_ZERO_MINUTES);
console.assert(rZeroMinutes.ok === false, "TEST 3 FAILED: zero estimatedMinutes should fail");

console.log("TEST 3 passed: validateTask rejects invalid tasks ✓");

// -----------------------------------------------------------
// Test 4: scheduleTasks — invalid blobs are silently skipped
// -----------------------------------------------------------
const mixedBlobs: unknown[] = [
  VALID_HIGH,
  INVALID_MISSING_TITLE,
  VALID_LOW,
  INVALID_BAD_PRIORITY,
  VALID_MEDIUM,
];
const plan = scheduleTasks(mixedBlobs);

console.assert(
  plan.scheduled.length === 3,
  `TEST 4 FAILED: expected 3 scheduled tasks, got ${plan.scheduled.length}`
);
console.log("TEST 4 passed: invalid blobs are silently skipped ✓");

// -----------------------------------------------------------
// Test 5: scheduleTasks — output is ordered & ranked correctly
// -----------------------------------------------------------
console.assert(
  plan.scheduled[0].rank === 1,
  "TEST 5 FAILED: first task must have rank 1"
);
console.assert(
  plan.scheduled[1].rank === 2,
  "TEST 5 FAILED: second task must have rank 2"
);
console.assert(
  plan.scheduled[2].rank === 3,
  "TEST 5 FAILED: third task must have rank 3"
);

// High priority task should appear before low priority task
const firstTaskPriority = plan.scheduled[0].task.priority;
const lastTaskPriority = plan.scheduled[plan.scheduled.length - 1].task.priority;
console.assert(
  firstTaskPriority === "high",
  `TEST 5 FAILED: first scheduled task should be 'high' priority, got '${firstTaskPriority}'`
);
console.assert(
  lastTaskPriority === "low",
  `TEST 5 FAILED: last scheduled task should be 'low' priority, got '${lastTaskPriority}'`
);

const expectedTotal = 30 + 15 + 90; // estimatedMinutes from the 3 valid tasks
console.assert(
  plan.totalEstimatedMinutes === expectedTotal,
  `TEST 5 FAILED: totalEstimatedMinutes should be ${expectedTotal}, got ${plan.totalEstimatedMinutes}`
);

console.assert(
  typeof plan.generatedAt === "string" && plan.generatedAt.length > 0,
  "TEST 5 FAILED: generatedAt should be a non-empty string"
);

console.log("TEST 5 passed: execution plan ordering, ranking, and totals ✓");
console.log("\n✅ All tests passed!");
