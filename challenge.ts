// ============================================================
// Typed Job Queue with Priority Scheduling & Retry Policies
// challenge.ts
// ============================================================
// Compile with: tsc --strict --noEmit challenge.ts
// ============================================================

// -----------------------------------------------------------
// 1. DOMAIN TYPES
// -----------------------------------------------------------

/** Priority levels that control scheduling order (lower number = higher urgency). */
export type Priority = 1 | 2 | 3;

/**
 * Every concrete job kind is a discriminated union member.
 * Add the payload type as the second type parameter of JobBase.
 */
type JobBase<K extends string, P> = {
  readonly kind: K;
  readonly payload: P;
};

export type SendEmailJob   = JobBase<"send_email",   { to: string; subject: string; body: string }>;
export type ResizeImageJob = JobBase<"resize_image", { imageUrl: string; width: number; height: number }>;
export type GenerateReportJob = JobBase<"generate_report", { reportId: string; format: "pdf" | "csv" }>;

/** The full discriminated union of all supported job kinds. */
export type Job = SendEmailJob | ResizeImageJob | GenerateReportJob;

/** Extracts the kind string from any Job union member. */
export type JobKind = Job["kind"];

/** Extracts the payload type for a given job kind K. */
export type PayloadOf<K extends JobKind> = Extract<Job, { kind: K }>["payload"];

// -----------------------------------------------------------
// 2. RETRY POLICY
// -----------------------------------------------------------

export type RetryPolicy = {
  /** Maximum number of attempts (including the first). */
  maxAttempts: number;
  /** Fixed delay in milliseconds between attempts. */
  delayMs: number;
};

/**
 * A registry that maps every JobKind to its RetryPolicy.
 * TODO: Use a mapped type over JobKind so every kind MUST have a policy.
 */
export type RetryPolicyRegistry = {
  // TODO: replace this comment with the correct mapped type
  [K in JobKind]: RetryPolicy;
};

// -----------------------------------------------------------
// 3. JOB DESCRIPTOR (what gets enqueued)
// -----------------------------------------------------------

export type JobDescriptor<K extends JobKind = JobKind> = {
  readonly id: string;
  readonly kind: K;
  readonly payload: PayloadOf<K>;
  readonly priority: Priority;
  readonly enqueuedAt: number; // Unix timestamp ms
};

// -----------------------------------------------------------
// 4. EXECUTION RESULT
// -----------------------------------------------------------

type ExecutionResultBase<S extends string> = { status: S; jobId: string; attempts: number };

export type SuccessResult = ExecutionResultBase<"success"> & { output: string };
export type FailureResult = ExecutionResultBase<"failure"> & { error: string };
export type ExecutionResult = SuccessResult | FailureResult;

// -----------------------------------------------------------
// 5. HANDLER REGISTRY
// -----------------------------------------------------------

/**
 * A handler for job kind K receives the typed payload and returns a Promise
 * that resolves to a human-readable output string on success.
 *
 * TODO: Define HandlerFn<K> as a generic type alias.
 */
export type HandlerFn<K extends JobKind> = (payload: PayloadOf<K>) => Promise<string>;

/**
 * A registry that maps every JobKind to its handler function.
 * TODO: Use a mapped type over JobKind — every kind MUST have a handler.
 */
export type HandlerRegistry = {
  // TODO: replace this comment with the correct mapped type
  [K in JobKind]: HandlerFn<K>;
};

// -----------------------------------------------------------
// 6. VALIDATION — unknown → JobDescriptor
// -----------------------------------------------------------

/**
 * Validates a raw unknown value into a JobDescriptor.
 *
 * Requirements:
 * - R1: Return a JobDescriptor if the raw value has a valid `id` (non-empty string),
 *        a known `kind` (one of the JobKind values), a `payload` object matching
 *        that kind, a `priority` of 1 | 2 | 3, and an `enqueuedAt` number.
 * - R2: Return null for any invalid input — never throw.
 * - R3: Validate each payload field for the specific job kind (see payload types above).
 *        You must narrow to the correct payload shape per kind.
 *
 * HINT: Use a type predicate or discriminated narrowing inside the function body.
 */
export function validateJobDescriptor(raw: unknown): JobDescriptor | null {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. SCHEDULER — sort by priority then enqueuedAt
// -----------------------------------------------------------

/**
 * Given an array of validated job descriptors, return them sorted so that:
 * - R4: Jobs with a lower `priority` number come first (priority 1 before 2 before 3).
 * - R5: Ties in priority are broken by `enqueuedAt` ascending (FIFO within same priority).
 *
 * The input array must NOT be mutated.
 */
export function scheduleJobs(jobs: ReadonlyArray<JobDescriptor>): JobDescriptor[] {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 8. EXECUTOR — run a single job with retry logic
// -----------------------------------------------------------

/**
 * Executes a single job descriptor using the provided handler and retry policy.
 *
 * Requirements:
 * - R6: Look up the handler for `descriptor.kind` from `handlers`.
 * - R7: Look up the retry policy for `descriptor.kind` from `policies`.
 * - R8: Attempt to call the handler up to `maxAttempts` times.
 *        On success, return a SuccessResult immediately.
 * - R9: Between failed attempts, wait `delayMs` milliseconds before retrying.
 * - R10: After all attempts are exhausted, return a FailureResult (never throw).
 * - R11: The `attempts` field in the result must reflect the TOTAL number of calls made.
 *
 * HINT: You will need to narrow `descriptor.kind` to call the correct handler.
 *       Use a helper or a type-safe dispatch pattern — no `any`, no `as`.
 */
export async function executeJob(
  descriptor: JobDescriptor,
  handlers: HandlerRegistry,
  policies: RetryPolicyRegistry
): Promise<ExecutionResult> {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 9. QUEUE RUNNER — validate → schedule → execute
// -----------------------------------------------------------

/**
 * Processes a batch of raw unknown job submissions end-to-end.
 *
 * Requirements:
 * - R12: Validate each raw item with `validateJobDescriptor`; silently skip invalid ones.
 * - R13: Sort the valid descriptors with `scheduleJobs`.
 * - R14: Execute jobs SEQUENTIALLY (one at a time) in scheduled order using `executeJob`.
 * - R15: Return an array of ExecutionResult in the same order as execution.
 */
export async function runQueue(
  rawJobs: unknown[],
  handlers: HandlerRegistry,
  policies: RetryPolicyRegistry
): Promise<ExecutionResult[]> {
  // TODO: implement
  throw new Error("Not implemented");
}
