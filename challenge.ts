// ============================================================
// Typed Schema Migration Engine
// challenge.ts
// ============================================================
// Compile with: tsc --strict --noEmit challenge.ts
// Do NOT use `any`, `as`, or non-trivial type assertions.
// ============================================================

// -----------------------------------------------------------
// § 1  DOMAIN TYPES
// -----------------------------------------------------------

/** The raw shape we expect after JSON.parse — validated at runtime. */
export interface RawMigration {
  id: string;
  dependsOn: string[];
  up: string;   // SQL / DSL string to apply
  down: string; // SQL / DSL string to roll back
  meta: Record<string, unknown>;
}

/** A validated, branded migration identifier. */
export type MigrationId = string & { readonly __brand: "MigrationId" };

/** A fully validated migration ready for compilation. */
export interface ValidMigration {
  id: MigrationId;
  dependsOn: MigrationId[];
  up: string;
  down: string;
  meta: Record<string, unknown>;
}

/** A node in the compiled dependency graph. */
export interface MigrationNode {
  migration: ValidMigration;
  /** IDs of migrations that must complete before this one runs. */
  deps: Set<MigrationId>;
  /** IDs of migrations that depend on this one. */
  dependents: Set<MigrationId>;
}

/** The compiled execution plan (topological layers). */
export interface ExecutionPlan {
  /** Each inner array is a "wave" of migrations that can run concurrently. */
  waves: ValidMigration[][];
  /** Lookup for quick node access. */
  nodes: Map<MigrationId, MigrationNode>;
}

// -----------------------------------------------------------
// § 2  RESULT TYPES  (discriminated unions — no throwing)
// -----------------------------------------------------------

export type ValidationError =
  | { kind: "missing_field"; field: string; migrationIndex: number }
  | { kind: "invalid_type"; field: string; expected: string; migrationIndex: number }
  | { kind: "duplicate_id"; id: string }
  | { kind: "self_dependency"; id: string }
  | { kind: "unknown_dependency"; id: string; dep: string };

export type GraphError =
  | { kind: "cycle_detected"; cycle: MigrationId[] }
  | { kind: "empty_graph" };

export type ExecutionError =
  | { kind: "migration_failed"; id: MigrationId; reason: string }
  | { kind: "rollback_failed"; id: MigrationId; reason: string }
  | { kind: "rollback_succeeded"; id: MigrationId };

/** Per-migration outcome emitted after execution. */
export type MigrationResult =
  | { status: "applied";    id: MigrationId; durationMs: number }
  | { status: "skipped";    id: MigrationId; reason: string }
  | { status: "failed";     id: MigrationId; error: ExecutionError }
  | { status: "rolledBack"; id: MigrationId; error: ExecutionError };

/** Top-level report returned by the engine. */
export type EngineReport =
  | { outcome: "success";        results: MigrationResult[]; totalMs: number }
  | { outcome: "partial_failure"; results: MigrationResult[]; totalMs: number; firstFailure: MigrationId }
  | { outcome: "validation_error"; errors: ValidationError[] }
  | { outcome: "graph_error";      error: GraphError };

// -----------------------------------------------------------
// § 3  EXECUTOR ABSTRACTION
// -----------------------------------------------------------

/**
 * Simulates running a migration statement.
 * Returns `{ ok: true }` on success or `{ ok: false; reason: string }` on failure.
 */
export type ExecutorFn = (
  id: MigrationId,
  sql: string,
  direction: "up" | "down"
) => Promise<{ ok: true } | { ok: false; reason: string }>;

// -----------------------------------------------------------
// § 4  VALIDATION
// -----------------------------------------------------------

/**
 * TODO: Implement `validateManifest`.
 *
 * Requirements:
 * 1. Accept `unknown` input and return
 *    `{ ok: true; migrations: ValidMigration[] }` or
 *    `{ ok: false; errors: ValidationError[] }`.
 * 2. Verify the input is a non-null array; each element must have:
 *    - `id`        — non-empty string
 *    - `dependsOn` — array of non-empty strings
 *    - `up`        — non-empty string
 *    - `down`      — non-empty string
 *    - `meta`      — object (may be empty)
 * 3. Collect ALL errors (do not short-circuit after the first).
 * 4. After field validation passes, check for:
 *    - Duplicate `id` values across migrations.
 *    - A migration that lists itself in `dependsOn`.
 *    - A `dependsOn` entry that references a non-existent `id`.
 * 5. Brand valid ids as `MigrationId` — without using `as`.
 *    Hint: write a type-guard `isMigrationId` or a branded constructor.
 */
