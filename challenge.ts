// =============================================================
// challenge.ts — Typed Task Priority Queue
// =============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every section marked TODO.
// =============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES
// ------------------------------------------------------------------

/** Raw priority levels accepted by the API. */
export type Priority = "low" | "medium" | "high" | "critical";

/**
 * A validated task ready to be queued.
 *
 * TODO: Define the Task type with the following fields:
 *   - id:          string
 *   - title:       string
 *   - priority:    Priority
 *   - durationMin: number   (estimated duration in minutes, must be > 0)
 *   - tags:        readonly string[]
 */
export type Task = {
  // TODO
};

/**
 * The execution plan produced after draining the queue.
 *
 * TODO: Define ExecutionPlan with:
 *   - orderedTasks: readonly Task[]   (high→low priority order)
 *   - totalDurationMin: number        (sum of all task durations)
 *   - taskCountByPriority: Record<Priority, number>
 */
export type ExecutionPlan = {
  // TODO
};

// ------------------------------------------------------------------
// 2. VALIDATION HELPERS
// ------------------------------------------------------------------

/** Ordered priority levels — highest first. Used for sorting. */
export const PRIORITY_ORDER = ["critical", "high", "medium", "low"] as const;

/**
 * TODO: Implement isValidPriority(value: unknown): value is Priority
 *
 * Requirements:
 *   - Returns true only when `value` is one of the four Priority strings.
 */
export function isValidPriority(value: unknown): value is Priority {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Implement validateTask(raw: unknown): Task
 *
 * Requirements:
 *   # 1 — Throw a TypeError with message "Invalid task" if `raw` is not
 *          a non-null object.
 *   # 2 — Throw a TypeError with message "Invalid task.id" if `id` is
 *          not a non-empty string.
 *   # 3 — Throw a TypeError with message "Invalid task.title" if `title`
 *          is not a non-empty string.
 *   # 4 — Throw a TypeError with message "Invalid task.priority" if
 *          `priority` is not a valid Priority.
 *   # 5 — Throw a TypeError with message "Invalid task.durationMin" if
 *          `durationMin` is not a number greater than 0.
 *   # 6 — Throw a TypeError with message "Invalid task.tags" if `tags`
 *          is not an array of strings (may be empty).
 *   # 7 — Return a well-typed Task on success.
 */
export function validateTask(raw: unknown): Task {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 3. PRIORITY QUEUE
// ------------------------------------------------------------------

/**
 * A minimal typed priority queue for Tasks.
 *
 * TODO: Implement the class body.
 *
 * Requirements:
 *   # 8  — `insert(task: Task): void` adds a task.
 *   # 9  — `drain(): readonly Task[]` removes and returns ALL tasks
 *           sorted by priority (critical → high → medium → low).
 *           Tasks of equal priority preserve insertion order (stable sort).
 *   # 10 — `size` getter returns the current number of queued tasks.
 *   # 11 — After `drain()`, the queue must be empty (size === 0).
 */
export class TaskQueue {
  // TODO: private storage field

  get size(): number {
    // TODO
    throw new Error("Not implemented");
  }

  insert(task: Task): void {
    // TODO
    throw new Error("Not implemented");
  }

  drain(): readonly Task[] {
    // TODO
    throw new Error("Not implemented");
  }
}

// ------------------------------------------------------------------
// 4. PLAN BUILDER
// ------------------------------------------------------------------

/**
 * TODO: Implement buildExecutionPlan(rawTasks: unknown[]): ExecutionPlan
 *
 * Requirements:
 *   # 12 — Validate every element with `validateTask`; if any element
 *           throws, let the error propagate unchanged.
 *   # 13 — Insert all valid tasks into a TaskQueue, then drain it.
 *   # 14 — Compute `totalDurationMin` as the sum of all task durations.
 *   # 15 — Compute `taskCountByPriority` — every Priority key must be
 *           present, even if its count is 0.
 *   # 16 — Return a well-typed ExecutionPlan.
 */
export function buildExecutionPlan(rawTasks: unknown[]): ExecutionPlan {
  // TODO
  throw new Error("Not implemented");
}
