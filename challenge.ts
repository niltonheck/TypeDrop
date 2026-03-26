// =============================================================
// Typed Job Queue Retry Scheduler
// =============================================================
// SCENARIO:
//   You are building the background job processing layer for a
//   workflow automation platform. Jobs can succeed, fail with a
//   retryable error, or fail fatally. Your scheduler must:
//     1. Execute each job using its typed retry policy
//     2. Distinguish retryable vs. fatal failures via a
//        discriminated union
//     3. Surface per-job outcomes and an aggregate run report
//        through a Result<T, E> type
//
// REQUIREMENTS:
//   [1] Define a `Result<T, E>` generic type with two variants:
//         { ok: true;  value: T }
//         { ok: false; error: E }
//
//   [2] Define a `JobError` discriminated union with three variants:
//         - { kind: "retryable"; message: string; retryAfterMs: number }
//         - { kind: "fatal";     message: string; code: string }
//         - { kind: "timeout";   message: string; elapsedMs: number }
//       Only "retryable" errors should trigger retry attempts.
//
//   [3] Define a `RetryPolicy` type:
//         - maxAttempts: number   (total tries, including the first)
//         - backoffMs:   number   (flat delay between retries in ms)
//         - timeoutMs:   number   (per-attempt deadline in ms)
//
//   [4] Define a `Job<P>` generic type where P is the job payload:
//         - id:     string
//         - name:   string
//         - payload: P
//         - policy: RetryPolicy
//         - execute: (payload: P) => Promise<Result<unknown, JobError>>
//
//   [5] Define `JobOutcome<P>` — the per-job result after the
//       scheduler finishes. It must record:
//         - job:       Job<P>
//         - attempts:  number          (how many times execute() was called)
//         - result:    Result<unknown, JobError>
//
//   [6] Define `RunReport` — the aggregate report for a batch run:
//         - totalJobs:   number
//         - succeeded:   number
//         - failed:      number
//         - outcomes:    JobOutcome<unknown>[]
//
//   [7] Implement `scheduleJob<P>`:
//         - Runs job.execute(job.payload) up to policy.maxAttempts times
//         - Wraps each attempt in a race against policy.timeoutMs:
//             if the attempt doesn't resolve in time, produce a
//             { kind: "timeout", message: "...", elapsedMs: policy.timeoutMs }
//             error and count it as a failed (non-retryable) attempt
//         - Retries ONLY when the error variant is "retryable"
//         - Waits backoffMs between retries (use the provided `delay` helper)
//         - Returns a `JobOutcome<P>` (never throws)
//
//   [8] Implement `runQueue`:
//         - Accepts an array of Job<unknown>[]
//         - Runs ALL jobs concurrently (Promise.all)
//         - Returns a `RunReport`
//
// HELPERS (already implemented — do not modify):
/** Resolves after `ms` milliseconds. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Races a promise against a timeout, returning a Result. */
export async function withTimeout<T>(
  promise: Promise<Result<T, JobError>>,
  timeoutMs: number
): Promise<Result<T, JobError>> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<Result<T, JobError>>((resolve) => {
    timer = setTimeout(() => {
      resolve({
        ok: false,
        error: { kind: "timeout", message: "Attempt timed out", elapsedMs: timeoutMs },
      });
    }, timeoutMs);
  });
  const result = await Promise.race([promise, timeoutPromise]);
  clearTimeout(timer!);
  return result;
}

// =============================================================
// [1] Result<T, E> — two-variant generic type
// =============================================================
export type Result<T, E> = TODO; // replace TODO

// =============================================================
// [2] JobError — discriminated union (retryable | fatal | timeout)
// =============================================================
export type JobError = TODO; // replace TODO

// =============================================================
// [3] RetryPolicy
// =============================================================
export type RetryPolicy = TODO; // replace TODO

// =============================================================
// [4] Job<P> — generic job descriptor
// =============================================================
export type Job<P> = TODO; // replace TODO

// =============================================================
// [5] JobOutcome<P> — per-job scheduler result
// =============================================================
export type JobOutcome<P> = TODO; // replace TODO

// =============================================================
// [6] RunReport — aggregate batch report
// =============================================================
export type RunReport = TODO; // replace TODO

// =============================================================
// [7] scheduleJob — execute one job with retry logic
// =============================================================
export async function scheduleJob<P>(job: Job<P>): Promise<JobOutcome<P>> {
  // TODO: implement
  throw new Error("Not implemented");
}

// =============================================================
// [8] runQueue — run all jobs concurrently, return a RunReport
// =============================================================
export async function runQueue(jobs: Job<unknown>[]): Promise<RunReport> {
  // TODO: implement
  throw new Error("Not implemented");
}
