// ─── challenge.ts ────────────────────────────────────────────────────────────
// Typed Retry & Concurrency-Limited Task Runner
//
// SCENARIO:
//   You're building the job-execution engine for a data-pipeline orchestrator.
//   Individual tasks are async functions that can fail transiently, so the
//   runner must retry them with exponential back-off, enforce a global
//   concurrency cap, and return a fully-typed settled report for every task.
//
// YOUR GOALS:
//   1. Fill in the four generic / utility types marked TODO.
//   2. Implement `withRetry` — wraps a single task with retry + back-off logic.
//   3. Implement `runWithConcurrencyLimit` — executes all tasks respecting the
//      concurrency cap and returns a `TaskReport<T>[]` in submission order.
//   4. Never use `any`, `as`, or non-null assertions (`!`).
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Core domain types ─────────────────────────────────────────────────────

/** A named async task that returns a value of type T. */
export interface Task<T> {
  readonly name: string;
  readonly run: () => Promise<T>;
}

/** Configuration for retry behaviour. */
export interface RetryConfig {
  /** Maximum number of attempts (first try + retries). Must be >= 1. */
  readonly maxAttempts: number;
  /** Base delay in ms before the first retry. Doubles each subsequent retry. */
  readonly baseDelayMs: number;
}

/** Configuration for the task runner. */
export interface RunnerConfig extends RetryConfig {
  /** Maximum number of tasks allowed to execute concurrently. Must be >= 1. */
  readonly concurrency: number;
}

// ── 2. Result / report types ─────────────────────────────────────────────────

// TODO A — TaskSuccess<T>
//   A discriminated-union arm representing a task that completed successfully.
//   Must carry: `status: "fulfilled"`, `name: string`, and `value: T`.
export type TaskSuccess<T> = {
  // TODO: fill in the fields
  readonly status: "fulfilled";
  readonly name: string;
  readonly value: T;
};

// TODO B — TaskFailure
//   A discriminated-union arm representing a task that exhausted all retries.
//   Must carry: `status: "rejected"`, `name: string`, `attempts: number`,
//   and `error: unknown`.
export type TaskFailure = {
  // TODO: fill in the fields
  readonly status: "rejected";
  readonly name: string;
  readonly attempts: number;
  readonly error: unknown;
};

// TODO C — TaskReport<T>
//   The union of TaskSuccess<T> and TaskFailure.
//   Hint: a simple two-arm discriminated union.
export type TaskReport<T> = TaskSuccess<T> | TaskFailure;

// TODO D — ReportFor<Tasks>
//   A mapped type that, given a tuple of Task<T> types, produces a tuple of
//   their corresponding TaskReport<T> types — preserving position.
//
//   Example:
//     ReportFor<[Task<number>, Task<string>]>
//     // => [TaskReport<number>, TaskReport<string>]
//
//   Hint: map over the tuple using a mapped type on `keyof Tasks & number`
//   (or a conditional / infer approach).
export type ReportFor<Tasks extends readonly Task<unknown>[]> = {
  [K in keyof Tasks]: Tasks[K] extends Task<infer T> ? TaskReport<T> : never;
};

// ── 3. Helper — sleep ─────────────────────────────────────────────────────────

/** Resolves after `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── 4. withRetry ─────────────────────────────────────────────────────────────

/**
 * Wraps a Task<T> with retry logic.
 *
 * Requirements:
 *   - Attempt `task.run()` up to `config.maxAttempts` times.
 *   - On failure, wait `baseDelayMs * 2^(attempt - 1)` ms before the next try.
 *     (i.e. 1st retry waits baseDelayMs, 2nd waits 2×baseDelayMs, etc.)
 *   - If every attempt fails, resolve (never reject) with a TaskFailure whose
 *     `attempts` equals the total number of tries made.
 *   - On success, resolve with a TaskSuccess<T>.
 *
 * @returns A Promise<TaskReport<T>> — always resolves, never rejects.
 */
export async function withRetry<T>(
  task: Task<T>,
  config: RetryConfig
): Promise<TaskReport<T>> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 5. runWithConcurrencyLimit ────────────────────────────────────────────────

/**
 * Runs an array of tasks with a concurrency cap, each wrapped in retry logic.
 *
 * Requirements:
 *   - At most `config.concurrency` tasks may be in-flight simultaneously.
 *   - Results must appear in the SAME ORDER as the input `tasks` array,
 *     regardless of completion order.
 *   - Returns a Promise that always resolves (never rejects) with a
 *     TaskReport<T>[] — one entry per input task.
 *
 * Note: For this challenge the simpler homogeneous overload (all tasks return
 * the same type T) is sufficient. The heterogeneous tuple overload using
 * ReportFor<Tasks> is the BONUS.
 *
 * @param tasks   Array of tasks, all returning the same type T.
 * @param config  Runner configuration (concurrency + retry settings).
 */
export async function runWithConcurrencyLimit<T>(
  tasks: Task<T>[],
  config: RunnerConfig
): Promise<TaskReport<T>[]> {
  // TODO: implement
  // HINTS:
  //   - Keep a pointer to the next task index to start.
  //   - Spawn exactly `config.concurrency` "worker" promises that each pull
  //     the next task, run it (via withRetry), store the result by index,
  //     then immediately pick up the next task — until none remain.
  //   - Use Promise.all over the worker promises to wait for all workers.
  throw new Error("Not implemented");
}

// ── BONUS (stretch goal) ──────────────────────────────────────────────────────
// Add a second overload of `runWithConcurrencyLimit` that accepts a
// *heterogeneous* readonly tuple of tasks and returns `ReportFor<Tasks>`,
// preserving each task's individual return type positionally.
// You'll need a function overload and the `ReportFor` mapped type above.
