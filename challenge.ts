// ============================================================
// challenge.ts — Typed Concurrent Task Scheduler
// ============================================================
// RULES
//  • No `any`, no type assertions (`as`), no `@ts-ignore`
//  • Must compile under strict: true
//  • Implement every function marked TODO
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPE — enforce that concurrency limits are positive ints
// ------------------------------------------------------------------

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** A positive integer representing the max number of concurrent tasks. */
export type Concurrency = Brand<number, "Concurrency">;

/**
 * TODO 1 — Implement this constructor.
 * Requirements:
 *   1a. Throw a TypeError if `n` is not a finite integer >= 1.
 *   1b. Otherwise return `n` widened to the `Concurrency` brand.
 */
export function makeConcurrency(n: number): Concurrency {
  // TODO 1
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 2. TASK TYPES — discriminated union of priority levels
// ------------------------------------------------------------------

export type Priority = "critical" | "high" | "normal" | "low";

/** Numeric weight for ordering; lower = runs first. */
export const PRIORITY_WEIGHT = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
} as const satisfies Record<Priority, number>;

export interface Task<T> {
  readonly id: string;
  readonly priority: Priority;
  /** The async work to perform. May resolve or reject. */
  readonly run: () => Promise<T>;
}

// ------------------------------------------------------------------
// 3. RESULT TYPES — typed success / failure per task
// ------------------------------------------------------------------

export type TaskSuccess<T> = {
  readonly status: "fulfilled";
  readonly id: string;
  readonly priority: Priority;
  readonly value: T;
  /** Wall-clock milliseconds the task took to complete. */
  readonly durationMs: number;
};

export type TaskFailure = {
  readonly status: "rejected";
  readonly id: string;
  readonly priority: Priority;
  readonly reason: unknown;
  readonly durationMs: number;
};

export type TaskResult<T> = TaskSuccess<T> | TaskFailure;

// ------------------------------------------------------------------
// 4. AGGREGATED REPORT
// ------------------------------------------------------------------

export type SchedulerReport<T> = {
  /** All results in the order tasks *completed* (not submitted). */
  readonly results: ReadonlyArray<TaskResult<T>>;
  /** Total wall-clock ms from first task start to last task finish. */
  readonly totalDurationMs: number;
  /** Number of tasks that fulfilled. */
  readonly successCount: number;
  /** Number of tasks that rejected. */
  readonly failureCount: number;
  /**
   * The single fulfilled value with the highest-priority task that succeeded,
   * or `null` if no task succeeded.
   *
   * Requirement: if two successes share the same priority, prefer the one
   * whose task appeared *earlier* in the original input array.
   */
  readonly topResult: TaskSuccess<T> | null;
};

// ------------------------------------------------------------------
// 5. HELPERS you must implement
// ------------------------------------------------------------------

/**
 * TODO 2 — Sort a copy of `tasks` by priority (critical first, low last).
 * Requirements:
 *   2a. Use `PRIORITY_WEIGHT` for ordering — do NOT hard-code strings.
 *   2b. Tasks of equal priority must preserve their original relative order
 *       (i.e. the sort must be stable with respect to the input array).
 *   2c. Return a new array; do not mutate the input.
 */
export function sortByPriority<T>(tasks: ReadonlyArray<Task<T>>): Array<Task<T>> {
  // TODO 2
  throw new Error("Not implemented");
}

/**
 * TODO 3 — Narrow a `TaskResult<T>` to `TaskSuccess<T>`.
 * Requirements:
 *   3a. Return `true` iff `result.status === "fulfilled"`.
 *   3b. Must be a proper TypeScript type predicate so callers get narrowing.
 */
export function isSuccess<T>(result: TaskResult<T>): result is TaskSuccess<T> {
  // TODO 3
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. MAIN SCHEDULER — the heart of the challenge
// ------------------------------------------------------------------

/**
 * TODO 4 — Run all `tasks` with at most `concurrency` running at once,
 * draining them in priority order, and return a `SchedulerReport<T>`.
 *
 * Requirements:
 *   4a. Tasks must be started in priority order (critical before high, etc.).
 *       Within the same priority level, preserve the original input order.
 *   4b. At no point may more than `concurrency` tasks be executing simultaneously.
 *   4c. When a running slot opens up, immediately start the next queued task
 *       (do not wait for an artificial delay).
 *   4d. A task that rejects must NOT cause other tasks to abort — capture its
 *       error as a `TaskFailure` and continue.
 *   4e. `durationMs` for each task is measured from just before `run()` is
 *       called to when its promise settles.
 *   4f. `totalDurationMs` is measured from when `runScheduler` is called to
 *       when the last task settles.
 *   4g. `results` must be in *completion* order (whichever task finishes first
 *       appears first), not submission order.
 *   4h. Compute `topResult` according to the rule in `SchedulerReport`.
 *       Hint: "appeared earlier in the original input array" means you need
 *       the original index, not the sorted index.
 *   4i. If `tasks` is empty, return a valid report with empty results,
 *       zero counts, zero duration, and `topResult: null`.
 */
export async function runScheduler<T>(
  tasks: ReadonlyArray<Task<T>>,
  concurrency: Concurrency
): Promise<SchedulerReport<T>> {
  // TODO 4
  throw new Error("Not implemented");
}
