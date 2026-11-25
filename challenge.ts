// ============================================================
// Typed Job Queue: Priority Scheduling, Worker Dispatch & Result Aggregation
// ============================================================
// TOPICS: Discriminated unions · Mapped types · Generics · Record
//         · Conditional types · Result<T,E> · satisfies
// ============================================================

// ------------------------------------------------------------------
// 1. JOB DEFINITIONS
// ------------------------------------------------------------------

/** Priority levels — higher number = higher urgency */
export type Priority = 1 | 2 | 3;

/** All supported job kinds */
export type JobKind = "email" | "resize" | "report" | "webhook";

/** Base fields shared by every job */
interface JobBase<K extends JobKind> {
  readonly id: string;
  readonly kind: K;
  readonly priority: Priority;
  readonly enqueuedAt: Date;
}

/** Concrete job variants */
export interface EmailJob extends JobBase<"email"> {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
}

export interface ResizeJob extends JobBase<"resize"> {
  readonly imageUrl: string;
  readonly targetWidth: number;
  readonly targetHeight: number;
}

export interface ReportJob extends JobBase<"report"> {
  readonly reportType: "daily" | "weekly" | "monthly";
  readonly recipientIds: string[];
}

export interface WebhookJob extends JobBase<"webhook"> {
  readonly url: string;
  readonly payload: Record<string, string | number | boolean>;
}

/** The full discriminated union */
export type Job = EmailJob | ResizeJob | ReportJob | WebhookJob;

// ------------------------------------------------------------------
// 2. RESULT TYPES
// ------------------------------------------------------------------

export type JobSuccess<T> = { status: "success"; jobId: string; output: T };
export type JobFailure   = { status: "failure"; jobId: string; error: string };
export type JobResult<T> = JobSuccess<T> | JobFailure;

// ------------------------------------------------------------------
// 3. WORKER REGISTRY
// ------------------------------------------------------------------

/**
 * TODO (3a): Define `WorkerFn<J>` — a generic type alias for an async function
 * that receives a single job `J` and returns a `Promise<JobResult<unknown>>`.
 */
export type WorkerFn<J extends Job> = /* TODO */ unknown;

/**
 * TODO (3b): Define `WorkerRegistry` as a mapped type over `JobKind` where
 * each key `K` maps to a `WorkerFn` whose job type is the variant of `Job`
 * whose `kind` discriminant equals `K`.
 *
 * Hint: Use `Extract<Job, { kind: K }>` to pick the right variant.
 */
export type WorkerRegistry = {
  [K in JobKind]: /* TODO */ unknown;
};

// ------------------------------------------------------------------
// 4. RUN REPORT
// ------------------------------------------------------------------

export interface RunReport {
  /** Total number of jobs processed */
  total: number;
  /** Number that finished with status "success" */
  succeeded: number;
  /** Number that finished with status "failure" */
  failed: number;
  /** Jobs that failed, in the order they were processed */
  failures: JobFailure[];
  /** Wall-clock duration in milliseconds */
  durationMs: number;
}

// ------------------------------------------------------------------
// 5. QUEUE IMPLEMENTATION
// ------------------------------------------------------------------

/**
 * TODO (5a): Implement `sortByPriority`.
 *
 * Requirements:
 * - Returns a NEW array (do not mutate the input).
 * - Jobs with HIGHER priority numbers come FIRST.
 * - Jobs with equal priority preserve their original relative order
 *   (stable sort).
 */
export function sortByPriority(jobs: Job[]): Job[] {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO (5b): Implement `dispatchJob`.
 *
 * Requirements:
 * - Accepts a single `Job` and the full `WorkerRegistry`.
 * - Looks up the correct worker by `job.kind` and calls it with the job.
 * - Returns the `Promise<JobResult<unknown>>` from the worker.
 * - Must NOT use `any` or unsafe type assertions.
 *
 * Hint: A small helper overload or a narrowing switch is the cleanest approach.
 */
export async function dispatchJob(
  job: Job,
  registry: WorkerRegistry
): Promise<JobResult<unknown>> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO (5c): Implement `runQueue`.
 *
 * Requirements:
 * - Accepts a `jobs` array and a `WorkerRegistry`.
 * - Sorts the jobs by priority (highest first) before processing.
 * - Dispatches ALL jobs CONCURRENTLY (use Promise.all / allSettled).
 * - Collects results and builds a `RunReport`.
 * - `durationMs` must reflect actual wall-clock time (use Date.now()).
 * - Any worker Promise that REJECTS (throws) must be caught and recorded
 *   as a `JobFailure` with the thrown error message.
 */
export async function runQueue(
  jobs: Job[],
  registry: WorkerRegistry
): Promise<RunReport> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. REGISTRY VALIDATION (satisfies)
// ------------------------------------------------------------------

/**
 * TODO (6): Declare a `mockRegistry` object that `satisfies WorkerRegistry`.
 *
 * Each worker should be a stub that:
 *   - For "email"   → resolves { status: "success", jobId: job.id, output: "sent" }
 *   - For "resize"  → resolves { status: "success", jobId: job.id, output: { width: job.targetWidth, height: job.targetHeight } }
 *   - For "report"  → rejects  with new Error("report service unavailable")
 *   - For "webhook" → resolves { status: "failure", jobId: job.id, error: "403 Forbidden" }
 *
 * Requirement: use `satisfies WorkerRegistry` so the compiler checks all
 * four keys are present and each handler has the correct job type.
 */
export const mockRegistry = /* TODO: = { ... } satisfies WorkerRegistry */ null as unknown as WorkerRegistry;
