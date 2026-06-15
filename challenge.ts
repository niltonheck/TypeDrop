// =============================================================
// challenge.ts — Typed Job Queue Scheduler with Priority & Retry
// =============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill every TODO to make the test harness pass.
// =============================================================

// ─── Domain Types ────────────────────────────────────────────

/** The three priority tiers a job can belong to. */
export type Priority = "high" | "normal" | "low";

/** All job kinds supported by the scheduler. */
export type JobKind = "email" | "report" | "export";

/**
 * A validated, strongly-typed job ready for scheduling.
 * Uses a discriminated union so each kind carries its own payload.
 */
export type Job =
  | { id: string; kind: "email";  priority: Priority; retries: number; payload: EmailPayload  }
  | { id: string; kind: "report"; priority: Priority; retries: number; payload: ReportPayload }
  | { id: string; kind: "export"; priority: Priority; retries: number; payload: ExportPayload };

export interface EmailPayload  { to: string; subject: string }
export interface ReportPayload { reportId: string; format: "pdf" | "csv" }
export interface ExportPayload { datasetId: string; destination: string }

// ─── Result & Validation Types ───────────────────────────────

/** A lightweight Result monad — no exceptions escape the boundary. */
export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

export type ValidationError =
  | { tag: "missing_field";  field: string }
  | { tag: "invalid_value";  field: string; received: unknown }
  | { tag: "unknown_kind";   received: unknown };

// ─── Execution Report Types ───────────────────────────────────

export type JobStatus = "succeeded" | "failed" | "exhausted";

/**
 * The outcome record written to the execution report for every job.
 * `attempts` counts how many times the job was tried (1 = first try, no retries needed).
 */
export interface JobOutcome {
  jobId:    string;
  kind:     JobKind;
  priority: Priority;
  status:   JobStatus;
  attempts: number;
  /** ISO timestamp of when the outcome was recorded */
  finishedAt: string;
}

/** The final report returned by `runScheduler`. */
export interface SchedulerReport {
  succeeded: number;
  failed:    number;
  exhausted: number;
  outcomes:  JobOutcome[];
}

// ─── Handler Types ───────────────────────────────────────────

/**
 * A handler receives a fully-typed job and returns a Promise that
 * resolves to `true` on success or `false` on a transient failure.
 */
export type JobHandler<K extends JobKind> = (
  job: Extract<Job, { kind: K }>
) => Promise<boolean>;

/**
 * A registry that maps every JobKind to its corresponding handler.
 * Use a mapped type so the compiler enforces completeness.
 */
export type HandlerRegistry = {
  [K in JobKind]: JobHandler<K>;
};

// ─── Scheduler Config ────────────────────────────────────────

export interface SchedulerConfig {
  /** Maximum number of jobs running concurrently. */
  concurrency: number;
  /** Maximum total attempts per job (1 = no retries). */
  maxAttempts: number;
}

// ─── TODO 1 — validateJob ────────────────────────────────────
/**
 * Parse an `unknown` value into a `Job`.
 *
 * Requirements:
 * 1. The input must be a non-null object.
 * 2. `id`       — must be a non-empty string.
 * 3. `kind`     — must be one of "email" | "report" | "export".
 * 4. `priority` — must be one of "high" | "normal" | "low".
 * 5. `retries`  — must be a non-negative integer (0 is valid).
 * 6. `payload`  — must be a non-null object whose required fields
 *                 depend on `kind`:
 *                   email:  { to: string, subject: string }
 *                   report: { reportId: string, format: "pdf"|"csv" }
 *                   export: { datasetId: string, destination: string }
 * 7. Return `{ ok: false, error }` for the FIRST validation failure found.
 * 8. Return `{ ok: true, value: job }` when all checks pass.
 */
export function validateJob(raw: unknown): Result<Job, ValidationError> {
  // TODO: implement field-by-field validation, narrowing `raw` to `Job`
  throw new Error("Not implemented");
}

// ─── TODO 2 — enqueueByPriority ──────────────────────────────
/**
 * Given an array of validated `Job`s, return a NEW array sorted so
 * that jobs are ordered: "high" → "normal" → "low".
 * Jobs of equal priority must preserve their original relative order
 * (i.e. a stable sort).
 *
 * Requirements:
 * 1. Do NOT mutate the input array.
 * 2. Use the `Priority` type to drive the ordering — no magic strings
 *    outside of the priority-rank lookup.
 */
export function enqueueByPriority(jobs: Job[]): Job[] {
  // TODO: implement stable priority sort
  throw new Error("Not implemented");
}

// ─── TODO 3 — runScheduler ───────────────────────────────────
/**
 * Execute all jobs in priority order, honouring the concurrency limit
 * and per-job retry budget, then return a `SchedulerReport`.
 *
 * Requirements:
 * 1. Call `enqueueByPriority` to sort the jobs before execution.
 * 2. Run at most `config.concurrency` jobs simultaneously at any time
 *    (use a sliding-window / pool approach, not batch-by-batch).
 * 3. For each job, call the matching handler from `registry`.
 *    - If the handler returns `true`  → status "succeeded", stop retrying.
 *    - If the handler returns `false` → retry up to `config.maxAttempts` total attempts.
 *    - If all attempts are exhausted  → status "exhausted".
 *    - If the handler throws          → count as a failed attempt; same retry logic applies,
 *                                       but if ALL attempts throw, status is "failed".
 * 4. Record a `JobOutcome` for every job.
 * 5. Tally `succeeded`, `failed`, and `exhausted` counts in the report.
 * 6. `finishedAt` must be an ISO 8601 string (use `new Date().toISOString()`).
 *
 * Note on "failed" vs "exhausted":
 *   - "exhausted" — the handler consistently returned `false` (transient failure signal).
 *   - "failed"    — at least one attempt threw an exception (unexpected error).
 */
export async function runScheduler(
  jobs: Job[],
  registry: HandlerRegistry,
  config: SchedulerConfig
): Promise<SchedulerReport> {
  // TODO: implement concurrency-limited, retryable job runner
  throw new Error("Not implemented");
}

// ─── TODO 4 — buildReport ────────────────────────────────────
/**
 * A pure helper that accepts an array of `JobOutcome` objects and
 * computes the final `SchedulerReport` tallies.
 *
 * Requirements:
 * 1. Count outcomes by status using a single-pass `reduce`.
 * 2. The `outcomes` field of the returned report must be the same
 *    array reference that was passed in (no copying).
 */
export function buildReport(outcomes: JobOutcome[]): SchedulerReport {
  // TODO: implement single-pass reduce tally
  throw new Error("Not implemented");
}
