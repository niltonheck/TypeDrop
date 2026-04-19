// ============================================================
// Typed Workflow Orchestrator
// ============================================================
// TOPICS: discriminated unions · conditional types · mapped types ·
//         generics · Result<T,E> · concurrency limits · retry logic ·
//         unknown → typed narrowing · branded types · satisfies
// ============================================================

// -------------------------------------------------------------------
// 1. BRANDED TYPES
// -------------------------------------------------------------------

/** Opaque brand helper — do NOT use `as` to cast; use the provided constructors. */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type WorkflowId = Brand<string, "WorkflowId">;
export type StepId     = Brand<string, "StepId">;

/** Safe constructors (these are the ONLY places a cast is permitted). */
export const workflowId = (s: string): WorkflowId => s as WorkflowId;
export const stepId     = (s: string): StepId     => s as StepId;

// -------------------------------------------------------------------
// 2. STEP DEFINITIONS  (discriminated union on `kind`)
// -------------------------------------------------------------------

export interface HttpStep {
  kind:    "http";
  id:      StepId;
  url:     string;
  method:  "GET" | "POST" | "PUT" | "DELETE";
  body?:   Record<string, unknown>;
  /** Steps that must complete before this one runs. */
  dependsOn: StepId[];
}

export interface TransformStep {
  kind:       "transform";
  id:         StepId;
  dependsOn:  StepId[];
  /** JS expression string evaluated over the previous step's output.
   *  (Treat as an opaque string — no need to actually eval it.) */
  expression: string;
}

export interface ConditionStep {
  kind:        "condition";
  id:          StepId;
  dependsOn:   StepId[];
  /** If true, `thenStepId` runs next; otherwise `elseStepId`. */
  predicate:   string;
  thenStepId:  StepId;
  elseStepId:  StepId;
}

export interface DelayStep {
  kind:       "delay";
  id:         StepId;
  dependsOn:  StepId[];
  /** Milliseconds to wait. */
  ms:         number;
}

export type WorkflowStep =
  | HttpStep
  | TransformStep
  | ConditionStep
  | DelayStep;

// -------------------------------------------------------------------
// 3. RAW (UNVALIDATED) SHAPES
// -------------------------------------------------------------------

export interface RawWorkflow {
  id:    unknown;
  name:  unknown;
  steps: unknown;
}

// -------------------------------------------------------------------
// 4. VALIDATED WORKFLOW
// -------------------------------------------------------------------

export interface Workflow {
  id:    WorkflowId;
  name:  string;
  steps: WorkflowStep[];
}

// -------------------------------------------------------------------
// 5. RESULT TYPE
// -------------------------------------------------------------------

