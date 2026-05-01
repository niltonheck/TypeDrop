// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts — Typed Workflow Orchestrator
// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO:
//   You are building the execution engine for a low-code automation platform.
//   Workflow definitions arrive as `unknown` from a config store. Your engine
//   must:
//     1. Validate & parse the raw definition into a strongly-typed WorkflowDef.
//     2. Build a dependency graph and topologically sort steps into stages
//        (steps within a stage have no intra-stage dependencies and can run
//        concurrently; stages are executed sequentially).
//     3. Execute each stage concurrently, applying per-step RetryPolicy and
//        TimeoutPolicy, passing the accumulated context (outputs of prior steps)
//        to each step handler.
//     4. Emit a discriminated-union StepReport for every step and a final
//        WorkflowReport wrapping all step reports.
//
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Primitive branded types ────────────────────────────────────────────────

/** Opaque identifier for a workflow step. */
export type StepId = string & { readonly __brand: "StepId" };

/** Cast a plain string to StepId (only place a type assertion is permitted). */
export function toStepId(s: string): StepId {
  return s as StepId;
}

// ── 2. Step-handler contract ──────────────────────────────────────────────────

/**
 * The accumulated outputs of all previously-completed steps.
 * Keys are StepIds; values are the JSON-serialisable output each step produced.
 */
export type StepContext = Readonly<Record<StepId, unknown>>;

/**
 * A step handler receives the current context and returns its output.
 * Handlers may be async and may throw — the engine handles retries/timeouts.
 */
export type StepHandler = (ctx: StepContext) => Promise<unknown>;

// ── 3. Policies ───────────────────────────────────────────────────────────────

export interface RetryPolicy {
  /** Maximum number of attempts (1 = no retries). */
  maxAttempts: number;
  /** Base delay in ms between attempts (exponential back-off: delay * 2^attempt). */
  baseDelayMs: number;
}

export interface TimeoutPolicy {
  /** Abort the step if it hasn't resolved within this many ms. */
  timeoutMs: number;
}

// ── 4. Workflow definition (runtime-validated) ────────────────────────────────

export interface StepDef {
  id: StepId;
  /** StepIds this step depends on — must all complete before this step runs. */
  dependsOn: StepId[];
  retry: RetryPolicy;
  timeout: TimeoutPolicy;
}

export interface WorkflowDef {
  workflowId: string;
  steps: StepDef[];
}

// ── 5. Discriminated-union step report ────────────────────────────────────────

export interface StepSuccess {
  kind: "success";
  stepId: StepId;
  output: unknown;
  attempts: number;
  durationMs: number;
}

export interface StepFailure {
  kind: "failure";
  stepId: StepId;
  error: string;
  attempts: number;
  durationMs: number;
}

export interface StepSkipped {
  kind: "skipped";
  stepId: StepId;
  reason: "dependency_failed";
}

export type StepReport = StepSuccess | StepFailure | StepSkipped;

// ── 6. Workflow-level report ──────────────────────────────────────────────────

export interface WorkflowReport {
  workflowId: string;
  status: "completed" | "partial_failure";
  stepReports: StepReport[];
  totalDurationMs: number;
}

// ── 7. Handler registry ───────────────────────────────────────────────────────

/**
 * Maps every StepId that appears in a WorkflowDef to its handler function.
 * REQUIREMENT: The type must enforce that the registry is a plain object whose
 * keys are StepIds and values are StepHandlers — use a mapped type or Record.
 */
export type HandlerRegistry = Record<StepId, StepHandler>;

// ── 8. Validation ─────────────────────────────────────────────────────────────

/** Branded result types — no throwing from the validator. */
export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

/**
 * TODO (REQUIREMENT 1):
 *   Validate `raw` (typed as `unknown`) and return a `ValidationResult<WorkflowDef>`.
 *
 *   Rules:
 *   - `raw` must be a non-null object.
 *   - `workflowId` must be a non-empty string.
 *   - `steps` must be a non-empty array where each element has:
 *       • `id`         — non-empty string  → cast to StepId via toStepId()
 *       • `dependsOn`  — array of strings  → each cast via toStepId()
 *       • `retry`      — object with numeric `maxAttempts` (≥1) and `baseDelayMs` (≥0)
 *       • `timeout`    — object with numeric `timeoutMs` (>0)
 *   - Step ids must be unique within the workflow.
 *   - Every id referenced in `dependsOn` must exist as a step id.
 *   - The dependency graph must be acyclic (no circular deps).
 *
 *   Hint: write small, focused type-guard helpers; compose them here.
 */
