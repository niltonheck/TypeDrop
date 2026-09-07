// ─── challenge.test.ts ───────────────────────────────────────────────────────
import {
  createTask,
  transitionTask,
  nextToProcess,
  summariseByStatus,
  VALID_TRANSITIONS,
  type Task,
  type TaskStatus,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeTask(
  overrides: Partial<Task> & Pick<Task, "priority" | "status">
): Task {
  return {
    id: crypto.randomUUID(),
    title: "Test task",
    createdAt: Date.now(),
    ...overrides,
  };
}

// ── Test 1: createTask produces a well-formed pending task ────────────────────
{
  const t = createTask("Write docs", "high");
  console.assert(t.title === "Write docs", "title should match");
  console.assert(t.priority === "high", "priority should be high");
  console.assert(t.status === "pending", "initial status should be pending");
  console.assert(typeof t.id === "string" && t.id.length > 0, "id should be a non-empty string");
  console.assert(typeof t.createdAt === "number", "createdAt should be a number");
  console.assert(t.startedAt === undefined, "startedAt should not be set on creation");
  console.assert(t.finishedAt === undefined, "finishedAt should not be set on creation");
  console.log("✅ Test 1 passed: createTask");
}

// ── Test 2: valid transition updates status and timestamps ────────────────────
{
  const t0 = createTask("Fix bug", "critical");
  const t1 = transitionTask(t0, "in-progress");
  console.assert(t1.status === "in-progress", "status should be in-progress");
  console.assert(typeof t1.startedAt === "number", "startedAt should be set");
  console.assert(t1.finishedAt === undefined, "finishedAt should not be set yet");

  const t2 = transitionTask(t1, "done");
  console.assert(t2.status === "done", "status should be done");
  console.assert(typeof t2.finishedAt === "number", "finishedAt should be set");

  // Original task must not be mutated
  console.assert(t0.status === "pending", "original task must not be mutated");
  console.log("✅ Test 2 passed: transitionTask (valid)");
}

// ── Test 3: invalid transition returns the original task unchanged ─────────────
{
  const t = makeTask({ priority: "low", status: "done" });
  const result = transitionTask(t, "in-progress"); // done → in-progress is invalid
  console.assert(result.status === "done", "invalid transition should leave status unchanged");
  console.assert(result === t || result.status === t.status, "task should be returned unchanged");
  console.log("✅ Test 3 passed: transitionTask (invalid)");
}

// ── Test 4: nextToProcess returns highest-priority pending task ───────────────
{
  const now = Date.now();
  const tasks: Task[] = [
    makeTask({ priority: "low",      status: "pending",     createdAt: now - 3000 }),
    makeTask({ priority: "high",     status: "pending",     createdAt: now - 2000 }),
    makeTask({ priority: "critical", status: "in-progress", createdAt: now - 1000 }), // not pending
    makeTask({ priority: "medium",   status: "pending",     createdAt: now - 500  }),
  ];

  const next = nextToProcess(tasks);
  console.assert(next !== undefined, "should find a pending task");
  console.assert(next!.priority === "high", "should pick the highest-priority pending task");
  console.log("✅ Test 4 passed: nextToProcess");
}

// ── Test 5: summariseByStatus counts all statuses including zeros ─────────────
{
  const now = Date.now();
  const tasks: Task[] = [
    makeTask({ priority: "low",    status: "pending"     }),
    makeTask({ priority: "medium", status: "pending"     }),
    makeTask({ priority: "high",   status: "in-progress" }),
    makeTask({ priority: "low",    status: "done"        }),
  ];

  const summary = summariseByStatus(tasks);
  console.assert(summary["pending"]     === 2, "pending count should be 2");
  console.assert(summary["in-progress"] === 1, "in-progress count should be 1");
  console.assert(summary["done"]        === 1, "done count should be 1");
  console.assert(summary["cancelled"]   === 0, "cancelled count should be 0 (not missing)");
  console.log("✅ Test 5 passed: summariseByStatus");
}
