// ============================================================
// Typed Workflow Orchestrator — challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill in every TODO. Do NOT modify existing type signatures.
// ============================================================

// ------------------------------------------------------------------
// 1. PRIMITIVE BRANDED TYPES
// ------------------------------------------------------------------

/** A non-empty string identifier */
type WorkflowId = string & { readonly __brand: "WorkflowId" };
type StepId     = string & { readonly __brand: "StepId" };

// TODO 1 — Implement branded constructors.
// Each must validate the raw string (non-empty) and return
// Result<BrandedType, ValidationError> (see Result below).
// Do NOT use `as` or type assertions.

// ------------------------------------------------------------------
// 2. RESULT / ERROR TYPES
// ------------------------------------------------------------------

type ValidationError = { readonly kind: "ValidationError"; message: string };
type ExecutionError  = { readonly kind: "ExecutionError";  stepId: StepId; message: string };
type RetryExhausted  = { readonly kind: "RetryExhausted";  stepId: StepId; attempts: number };

type OrchestratorError = ValidationError | ExecutionError | RetryExhausted;

type Result<T, E> =
  | { readonly ok: true;  value: T }
  | { readonly ok: false; error: E };

// Convenience constructors (already provided — do not modify)
const Ok  = <T>(value: T): Result<T, never>               => ({ ok: true,  value });
const Err = <E>(error: E): Result<never, E>               => ({ ok: false, error });

// ------------------------------------------------------------------
// 3. STEP DEFINITIONS — discriminated union
// ------------------------------------------------------------------

// Each step kind carries its own typed config.

type HttpStep = {
  readonly kind:    "http";
  readonly stepId:  StepId;
  readonly url:     string;
  readonly method:  "GET" | "POST" | "PUT" | "DELETE";
  readonly retries: number;          // 0–5
};

type TransformStep = {
  readonly kind:       "transform";
  readonly stepId:     StepId;
  readonly expression: string;       // non-empty
  readonly retries:    number;
};

type ConditionStep = {
  readonly kind:        "condition";
  readonly stepId:      StepId;
  readonly predicate:   string;      // non-empty
  readonly trueBranch:  StepId;
  readonly falseBranch: StepId;
};

type NotifyStep = {
  readonly kind:      "notify";
  readonly stepId:    StepId;
  readonly channel:   "email" | "slack" | "webhook";
  readonly template:  string;        // non-empty
  readonly retries:   number;
};

type WorkflowStep = HttpStep | TransformStep | ConditionStep | NotifyStep;

// ------------------------------------------------------------------
// 4. WORKFLOW DEFINITION
// ------------------------------------------------------------------

type WorkflowDef = {
  readonly id:      WorkflowId;
  readonly name:    string;
  readonly steps:   readonly WorkflowStep[];
  readonly entryId: StepId;          // must reference an existing step
};

// ------------------------------------------------------------------
// 5. RUNTIME / EXECUTION TYPES
// ------------------------------------------------------------------

/** Per-step outcome after execution */
type StepOutcome =
  | { readonly status: "success"; stepId: StepId; durationMs: number; output: unknown }
  | { readonly status: "skipped"; stepId: StepId; reason: string }
  | { readonly status: "failed";  stepId: StepId; error: ExecutionError | RetryExhausted };

/** Final report returned by the orchestrator */
type WorkflowReport = {
  readonly workflowId: WorkflowId;
  readonly startedAt:  number;       // Date.now()
  readonly finishedAt: number;
  readonly outcomes:   readonly StepOutcome[];
  readonly finalStatus: "completed" | "partial" | "failed";
};

// ------------------------------------------------------------------
// 6. STEP HANDLER REGISTRY
// ------------------------------------------------------------------

/**
 * A handler receives a fully-typed step and returns a Promise
 * resolving to a Result containing either an output value or an
 * ExecutionError.
 */
type StepHandler<S extends WorkflowStep> = (
  step: S
) => Promise<Result<unknown, ExecutionError>>;

/**
 * The registry maps each step `kind` to its corresponding handler.
 * Use a mapped type over the discriminant so every kind is required.
 */
// TODO 2 — Define `HandlerRegistry` as a mapped type keyed by
// WorkflowStep["kind"] where each key maps to the correct
// StepHandler<Extract<WorkflowStep, { kind: K }>> for that key K.
type HandlerRegistry = /* your mapped type here */ unknown;

// ------------------------------------------------------------------
// 7. MIDDLEWARE
// ------------------------------------------------------------------

/**
 * Middleware wraps a handler call; it receives the step (as the
 * base union) and a `next` function it must call to continue the
 * chain.  It may short-circuit by returning a Result directly.
 */
