// ============================================================
// Typed Job Queue Processor
// challenge.ts
// ============================================================
// Compile with: tsc --strict --noEmit challenge.ts
// Do NOT use `any`, `as`, or non-trivial type assertions.
// ============================================================

// ── 1. Job-type definitions ──────────────────────────────────
// Each job kind has its own payload shape.

export interface SendEmailJob {
  kind: "send_email";
  to: string;
  subject: string;
  body: string;
}

export interface ResizeImageJob {
  kind: "resize_image";
  imageUrl: string;
  width: number;
  height: number;
}

export interface GenerateReportJob {
  kind: "generate_report";
  reportType: "csv" | "pdf" | "xlsx";
  filters: Record<string, string>;
}

// TODO 1 ── Define a discriminated union `Job` that covers all
//           three job types above.
export type Job = /* TODO */ never;

// ── 2. Retry policy ─────────────────────────────────────────

export interface RetryPolicy {
  maxAttempts: number;   // total attempts allowed (including the first)
  backoffMs: number;     // fixed delay between retries, in milliseconds
}

// TODO 2 ── Define `JOB_RETRY_POLICIES` as a `Record` mapping
//           each `Job["kind"]` to a `RetryPolicy`.
//           Use the `satisfies` operator to keep the type precise.
//           Suggested values (you may adjust):
//             send_email:      { maxAttempts: 3, backoffMs: 500  }
//             resize_image:    { maxAttempts: 5, backoffMs: 200  }
//             generate_report: { maxAttempts: 2, backoffMs: 1000 }
export const JOB_RETRY_POLICIES = /* TODO */ {} satisfies Record<string, RetryPolicy>;

// ── 3. Result types ──────────────────────────────────────────

export interface JobSuccess<J extends Job> {
  status: "success";
  job: J;
  attempts: number;
  durationMs: number;
}

export interface JobFailure<J extends Job> {
  status: "failure";
  job: J;
  attempts: number;
  lastError: string;
}

// TODO 3 ── Define a generic `JobResult<J extends Job>` as a
//           discriminated union of `JobSuccess<J>` | `JobFailure<J>`.
export type JobResult<J extends Job> = /* TODO */ never;

// ── 4. Handlers ──────────────────────────────────────────────

// A handler receives a strongly-typed job and returns a Promise
// that resolves if the job succeeded, or rejects with an Error.

// TODO 4 ── Define a generic type alias `JobHandler<J extends Job>`
//           that represents: (job: J) => Promise<void>
export type JobHandler<J extends Job> = /* TODO */ never;

// TODO 5 ── Define a mapped type `HandlerMap` whose keys are
//           each `Job["kind"]` and whose values are the correct
//           `JobHandler` for that specific job subtype.
//           Hint: use a distributive mapped type over `Job`.
export type HandlerMap = {
  [K in Job["kind"]]: /* TODO */ never;
};

// ── 5. Runtime validator ─────────────────────────────────────

// TODO 6 ── Implement `parseJob(raw: unknown): Job`
//           Requirements:
//           a) Throw a TypeError if `raw` is not a non-null object.
//           b) Throw a TypeError if `raw.kind` is not one of the
//              known job kinds ("send_email" | "resize_image" | "generate_report").
//           c) For each kind, validate the required fields and their
//              types; throw a TypeError listing the missing/invalid field.
//           d) Return the narrowed `Job` value — no type assertions.
export function parseJob(raw: unknown): Job {
  // TODO
  throw new Error("Not implemented");
}

// ── 6. Core processor ────────────────────────────────────────

// TODO 7 ── Implement `processJob<J extends Job>`:
//           Signature:
//             processJob<J extends Job>(
//               job: J,
//               handler: JobHandler<J>,
//               policy: RetryPolicy,
//             ): Promise<JobResult<J>>
//
//           Requirements:
//           a) Track `attempts` (starts at 0, increments before each call).
//           b) Track wall-clock `durationMs` across all attempts.
//           c) Call `handler(job)`. On success return a `JobSuccess<J>`.
//           d) On failure, if attempts < maxAttempts, wait `backoffMs`
//              milliseconds (use the provided `sleep` helper) then retry.
//           e) If all attempts are exhausted, return a `JobFailure<J>`
//              with the last error's message in `lastError`.
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processJob<J extends Job>(
  job: J,
  handler: JobHandler<J>,
  policy: RetryPolicy,
): Promise<JobResult<J>> {
  // TODO
  throw new Error("Not implemented");
}

// ── 7. Dispatcher ────────────────────────────────────────────

// TODO 8 ── Implement `dispatch(raw: unknown, handlers: HandlerMap): Promise<JobResult<Job>>`
//           Requirements:
//           a) Parse `raw` with `parseJob`; on parse error return a
//              `JobFailure` immediately (attempts: 0, lastError: error message).
//              Hint: you'll need a placeholder `Job` value for the failure —
//              model an "unparsed" failure using a best-effort cast-free approach,
//              OR catch parse errors and re-throw as a JobFailure with a
//              sentinel job shape. Choose whichever keeps the types sound.
//           b) Look up the correct handler and retry policy by `job.kind`.
//           c) Call `processJob` and return its result.
//
//           Note: the return type is `Promise<JobResult<Job>>` because the
//           caller doesn't know which subtype will be processed at runtime.
export async function dispatch(
  raw: unknown,
  handlers: HandlerMap,
): Promise<JobResult<Job>> {
  // TODO
  throw new Error("Not implemented");
}
