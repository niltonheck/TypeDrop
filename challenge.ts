// ============================================================
// Typed Workflow Orchestrator with Dependency Resolution
// ============================================================
// TOPICS: discriminated unions, mapped types, conditional types,
//         generics, branded types, infer, Promise.all, topological
//         sort, Result<T,E>, runtime validation (unknown → typed)
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** A non-empty string identifier for a workflow step. */
export type StepId = string & { readonly __brand: "StepId" };

/** A non-empty string identifier for a handler kind. */
export type HandlerKind = string & { readonly __brand: "HandlerKind" };

// Helpers to construct branded values (implement these):
export function toStepId(raw: string): StepId {
  // TODO: throw a TypeError if raw is empty or not a string
  throw new Error("Not implemented");
}

export function toHandlerKind(raw: string): HandlerKind {
  // TODO: throw a TypeError if raw is empty or not a string
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 2. HANDLER REGISTRY TYPES
// ------------------------------------------------------------------

/**
 * A single handler descriptor.
 *  - `kind`   : unique key that identifies this handler type
 *  - `validate`: narrows `unknown` config to the strongly-typed `C`
 *  - `execute` : receives the validated config + resolved inputs from
 *                dependency steps, returns a typed output `O`
 */
export type HandlerDescriptor<C, O> = {
  readonly kind: HandlerKind;
  validate(rawConfig: unknown): C;           // throws on invalid config
  execute(config: C, inputs: StepInputMap): Promise<O>;
};

/**
 * A map of every registered handler, keyed by HandlerKind.
 * The mapped type must preserve each handler's individual C and O
 * so callers get full inference — no `any` escape hatches.
 */
export type HandlerRegistry = {
  // TODO: Define this as a mapped type over HandlerKind keys such that
  //       each value is a HandlerDescriptor<C, O> for *some* C and O.
  //       Hint: use an index signature with a bounded generic.
  [K in HandlerKind]: HandlerDescriptor<unknown, unknown>;
};

// ------------------------------------------------------------------
// 3. STEP INPUT MAP
// ------------------------------------------------------------------

/**
 * When a step executes, its `inputs` is a record of the *outputs*
 * produced by each of its declared dependency steps.
 * Key = StepId of the dependency, Value = that step's output (unknown
 * at the registry level, but typed per-handler via generics).
 */
export type StepInputMap = Readonly<Record<StepId, unknown>>;

// ------------------------------------------------------------------
// 4. RAW WORKFLOW DEFINITION (arrives as `unknown`)
// ------------------------------------------------------------------

export type RawStep = {
  id: string;
  kind: string;
  config: unknown;
  dependsOn: string[];   // step IDs this step waits for
};

export type RawWorkflow = {
  workflowId: string;
  steps: RawStep[];
};

// ------------------------------------------------------------------
// 5. VALIDATED INTERNAL TYPES
// ------------------------------------------------------------------

export type ValidatedStep = {
  id: StepId;
  kind: HandlerKind;
  config: unknown;          // validated by the handler's own `validate`
  dependsOn: StepId[];
};

export type ValidatedWorkflow = {
  workflowId: string;
  steps: ValidatedStep[];
};

// ------------------------------------------------------------------
// 6. EXECUTION RESULT TYPES  (Result<T, E> pattern)
// ------------------------------------------------------------------

export type StepSuccess<O = unknown> = {
  readonly status: "success";
  readonly stepId: StepId;
  readonly output: O;
};

export type StepFailure = {
  readonly status: "failure";
  readonly stepId: StepId;
  readonly error: string;
};

export type StepResult<O = unknown> = StepSuccess<O> | StepFailure;

export type WorkflowReport = {
  readonly workflowId: string;
  /** Ordered by execution finish time */
  readonly results: StepResult[];
  readonly overallStatus: "completed" | "partial" | "failed";
};

// ------------------------------------------------------------------
// 7. TOPOLOGICAL SORT
// ------------------------------------------------------------------

/**
 * Given a validated workflow, return its steps ordered so that every
 * step appears AFTER all steps it depends on.
 *
 * Requirements:
 *  R1. Must detect circular dependencies and throw a descriptive Error.
 *  R2. Steps with no dependencies (or whose dependencies are already
 *      scheduled) may be batched into the same "wave" — return a flat
 *      array where wave order is preserved but intra-wave order is
 *      implementation-defined.
 *  R3. Return type must be `ValidatedStep[]`.
 */
export function topologicalSort(workflow: ValidatedWorkflow): ValidatedStep[] {
  // TODO: implement Kahn's algorithm (or DFS-based topo sort)
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 8. WORKFLOW VALIDATOR
// ------------------------------------------------------------------

/**
 * Narrows `unknown` → `ValidatedWorkflow`.
 *
 * Requirements:
 *  R4.  `raw` must be a plain object with a non-empty string `workflowId`
 *       and a non-empty array `steps`.
 *  R5.  Each step must have: non-empty string `id`, non-empty string `kind`,
 *       a `config` field (any value), and a `dependsOn` string array.
 *  R6.  All `dependsOn` references must point to step IDs declared within
 *       the same workflow (no dangling references).
 *  R7.  Step IDs must be unique within the workflow.
 *  R8.  Each referenced `kind` must exist in the provided `registry`.
 *  R9.  For each step, call `registry[kind].validate(step.config)` to
 *       validate and store the validated config — propagate any thrown errors
 *       as a descriptive validation Error.
 *  R10. Throw a descriptive `Error` for every violation above.
 */
export function validateWorkflow(
  raw: unknown,
  registry: HandlerRegistry
): ValidatedWorkflow {
  // TODO: implement structural validation + registry-driven config validation
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. ORCHESTRATOR
// ------------------------------------------------------------------

/**
 * Executes a validated workflow respecting dependency order.
 *
 * Requirements:
 *  R11. Call `topologicalSort` to determine execution order.
 *  R12. Steps in the same "wave" (no unresolved dependencies among them)
 *       MUST be executed concurrently via Promise.allSettled.
 *  R13. A step whose dependency failed must be skipped and recorded as a
 *       StepFailure with error `"Skipped: dependency '<id>' failed"`.
 *  R14. Pass resolved dependency outputs as `StepInputMap` to `execute`.
 *  R15. Catch any error thrown by `execute` and record it as a StepFailure.
 *  R16. `overallStatus`:
 *         - "completed" if every step succeeded
 *         - "failed"    if every step failed or was skipped
 *         - "partial"   otherwise
 *  R17. Results must be appended in the order steps finish (wave by wave,
 *       preserving Promise.allSettled resolution order within a wave).
 */
export async function runWorkflow(
  workflow: ValidatedWorkflow,
  registry: HandlerRegistry
): Promise<WorkflowReport> {
  // TODO: implement wave-based concurrent execution
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 10. ENTRY POINT  (ties validation + orchestration together)
// ------------------------------------------------------------------

/**
 * Full pipeline: unknown JSON → WorkflowReport.
 *
 * Requirements:
 *  R18. Parse `rawJson` with `JSON.parse` (let it throw on malformed JSON).
 *  R19. Call `validateWorkflow`, then `runWorkflow`.
 *  R20. If validation throws, return a WorkflowReport with a single
 *       StepFailure whose stepId is `"__validation__" as StepId`,
 *       overallStatus "failed", and the error message from the thrown Error.
 */
export async function executeWorkflowJson(
  rawJson: string,
  registry: HandlerRegistry
): Promise<WorkflowReport> {
  // TODO: implement
  throw new Error("Not implemented");
}
