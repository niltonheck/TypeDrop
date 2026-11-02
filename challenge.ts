// ============================================================
// Typed Async Job Queue with Retry & Concurrency Control
// ============================================================
// REQUIREMENTS (implement each marked TODO)
//
// 1. Define a branded type `JobId` (string brand) so raw strings
//    cannot be passed where a JobId is expected.
//
// 2. Define the `Job<T>` generic interface with fields:
//      id        : JobId
//      priority  : "high" | "normal" | "low"
//      maxRetries: number          // 0 means no retries
//      payload   : T
//      execute   : (payload: T) => Promise<T>
//
// 3. Define a discriminated union `JobOutcome<T>` with three members:
//      { status: "succeeded"; jobId: JobId; result: T; attempts: number }
//      { status: "failed";    jobId: JobId; error: string; attempts: number }
//      { status: "exhausted"; jobId: JobId; error: string; totalAttempts: number }
//    "exhausted" means all retries were consumed and the job never succeeded.
//    "failed" means the job failed on its FIRST (and only) attempt (maxRetries === 0).
//
// 4. Implement `makeJobId(raw: string): JobId`
//    A simple factory — no validation needed, just correct branding.
//
// 5. Implement `runJob<T>(job: Job<T>): Promise<JobOutcome<T>>`
//    - Attempt job.execute(job.payload) up to (maxRetries + 1) times.
//    - On success, return a "succeeded" outcome with the attempt count.
//    - If maxRetries === 0 and the single attempt fails → "failed" outcome.
//    - If all (maxRetries + 1) attempts fail → "exhausted" outcome.
//    - Capture the error message from the thrown value (use String(e) if not an Error).
//
// 6. Implement `runQueue<T>(jobs: Job<T>[], concurrency: number): Promise<JobOutcome<T>[]>`
//    - Execute all jobs respecting the concurrency limit (at most `concurrency`
//      jobs running simultaneously at any point).
//    - Preserve output order: outcomes[i] corresponds to jobs[i].
//    - Sort jobs by priority before execution:
//        "high" → first, "normal" → second, "low" → last.
//    - Return all outcomes (never reject the outer promise).
//
// 7. Implement `summariseOutcomes<T>(outcomes: JobOutcome<T>[]): QueueSummary`
//    - Count how many outcomes fall into each status bucket.
//    - Collect the jobId of every non-succeeded outcome into `failedJobIds`.
//
// ============================================================

// ------ Branded type ----------------------------------------

// TODO 1: Define JobId as a branded string type.
export type JobId = string & { readonly __brand: "JobId" };

// ------ Core domain types -----------------------------------

// TODO 2: Define Job<T>
export interface Job<T> {
  id: JobId;
  priority: "high" | "normal" | "low";
  maxRetries: number;
  payload: T;
  execute: (payload: T) => Promise<T>;
}

// TODO 3: Define JobOutcome<T> discriminated union
export type JobOutcome<T> =
  | { status: "succeeded"; jobId: JobId; result: T; attempts: number }
  | { status: "failed";    jobId: JobId; error: string; attempts: number }
  | { status: "exhausted"; jobId: JobId; error: string; totalAttempts: number };

// ------ Summary type (do not modify) ------------------------

export interface QueueSummary {
  succeeded: number;
  failed: number;
  exhausted: number;
  failedJobIds: JobId[];
}

// ------ Implementations -------------------------------------

// TODO 4: Implement makeJobId
export function makeJobId(raw: string): JobId {
  // TODO: return raw as a branded JobId
  throw new Error("Not implemented");
}

// TODO 5: Implement runJob
export async function runJob<T>(job: Job<T>): Promise<JobOutcome<T>> {
  // TODO: attempt execute up to (maxRetries + 1) times, return correct outcome variant
  throw new Error("Not implemented");
}

// TODO 6: Implement runQueue
export async function runQueue<T>(
  jobs: Job<T>[],
  concurrency: number
): Promise<JobOutcome<T>[]> {
  // TODO: run jobs with bounded concurrency, preserve original order in result,
  //       sort by priority (high → normal → low) before executing.
  throw new Error("Not implemented");
}

// TODO 7: Implement summariseOutcomes
export function summariseOutcomes<T>(outcomes: JobOutcome<T>[]): QueueSummary {
  // TODO: aggregate counts and collect non-succeeded jobIds
  throw new Error("Not implemented");
}
