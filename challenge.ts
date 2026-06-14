// ============================================================
// Typed Workflow Orchestrator with Conditional Branching
// ============================================================
// TOPICS: discriminated unions, conditional types, generics,
//         mapped types, Result<T,E>, infer, middleware/plugin
//         chains, unknown → typed narrowing, exhaustive matching
// ============================================================

// -----------------------------------------------------------
// 1. CORE RESULT TYPE
// -----------------------------------------------------------

/**
 * A Result monad: every step either succeeds with a typed value
 * or fails with a typed WorkflowError.
 */
export type Result<T, E extends WorkflowError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// -----------------------------------------------------------
// 2. ERROR HIERARCHY  (discriminated union — no `any`)
// -----------------------------------------------------------

export type WorkflowError =
  | { kind: "ValidationError"; field: string; message: string }
  | { kind: "StepError"; stepId: string; message: string }
  | { kind: "BranchError"; stepId: string; unmatchedOutcome: string }
  | { kind: "TimeoutError"; stepId: string; limitMs: number };

// -----------------------------------------------------------
// 3. STEP DEFINITIONS  (discriminated union on `type`)
// -----------------------------------------------------------

/** A step that transforms an input value and produces an output. */
export interface TransformStep {
  type: "transform";
  id: string;
  /** Name of the transformer registered in the StepRegistry */
  transformer: string;
  timeoutMs?: number;
}

/** A step that branches execution based on the previous step's output. */
export interface BranchStep {
  type: "branch";
  id: string;
  /**
   * Maps an outcome label (e.g. "approved" | "rejected") to the
   * next step id to execute.  Use "*" as a wildcard / default branch.
   */
  branches: Record<string, string>;
}

/** A step that merges parallel outputs back into a single value. */
export interface MergeStep {
  type: "merge";
  id: string;
  strategy: "first" | "concat" | "sum";
}

export type WorkflowStep = TransformStep | BranchStep | MergeStep;

// -----------------------------------------------------------
// 4. WORKFLOW DEFINITION
// -----------------------------------------------------------

export interface WorkflowDefinition {
  id: string;
  name: string;
  /** Ordered list of steps; branching may skip steps by id. */
  steps: WorkflowStep[];
  /** Id of the first step to execute */
  entryStepId: string;
}

// -----------------------------------------------------------
// 5. STEP CONTEXT & TRANSFORMER SIGNATURE
// -----------------------------------------------------------

/**
 * Passed into every transformer so it has full execution context.
 */
export interface StepContext {
  workflowId: string;
  stepId: string;
  /** Accumulated key→value store shared across all steps in this run */
  store: Map<string, unknown>;
}

/**
 * A transformer receives the current payload and context, and
 * returns a Result containing the new payload plus an outcome label.
 */
export type TransformerFn<TIn, TOut> = (
  input: TIn,
  ctx: StepContext
) => Promise<Result<{ value: TOut; outcome: string }, WorkflowError>>;

// -----------------------------------------------------------
// 6. STEP REGISTRY
// -----------------------------------------------------------

/**
 * Maps transformer names → their TransformerFn implementations.
 * The registry is generic over its shape so callers can register
 * strongly-typed transformers.
 *
 * TODO (1): Define `StepRegistry` as a mapped type over a generic
 *           record shape `R` where each key maps to a TransformerFn
 *           with arbitrary TIn / TOut.  The type should be:
 *
 *             StepRegistry<R extends Record<string, TransformerFn<unknown, unknown>>>
 *
 *           and simply equal `R` (it acts as a branded constraint helper).
 */
export type StepRegistry<
  R extends Record<string, TransformerFn<unknown, unknown>>
> = R; // TODO (1): keep this as-is — your job is to implement the functions below

// -----------------------------------------------------------
// 7. EXECUTION TRACE
// -----------------------------------------------------------

/** The outcome of a single executed step. */
export type StepTrace =
  | {
      stepId: string;
      type: "transform";
      outcome: string;
      durationMs: number;
      outputSnapshot: unknown; // intentionally opaque in the trace
    }
  | {
      stepId: string;
      type: "branch";
      selectedBranch: string;
      nextStepId: string;
    }
  | {
      stepId: string;
      type: "merge";
      strategy: MergeStep["strategy"];
      outputSnapshot: unknown;
    };

export interface ExecutionReport {
  workflowId: string;
  runId: string;
  status: "completed" | "failed";
  /** Ordered trace of every step that was executed */
  trace: StepTrace[];
  /** Final output value if status === "completed" */
  finalOutput?: unknown;
  /** Terminal error if status === "failed" */
  error?: WorkflowError;
}

// -----------------------------------------------------------
// 8. MIDDLEWARE
// -----------------------------------------------------------

/**
 * Middleware wraps a step execution.  It receives the step being
 * run, the current payload, and a `next` function to call the
 * inner handler (or the next middleware in the chain).
 */
export type StepMiddleware = (
  step: WorkflowStep,
  payload: unknown,
  next: (payload: unknown) => Promise<Result<{ value: unknown; outcome: string }, WorkflowError>>
) => Promise<Result<{ value: unknown; outcome: string }, WorkflowError>>;

// -----------------------------------------------------------
// 9.  VALIDATION  (unknown → WorkflowDefinition)
// -----------------------------------------------------------

