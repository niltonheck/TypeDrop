// ============================================================
// Typed Job Queue with Retry Logic & Concurrency Limits
// ============================================================
// REQUIREMENTS
// 1. Define a discriminated-union `Job<T>` where `T` is one of the
//    concrete payload types (EmailPayload | ReportPayload | WebhookPayload).
//    Each job must carry: id, kind, payload, priority ("low"|"normal"|"high"),
//    maxRetries, and (optionally) attemptsMade.
// 2. Define a `JobHandler<T>` — a typed async function that receives
//    the payload and returns a `JobResult` (success or failure).
// 3. Build a `JobRegistry` that maps every job `kind` to the correct
//    handler type — no handler should be able to receive the wrong payload.
// 4. Implement `createJobRunner` which accepts a registry and a
//    `RunnerOptions` config (concurrency limit, base retry delay ms).
//    It must return a `JobRunner` object with two methods:
//      - `enqueue(job)` — adds a job to the internal queue
//      - `run()` — drains the queue and returns a `RunSummary`
// 5. Inside `run()`, enforce the concurrency cap (never more than
//    `maxConcurrency` jobs executing simultaneously).
// 6. On handler failure, retry up to `job.maxRetries` times using
//    exponential back-off: delay = baseDelayMs * 2^attemptsMade.
// 7. `RunSummary` must include: total, succeeded, failed, and a
//    `results` array of per-job `JobOutcome` records (typed discriminated union).
// ============================================================

// --- Payload types -----------------------------------------------------------

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface ReportPayload {
  reportId: string;
  format: "pdf" | "csv";
}

export interface WebhookPayload {
  url: string;
  data: Record<string, string>;
}

// --- TODO 1: Discriminated-union Job type ------------------------------------
// A Job must be parameterised over its payload type T.
// Use a `kind` discriminant: "email" | "report" | "webhook".
// Each variant should lock `kind` and `payload` together.
// Fields required on ALL variants: id, priority, maxRetries, attemptsMade?

export type JobKind = "email" | "report" | "webhook";

export type Job<T> = {
  // TODO: fill in the shared fields
  id: string;
  kind: JobKind; // narrow this in the concrete variants below
  payload: T;
  priority: "low" | "normal" | "high";
  maxRetries: number;
  attemptsMade?: number;
};

// TODO: define EmailJob, ReportJob, WebhookJob as concrete variants
// then export `AnyJob` as their union.
export type EmailJob   = Job<EmailPayload>   & { kind: "email" };
export type ReportJob  = Job<ReportPayload>  & { kind: "report" };
export type WebhookJob = Job<WebhookPayload> & { kind: "webhook" };

export type AnyJob = EmailJob | ReportJob | WebhookJob;

// --- TODO 2: JobResult -------------------------------------------------------
// A discriminated union: { status: "success" } | { status: "failure"; error: string }

export type JobResult = TODO; // replace TODO

// --- TODO 3: JobHandler ------------------------------------------------------
// A generic async function type that accepts a payload T and returns JobResult.

export type JobHandler<T> = TODO; // replace TODO

// --- TODO 4: JobRegistry -----------------------------------------------------
// Map each JobKind to the handler for its payload.
// HINT: Use a mapped type over JobKind + a conditional type (or helper) to
//       resolve the correct payload for each kind.

type PayloadFor<K extends JobKind> = TODO; // replace TODO

export type JobRegistry = {
  [K in JobKind]: JobHandler<PayloadFor<K>>;
};

// --- TODO 5: RunnerOptions ---------------------------------------------------

export interface RunnerOptions {
  maxConcurrency: number;  // max simultaneous jobs
  baseDelayMs: number;     // base delay for exponential back-off
}

// --- TODO 6: JobOutcome (per-job result in the summary) ----------------------
// Discriminated union carrying the original job + outcome details.
// "succeeded" variant: { status: "succeeded"; job: AnyJob; attempts: number }
// "failed"    variant: { status: "failed";    job: AnyJob; attempts: number; lastError: string }

export type JobOutcome = TODO; // replace TODO

// --- TODO 7: RunSummary ------------------------------------------------------

export interface RunSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: JobOutcome[];
}

// --- TODO 8: JobRunner interface ---------------------------------------------

export interface JobRunner {
  enqueue(job: AnyJob): void;
  run(): Promise<RunSummary>;
}

// --- TODO 9: createJobRunner -------------------------------------------------
// Implement the factory. Key requirements:
//   a) Dispatch each job to the correct handler via the registry (use the
//      job's `kind` to look up the handler — TypeScript must be satisfied
//      that the payload matches without casting).
//   b) Enforce maxConcurrency: track active slots and only start a new job
//      when a slot is free (use a simple Promise-slot pool pattern).
//   c) Retry on failure up to job.maxRetries times; wait
//      baseDelayMs * 2^attemptsMade ms between attempts.
//   d) Collect a JobOutcome for every job; build and return RunSummary.

export function createJobRunner(
  registry: JobRegistry,
  options: RunnerOptions
): JobRunner {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- Helper (provided — do not modify) ---------------------------------------
/** Resolves after `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
