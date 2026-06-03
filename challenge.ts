// ============================================================
// Typed Workflow State Machine Executor
// challenge.ts
// ============================================================
// Compile with: tsc --strict --noEmit challenge.ts
// Do NOT use `any`, `as`, or non-trivial type assertions.
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque brand helper — do NOT change. */
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type WorkflowId = Brand<string, "WorkflowId">;
export type StepId     = Brand<string, "StepId">;

// ------------------------------------------------------------------
// 2. STEP KINDS & DISCRIMINATED UNION
// ------------------------------------------------------------------

/**
 * TODO: Define `StepDefinition` as a discriminated union of the four
 * step kinds below.  Every variant must carry:
 *   - `id: StepId`
 *   - `kind`: the literal string discriminant
 *   - `retries: number`   (max retry attempts, ≥ 0)
 *   - its own kind-specific fields (described per variant)
 *
 * Variants:
 *
 * "http"
 *   - url:    string
 *   - method: "GET" | "POST" | "PUT" | "DELETE"
 *   - body?:  string
 *
 * "transform"
 *   - expression: string   (a JS expression string, e.g. "input.value * 2")
 *
 * "condition"
 *   - expression: string
 *   - onTrue:  StepId      (next step when truthy)
 *   - onFalse: StepId      (next step when falsy)
 *
 * "notify"
 *   - channel: "email" | "slack" | "sms"
 *   - message: string
 */
export type StepDefinition = never; // TODO: replace with your discriminated union

// ------------------------------------------------------------------
// 3. WORKFLOW DEFINITION
// ------------------------------------------------------------------

export interface WorkflowDefinition {
  id:         WorkflowId;
  name:       string;
  /** Ordered list of steps; execution starts at index 0. */
  steps:      StepDefinition[];
  /** Maximum total wall-clock time (ms) before the whole workflow is aborted. */
  timeoutMs:  number;
}

// ------------------------------------------------------------------
// 4. EXECUTION RESULT TYPES
// ------------------------------------------------------------------

export type StepStatus = "success" | "failed" | "skipped" | "timeout";

export interface StepResult<K extends StepDefinition["kind"]> {
  stepId:   StepId;
  kind:     K;
  status:   StepStatus;
  /** Attempt number that produced this result (1-based). */
  attempt:  number;
  /** ISO timestamp when this step finished. */
  finishedAt: string;
  /** Step-kind-specific output — see `StepOutput` below. */
  output:   StepOutput<K>;
}

/**
 * TODO: Define `StepOutput` as a mapped type over `StepDefinition["kind"]`
 * that maps each kind to its specific output shape:
 *
 *  "http"      → { statusCode: number; body: string }
 *  "transform" → { result: unknown }
 *  "condition" → { evaluated: boolean; nextStepId: StepId }
 *  "notify"    → { delivered: boolean; provider: string }
 *
 * Hint: use `Extract<StepDefinition, { kind: K }>` inside the mapped type
 * to keep the relationship between kind and output type-safe.
 */
export type StepOutput<K extends StepDefinition["kind"]> = never; // TODO

// ------------------------------------------------------------------
// 5. WORKFLOW EXECUTION REPORT
// ------------------------------------------------------------------

export interface WorkflowExecutionReport {
  workflowId:   WorkflowId;
  workflowName: string;
  startedAt:    string;
  finishedAt:   string;
  /** Overall outcome of the workflow run. */
  status:       "completed" | "failed" | "timeout";
  /** One entry per step that was attempted (skipped steps are included). */
  stepResults:  StepResult<StepDefinition["kind"]>[];
  /** Total number of retry attempts consumed across all steps. */
  totalRetries: number;
  /** Per-kind tally of step outcomes. */
  summary:      Record<StepDefinition["kind"], { total: number; succeeded: number; failed: number }>;
}

// ------------------------------------------------------------------
// 6. STEP HANDLER STRATEGY
// ------------------------------------------------------------------

