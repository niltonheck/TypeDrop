// ============================================================
// Typed Streaming Log Aggregator with Plugin Pipeline
// ============================================================
// Solvable in ~25-30 minutes. strict: true, no `any` allowed.
// ============================================================

// -----------------------------------------------------------
// 1. CORE LOG TYPES
// -----------------------------------------------------------

/** All possible severity levels for a log entry. */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/** A brand that guarantees a ServiceId has been validated. */
export type ServiceId = string & { readonly __brand: "ServiceId" };

/** Creates a validated ServiceId (must be non-empty, lowercase, no spaces). */
export function makeServiceId(raw: string): ServiceId {
  if (!/^[a-z][a-z0-9-]*$/.test(raw)) {
    throw new Error(`Invalid ServiceId: "${raw}"`);
  }
  return raw as ServiceId;
}

/**
 * A raw log entry as it arrives from an upstream source.
 * TODO: Make `level` a discriminated field so each level carries
 *       its own extra metadata shape (see LogEntry below).
 */
export type RawLogEntry = {
  id: string;
  serviceId: ServiceId;
  timestamp: number; // Unix ms
  level: LogLevel;
  message: string;
  meta: Record<string, string>;
};

/**
 * Discriminated log entries — each level carries level-specific metadata.
 *
 * TODO: Define a discriminated union `LogEntry` where:
 *   - "debug" | "info"  → no extra fields beyond RawLogEntry base
 *   - "warn"            → adds `warnCode: string`
 *   - "error"           → adds `errorCode: string` and `stack: string`
 *   - "fatal"           → adds `errorCode: string`, `stack: string`,
 *                         and `affectedServiceIds: ServiceId[]`
 *
 * Each variant must include all fields from RawLogEntry EXCEPT `meta`
 * (which gets promoted to `meta: Record<string, string>` still present)
 * and the `level` field must be the literal discriminant.
 *
 * Hint: Use a mapped/conditional approach or write each variant explicitly.
 */
export type LogEntry =
  // TODO: replace this stub with your discriminated union
  never;

// -----------------------------------------------------------
// 2. PLUGIN PIPELINE TYPES
// -----------------------------------------------------------

/**
 * A Plugin transforms a stream of log entries.
 *
 * TODO: Define `Plugin<In, Out>` as a generic interface with:
 *   - `name: string`
 *   - `process(entries: In[]): Promise<Out[]>`
 *
 * Constraints:
 *   - `In` and `Out` must both extend `RawLogEntry`
 */
export type Plugin<
  // TODO: add constrained type parameters
> = {
  name: string;
  // TODO: add process signature
};

/**
 * A Pipeline is an ordered chain of plugins where the output type
 * of each plugin must be assignable to the input type of the next.
 *
 * TODO: Define `Pipeline<Stages>` where `Stages` is a tuple of Plugin types.
 *       The Pipeline must expose:
 *         - `plugins: Stages`
 *         - `run(entries: PipelineInput<Stages>): Promise<PipelineOutput<Stages>>`
 *
 * Hint: You'll need helper conditional types `PipelineInput` and
 *       `PipelineOutput` that extract the In/Out of the first/last plugin.
 */

/** Extracts the input type of the first plugin in a pipeline tuple. */
export type PipelineInput<Stages extends Plugin<RawLogEntry, RawLogEntry>[]> =
  // TODO: use conditional/indexed types to extract In of Stages[0]
  never;

/** Extracts the output type of the last plugin in a pipeline tuple. */
export type PipelineOutput<Stages extends Plugin<RawLogEntry, RawLogEntry>[]> =
  // TODO: use conditional/indexed types to extract Out of the last element
  never;

export interface Pipeline<
  Stages extends Plugin<RawLogEntry, RawLogEntry>[]
> {
  plugins: Stages;
  run(entries: PipelineInput<Stages>): Promise<PipelineOutput<Stages>>;
}

// -----------------------------------------------------------
// 3. BUILT-IN PLUGIN IMPLEMENTATIONS
// -----------------------------------------------------------

/**
 * REQUIREMENT 1 — `parsePlugin`
 *
 * Type: Plugin<RawLogEntry, LogEntry>
 *
 * Converts each RawLogEntry into the appropriate LogEntry discriminated variant.
 * Rules:
 *   - "debug" / "info": copy all fields; `warnCode`, `errorCode`, `stack`,
 *     `affectedServiceIds` are NOT present.
 *   - "warn": parse `meta.warnCode` (default "WARN_UNKNOWN" if absent).
 *   - "error": parse `meta.errorCode` (default "ERR_UNKNOWN") and
 *     `meta.stack` (default "").
 *   - "fatal": same as "error" plus `affectedServiceIds` parsed from
 *     `meta.affectedServiceIds` as a comma-separated list of validated
 *     ServiceIds (skip invalid ones silently).
 *
 * The returned array must have the same length as the input (one-to-one).
 */
