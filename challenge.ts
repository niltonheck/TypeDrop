// ─── challenge.ts ────────────────────────────────────────────────────────────
// Typed Task Queue with Priority & Status Tracking
//
// REQUIREMENTS
// 1. Define a `Priority` type — a union of the string literals:
//    "low" | "medium" | "high" | "critical"
//
// 2. Define a `TaskStatus` type — a union of the string literals:
//    "pending" | "in-progress" | "done" | "cancelled"
//
// 3. Define a `Task` interface with the fields:
//    - id:          string
//    - title:       string
//    - priority:    Priority
//    - status:      TaskStatus
//    - createdAt:   number   (Unix timestamp ms)
//    - startedAt?:  number   (set when status becomes "in-progress")
//    - finishedAt?: number   (set when status becomes "done" or "cancelled")
//
// 4. Define `VALID_TRANSITIONS` — a `Record` mapping every `TaskStatus` to a
//    `ReadonlyArray<TaskStatus>` listing the statuses it may legally move to.
//    Valid transitions:
//      "pending"     → ["in-progress", "cancelled"]
//      "in-progress" → ["done", "cancelled"]
//      "done"        → []
//      "cancelled"   → []
//
// 5. Implement `createTask`:
//    - Accepts title (string) and priority (Priority).
//    - Returns a new Task with a generated id (use `crypto.randomUUID()`),
//      status "pending", and createdAt set to Date.now().
//    - startedAt and finishedAt must NOT be set.
//
// 6. Implement `transitionTask`:
//    - Accepts a Task and a next TaskStatus.
//    - If the transition is invalid, return the task UNCHANGED.
//    - If valid, return a NEW Task object (do not mutate) with:
//        • status updated to the next value
//        • startedAt set to Date.now() when next === "in-progress"
//        • finishedAt set to Date.now() when next === "done" || "cancelled"
//
// 7. Implement `nextToProcess`:
//    - Accepts a ReadonlyArray<Task>.
//    - Returns the single "pending" task with the highest priority, or
//      `undefined` if none exist.
//    - Priority order (highest → lowest): critical > high > medium > low
//    - Break ties by choosing the task with the smallest createdAt value.
//
// 8. Implement `summariseByStatus`:
//    - Accepts a ReadonlyArray<Task>.
//    - Returns a `Record<TaskStatus, number>` with the count of tasks in each
//      status. Every status key must always be present (count 0 if none).

// ── 1 & 2: Union types ───────────────────────────────────────────────────────
export type Priority = "low" | "medium" | "high" | "critical";

export type TaskStatus = "pending" | "in-progress" | "done" | "cancelled";

// ── 3: Task interface ─────────────────────────────────────────────────────────
export interface Task {
  // TODO: fill in the fields described in requirement 3
}

// ── 4: Valid transitions ──────────────────────────────────────────────────────
export const VALID_TRANSITIONS: Record<TaskStatus, ReadonlyArray<TaskStatus>> =
  {
    // TODO: fill in the valid transitions described in requirement 4
  } satisfies Record<TaskStatus, ReadonlyArray<TaskStatus>>;

// ── 5: createTask ─────────────────────────────────────────────────────────────
export function createTask(title: string, priority: Priority): Task {
  // TODO
  throw new Error("Not implemented");
}

// ── 6: transitionTask ────────────────────────────────────────────────────────
export function transitionTask(task: Task, next: TaskStatus): Task {
  // TODO
  throw new Error("Not implemented");
}

// ── 7: nextToProcess ─────────────────────────────────────────────────────────
export function nextToProcess(tasks: ReadonlyArray<Task>): Task | undefined {
  // TODO
  throw new Error("Not implemented");
}

// ── 8: summariseByStatus ─────────────────────────────────────────────────────
export function summariseByStatus(
  tasks: ReadonlyArray<Task>
): Record<TaskStatus, number> {
  // TODO
  throw new Error("Not implemented");
}