/**
 * TODO (2): Implement `validateWorkflowDefinition`.
 *
 * Requirements:
 *  - Accept `raw: unknown` and return `Result<WorkflowDefinition, WorkflowError>`
 *  - Validate that `raw` is an object with:
 *      • `id`          — non-empty string
 *      • `name`        — non-empty string
 *      • `entryStepId` — non-empty string
 *      • `steps`       — non-empty array where every element has:
 *            - `type` ∈ { "transform", "branch", "merge" }
 *            - `id`   — non-empty string
 *            - For "transform": `transformer` is a non-empty string
 *            - For "branch":    `branches` is a non-empty plain object
 *            - For "merge":     `strategy` ∈ { "first", "concat", "sum" }
 *  - Return `{ ok: false, error: { kind: "ValidationError", ... } }` on
 *    the FIRST validation failure found.
 *  - No `any`, no type assertions (`as`).
 */
export function validateWorkflowDefinition(
  raw: unknown
): Result<WorkflowDefinition, WorkflowError> {
  // TODO (2)
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 10. ORCHESTRATOR
// -----------------------------------------------------------

/**
 * TODO (3): Implement `createOrchestrator`.
 *
 * Returns an object with a single `run` method.
 *
 * Requirements:
 *  a) `run` accepts:
 *       - `definition`  — a validated WorkflowDefinition
 *       - `initialInput`— the starting payload (unknown)
 *     and returns `Promise<ExecutionReport>`.
 *
 *  b) Execution loop:
 *       i.  Start at `definition.entryStepId`.
 *       ii. Look up the current step by id in `definition.steps`.
 *       iii.For a `transform` step:
 *             - Look up `step.transformer` in the registry.
 *             - If not found → fail with StepError.
 *             - Wrap the call with the middleware chain (see §d).
 *             - Respect `step.timeoutMs` if set: race the transformer
 *               against a `setTimeout`-based rejection that returns
 *               a TimeoutError result (do NOT throw — return as Result).
 *             - Append a StepTrace of type "transform".
 *             - Advance payload to the transformer's output value.
 *             - Store the outcome label for the next branch step.
 *       iv. For a `branch` step:
 *             - Use the last outcome label to pick a branch key.
 *             - Fall back to "*" wildcard if the exact key is absent.
 *             - If neither found → fail with BranchError.
 *             - Append a StepTrace of type "branch".
 *             - Jump to the indicated next step id.
 *       v.  For a `merge` step:
 *             - Apply the strategy to the CURRENT payload:
 *                 "first"  → keep as-is (payload unchanged)
 *                 "concat" → if payload is string[], join with ","
 *                            else keep as-is
 *                 "sum"    → if payload is number[], sum them
 *                            else keep as-is
 *             - Append a StepTrace of type "merge".
 *             - Continue to the NEXT step in the `steps` array
 *               (by array index, not by id).
 *       vi. After a step completes without a branch redirect,
 *           advance to the next step in the array by index.
 *       vii.When there is no next step, finish with status "completed".
 *
 *  c) Error handling:
 *       - Any failed Result from a step → immediately return an
 *         ExecutionReport with status "failed" and the error.
 *       - Include all traces collected so far in the report.
 *
 *  d) Middleware chain:
 *       - Middleware is applied in the ORDER it was registered
 *         (first registered = outermost wrapper).
 *       - Each middleware receives `next`; calling `next(payload)`
 *         delegates to the remaining chain and finally the transformer.
 *
 *  e) `runId` should be a simple incrementing counter (1, 2, 3 …)
 *     scoped to the orchestrator instance.
 */
export function createOrchestrator<
  R extends Record<string, TransformerFn<unknown, unknown>>
>(
  registry: StepRegistry<R>,
  middleware?: StepMiddleware[]
): {
  run: (
    definition: WorkflowDefinition,
    initialInput: unknown
  ) => Promise<ExecutionReport>;
} {
  // TODO (3)
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 11. UTILITY: `extractStepIds`
// -----------------------------------------------------------

/**
 * TODO (4): Implement `extractStepIds`.
 *
 * Requirements:
 *  - Accept a WorkflowDefinition and return a
 *    `Record<WorkflowStep["type"], string[]>` mapping each step
 *    type to the list of step ids of that type (in definition order).
 *  - The return type must be inferred / constructed via mapped type
 *    over `WorkflowStep["type"]` — do NOT manually write out the
 *    object literal type.
 *  - Use a single `reduce` call (no imperative loops).
 */
export function extractStepIds(
  definition: WorkflowDefinition
): Record<WorkflowStep["type"], string[]> {
  // TODO (4)
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 12. UTILITY: `narrowError`
// -----------------------------------------------------------

/**
 * TODO (5): Implement `narrowError`.
 *
 * A generic exhaustive-match helper.
 *
 * Requirements:
 *  - Signature:  narrowError<E extends WorkflowError>(
 *                  error: E,
 *                  handlers: { [K in E["kind"]]: (e: Extract<E, { kind: K }>) => string }
 *                ): string
 *  - For each `kind` in the union, call the matching handler with
 *    the correctly narrowed error type.
 *  - Must be exhaustive: TypeScript should complain if a handler is missing.
 *  - No `any`, no type assertions.
 */
export function narrowError<E extends WorkflowError>(
  error: E,
  handlers: { [K in E["kind"]]: (e: Extract<E, { kind: K }>) => string }
): string {
  // TODO (5)
  throw new Error("Not implemented");
}
