// ============================================================
// Typed Async Job Scheduler with Priority Queues
// challenge.ts
// Compile with: tsc --strict --noEmit challenge.ts
// ============================================================

// -----------------------------------------------------------
// 1. BRANDED TYPES
// -----------------------------------------------------------

/** Opaque identifier for a job. */
type JobId = string & { readonly __brand: "JobId" };

/** Opaque identifier for a queue. */
type QueueId = string & { readonly __brand: "QueueId" };

/** Creates a branded JobId. */
export function makeJobId(raw: string): JobId {
  return raw as JobId;
}

/** Creates a branded QueueId. */
export function makeQueueId(raw: string): QueueId {
  return raw as QueueId;
}

// -----------------------------------------------------------
// 2. DOMAIN TYPES
// -----------------------------------------------------------

export type JobPriority = "critical" | "high" | "normal" | "low";

/** Numeric weight for priority ordering (lower = runs first). */
export const PRIORITY_WEIGHT = {
  critical: 0,
  high:     1,
  normal:   2,
  low:      3,
} as const satisfies Record<JobPriority, number>;

/** A validated, strongly-typed job definition. */
export interface Job {
  readonly id:          JobId;
  readonly queueId:     QueueId;
  readonly priority:    JobPriority;
  readonly timeoutMs:   number;   // must be 100 – 30_000
  readonly payload:     Record<string, unknown>;
  readonly maxRetries:  number;   // 0 – 5
}

// -----------------------------------------------------------
// 3. DISCRIMINATED UNION — JOB OUTCOME
// -----------------------------------------------------------

export type JobOutcome =
  | { readonly status: "succeeded"; readonly jobId: JobId; readonly durationMs: number }
  | { readonly status: "failed";    readonly jobId: JobId; readonly error: string; readonly attempts: number }
  | { readonly status: "timed_out"; readonly jobId: JobId; readonly timeoutMs: number };

// -----------------------------------------------------------
// 4. RESULT TYPE
// -----------------------------------------------------------

export type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

// -----------------------------------------------------------
// 5. VALIDATION ERRORS (discriminated union)
// -----------------------------------------------------------

export type ValidationError =
  | { readonly kind: "missing_field";  readonly field: string }
  | { readonly kind: "invalid_type";   readonly field: string; readonly expected: string }
  | { readonly kind: "out_of_range";   readonly field: string; readonly min: number; readonly max: number }
  | { readonly kind: "invalid_value";  readonly field: string; readonly allowed: readonly string[] };

// -----------------------------------------------------------
// 6. EXECUTION REPORT
// -----------------------------------------------------------

export interface QueueReport {
  readonly queueId:    QueueId;
  readonly succeeded:  number;
  readonly failed:     number;
  readonly timedOut:   number;
  readonly outcomes:   readonly JobOutcome[];
}

export interface SchedulerReport {
  readonly totalJobs:       number;
  readonly validJobs:       number;
  readonly invalidJobs:     number;
  readonly queues:          ReadonlyMap<QueueId, QueueReport>;
  readonly validationErrors: ReadonlyArray<{ rawIndex: number; errors: ValidationError[] }>;
}

// -----------------------------------------------------------
// 7. JOB HANDLER
// -----------------------------------------------------------

/**
 * A typed async handler that processes a single job's payload.
 * It must resolve with a string (result message) or reject/throw on failure.
 */
export type JobHandler = (payload: Record<string, unknown>) => Promise<string>;

// -----------------------------------------------------------
// 8. SCHEDULER CONFIG
// -----------------------------------------------------------

export interface SchedulerConfig {
  /** Maximum number of jobs executing simultaneously across ALL queues. */
  readonly concurrencyLimit: number;
}

// -----------------------------------------------------------
// 9. YOUR TASKS
// -----------------------------------------------------------

/**
 * TASK 1 — validateJob
 *
 * Parse an `unknown` value into a `Result<Job, ValidationError[]>`.
 *
 * Requirements:
 * - R1: Input must be a non-null object.
 * - R2: `id` must be a non-empty string → brand as JobId.
 * - R3: `queueId` must be a non-empty string → brand as QueueId.
 * - R4: `priority` must be one of "critical" | "high" | "normal" | "low".
 * - R5: `timeoutMs` must be a number in [100, 30_000].
 * - R6: `payload` must be a non-null object (Record<string, unknown>).
 * - R7: `maxRetries` must be a number in [0, 5].
 * - R8: Collect ALL validation errors before returning; do not short-circuit.
 */
export function validateJob(raw: unknown): Result<Job, ValidationError[]> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TASK 2 — buildPriorityQueue
 *
 * Given an array of validated Jobs, return them sorted by priority weight
 * (PRIORITY_WEIGHT), with ties broken by insertion order (stable sort).
 *
 * Requirements:
 * - R9:  Return type must be `readonly Job[]`.
 * - R10: Jobs with lower PRIORITY_WEIGHT values come first.
 */
export function buildPriorityQueue(jobs: readonly Job[]): readonly Job[] {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TASK 3 — executeJob
 *
 * Run a single job with its handler, respecting `job.timeoutMs`.
 *
 * Requirements:
 * - R11: If the handler resolves within timeoutMs → return `{ status: "succeeded", … }`.
 * - R12: If the handler rejects/throws → retry up to `job.maxRetries` additional times
 *        (total attempts = 1 + maxRetries). Each retry is a fresh handler call.
 *        After all attempts are exhausted → return `{ status: "failed", … }`.
 * - R13: If any single attempt exceeds timeoutMs → immediately return
 *        `{ status: "timed_out", … }` (do NOT retry after a timeout).
 * - R14: `durationMs` must reflect wall-clock time for the successful attempt only.
 * - R15: Use `Promise.race` to implement the timeout; do NOT use `setTimeout` as the
 *        sole mechanism.
 */
export async function executeJob(
  job: Job,
  handler: JobHandler
): Promise<JobOutcome> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TASK 4 — runScheduler
 *
 * Validate all raw inputs, build per-queue priority queues, execute every valid
 * job through `handler` with a global concurrency limit, and return a SchedulerReport.
 *
 * Requirements:
 * - R16: Validate each element of `rawJobs` with `validateJob`; collect errors for
 *        the report.
 * - R17: Group valid jobs by `queueId`; within each queue sort by priority using
 *        `buildPriorityQueue`.
 * - R18: Execute jobs using `executeJob`, but never exceed `config.concurrencyLimit`
 *        simultaneous executions across all queues combined.
 * - R19: Build and return a `SchedulerReport` with per-queue `QueueReport` entries.
 * - R20: The returned `queues` field must be a `ReadonlyMap<QueueId, QueueReport>`.
 */
export async function runScheduler(
  rawJobs: readonly unknown[],
  handler: JobHandler,
  config: SchedulerConfig
): Promise<SchedulerReport> {
  // TODO: implement
  throw new Error("Not implemented");
}
