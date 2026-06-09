// ============================================================
// Typed Job Queue Scheduler with Priority & Concurrency
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// ============================================================

// ── 1. DOMAIN TYPES ─────────────────────────────────────────

/** Priority levels for job execution order. Higher = runs first. */
export type Priority = "critical" | "high" | "normal" | "low";

/** Maps each Priority to a numeric weight (used for sorting). */
export type PriorityWeight = Record<Priority, number>;

export const PRIORITY_WEIGHT: PriorityWeight = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

// TODO (Requirement 1):
// Define a discriminated union `JobDefinition` with a `kind` discriminant.
// It must have exactly three variants:
//
//   • kind: "http"
//     Fields: id (string), priority (Priority), url (string), method ("GET" | "POST" | "PUT" | "DELETE"), timeoutMs (number)
//
//   • kind: "compute"
//     Fields: id (string), priority (Priority), fn (string), args (readonly unknown[])
//
//   • kind: "notification"
//     Fields: id (string), priority (Priority), channel ("email" | "sms" | "push"), recipient (string), message (string)
//
// All fields are required and readonly.

export type JobDefinition = never; // replace with your discriminated union

// ── 2. RESULT & REPORT TYPES ────────────────────────────────

// TODO (Requirement 2):
// Define a generic `Result<T, E>` type that is either:
//   • { ok: true;  value: T }
//   • { ok: false; error: E }

export type Result<T, E> = never; // replace with your definition

/** Describes a single job's execution outcome. */
export type JobOutcome =
  | { status: "fulfilled"; jobId: string; kind: JobDefinition["kind"]; durationMs: number }
  | { status: "rejected";  jobId: string; kind: JobDefinition["kind"]; reason: string };

/** Final report returned by the scheduler. */
export interface SchedulerReport {
  readonly totalJobs: number;
  readonly fulfilled: number;
  readonly rejected: number;
  /** Outcomes ordered by execution start time (earliest first). */
  readonly outcomes: readonly JobOutcome[];
  /** Wall-clock time the entire batch took, in milliseconds. */
  readonly wallTimeMs: number;
}

// ── 3. VALIDATION ───────────────────────────────────────────

// TODO (Requirement 3):
// Implement `parseJobDefinition(raw: unknown): Result<JobDefinition, string>`
//
// Requirements:
//   a. `raw` must be a non-null object.
//   b. `id` must be a non-empty string.
//   c. `priority` must be one of the four Priority values.
//   d. `kind` must be one of "http" | "compute" | "notification".
//   e. For kind "http":    `url` (non-empty string), `method` (one of the four HTTP verbs), `timeoutMs` (positive number).
//   f. For kind "compute": `fn` (non-empty string), `args` (array — may be empty).
//   g. For kind "notification": `channel` (one of the three channel values), `recipient` (non-empty string), `message` (non-empty string).
//   h. On any failure return `{ ok: false, error: "<descriptive message>" }`.

export function parseJobDefinition(raw: unknown): Result<JobDefinition, string> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 4. JOB HANDLERS ─────────────────────────────────────────

// TODO (Requirement 4):
// Define a mapped type `JobHandlerMap` that maps every `JobDefinition["kind"]`
// to an async handler function signature:
//
//   (job: Extract<JobDefinition, { kind: K }>) => Promise<void>
//
// where K is the specific kind key.

export type JobHandlerMap = never; // replace with your mapped type

// Default no-op handlers (simulate work with a small delay).
// You must NOT modify this block — it must type-check against your JobHandlerMap.
export const defaultHandlers: JobHandlerMap = {
  http: async (job) => {
    await sleep(job.timeoutMs > 500 ? 50 : job.timeoutMs);
  },
  compute: async (job) => {
    await sleep(job.args.length * 10);
  },
  notification: async (job) => {
    await sleep(job.channel === "sms" ? 30 : 20);
  },
};

// ── 5. SCHEDULER ────────────────────────────────────────────

export interface SchedulerOptions {
  /** Maximum number of jobs running in parallel. Must be ≥ 1. */
  readonly concurrency: number;
  /** Handlers for each job kind. */
  readonly handlers: JobHandlerMap;
}

// TODO (Requirement 5):
// Implement `runScheduler(rawJobs: unknown[], options: SchedulerOptions): Promise<SchedulerReport>`
//
// Requirements:
//   a. Validate every element of `rawJobs` using `parseJobDefinition`.
//      Invalid jobs count as "rejected" in the report (reason = the parse error string).
//      Valid jobs proceed to execution.
//   b. Sort valid jobs by priority (PRIORITY_WEIGHT) — highest weight first.
//      Jobs with equal priority preserve their original input order (stable sort).
//   c. Execute valid jobs with at most `options.concurrency` running simultaneously.
//      Use the matching handler from `options.handlers` for each job kind.
//   d. A job that throws must be caught: record it as "rejected" with reason = error.message (or String(error)).
//   e. `outcomes` in the report must be ordered by execution START time (earliest first).
//   f. `wallTimeMs` is the total elapsed time from when runScheduler was called until all jobs finish.

export async function runScheduler(
  rawJobs: unknown[],
  options: SchedulerOptions
): Promise<SchedulerReport> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── UTILITY ──────────────────────────────────────────────────
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