export function validateWorkflow(raw: unknown): ValidationResult<WorkflowDef> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 9. Topological sort → execution stages ────────────────────────────────────

/**
 * TODO (REQUIREMENT 2):
 *   Given a validated `WorkflowDef`, return an ordered array of stages.
 *   Each stage is an array of `StepDef`s that can run concurrently because
 *   none of them depend on each other (all their dependencies were satisfied
 *   by earlier stages).
 *
 *   Use Kahn's algorithm (BFS-based topological sort).
 *   Return type must be `StepDef[][]` — a tuple/array of concurrent batches.
 *
 *   Throw a TypeError (with a descriptive message) if a cycle is detected
 *   (this should not happen after validation, but be defensive).
 */
export function buildExecutionStages(def: WorkflowDef): StepDef[][] {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 10. Policy helpers ────────────────────────────────────────────────────────

/**
 * TODO (REQUIREMENT 3a):
 *   Return a Promise that rejects with a TimeoutError after `timeoutMs` ms.
 *   The TimeoutError must carry the stepId for traceability.
 *   Race this against the actual step execution in `executeStep`.
 */
export class TimeoutError extends Error {
  constructor(
    public readonly stepId: StepId,
    public readonly timeoutMs: number
  ) {
    super(`Step "${stepId}" timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
  }
}

export function withTimeout(stepId: StepId, timeoutMs: number): Promise<never> {
  // TODO: implement — returns a Promise<never> that rejects after timeoutMs
  throw new Error("Not implemented");
}

/**
 * TODO (REQUIREMENT 3b):
 *   Execute `handler` with retry logic governed by `policy`.
 *   - Attempt the handler up to `policy.maxAttempts` times.
 *   - Between attempts, wait `policy.baseDelayMs * 2^(attempt-1)` ms (exponential back-off).
 *   - On the final failed attempt, re-throw the last error.
 *   - Return `{ output: unknown; attempts: number }` on success.
 */
export async function withRetry(
  handler: () => Promise<unknown>,
  policy: RetryPolicy
): Promise<{ output: unknown; attempts: number }> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 11. Single-step executor ──────────────────────────────────────────────────

/**
 * TODO (REQUIREMENT 3c):
 *   Execute a single step, applying both its retry and timeout policies.
 *   - The timeout wraps each individual attempt (not the whole retry loop).
 *   - Resolve to a `StepReport`.
 *   - Never throw — all errors must be captured as `StepFailure`.
 *
 *   Signature is fixed; do not change it.
 */
export async function executeStep(
  step: StepDef,
  handler: StepHandler,
  ctx: StepContext
): Promise<StepReport> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 12. Stage executor ────────────────────────────────────────────────────────

/**
 * TODO (REQUIREMENT 4a):
 *   Execute all steps in a single stage concurrently.
 *   - A step whose stepId appears in `failedStepIds` must be emitted as
 *     `StepSkipped` (reason: "dependency_failed") without calling its handler.
 *   - Collect and return all StepReports for this stage.
 *   - Update `ctx` with the output of every successful step before returning
 *     (use a local mutable accumulator, then spread into the returned context).
 *
 *   Returns `{ reports: StepReport[]; updatedCtx: StepContext }`.
 */
export async function executeStage(
  stage: StepDef[],
  registry: HandlerRegistry,
  ctx: StepContext,
  failedStepIds: ReadonlySet<StepId>
): Promise<{ reports: StepReport[]; updatedCtx: StepContext }> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 13. Orchestrator entry-point ──────────────────────────────────────────────

/**
 * TODO (REQUIREMENT 4b):
 *   Orchestrate the full workflow end-to-end.
 *
 *   Steps:
 *   1. Validate `rawDef` — if invalid, throw a TypeError with the validation
 *      error message (this is the one place a throw is acceptable at this level).
 *   2. Build execution stages via `buildExecutionStages`.
 *   3. Execute stages sequentially; within each stage run steps concurrently
 *      via `executeStage`.
 *   4. Track failed step ids across stages so downstream steps can be skipped.
 *   5. Build and return a `WorkflowReport`:
 *      - `status` is "completed" if every StepReport has kind "success",
 *        otherwise "partial_failure".
 *      - `totalDurationMs` is wall-clock time for the entire orchestration.
 *
 *   Signature is fixed; do not change it.
 */
export async function orchestrate(
  rawDef: unknown,
  registry: HandlerRegistry
): Promise<WorkflowReport> {
  // TODO: implement
  throw new Error("Not implemented");
}
