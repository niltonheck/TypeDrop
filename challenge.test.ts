
// ============================================================
// challenge.test.ts
// ============================================================
import {
  computeUrgency,
  validateTask,
  buildPriorityQueue,
  filterByStatus,
  groupByUrgency,
  type Task,
  type UrgencyTier,
} from "./challenge";

// ── Mock data ───────────────────────────────────────────────

const TODAY = new Date();
TODAY.setUTCHours(0, 0, 0, 0);

function isoInDays(days: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

const rawTasks: unknown[] = [
  // index 0 — high priority, 1 day out → urgency 5
  {
    id: "task-1",
    title: "Fix critical bug",
    priority: "high",
    dueDate: isoInDays(1),
    status: "in-progress",
    tags: ["backend", "urgent"],
  },
  // index 1 — medium priority, 5 days out → urgency 3
  {
    id: "task-2",
    title: "Write unit tests",
    priority: "medium",
    dueDate: isoInDays(5),
    status: "pending",
    tags: ["testing"],
  },
  // index 2 — low priority, 10 days out → urgency 1
  {
    id: "task-3",
    title: "Update README",
    priority: "low",
    dueDate: isoInDays(10),
    status: "done",
    tags: [],
  },
  // index 3 — INVALID: missing title
  {
    id: "task-4",
    title: "",
    priority: "high",
    dueDate: isoInDays(2),
    status: "pending",
    tags: ["ops"],
  },
  // index 4 — INVALID: bad priority
  {
    id: "task-5",
    title: "Deploy to staging",
    priority: "critical", // not a valid RawPriority
    dueDate: isoInDays(3),
    status: "pending",
    tags: [],
  },
  // index 5 — high priority, 4 days out → urgency 4
  {
    id: "task-6",
    title: "Review PR",
    priority: "high",
    dueDate: isoInDays(4),
    status: "pending",
    tags: ["review"],
  },
];

// ── Tests ────────────────────────────────────────────────────

// Test 1: computeUrgency matrix spot-checks
console.assert(
  computeUrgency("high", new Date(TODAY.getTime() + 1 * 86_400_000)) === 5,
  "FAIL Test 1a: high + 1 day should be urgency 5"
);
console.assert(
  computeUrgency("medium", new Date(TODAY.getTime() + 5 * 86_400_000)) === 3,
  "FAIL Test 1b: medium + 5 days should be urgency 3"
);
console.assert(
  computeUrgency("low", new Date(TODAY.getTime() + 10 * 86_400_000)) === 1,
  "FAIL Test 1c: low + 10 days should be urgency 1"
);
console.assert(
  computeUrgency("high", new Date(TODAY.getTime() + 10 * 86_400_000)) === 3,
  "FAIL Test 1d: high + 10 days should be urgency 3"
);

// Test 2: validateTask rejects invalid input correctly
const badPriorityResult = validateTask({
  id: "x",
  title: "Hello",
  priority: "critical",
  dueDate: isoInDays(3),
  status: "pending",
  tags: [],
});
console.assert(
  !badPriorityResult.ok && badPriorityResult.error.kind === "INVALID_PRIORITY",
  "FAIL Test 2: invalid priority should produce INVALID_PRIORITY error"
);

// Test 3: validateTask accepts valid input and sets urgencyTier
const goodResult = validateTask(rawTasks[0]);
console.assert(
  goodResult.ok && goodResult.value.urgencyTier === 5,
  "FAIL Test 3: task-1 (high, 1 day) should have urgencyTier 5"
);

// Test 4: buildPriorityQueue — correct valid/error split and sort order
const { tasks, errors } = buildPriorityQueue(rawTasks);
console.assert(
  tasks.length === 4 && errors.length === 2,
  `FAIL Test 4a: expected 4 valid tasks and 2 errors, got ${tasks.length} / ${errors.length}`
);
console.assert(
  tasks[0].id === "task-1" && tasks[1].id === "task-6",
  `FAIL Test 4b: tasks should be sorted urgency DESC — got ${tasks.map((t) => t.id).join(", ")}`
);
console.assert(
  errors.some((e) => e.index === 3 && e.error.kind === "MISSING_TITLE") &&
    errors.some((e) => e.index === 4 && e.error.kind === "INVALID_PRIORITY"),
  "FAIL Test 4c: errors should reference indices 3 and 4 with correct kinds"
);

// Test 5: filterByStatus and groupByUrgency
const pending = filterByStatus(tasks, "pending");
console.assert(
  pending.every((t) => t.status === "pending"),
  "FAIL Test 5a: filterByStatus should return only pending tasks"
);

const grouped = groupByUrgency(tasks);
const allTiers: UrgencyTier[] = [1, 2, 3, 4, 5];
console.assert(
  allTiers.every((tier) => Array.isArray(grouped[tier])),
  "FAIL Test 5b: groupByUrgency must include all 5 tier keys"
);
console.assert(
  grouped[5].length === 1 && grouped[5][0].id === "task-1",
  "FAIL Test 5c: tier 5 should contain only task-1"
);

console.log("All tests passed! ✅");
