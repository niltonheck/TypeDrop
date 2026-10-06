// ============================================================
// Typed Task Priority Queue
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no `as`, no unsafe casts.
// Fill in every section marked TODO.
// ============================================================

// ── 1. Priority levels ──────────────────────────────────────
// TODO: Define a `Priority` type as a union of the three
//       string literals: "low" | "medium" | "high"
export type Priority = TODO;

// ── 2. Task shape ───────────────────────────────────────────
// TODO: Define a `Task` interface with:
//   - id:          string
//   - title:       string
//   - priority:    Priority
//   - tags:        readonly string[]
//   - createdAt:   Date
export interface Task extends TODO {}

// ── 3. Priority ordering ────────────────────────────────────
// TODO: Define a const object `PRIORITY_ORDER` that maps every
//       Priority to a numeric weight (higher number = higher
//       urgency).  Use `satisfies Record<Priority, number>` so
//       the compiler verifies all keys are present.
//
//       Suggested weights: low → 1, medium → 2, high → 3
export const PRIORITY_ORDER = TODO;

// ── 4. Queue state ──────────────────────────────────────────
// TODO: Define a generic interface `PriorityQueue<T>` with:
//   - items:   T[]          (the internal storage)
//   - size:    number       (current number of items)
export interface PriorityQueue<T> extends TODO {}

// ── 5. createQueue ──────────────────────────────────────────
// TODO: Implement `createQueue<T>(): PriorityQueue<T>`
//       Returns a fresh empty queue (items: [], size: 0).
export function createQueue<T>(): PriorityQueue<T> {
  // TODO
  throw new Error("Not implemented");
}

// ── 6. enqueue ──────────────────────────────────────────────
// TODO: Implement `enqueue(queue, task)`
//       - Adds `task` to `queue.items`
//       - Updates `queue.size`
//       - Returns the mutated queue (same reference)
//       - The function must be generic: `<T extends Task>`
export function enqueue<T extends Task>(
  queue: PriorityQueue<T>,
  task: T
): PriorityQueue<T> {
  // TODO
  throw new Error("Not implemented");
}

// ── 7. dequeue ──────────────────────────────────────────────
// TODO: Implement `dequeue(queue)`
//       - Removes and returns the Task with the HIGHEST priority
//         (use PRIORITY_ORDER weights to compare).
//       - If two tasks share the same priority, return the one
//         that was enqueued FIRST (earlier createdAt wins).
//       - Returns `undefined` when the queue is empty.
//       - The function must be generic: `<T extends Task>`
export function dequeue<T extends Task>(
  queue: PriorityQueue<T>
): T | undefined {
  // TODO
  throw new Error("Not implemented");
}

// ── 8. Result types for the summary report ──────────────────
// TODO: Define a discriminated union `SummaryResult` with two
//       members:
//
//   { status: "ok";    counts: Record<Priority, number>;
//                      topTask: Task }
//   { status: "empty"; counts: Record<Priority, number> }
//
//       Hint: both variants share `counts`; only "ok" has
//       `topTask` (the highest-priority item WITHOUT removing it).
export type SummaryResult = TODO;

// ── 9. summarize ────────────────────────────────────────────
// TODO: Implement `summarize<T extends Task>(queue: PriorityQueue<T>): SummaryResult`
//       - Counts how many tasks exist per Priority level.
//       - If the queue is non-empty, also identifies the topTask
//         (same selection logic as dequeue, but NON-destructive).
//       - Returns the correct SummaryResult variant.
export function summarize<T extends Task>(
  queue: PriorityQueue<T>
): SummaryResult {
  // TODO
  throw new Error("Not implemented");
}
