// ============================================================
// challenge.ts — Typed Workflow State Machine with Retry & Cancellation
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill in every section marked TODO.
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

// TODO: Define a branded type `JobId` (brand: "JobId") over `string`.
// TODO: Define a branded type `StepId` (brand: "StepId") over `string`.

export type JobId = // TODO
export type StepId = // TODO

// Helper constructors (implement these — they may use a type assertion
// ONLY inside the constructor body, nowhere else in the file).
export declare function makeJobId(raw: string): JobId;
export declare function makeStepId(raw: string): StepId;

// ------------------------------------------------------------------
// 2. RAW INPUT TYPES (arrive as `unknown` from the queue)
// ------------------------------------------------------------------

export interface RawStep {
  id: unknown;
  name: unknown;
  /** Maximum number of attempts (including the first). Min 1, max 5. */
  maxAttempts: unknown;
  /** Simulated duration in milliseconds (1–5000). */
  durationMs: unknown;
  /** Whether this step should intentionally fail on every attempt. */
  alwaysFails: unknown;
}

export interface RawJob {
  id: unknown;
  name: unknown;
  steps: unknown;
}

// ------------------------------------------------------------------
// 3. VALIDATED DOMAIN TYPES
// ------------------------------------------------------------------

export interface Step {
  id: StepId;
  name: string;
  maxAttempts: number;
  durationMs: number;
  alwaysFails: boolean;
}

export interface Job {
  id: JobId;
  name: string;
  steps: Step[];
}

// ------------------------------------------------------------------
// 4. STATE MACHINE — Discriminated Union
// ------------------------------------------------------------------
// A StepExecution moves through these states (in order):
//   pending → running → (succeeded | failed | cancelled)
//
// A JobExecution moves through these states:
//   pending → running → (completed | failed | cancelled)

// TODO: Define `StepState` as a discriminated union with the following
//       variants. Each variant must have a `status` discriminant and
//       the fields listed:
//
//  { status: "pending" }
//  { status: "running";    attempt: number; startedAt: number }
//  { status: "succeeded";  attempt: number; startedAt: number; endedAt: number; durationMs: number }
//  { status: "failed";     attempts: number; lastError: string }
//  { status: "cancelled";  attempt: number; reason: string }

export type StepState = // TODO

// TODO: Define `JobState` as a discriminated union with the following
//       variants:
//
//  { status: "pending" }
//  { status: "running";    startedAt: number; currentStepId: StepId }
//  { status: "completed";  startedAt: number; endedAt: number; totalDurationMs: number }
//  { status: "failed";     startedAt: number; endedAt: number; failedStepId: StepId; reason: string }
//  { status: "cancelled";  startedAt: number; endedAt: number; cancelledStepId: StepId }

export type JobState = // TODO

// ------------------------------------------------------------------
// 5. EXECUTION RECORDS
// ------------------------------------------------------------------

export interface StepExecution {
  step: Step;
  state: StepState;
}

export interface JobExecution {
  job: Job;
  state: JobState;
  stepExecutions: StepExecution[];
}

// ------------------------------------------------------------------
// 6. RESULT TYPE
// ------------------------------------------------------------------

// TODO: Define a generic `Result<T, E>` discriminated union:
//   | { ok: true;  value: T }
//   | { ok: false; error: E }

export type Result<T, E> = // TODO

// ------------------------------------------------------------------
// 7. VALIDATION ERRORS
// ------------------------------------------------------------------

// TODO: Define `ValidationError` as a discriminated union with these
//       variants (discriminant: `kind`):
//
//   { kind: "MissingField";  field: string }
//   { kind: "InvalidType";   field: string; expected: string; received: string }
//   { kind: "OutOfRange";    field: string; min: number; max: number; actual: number }
//   { kind: "InvalidSteps";  errors: ValidationError[] }

export type ValidationError = // TODO

// ------------------------------------------------------------------
// 8. EXECUTION ERRORS
// ------------------------------------------------------------------

// TODO: Define `ExecutionError` as a discriminated union:
//
//   { kind: "StepFailed";    stepId: StepId; attempts: number; message: string }
//   { kind: "Cancelled";     stepId: StepId; reason: string }
//   { kind: "Timeout";       stepId: StepId; durationMs: number }

export type ExecutionError = // TODO

// ------------------------------------------------------------------
// 9. REPORT TYPE
// ------------------------------------------------------------------

// TODO: Define `StepReport` — a mapped type derived from `StepExecution`
//       that replaces `state` with a `summary` field of type `StepSummary`.
//       `StepSummary` is a conditional type:
//         - If `StepState["status"]` is "succeeded" → { outcome: "success"; durationMs: number }
//         - If `StepState["status"]` is "failed"    → { outcome: "failure"; attempts: number }
//         - If `StepState["status"]` is "cancelled" → { outcome: "cancelled"; reason: string }
//         - Otherwise                               → { outcome: "pending" }

// TODO: Define `StepSummary` as a conditional type over `StepState`.
export type StepSummary<S extends StepState> = // TODO

