// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed Retry-with-Backoff Task Queue
//
// SCENARIO:
//   You're building the background job runner for a data-pipeline service.
//   Tasks arrive with typed inputs and outputs. Each task is retried up to a
//   configurable limit on transient failures (using exponential backoff) before
//   being permanently failed. The queue surfaces per-task results without
//   discarding successful jobs, and the whole run respects an AbortSignal.
//
// REQUIREMENTS:
//   1. Define a `TaskResult<T>` discriminated union with variants:
//        - `{ status: "fulfilled"; value: T }`
//        - `{ status: "failed"; attempts: number; lastError: Error }`
//      The `status` field must be the discriminant.
//
//   2. Define a `Task<I, O>` type that carries:
//        - `id`     : string  — unique identifier
//        - `input`  : I       — typed input passed to the executor
//        - `execute`: (input: I, signal: AbortSignal) => Promise<O>
//                     — the async work unit (receives the shared AbortSignal)
//
//   3. Define a `RetryPolicy` type with:
//        - `maxAttempts`  : number  — total attempts allowed (≥ 1)
//        - `baseDelayMs`  : number  — initial backoff delay in ms
//        - `backoffFactor`: number  — multiplier applied each retry
//
//   4. Implement:
//        runWithRetry<I, O>(
//          task    : Task<I, O>,
//          policy  : RetryPolicy,
//          signal  : AbortSignal,
//        ): Promise<TaskResult<O>>
//
//      Behaviour:
//        a. Call `task.execute(task.input, signal)` up to `policy.maxAttempts` times.
//        b. On success, return `{ status: "fulfilled", value }` immediately.
//        c. On failure, wait `baseDelayMs * backoffFactor^(attempt-1)` ms before
//           the next attempt (attempt index is 0-based).
//        d. If the signal is aborted before a retry delay finishes, stop retrying
//           and return `{ status: "failed", attempts, lastError }` where `lastError`
//           is an `Error` with message "Aborted".
//        e. After exhausting all attempts, return
//           `{ status: "failed", attempts: policy.maxAttempts, lastError }`.
//
//   5. Implement:
//        runQueue<I, O>(
//          tasks   : ReadonlyArray<Task<I, O>>,
//          policy  : RetryPolicy,
//          signal  : AbortSignal,
//        ): Promise<ReadonlyArray<QueueResult<I, O>>>
//
//      Where `QueueResult<I, O>` is a type you define that pairs each task's `id`
//      and `input` with its `TaskResult<O>`.
//
//      Behaviour:
//        a. Run all tasks **concurrently** (Promise.all — not sequentially).
//        b. Every task runs through `runWithRetry`; failures must NOT prevent
//           other tasks from completing.
//        c. Return results in the same order as the input `tasks` array.
//
//   6. No `any`, no `as` casts, no non-null assertions (`!`).
// ─────────────────────────────────────────────────────────────────────────────

// TODO 1 — Define TaskResult<T> as a discriminated union
export type TaskResult<T> = never; // replace with your implementation

// TODO 2 — Define Task<I, O>
export type Task<I, O> = never; // replace with your implementation

// TODO 3 — Define RetryPolicy
export type RetryPolicy = never; // replace with your implementation

// TODO 4 — Define QueueResult<I, O>
export type QueueResult<I, O> = never; // replace with your implementation

// TODO 5 — Implement runWithRetry
export async function runWithRetry<I, O>(
  task: Task<I, O>,
  policy: RetryPolicy,
  signal: AbortSignal,
): Promise<TaskResult<O>> {
  // TODO: implement exponential backoff + abort support
  throw new Error("Not implemented");
}

// TODO 6 — Implement runQueue
export async function runQueue<I, O>(
  tasks: ReadonlyArray<Task<I, O>>,
  policy: RetryPolicy,
  signal: AbortSignal,
): Promise<ReadonlyArray<QueueResult<I, O>>> {
  // TODO: run all tasks concurrently, surface per-task results
  throw new Error("Not implemented");
}

// ─── Helper you may use ──────────────────────────────────────────────────────
// A typed sleep that resolves after `ms` milliseconds, but rejects early
// if the AbortSignal fires. You may use or ignore this helper.
export function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("Aborted"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new Error("Aborted"));
      },
      { once: true },
    );
  });
}