type MiddlewareFn = (
  step: WorkflowStep,
  next: () => Promise<Result<unknown, ExecutionError>>
) => Promise<Result<unknown, ExecutionError>>;

/**
 * TODO 3 — Implement `composeMiddleware`.
 *
 * Given an ordered array of MiddlewareFn and a terminal handler
 * (a function that takes a WorkflowStep and returns the raw result),
 * return a single composed function with the same signature as the
 * terminal handler.
 *
 * Middleware is applied outermost-first (index 0 runs first).
 */
declare function composeMiddleware(
  middlewares: readonly MiddlewareFn[],
  terminal: (step: WorkflowStep) => Promise<Result<unknown, ExecutionError>>
): (step: WorkflowStep) => Promise<Result<unknown, ExecutionError>>;

// ------------------------------------------------------------------
// 8. VALIDATION
// ------------------------------------------------------------------

/**
 * TODO 4 — Implement `parseWorkflowDef`.
 *
 * Accepts `unknown` input and returns Result<WorkflowDef, ValidationError>.
 *
 * Requirements (all must be checked; return the FIRST error found):
 *  4a. Input must be a non-null object.
 *  4b. `id` must be a non-empty string → brand as WorkflowId.
 *  4c. `name` must be a non-empty string.
 *  4d. `steps` must be a non-empty array; each element must satisfy
 *      one of the four step shapes (validate kind, stepId, and all
 *      kind-specific required fields).
 *  4e. `entryId` must be a non-empty string → brand as StepId, and
 *      must match the stepId of at least one step in the array.
 *  4f. For ConditionStep, trueBranch and falseBranch must each
 *      reference an existing stepId in the workflow.
 *  4g. retries (where present) must be an integer in [0, 5].
 */
declare function parseWorkflowDef(raw: unknown): Result<WorkflowDef, ValidationError>;

// ------------------------------------------------------------------
// 9. RETRY HELPER
// ------------------------------------------------------------------

/**
 * TODO 5 — Implement `withRetry`.
 *
 * Wraps an async operation; retries on ExecutionError up to
 * `maxAttempts` times (total calls = maxAttempts, not extra retries).
 * Between retries apply exponential back-off: wait 50 * 2^attempt ms
 * (use a provided `delay` function for testability).
 *
 * Returns:
 *  - Ok(value) on first success.
 *  - Err(RetryExhausted) if all attempts fail, including the attempt
 *    count in the error.
 */
declare function withRetry(
  stepId: StepId,
  maxAttempts: number,
  operation: () => Promise<Result<unknown, ExecutionError>>,
  delay?: (ms: number) => Promise<void>
): Promise<Result<unknown, ExecutionError | RetryExhausted>>;

// ------------------------------------------------------------------
// 10. ORCHESTRATOR — main entry point
// ------------------------------------------------------------------

/**
 * TODO 6 — Implement `runWorkflow`.
 *
 * Accepts raw unknown input (a workflow definition blob) and a
 * HandlerRegistry, plus an optional middleware array.
 *
 * Steps:
 *  6a. Parse and validate the raw input via `parseWorkflowDef`.
 *      On failure return Err(ValidationError).
 *  6b. Build the composed middleware pipeline using `composeMiddleware`.
 *  6c. Execute steps sequentially starting from `entryId`.
 *      - For each step, dispatch to the correct handler via the
 *        registry (use the step's `kind` to look up the handler).
 *      - Apply `withRetry` for steps that have a `retries` field > 0.
 *      - For ConditionStep, execute the step, then interpret the
 *        boolean output to choose the next branch (trueBranch /
 *        falseBranch). Mark the unchosen branch as "skipped".
 *      - Stop execution on the first unrecoverable failure
 *        (RetryExhausted or ExecutionError after retries exhausted).
 *  6d. Collect all StepOutcomes and build a WorkflowReport.
 *      finalStatus rules:
 *        "completed" — all steps succeeded or were skipped
 *        "partial"   — at least one skipped AND at least one success
 *        "failed"    — any step ended in "failed" status
 *
 * Returns Result<WorkflowReport, OrchestratorError>.
 */
declare function runWorkflow(
  raw: unknown,
  registry: HandlerRegistry,
  middlewares?: readonly MiddlewareFn[]
): Promise<Result<WorkflowReport, OrchestratorError>>;

// ------------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------------
export type {
  WorkflowId, StepId,
  WorkflowStep, HttpStep, TransformStep, ConditionStep, NotifyStep,
  WorkflowDef, WorkflowReport, StepOutcome,
  HandlerRegistry, MiddlewareFn,
  Result, OrchestratorError, ValidationError, ExecutionError, RetryExhausted,
};
export { Ok, Err, composeMiddleware, parseWorkflowDef, withRetry, runWorkflow };