// TODO: Define `StepReport` using `StepSummary`.
export interface StepReport<S extends StepState> {
  step: Step;
  summary: StepSummary<S>; // TODO — wire up StepSummary
}

export interface JobReport {
  jobId: JobId;
  jobName: string;
  finalStatus: JobState["status"];
  totalSteps: number;
  succeededSteps: number;
  failedSteps: number;
  cancelledSteps: number;
  /** Union of all concrete StepReport variants */
  stepReports: StepReport<StepState>[];
  executionError: ExecutionError | null;
}

// ------------------------------------------------------------------
// 10. STEP EXECUTOR TYPE
// ------------------------------------------------------------------

// A StepExecutor is an async function that simulates running a step.
// It receives the step and an AbortSignal and resolves after `durationMs`,
// or rejects with an Error if `alwaysFails` is true, or rejects with
// an "AbortError" if the signal fires first.
export type StepExecutor = (step: Step, signal: AbortSignal) => Promise<void>;

// ------------------------------------------------------------------
// 11. FUNCTIONS TO IMPLEMENT
// ------------------------------------------------------------------

/**
 * REQUIREMENT 1 — validateStep
 * Parse `unknown` input into a validated `Step`.
 * - `id`          : non-empty string → StepId
 * - `name`        : non-empty string
 * - `maxAttempts` : integer in [1, 5]
 * - `durationMs`  : integer in [1, 5000]
 * - `alwaysFails` : boolean
 * Returns Result<Step, ValidationError[]>.
 */
export declare function validateStep(raw: unknown): Result<Step, ValidationError[]>;

/**
 * REQUIREMENT 2 — validateJob
 * Parse `unknown` input into a validated `Job`.
 * - `id`    : non-empty string → JobId
 * - `name`  : non-empty string
 * - `steps` : non-empty array; each element validated via validateStep.
 *             Collect ALL step errors; do not short-circuit.
 * Returns Result<Job, ValidationError[]>.
 */
export declare function validateJob(raw: unknown): Result<Job, ValidationError[]>;

/**
 * REQUIREMENT 3 — createStepExecutor
 * Return a `StepExecutor` that:
 * - Resolves after `step.durationMs` milliseconds (simulate with setTimeout).
 * - If `step.alwaysFails` is true, rejects with `new Error("step failed: <step.name>")`.
 * - If the AbortSignal fires before completion, rejects with
 *   `new Error("AbortError: step cancelled: <step.name>")`.
 * The abort check must happen BEFORE the timer resolves.
 */
export declare function createStepExecutor(): StepExecutor;

/**
 * REQUIREMENT 4 — runStep
 * Execute a single step with retry logic.
 * - Attempt the step up to `step.maxAttempts` times.
 * - On each attempt, update the StepExecution state to "running"
 *   with the current attempt number (1-based).
 * - If the attempt succeeds, set state to "succeeded".
 * - If the attempt fails with a non-abort error and attempts remain, retry.
 * - If all attempts fail, set state to "failed".
 * - If the signal fires (AbortError), set state to "cancelled" and
 *   return Result<StepExecution, ExecutionError> with kind "Cancelled".
 * Returns Result<StepExecution, ExecutionError>.
 *
 * @param execution  - mutable StepExecution record (update `.state` in place)
 * @param executor   - the StepExecutor to use
 * @param signal     - AbortSignal for cancellation
 */
export declare function runStep(
  execution: StepExecution,
  executor: StepExecutor,
  signal: AbortSignal
): Promise<Result<StepExecution, ExecutionError>>;

/**
 * REQUIREMENT 5 — runJob
 * Execute all steps of a job sequentially.
 * - Create one AbortController for the entire job.
 * - Move job state to "running" before the first step.
 * - Run steps in order; on the first failure or cancellation, abort
 *   remaining steps and move job state to "failed" or "cancelled".
 * - If all steps succeed, move job state to "completed".
 * - Returns a fully populated JobExecution.
 *
 * @param job       - validated Job
 * @param executor  - StepExecutor to use for each step
 */
export declare function runJob(
  job: Job,
  executor: StepExecutor
): Promise<JobExecution>;

/**
 * REQUIREMENT 6 — buildJobReport
 * Convert a completed JobExecution into a JobReport.
 * - Count succeeded / failed / cancelled steps from stepExecutions.
 * - Build a StepReport for each StepExecution using StepSummary.
 * - Derive `executionError` from the job state if status is "failed"
 *   or "cancelled"; otherwise null.
 * - Must be exhaustive: handle every StepState status via a switch/if
 *   so TypeScript can narrow correctly.
 */
export declare function buildJobReport(execution: JobExecution): JobReport;

/**
 * REQUIREMENT 7 — processJobFromQueue
 * Full pipeline: validate → run → report.
 * - Validate the raw input; if invalid return Result with a human-readable
 *   summary string of all ValidationErrors.
 * - Run the job with `createStepExecutor()`.
 * - Build and return the JobReport wrapped in Result<JobReport, string>.
 */
export declare function processJobFromQueue(
  raw: unknown
): Promise<Result<JobReport, string>>;