export function validateManifest(raw: unknown): 
  | { ok: true;  migrations: ValidMigration[] }
  | { ok: false; errors: ValidationError[] } {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// § 5  GRAPH COMPILATION
// -----------------------------------------------------------

/**
 * TODO: Implement `compileGraph`.
 *
 * Requirements:
 * 1. Accept `ValidMigration[]` and return
 *    `{ ok: true; plan: ExecutionPlan }` or
 *    `{ ok: false; error: GraphError }`.
 * 2. Build a `Map<MigrationId, MigrationNode>` from the migrations.
 * 3. Detect cycles using DFS (or Kahn's algorithm); return
 *    `{ kind: "cycle_detected"; cycle: MigrationId[] }` if found.
 * 4. If the input array is empty, return `{ kind: "empty_graph" }`.
 * 5. Produce `waves: ValidMigration[][]` via topological sort:
 *    wave 0 = migrations with no deps,
 *    wave N = migrations whose deps all appear in waves 0..N-1.
 */
export function compileGraph(migrations: ValidMigration[]):
  | { ok: true;  plan: ExecutionPlan }
  | { ok: false; error: GraphError } {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// § 6  EXECUTION ENGINE
// -----------------------------------------------------------

export interface EngineOptions {
  /** Maximum number of migrations running concurrently within a wave. Default: 3 */
  concurrency: number;
  /** Whether to attempt rollback of applied migrations on failure. Default: true */
  rollbackOnFailure: boolean;
  /** Set of MigrationIds that have already been applied (will be skipped). */
  alreadyApplied: Set<MigrationId>;
}

/**
 * TODO: Implement `runMigrations`.
 *
 * Requirements:
 * 1. Accept `plan: ExecutionPlan`, `executor: ExecutorFn`, and `options: EngineOptions`.
 * 2. Process waves sequentially; within each wave, run up to `options.concurrency`
 *    migrations concurrently using `Promise.allSettled`.
 * 3. Skip any migration whose id is in `options.alreadyApplied`
 *    (emit `{ status: "skipped", reason: "already applied" }`).
 * 4. On executor failure (`ok: false`):
 *    a. Emit `{ status: "failed", error: { kind: "migration_failed", ... } }`.
 *    b. If `rollbackOnFailure` is true, attempt to roll back ALL previously
 *       successfully applied migrations in reverse order, emitting either
 *       `{ status: "rolledBack" }` or `{ status: "failed" }` for each.
 *    c. Stop processing further waves.
 * 5. Return an `EngineReport` with outcome `"success"`, `"partial_failure"`,
 *    or propagate `"validation_error"` / `"graph_error"` from earlier stages.
 * 6. Include accurate `totalMs` (wall-clock from start to end of execution).
 */
export async function runMigrations(
  plan: ExecutionPlan,
  executor: ExecutorFn,
  options: EngineOptions
): Promise<EngineReport> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// § 7  ORCHESTRATOR  (ties everything together)
// -----------------------------------------------------------

/**
 * TODO: Implement `runEngine`.
 *
 * Requirements:
 * 1. Accept `rawManifest: unknown`, `executor: ExecutorFn`, and
 *    `options: Partial<EngineOptions>`.
 * 2. Fill in defaults for any missing `EngineOptions` fields.
 * 3. Call `validateManifest` → on failure return the `EngineReport`
 *    with `outcome: "validation_error"`.
 * 4. Call `compileGraph`        → on failure return the `EngineReport`
 *    with `outcome: "graph_error"`.
 * 5. Call `runMigrations` and return its `EngineReport`.
 */
export async function runEngine(
  rawManifest: unknown,
  executor: ExecutorFn,
  options?: Partial<EngineOptions>
): Promise<EngineReport> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// § 8  UTILITY — exhaustive narrowing helper
// -----------------------------------------------------------

/**
 * TODO: Implement `assertNever`.
 *
 * Requirements:
 * 1. Accept a value typed as `never` and throw an error.
 * 2. Use this inside any switch/if-else that must be exhaustive
 *    (e.g. when handling all `MigrationResult["status"]` variants).
 */
export function assertNever(value: never): never {
  // TODO
  throw new Error("Not implemented");
}
