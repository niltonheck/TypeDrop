// ============================================================
// Typed Concurrent Task Scheduler with Priority Queues
// ============================================================
// REQUIREMENTS
// 1. Define a branded `TaskId` type (string brand) so raw strings
//    cannot be accidentally used as task IDs without going through
//    `makeTaskId`.
// 2. Define a `Priority` discriminated union: "low" | "normal" | "high" | "critical".
// 3. Define a `TaskDefinition<T>` generic interface that carries:
//    - id: TaskId
//    - priority: Priority
//    - resourceGroup: string   (concurrency is capped per group)
//    - run: () => Promise<T>   (the actual work)
//    - timeoutMs?: number      (optional per-task timeout)
// 4. Define a discriminated `TaskResult<T>` union with variants:
//    - { status: "fulfilled"; id: TaskId; value: T }
//    - { status: "rejected";  id: TaskId; error: TaskError }
//    - { status: "cancelled"; id: TaskId; reason: string }
// 5. Define a `TaskError` discriminated union:
//    - { kind: "timeout";   durationMs: number }
//    - { kind: "runtime";   message: string; cause?: unknown }
//    - { kind: "overflow";  queueSize: number }
// 6. Define `SchedulerConfig`:
//    - maxConcurrencyPerGroup: number  (max simultaneous tasks per resourceGroup)
//    - globalConcurrencyLimit: number  (hard cap across all groups)
//    - maxQueueSizePerGroup: number    (reject with "overflow" if exceeded)
// 7. Implement `makeTaskId(raw: string): TaskId`
// 8. Implement `createScheduler(config: SchedulerConfig): Scheduler`
//    The returned `Scheduler` object must satisfy the `Scheduler` interface (see below).
// 9. `Scheduler.submit<T>(task: TaskDefinition<T>): Promise<TaskResult<T>>`
//    - If the group's queue is full → resolve immediately with a "cancelled" result
//      whose reason contains "overflow".
//    - Tasks are dequeued in PRIORITY order (critical > high > normal > low).
//    - Respect both per-group AND global concurrency limits before dispatching.
//    - If a task exceeds its `timeoutMs`, resolve with a "rejected" / "timeout" error.
//    - If `run()` throws/rejects, resolve with a "rejected" / "runtime" error.
//    - Successful runs resolve with "fulfilled".
// 10. `Scheduler.cancel(id: TaskId): boolean`
//    - Removes a QUEUED (not yet running) task and resolves its promise with
//      a "cancelled" result. Returns true if found, false otherwise.
// 11. `Scheduler.stats(): SchedulerStats`
//    - Returns a snapshot: queued count per group, running count per group,
//      and total counts.
// 12. Use a mapped type to derive `GroupStats` from `SchedulerStats` so the
//    per-group breakdown is always consistent with the totals shape.
// 13. No `any`, no non-null assertions (`!`), no type casts (`as`).
// ============================================================

// --- Branded Types ---

// TODO: declare the `TaskId` brand and `makeTaskId` factory
declare const __taskIdBrand: unique symbol;
export type TaskId = string & { readonly [__taskIdBrand]: true };
export function makeTaskId(raw: string): TaskId {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- Priority ---

// TODO: define the Priority union
export type Priority = TODO;

// --- Errors ---

// TODO: define the TaskError discriminated union (timeout | runtime | overflow)
export type TaskError = TODO;

// --- Task Result ---

// TODO: define the TaskResult<T> discriminated union (fulfilled | rejected | cancelled)
export type TaskResult<T> = TODO;

// --- Task Definition ---

// TODO: define TaskDefinition<T>
export interface TaskDefinition<T> {
  // TODO
}

// --- Scheduler Config ---

export interface SchedulerConfig {
  maxConcurrencyPerGroup: number;
  globalConcurrencyLimit: number;
  maxQueueSizePerGroup: number;
}

// --- Stats ---

// TODO: define GroupCounts with { queued: number; running: number }
export interface GroupCounts {
  // TODO
}

// TODO: use a mapped type to define SchedulerStats so that
// perGroup is Record<string, GroupCounts> and totals mirrors GroupCounts keys
export type SchedulerStats = {
  perGroup: Record<string, GroupCounts>;
  totals: { [K in keyof GroupCounts]: number };
};

// --- Scheduler Interface ---

export interface Scheduler {
  submit<T>(task: TaskDefinition<T>): Promise<TaskResult<T>>;
  cancel(id: TaskId): boolean;
  stats(): SchedulerStats;
}

// --- Implementation ---

// TODO: implement createScheduler
export function createScheduler(config: SchedulerConfig): Scheduler {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// HELPER — priority ordering (feel free to use this)
// ============================================================
const PRIORITY_ORDER: Record<Priority, number> = {
  // TODO: fill in weights (higher number = higher priority)
} satisfies Record<Priority, number>;