export const parsePlugin: Plugin<RawLogEntry, LogEntry> = {
  name: "parse",
  async process(entries) {
    // TODO: implement
    throw new Error("Not implemented");
  },
};

/**
 * REQUIREMENT 2 — `filterPlugin`
 *
 * Type: Plugin<LogEntry, LogEntry>
 *
 * Factory that returns a plugin filtering entries to only those whose
 * `level` is in the provided `levels` set.
 *
 * Signature:
 *   function makeFilterPlugin(levels: ReadonlySet<LogLevel>): Plugin<LogEntry, LogEntry>
 */
export function makeFilterPlugin(
  levels: ReadonlySet<LogLevel>
): Plugin<LogEntry, LogEntry> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 3 — `enrichPlugin`
 *
 * Type: Plugin<LogEntry, LogEntry>
 *
 * Adds a `meta` key `"processedAt"` set to the current ISO timestamp string
 * on every entry (mutate a copy, never the original object).
 */
export const enrichPlugin: Plugin<LogEntry, LogEntry> = {
  name: "enrich",
  async process(entries) {
    // TODO: implement
    throw new Error("Not implemented");
  },
};

// -----------------------------------------------------------
// 4. PIPELINE BUILDER
// -----------------------------------------------------------

/**
 * REQUIREMENT 4 — `buildPipeline`
 *
 * TODO: Implement a generic function that accepts a tuple of plugins and
 *       returns a Pipeline whose `run` method executes them in sequence,
 *       passing the output of each plugin as the input to the next.
 *
 * Signature (fill in the generics):
 *
 *   function buildPipeline<Stages extends Plugin<RawLogEntry, RawLogEntry>[]>(
 *     ...plugins: Stages
 *   ): Pipeline<Stages>
 *
 * The compiler must enforce that you cannot pass an empty tuple.
 * Hint: Use a rest-parameter tuple with a minimum-length constraint.
 */
export function buildPipeline<
  // TODO: constrained generics here
>(
  // TODO: rest params here
): Pipeline<never> /* TODO: fix return type */ {
  // TODO: implement sequential execution
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 5. AGGREGATION
// -----------------------------------------------------------

/** Per-level count breakdown. All levels must be present (no optional fields). */
export type LevelCounts = {
  [L in LogLevel]: number;
};

/** Health verdict derived from the highest severity level seen. */
export type HealthStatus = "healthy" | "degraded" | "critical" | "down";

/**
 * TODO: Define `ServiceSummary` with:
 *   - `serviceId: ServiceId`
 *   - `totalEntries: number`
 *   - `counts: LevelCounts`
 *   - `status: HealthStatus`
 *   - `topErrors: string[]`  — up to 5 most-recent error/fatal messages
 *   - `lastSeen: number`     — max timestamp across all entries for this service
 */
export type ServiceSummary = {
  // TODO
};

/**
 * REQUIREMENT 5 — `aggregateLogs`
 *
 * Signature:
 *   function aggregateLogs(entries: LogEntry[]): Map<ServiceId, ServiceSummary>
 *
 * Rules:
 *   - Group entries by `serviceId`.
 *   - Compute `counts` for all five levels (zero-fill missing levels).
 *   - Derive `status`:
 *       "down"      if fatal  count > 0
 *       "critical"  if error  count > 0
 *       "degraded"  if warn   count > 0
 *       "healthy"   otherwise
 *   - `topErrors`: collect messages where level is "error" or "fatal",
 *     sorted descending by timestamp, take first 5.
 *   - `lastSeen`: maximum timestamp in the group.
 *
 * REQUIREMENT 6 — exhaustive level handling
 *   Inside `aggregateLogs`, write a helper `assertNever(x: never): never`
 *   and use it in a switch/if-chain over `LogLevel` so the compiler will
 *   error if a new level is ever added without updating the aggregation logic.
 */
export function aggregateLogs(
  entries: LogEntry[]
): Map<ServiceId, ServiceSummary> {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 6. TYPED RESULT WRAPPER
// -----------------------------------------------------------

/**
 * TODO: Define a generic `Result<T, E extends Error = Error>` discriminated
 *       union:
 *         | { ok: true;  value: T }
 *         | { ok: false; error: E }
 *
 * Then implement:
 *
 *   async function runPipelineWithResult<
 *     Stages extends Plugin<RawLogEntry, RawLogEntry>[]
 *   >(
 *     pipeline: Pipeline<Stages>,
 *     entries: PipelineInput<Stages>,
 *   ): Promise<Result<PipelineOutput<Stages>>>
 *
 * It must catch any thrown error and return it as `{ ok: false, error }`.
 * On success return `{ ok: true, value }`.
 */
export type Result<T, E extends Error = Error> =
  // TODO
  never;

export async function runPipelineWithResult<
  Stages extends Plugin<RawLogEntry, RawLogEntry>[]
>(
  pipeline: Pipeline<Stages>,
  entries: PipelineInput<Stages>
): Promise<Result<PipelineOutput<Stages>>> {
  // TODO: implement
  throw new Error("Not implemented");
}
