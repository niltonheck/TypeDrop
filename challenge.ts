// ============================================================
// challenge.ts — Typed Concurrent Task Scheduler
// ============================================================
// Topics: discriminated unions, generics, conditional types,
//         branded types, Result monad, Promise.allSettled,
//         concurrency limiting, mapped types, satisfies
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque brand helper — do NOT use `as` to cast; use the provided constructors. */
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type JobId   = Brand<string, "JobId">;
export type TagName = Brand<string, "TagName">;

/** Construct a valid JobId from a plain string. */
export function makeJobId(raw: string): JobId {
  // TODO: validate that `raw` is non-empty, then return it as JobId
  throw new Error("not implemented");
}

/** Construct a valid TagName from a plain string. */
export function makeTagName(raw: string): TagName {
  // TODO: validate that `raw` is non-empty, then return it as TagName
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 2. PRIORITY & JOB DEFINITION
// ------------------------------------------------------------------

export type Priority = "critical" | "high" | "normal" | "low";

/** Numeric weight for priority ordering (higher = runs first). */
export const PRIORITY_WEIGHT = {
  critical: 4,
  high:     3,
  normal:   2,
  low:      1,
} satisfies Record<Priority, number>;

/**
 * A scheduled job.
 * @template O  The resolved output type when the job succeeds.
 */
export interface Job<O> {
  readonly id:         JobId;
  readonly priority:   Priority;
  readonly tags:       ReadonlyArray<TagName>;
  readonly maxRetries: number;            // 0 = no retries
  /** The unit of work. Resolve → success, reject → failure. */
  readonly run:        () => Promise<O>;
}

// ------------------------------------------------------------------
// 3. RESULT MONAD
// ------------------------------------------------------------------

export type Ok<T>  = { readonly status: "ok";    readonly value: T };
export type Err<E> = { readonly status: "error"; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

/** Typed error kinds emitted by the scheduler. */
export type SchedulerError =
  | { kind: "job_failed";    jobId: JobId; attempt: number; cause: unknown }
  | { kind: "retries_exhausted"; jobId: JobId; totalAttempts: number; lastCause: unknown }
  | { kind: "invalid_job";   jobId: JobId; reason: string };

export function ok<T>(value: T): Ok<T> {
  return { status: "ok", value };
}

export function err<E>(error: E): Err<E> {
  return { status: "error", error };
}

// ------------------------------------------------------------------
// 4. SCHEDULER CONFIG & OUTPUT TYPES
// ------------------------------------------------------------------

export interface SchedulerConfig {
  /** Maximum number of jobs running at the same time. */
  readonly concurrency: number;
}

/**
 * The per-job outcome returned after all jobs finish.
 * @template O  The success output type of the job.
 */
export type JobOutcome<O> = {
  readonly jobId:    JobId;
  readonly attempts: number;
  readonly result:   Result<O, SchedulerError>;
};

/**
 * The aggregated report returned by `runScheduler`.
 * @template O  The common success output type across all jobs.
 */
export type SchedulerReport<O> = {
  readonly succeeded: ReadonlyArray<JobOutcome<O>>;
  readonly failed:    ReadonlyArray<JobOutcome<O>>;
  /** Wall-clock milliseconds from first job start to last job finish. */
  readonly elapsedMs: number;
};

// ------------------------------------------------------------------
// 5. CORE SCHEDULER — implement these two functions
// ------------------------------------------------------------------

/**
 * Run a single job with retry logic.
 *
 * Requirements:
 *  R1. Attempt `job.run()` up to `job.maxRetries + 1` times.
 *  R2. On each failure, emit a `job_failed` SchedulerError with the
 *      current attempt number (1-based).
 *  R3. If all attempts fail, the final result must be an `Err` with
 *      kind `retries_exhausted`, carrying `totalAttempts` and `lastCause`.
 *  R4. On the first success, immediately return `Ok<O>` — do not retry.
 *  R5. Return type must be `Promise<JobOutcome<O>>`.
 */
export async function runJobWithRetry<O>(
  job: Job<O>,
): Promise<JobOutcome<O>> {
  // TODO: implement retry loop
  throw new Error("not implemented");
}

/**
 * Schedule and run all jobs with a concurrency limit.
 *
 * Requirements:
 *  R6.  Sort jobs by PRIORITY_WEIGHT descending before scheduling
 *       (critical jobs start first).
 *  R7.  Never exceed `config.concurrency` simultaneously running jobs.
 *  R8.  Use `runJobWithRetry` internally for each job.
 *  R9.  Validate each job before running: `maxRetries` must be >= 0 and
 *       `concurrency` must be >= 1; invalid jobs yield an `invalid_job`
 *       SchedulerError immediately (no run attempt).
 *  R10. Collect ALL outcomes (never throw); partition into
 *       `succeeded` and `failed` arrays in the returned report.
 *  R11. `elapsedMs` must reflect total wall-clock time (use `Date.now()`).
 *  R12. Return type must be `Promise<SchedulerReport<O>>`.
 */
export async function runScheduler<O>(
  jobs: ReadonlyArray<Job<O>>,
  config: SchedulerConfig,
): Promise<SchedulerReport<O>> {
  // TODO: implement concurrency-limited scheduler
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 6. UTILITY — implement this helper
// ------------------------------------------------------------------

/**
 * Given a completed `SchedulerReport`, return a summary keyed by tag.
 *
 * Requirements:
 *  R13. For every TagName that appears across all jobs, produce an entry
 *       mapping it to `{ succeeded: number; failed: number }`.
 *  R14. A job may have multiple tags — count it once per tag.
 *  R15. Return type must be `Map<TagName, { succeeded: number; failed: number }>`.
 *  R16. Jobs with no tags are simply omitted from the map.
 *
 * HINT: You'll need access to the original job list alongside the report.
 */
export function summarizeByTag<O>(
  jobs: ReadonlyArray<Job<O>>,
  report: SchedulerReport<O>,
): Map<TagName, { succeeded: number; failed: number }> {
  // TODO: implement tag summary
  throw new Error("not implemented");
}
