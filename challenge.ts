// ============================================================
// Typed Plugin Middleware Chain Executor
// challenge.ts
// ============================================================
// Compile with: tsc --strict --noEmit challenge.ts
// Do NOT use `any`, `as`, or non-trivial type assertions.
// ============================================================

// -----------------------------------------------------------
// 1. BRANDED TYPES
// -----------------------------------------------------------

/** Opaque brand helper — do NOT modify. */
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** A non-empty string that uniquely identifies a plugin. */
export type PluginId = Brand<string, "PluginId">;

/** A monotonically increasing integer request identifier. */
export type RequestId = Brand<number, "RequestId">;

// TODO: Implement a `toPluginId` constructor that validates the
//       string is non-empty and returns `PluginId` (throw on failure).
export function toPluginId(raw: string): PluginId {
  // TODO
  throw new Error("not implemented");
}

// TODO: Implement a `toRequestId` constructor that validates the
//       number is a positive integer and returns `RequestId` (throw on failure).
export function toRequestId(raw: number): RequestId {
  // TODO
  throw new Error("not implemented");
}

// -----------------------------------------------------------
// 2. PLUGIN CONFIG & DISCRIMINATED UNION
// -----------------------------------------------------------

/**
 * Raw (unvalidated) plugin config as it arrives from JSON.
 * Requirement 1: Define `RawPluginConfig` as a plain object with
 *   `type: string`, `pluginId: string`, and `[key: string]: unknown`
 *   for arbitrary extra fields.
 */
// TODO: Define RawPluginConfig
export type RawPluginConfig = unknown; // replace this

/**
 * Strongly-typed discriminated union of every supported plugin kind.
 * Requirement 2: Each variant must carry `pluginId: PluginId` and its
 *   own kind-specific fields listed below.
 *
 *  - "auth"        → { apiKeyHeader: string; required: boolean }
 *  - "rateLimit"   → { maxRpm: number; burstSize: number }
 *  - "transform"   → { stripHeaders: string[]; addHeaders: Record<string, string> }
 *  - "logger"      → { level: "debug" | "info" | "warn" | "error"; destination: string }
 */
// TODO: Define the PluginConfig discriminated union (type field: "auth" | "rateLimit" | "transform" | "logger")
export type PluginConfig = never; // replace this

// -----------------------------------------------------------
// 3. RUNTIME CONTEXT & RESULT TYPES
// -----------------------------------------------------------

/** Mutable request context passed through the middleware chain. */
export interface GatewayContext {
  readonly requestId: RequestId;
  headers: Record<string, string>;
  metadata: Record<string, unknown>;
}

/** Outcome of a single plugin's execution. */
export type PluginOutcome =
  | { status: "ok"; pluginId: PluginId; durationMs: number }
  | { status: "skipped"; pluginId: PluginId; reason: string }
  | { status: "error"; pluginId: PluginId; durationMs: number; error: string }
  | { status: "timeout"; pluginId: PluginId; durationMs: number };

/**
 * Final execution trace for an entire pipeline run.
 * Requirement 3: `overallStatus` must be a union derived from
 *   PluginOutcome["status"] — use a mapped/indexed type, NOT a manual copy.
 */
export interface PipelineTrace {
  requestId: RequestId;
  // TODO: overallStatus type must be derived from PluginOutcome["status"]
  overallStatus: unknown; // replace `unknown` with the correct derived type
  outcomes: PluginOutcome[];
  totalDurationMs: number;
}

// -----------------------------------------------------------
// 4. PLUGIN HANDLER & REGISTRY
// -----------------------------------------------------------

/**
 * A plugin handler is an async function that receives the matching
 * config variant and the mutable context, and returns void (or throws).
 *
 * Requirement 4: `PluginHandler<C>` must be generic over C (a PluginConfig
 *   variant) so that each handler only sees its own config shape.
 */
// TODO: Define PluginHandler<C extends PluginConfig>
export type PluginHandler<C extends PluginConfig> = unknown; // replace this

/**
 * Requirement 5: Define `PluginRegistry` as a mapped type over
 *   PluginConfig["type"] where each key maps to the handler for
 *   the corresponding PluginConfig variant.
 *
 *   Hint: Use `Extract<PluginConfig, { type: K }>` to pick the right variant.
 */
// TODO: Define PluginRegistry
export type PluginRegistry = unknown; // replace this

// -----------------------------------------------------------
// 5. VALIDATION
// -----------------------------------------------------------

/**
 * Requirement 6: Implement `validatePluginConfig`.
 *   - Accept `raw: unknown`
 *   - Return `PluginConfig` if valid, or throw a descriptive `Error`
 *   - Must narrow from `unknown` without using `as` or `any`
 *   - Must handle all four plugin types
 */
export function validatePluginConfig(raw: unknown): PluginConfig {
  // TODO
  throw new Error("not implemented");
}

// -----------------------------------------------------------
// 6. PIPELINE EXECUTOR
// -----------------------------------------------------------

export interface PipelineOptions {
  /** Per-plugin timeout in milliseconds. Default: 5000 */
  pluginTimeoutMs?: number;
  /** If true, a plugin `error` status aborts remaining plugins. Default: false */
  abortOnError?: boolean;
}

/**
 * Requirement 7: Implement `executePipeline`.
 *
 * Behaviour:
 *  a) Validate each entry in `rawConfigs` via `validatePluginConfig`.
 *     - Invalid configs produce a `PluginOutcome` with status "error"
 *       (durationMs: 0) and skip execution for that plugin.
 *  b) Execute validated plugins in ORDER (sequentially — one at a time).
 *  c) Per-plugin timeout: if the handler does not resolve within
 *     `pluginTimeoutMs` ms, record a "timeout" outcome and continue
 *     (or abort, per `abortOnError`).
 *  d) If a handler throws, record an "error" outcome.
 *  e) `overallStatus` rules (in priority order):
 *       - any "timeout"  → "timeout"
 *       - any "error"    → "error"
 *       - any "skipped"  → "skipped"
 *       - otherwise      → "ok"
 *  f) If `abortOnError` is true, stop executing further plugins when
 *     an "error" or "timeout" outcome is recorded; mark remaining
 *     validated plugins as "skipped" with reason "aborted".
 *
 * Requirement 8: The return type must be `Promise<PipelineTrace>` — no `any`.
 */
export async function executePipeline(
  requestId: RequestId,
  rawConfigs: unknown[],
  registry: PluginRegistry,
  ctx: GatewayContext,
  options?: PipelineOptions
): Promise<PipelineTrace> {
  // TODO
  throw new Error("not implemented");
}

// -----------------------------------------------------------
// 7. HELPER — withTimeout
// -----------------------------------------------------------

/**
 * Requirement 9: Implement a generic `withTimeout<T>` utility.
 *   - Wraps a `Promise<T>` and rejects with a special `TimeoutError`
 *     if it does not settle within `ms` milliseconds.
 *   - `TimeoutError` must extend `Error` and carry a `pluginId: PluginId` field.
 */
export class TimeoutError extends Error {
  // TODO: add pluginId field
  constructor(pluginId: PluginId, ms: number) {
    super(`Plugin "${pluginId}" timed out after ${ms}ms`);
    // TODO
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  pluginId: PluginId
): Promise<T> {
  // TODO
  throw new Error("not implemented");
}
