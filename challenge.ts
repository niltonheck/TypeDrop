// ─── challenge.ts ────────────────────────────────────────────────────────────
// Typed Task Scheduler with Priority Queues & Retry Policies
//
// REQUIREMENTS
// ────────────────────────────────────────────────────────
// 1. Define the core domain types (Task, TaskResult, RunReport) using
//    discriminated unions, branded types, and mapped utility types as needed.
// 2. Implement `enqueue` — adds a Task to the scheduler's internal priority queue.
//    Higher-priority tasks (lower numeric value) must be drained first.
// 3. Implement `drain` — runs all enqueued tasks respecting `maxConcurrency`.
//    Tasks at the same priority level may run concurrently (up to the cap).
//    Tasks at a higher priority level must complete before lower-priority ones start.
// 4. Implement retry logic inside `drain`: if a task's handler throws, retry up to
//    `retryPolicy.maxAttempts` times with `retryPolicy.delayMs` between attempts.
//    Record every attempt outcome in the TaskResult.
// 5. `drain` must return a `RunReport` that contains per-task results, plus
//    aggregate counts: total, succeeded, failed.
// 6. Implement `createScheduler` — factory that wires everything together and
//    returns a `Scheduler` object (enqueue + drain).
// ────────────────────────────────────────────────────────

// ── Branded primitive ────────────────────────────────────────────────────────
// TODO: Define a branded type `TaskId` that is a `string` at runtime but
//       distinct from plain `string` at the type level.
export type TaskId = string & { readonly __brand: "TaskId" };

export function makeTaskId(raw: string): TaskId {
  return raw as TaskId; // branding helper — the only allowed cast in this file
}

// ── Priority ─────────────────────────────────────────────────────────────────
// TODO: Define `Priority` as a union of the numeric literals 1 | 2 | 3
//       where 1 = highest, 3 = lowest.
export type Priority = 1 | 2 | 3;

// ── Retry policy ─────────────────────────────────────────────────────────────
// TODO: Define `RetryPolicy` with:
//   - maxAttempts: number   (total attempts including the first try; min 1)
//   - delayMs:    number   (milliseconds to wait between retries)
export type RetryPolicy = {
  // TODO
};

// ── Task ─────────────────────────────────────────────────────────────────────
// TODO: Define a generic `Task<P>` where P is the payload type:
//   - id:          TaskId
//   - priority:    Priority
//   - payload:     P
//   - retryPolicy: RetryPolicy
//   - handler:     (payload: P) => Promise<string>
//                  resolves with a string result message on success,
//                  throws on failure
export type Task<P> = {
  // TODO
};

// ── Attempt outcome ───────────────────────────────────────────────────────────
// TODO: Define `AttemptOutcome` as a discriminated union:
//   | { status: "success"; attemptNumber: number; message: string  }
//   | { status: "failure"; attemptNumber: number; error:   string  }
export type AttemptOutcome =
  // TODO
  never;

// ── TaskResult ────────────────────────────────────────────────────────────────
// TODO: Define `TaskResult` as a discriminated union keyed on `status`:
//   | { status: "succeeded"; taskId: TaskId; attempts: AttemptOutcome[] }
//   | { status: "failed";    taskId: TaskId; attempts: AttemptOutcome[] }
//   The final status is "succeeded" if the last attempt was a success,
//   "failed" if all attempts were exhausted with failures.
export type TaskResult =
  // TODO
  never;

// ── RunReport ─────────────────────────────────────────────────────────────────
// TODO: Define `RunReport` with:
//   - results:   TaskResult[]
//   - total:     number
//   - succeeded: number
//   - failed:    number
export type RunReport = {
  // TODO
};

// ── Scheduler interface ───────────────────────────────────────────────────────
export interface Scheduler {
  // Adds a task to the internal queue. Generic so callers keep payload types.
  enqueue<P>(task: Task<P>): void;

  // Drains the queue respecting priority and concurrency, returns a RunReport.
  drain(maxConcurrency: number): Promise<RunReport>;
}

// ── Helper: sleep ─────────────────────────────────────────────────────────────
// TODO: Implement a typed `sleep` helper that returns Promise<void> after `ms`.
function sleep(ms: number): Promise<void> {
  // TODO
  throw new Error("not implemented");
}

// ── Core logic: runWithRetry ──────────────────────────────────────────────────
// TODO: Implement `runWithRetry`.
// Given a Task<P>, run its handler with retry logic.
// - Attempt the handler up to `task.retryPolicy.maxAttempts` times.
// - Wait `task.retryPolicy.delayMs` between attempts (use `sleep`).
// - Collect every AttemptOutcome.
// - Return a TaskResult (succeeded or failed).
async function runWithRetry<P>(task: Task<P>): Promise<TaskResult> {
  // TODO
  throw new Error("not implemented");
}

// ── Factory ───────────────────────────────────────────────────────────────────
// TODO: Implement `createScheduler`.
// - Maintains an internal queue of tasks (use Task<unknown> internally,
//   but the public `enqueue` signature stays generic — see the interface).
// - `drain(maxConcurrency)`:
//     1. Sort queued tasks by priority ascending (1 first).
//     2. Group them into priority buckets.
//     3. Process each bucket sequentially (one bucket at a time).
//     4. Within a bucket, run tasks concurrently up to `maxConcurrency`
//        using Promise.all over batches.
//     5. Collect all TaskResults and build a RunReport.
// - After draining, the internal queue must be cleared.
export function createScheduler(): Scheduler {
  // TODO
  throw new Error("not implemented");
}
