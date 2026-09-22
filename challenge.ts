// ============================================================
// Typed Job Queue with Priority Scheduling & Result Collection
// ============================================================
// Real-world context: background job processor for a data pipeline.
// Jobs have different priorities and payload types; a concurrency-
// limited runner executes them and collects typed results.
// ============================================================

// ── 1. JOB KINDS & PAYLOADS ─────────────────────────────────
// Requirement 1: Define a discriminated union `Job` with (at least)
//   three variants — "email", "report", "thumbnail" — each carrying
//   a distinct, non-overlapping payload shape.

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

export type ReportPayload = {
  reportId: string;
  format: "pdf" | "csv" | "xlsx";
};

export type ThumbnailPayload = {
  imageUrl: string;
  widths: number[];
};

// TODO: Define `Job` as a discriminated union.
// Each variant must have a `kind` discriminant, a unique `id: string`,
// a `priority: number` (higher = more urgent), and its payload fields
// (inline or via intersection — your choice, but no `any`).
export type Job = TODO;


// ── 2. RESULT TYPES ─────────────────────────────────────────
// Requirement 2: Define `JobSuccess<J>` and `JobFailure<J>` as generic
//   types parameterised over a Job variant, then combine them into
//   `JobResult<J>` (a discriminated union on `status`).
//
// `JobSuccess<J>` must carry:  { status: "success"; job: J; output: string; durationMs: number }
// `JobFailure<J>` must carry:  { status: "failure"; job: J; error: string; retryable: boolean }

export type JobSuccess<J extends Job> = TODO;
export type JobFailure<J extends Job> = TODO;
export type JobResult<J extends Job> = TODO;


// ── 3. HANDLER TYPE ─────────────────────────────────────────
// Requirement 3: Define `JobHandler<J>` — a function type that accepts
//   a single job of type `J` and returns `Promise<JobResult<J>>`.

export type JobHandler<J extends Job> = TODO;


// ── 4. HANDLER REGISTRY ─────────────────────────────────────
// Requirement 4: Define `HandlerRegistry` as a mapped type over every
//   Job `kind` so that each key maps to the correct `JobHandler` for
//   that specific variant. Use a helper type to extract the variant by
//   kind if needed.
//
// Hint: Extract<Job, { kind: K }> is your friend.

export type JobByKind<K extends Job["kind"]> = TODO;
export type HandlerRegistry = TODO;


// ── 5. QUEUE RUNNER ─────────────────────────────────────────
// Requirement 5: Implement `runQueue`.
//
// Signature (do NOT change):
//   async function runQueue(
//     jobs: Job[],
//     registry: HandlerRegistry,
//     concurrency: number,
//   ): Promise<QueueSummary>
//
// Behaviour:
//   a) Sort jobs by `priority` descending before execution.
//   b) Execute jobs with at most `concurrency` running simultaneously.
//   c) Each job is dispatched to its handler via the registry.
//   d) Failures must NOT abort remaining jobs — capture them in results.
//   e) Return a `QueueSummary` (see Requirement 6).

export type QueueSummary = {
  total: number;
  succeeded: number;
  failed: number;
  results: JobResult<Job>[];       // all results, in completion order
  failedIds: string[];             // ids of every failed job
};

export async function runQueue(
  jobs: Job[],
  registry: HandlerRegistry,
  concurrency: number,
): Promise<QueueSummary> {
  // TODO: implement
  throw new Error("Not implemented");
}


// ── 6. NARROWING HELPER ─────────────────────────────────────
// Requirement 6: Implement `getSuccesses` — a generic function that
//   accepts the `results` array from a `QueueSummary` and a job `kind`,
//   and returns only the successful results for that specific Job variant.
//
// The return type must be inferred (no explicit annotation needed on the
// call site) so that callers get back `JobSuccess<EmailJob>` etc., not
// the broader `JobResult<Job>`.
//
// Signature (do NOT change):
//   function getSuccesses<K extends Job["kind"]>(
//     results: JobResult<Job>[],
//     kind: K,
//   ): JobSuccess<JobByKind<K>>[]

export function getSuccesses<K extends Job["kind"]>(
  results: JobResult<Job>[],
  kind: K,
): JobSuccess<JobByKind<K>>[] {
  // TODO: implement
  throw new Error("Not implemented");
}