export type Ok<T>  = { ok: true;  value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export const ok  = <T>(value: T): Ok<T>   => ({ ok: true,  value });
export const err = <E>(error: E): Err<E>  => ({ ok: false, error });

// -------------------------------------------------------------------
// 6. STEP EXECUTION RESULTS  (discriminated on `status`)
// -------------------------------------------------------------------

export interface StepSuccess {
  status:  "success";
  stepId:  StepId;
  output:  unknown;          // whatever the step "returned"
  durationMs: number;
}

export interface StepFailure {
  status:    "failure";
  stepId:    StepId;
  reason:    string;
  attempts:  number;
}

export interface StepSkipped {
  status:  "skipped";
  stepId:  StepId;
  reason:  "dependency-failed" | "condition-branch-not-taken";
}

export type StepResult = StepSuccess | StepFailure | StepSkipped;

// -------------------------------------------------------------------
// 7. EXECUTION REPORT
// -------------------------------------------------------------------

export interface ExecutionReport {
  workflowId:   WorkflowId;
  workflowName: string;
  startedAt:    number;   // Date.now()
  finishedAt:   number;
  /** One entry per step, in execution order. */
  stepResults:  StepResult[];
  /** "completed" iff every non-skipped step succeeded. */
  outcome:      "completed" | "partial" | "failed";
}

// -------------------------------------------------------------------
// 8. EXECUTOR CONFIG
// -------------------------------------------------------------------

export interface ExecutorConfig {
  /** Max steps running simultaneously. */
  concurrency: number;
  /** How many times to retry a failing step (0 = no retries). */
  maxRetries:  number;
  /** Base delay (ms) between retries — use exponential back-off: baseMs * 2^attempt */
  retryBaseMs: number;
}

// -------------------------------------------------------------------
// 9. STEP HANDLER MAP
// -------------------------------------------------------------------

/**
 * TODO — Requirement 9a
 * Define `StepHandlerMap` as a mapped type over WorkflowStep["kind"] so that
 * each key maps to a handler function:
 *
 *   (step: Extract<WorkflowStep, { kind: K }>, ctx: ExecutionContext) => Promise<unknown>
 *
 * Use a mapped type with a type parameter constrained to WorkflowStep["kind"].
 */
export type StepHandlerMap = {
  // TODO: implement this mapped type
  [K in WorkflowStep["kind"]]: (
    step: Extract<WorkflowStep, { kind: K }>,
    ctx: ExecutionContext
  ) => Promise<unknown>;
};

// -------------------------------------------------------------------
// 10. EXECUTION CONTEXT  (carries outputs of completed steps)
// -------------------------------------------------------------------

export interface ExecutionContext {
  /** Retrieve the output of a previously completed step (undefined if not done). */
  getOutput: (id: StepId) => unknown;
}

// -------------------------------------------------------------------
// 11. VALIDATION
// -------------------------------------------------------------------

/**
 * TODO — Requirement 11a
 * Validate a single raw step object (already known to be a plain object).
 * Return `Result<WorkflowStep, string>`.
 *
 * Rules:
 *  - `kind` must be one of "http" | "transform" | "condition" | "delay"
 *  - `id` must be a non-empty string → brand it as StepId
 *  - `dependsOn` must be a string[] → brand each element as StepId
 *  - For "http": url (string), method (GET/POST/PUT/DELETE) are required
 *  - For "condition": predicate (string), thenStepId (string), elseStepId (string) required
 *  - For "delay": ms (positive number) required
 *  - For "transform": expression (string) required
 */
export function validateStep(raw: Record<string, unknown>): Result<WorkflowStep, string> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO — Requirement 11b
 * Validate an `unknown` value as a `Workflow`.
 * Return `Result<Workflow, string>`.
 *
 * Rules:
 *  - Must be a plain object with string `id`, string `name`, and array `steps`
 *  - Each element of `steps` must pass `validateStep`
 *  - If any step fails validation, return the first error encountered
 */
export function validateWorkflow(raw: unknown): Result<Workflow, string> {
  // TODO
  throw new Error("Not implemented");
}

// -------------------------------------------------------------------
// 12. TOPOLOGICAL SORT
// -------------------------------------------------------------------

/**
 * TODO — Requirement 12a
 * Produce a topological ordering of steps respecting `dependsOn` edges.
 * Return `Result<WorkflowStep[], string>` — Err if a cycle is detected.
 *
 * Hint: Kahn's algorithm works well here.
 */
export function topoSort(steps: WorkflowStep[]): Result<WorkflowStep[], string> {
  // TODO
  throw new Error("Not implemented");
}

// -------------------------------------------------------------------
// 13. ORCHESTRATOR
// -------------------------------------------------------------------

/**
 * TODO — Requirement 13a
 * Execute a validated workflow and return an `ExecutionReport`.
 *
 * Requirements:
 *  (a) Sort steps topologically before execution.
 *  (b) Steps whose `dependsOn` are ALL currently resolved (succeeded) may
 *      run concurrently, up to `config.concurrency` at a time.
 *  (c) If a step's direct dependency failed or was skipped, mark it
 *      `StepSkipped` with reason "dependency-failed" immediately.
 *  (d) For "condition" steps: after execution, mark the branch NOT taken
 *      as `StepSkipped` with reason "condition-branch-not-taken".
 *      (Treat the step's output as a boolean — truthy → thenStepId branch taken.)
 *  (e) Retry failing steps up to `config.maxRetries` times with exponential
 *      back-off: wait `config.retryBaseMs * 2^attempt` ms before each retry.
 *  (f) Determine `outcome`:
 *        "completed" — all steps succeeded (none failed, skipped is ok)
 *        "failed"    — the first step (in topo order) failed
 *        "partial"   — some steps failed but not the first
 *
 * @param workflow   A validated Workflow
 * @param handlers   Typed handler map for each step kind
 * @param config     Executor configuration
 */
export async function orchestrate(
  workflow:  Workflow,
  handlers:  StepHandlerMap,
  config:    ExecutorConfig
): Promise<ExecutionReport> {
  // TODO
  throw new Error("Not implemented");
}

// -------------------------------------------------------------------
// 14. PUBLIC ENTRY POINT
// -------------------------------------------------------------------

/**
 * TODO — Requirement 14a
 * Validate `rawWorkflow`, then orchestrate it.
 * If validation fails, return a report with:
 *   - `outcome: "failed"`
 *   - `stepResults: []`
 *   - `workflowId: workflowId("unknown")`
 *   - `workflowName: "unknown"`
 *   - startedAt / finishedAt set to Date.now() (same value is fine)
 */
export async function runWorkflow(
  rawWorkflow: unknown,
  handlers:    StepHandlerMap,
  config:      ExecutorConfig
): Promise<ExecutionReport> {
  // TODO
  throw new Error("Not implemented");
}