/**
 * TODO: Define `StepHandler<S>` as a generic type constrained to
 * `StepDefinition`.  It is an async function that:
 *   - receives the specific step definition `S`
 *   - receives a `signal: AbortSignal` (for timeout cancellation)
 *   - returns a `Promise<StepOutput<S["kind"]>>`
 *
 * The return type must use `S["kind"]` so TypeScript can infer the
 * correct output shape for each handler.
 */
export type StepHandler<S extends StepDefinition> = never; // TODO

// ------------------------------------------------------------------
// 7. HANDLER REGISTRY
// ------------------------------------------------------------------

/**
 * TODO: Define `HandlerRegistry` as a mapped type over
 * `StepDefinition["kind"]` where each key maps to the correct
 * `StepHandler` for that specific variant.
 *
 * Hint: use `Extract<StepDefinition, { kind: K }>` to select the
 * right variant per key.
 */
export type HandlerRegistry = never; // TODO

// ------------------------------------------------------------------
// 8. RUNTIME VALIDATOR
// ------------------------------------------------------------------

/**
 * TODO: Implement `parseWorkflowDefinition`.
 *
 * Requirements:
 *   R1. Accept `raw: unknown` and return `WorkflowDefinition` on
 *       success, or throw a descriptive `Error` on failure.
 *   R2. Validate top-level fields: `id` (non-empty string), `name`
 *       (non-empty string), `steps` (non-empty array), `timeoutMs`
 *       (positive number).
 *   R3. Validate each step has `id` (non-empty string), `kind` (one
 *       of the four literals), `retries` (non-negative integer), and
 *       all kind-specific required fields.
 *   R4. Return a fully-typed `WorkflowDefinition` — cast brands only
 *       inside this function using `as` (the ONE permitted use of
 *       `as` in the whole file, isolated to brand casting).
 */
export function parseWorkflowDefinition(raw: unknown): WorkflowDefinition {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. RETRY HELPER
// ------------------------------------------------------------------

/**
 * TODO: Implement `withRetry`.
 *
 * Requirements:
 *   R5. Generic over `T` — resolves to `T` on success.
 *   R6. Retry up to `maxRetries` times (so up to `maxRetries + 1`
 *       total attempts).
 *   R7. Use exponential back-off: wait `baseDelayMs * 2^attempt` ms
 *       between attempts (attempt is 0-indexed).
 *   R8. If the `signal` is aborted before a retry delay completes,
 *       reject immediately with an `Error("aborted")`.
 *   R9. Return `{ result: T; attempts: number }` — `attempts` is the
 *       total number of calls made (1-based).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelayMs: number,
  signal: AbortSignal
): Promise<{ result: T; attempts: number }> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 10. CORE EXECUTOR
// ------------------------------------------------------------------

/**
 * TODO: Implement `executeWorkflow`.
 *
 * Requirements:
 *   R10. Parse `rawDefinition` via `parseWorkflowDefinition`; if
 *        parsing fails, return a report with status "failed" and a
 *        single synthetic step result describing the parse error.
 *   R11. Create an `AbortController`; abort after `timeoutMs` ms.
 *   R12. Execute steps **sequentially** in definition order.
 *        - "condition" steps: after success, set the next step to
 *          execute based on `output.nextStepId`; skip all steps
 *          between the current index and the target step.
 *        - All other steps: proceed to the next index in order.
 *   R13. Use `withRetry` for every step, passing the step's
 *        `retries` value and a `baseDelayMs` of `50`.
 *   R14. If a step ultimately fails (all retries exhausted), mark it
 *        "failed" and **abort the remaining steps** (set them to
 *        "skipped").
 *   R15. If the `AbortSignal` fires mid-execution (timeout), mark the
 *        in-progress step as "timeout" and remaining as "skipped".
 *   R16. Populate `WorkflowExecutionReport` fully, including
 *        `totalRetries` and the per-kind `summary`.
 */
export async function executeWorkflow(
  rawDefinition: unknown,
  registry: HandlerRegistry
): Promise<WorkflowExecutionReport> {
  // TODO
  throw new Error("Not implemented");
}
