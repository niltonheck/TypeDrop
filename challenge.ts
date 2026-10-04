// =============================================================================
// Typed Plugin Middleware Pipeline
// challenge.ts
// =============================================================================
// You are building an extensibility layer for an HTTP gateway.
// Each plugin declares what context keys it READS (requires) and what keys it
// WRITES (provides). The compiler must verify:
//   1. A plugin's required keys are always present in the accumulated context
//      before that plugin runs.
//   2. The pipeline's final resolved context is the union of all written keys.
//   3. Error-producing plugins carry a typed error brand; the pipeline's error
//      type is the union of all plugin error brands.
//
// Requirements (implement all TODOs — no `any`, no `as`, no non-null assertions):
// -----------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 1. Core context & plugin types
// ---------------------------------------------------------------------------

/** A plain record of string keys to unknown values — the base context shape. */
export type BaseCtx = Record<string, unknown>;

/**
 * Describes one plugin in the pipeline.
 *
 * @typeParam Reads  - The subset of context keys this plugin requires as input.
 * @typeParam Writes - The new keys (and their value types) this plugin adds.
 * @typeParam EBrand - A string literal brand for errors this plugin may throw,
 *                     or `never` if this plugin is infallible.
 */
export type PluginDef<
  Reads extends BaseCtx,
  Writes extends BaseCtx,
  EBrand extends string | never
> = {
  readonly name: string;
  /**
   * Execute the plugin. Receives the current accumulated context (which
   * satisfies `Reads`) and returns a Promise of the `Writes` shape.
   * If `EBrand` is not `never`, the returned Promise may reject with a
   * `PluginError<EBrand>`.
   */
  readonly run: (ctx: Reads) => Promise<Writes>;
};

/** A branded error produced by a plugin. */
export type PluginError<Brand extends string> = {
  readonly brand: Brand;
  readonly message: string;
  readonly cause?: unknown;
};

// ---------------------------------------------------------------------------
// 2. TODO — Pipeline accumulator helpers
// ---------------------------------------------------------------------------

/**
 * TODO: Define `MergeCtx<Acc, Writes>` — a conditional / mapped type that
 * merges an accumulated context `Acc` with a plugin's `Writes`, producing
 * a new context type where `Writes` keys override `Acc` keys when they
 * overlap (similar to `Omit<Acc, keyof Writes> & Writes`).
 *
 * Requirement: Must be expressed purely with built-in utility types or mapped
 * types — no inline `any`.
 */
export type MergeCtx<Acc extends BaseCtx, Writes extends BaseCtx> =
  // TODO: replace `never` with your implementation
  never;

/**
 * TODO: Define `SatisfiedBy<Required, Acc>` — a conditional type that
 * evaluates to `true` when every key of `Required` exists in `Acc` AND the
 * value types are assignable, `false` otherwise.
 *
 * Hint: Think about `keyof Required extends keyof Acc` combined with a
 * mapped/conditional check on value assignability.
 */
export type SatisfiedBy<Required extends BaseCtx, Acc extends BaseCtx> =
  // TODO: replace `never` with your implementation
  never;

/**
 * TODO: Define `PipelineErrors<Plugins>` — given a tuple of `PluginDef`
 * values, extract the union of all non-`never` `EBrand` strings and produce
 * `PluginError<union>`. If all plugins are infallible, resolve to `never`.
 *
 * Hint: Use `infer` inside a distributive conditional type over the tuple.
 */
export type PipelineErrors<Plugins extends readonly PluginDef<BaseCtx, BaseCtx, string | never>[]> =
  // TODO: replace `never` with your implementation
  never;

/**
 * TODO: Define `PipelineFinalCtx<Plugins, InitCtx>` — given a tuple of
 * `PluginDef` values and an initial context shape `InitCtx`, recursively
 * accumulate the merged context as each plugin's `Writes` are folded in,
 * producing the final resolved context type.
 *
 * Hint: Use a recursive conditional type with `infer` to peel the tuple
 * head-by-head.
 */
export type PipelineFinalCtx<
  Plugins extends readonly PluginDef<BaseCtx, BaseCtx, string | never>[],
  InitCtx extends BaseCtx = Record<never, never>
> =
  // TODO: replace `never` with your implementation
  never;

// ---------------------------------------------------------------------------
// 3. TODO — Pipeline result type
// ---------------------------------------------------------------------------

/**
 * The result returned by a successfully executed pipeline.
 * - `ctx`    : the fully resolved context (PipelineFinalCtx)
 * - `timings`: a Record mapping each plugin name to its execution time in ms
 */
export type PipelineResult<
  Plugins extends readonly PluginDef<BaseCtx, BaseCtx, string | never>[],
  InitCtx extends BaseCtx = Record<never, never>
> = {
  // TODO: fill in the two properties using your helper types above
};

// ---------------------------------------------------------------------------
// 4. TODO — Plugin factory helper
// ---------------------------------------------------------------------------

/**
 * TODO: Implement `definePlugin` — a generic factory that infers `Reads`,
 * `Writes`, and `EBrand` from the provided `PluginDef` literal and returns
 * it unchanged (identity at runtime, inference anchor at compile time).
 *
 * This lets callers write:
 *   const myPlugin = definePlugin({ name: '...', run: async (ctx: MyReads) => ({ ... }) })
 * and have `Reads`/`Writes`/`EBrand` fully inferred.
 */
export function definePlugin<
  Reads extends BaseCtx,
  Writes extends BaseCtx,
  EBrand extends string | never = never
>(def: PluginDef<Reads, Writes, EBrand>): PluginDef<Reads, Writes, EBrand> {
  // TODO: implement (hint: it's one line)
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 5. TODO — Pipeline builder
// ---------------------------------------------------------------------------

/**
 * TODO: Implement `buildPipeline` — takes an `InitCtx` value and a readonly
 * tuple of `PluginDef`s and returns a `Pipeline` object (defined below).
 *
 * Compile-time requirement: The function must be generic enough that
 * TypeScript can verify (via `SatisfiedBy`) that each plugin's `Reads` are
 * satisfied by the context accumulated so far. If a plugin's reads are NOT
 * satisfied, the overload/signature should produce a compile error.
 *
 * Runtime behaviour:
 *   - Plugins run SEQUENTIALLY (not in parallel).
 *   - Each plugin receives the merged context accumulated so far.
 *   - Plugin execution time is recorded per plugin.
 *   - If a plugin rejects, wrap the rejection in a `PluginError`-shaped
 *     object (preserving `brand`, `message`, `cause`) and re-throw.
 *
 * Hint: You may use a generic rest-tuple parameter with a mapped/conditional
 * constraint to enforce ordering. Consider a helper overload or a recursive
 * generic approach for the compile-time check.
 */

export type Pipeline<
  Plugins extends readonly PluginDef<BaseCtx, BaseCtx, string | never>[],
  InitCtx extends BaseCtx = Record<never, never>
> = {
  /** Execute the pipeline and return the resolved result. */
  readonly execute: (init: InitCtx) => Promise<PipelineResult<Plugins, InitCtx>>;
  /** The ordered list of plugin names registered in this pipeline. */
  readonly pluginNames: readonly string[];
};

export function buildPipeline<
  const InitCtx extends BaseCtx,
  const Plugins extends readonly PluginDef<BaseCtx, BaseCtx, string | never>[]
>(
  plugins: Plugins
): Pipeline<Plugins, InitCtx> {
  // TODO: implement
  // Requirements (numbered for reference in the evaluation checklist):
  // R1 — iterate plugins in order, awaiting each before starting the next
  // R2 — merge each plugin's returned Writes into the running context object
  // R3 — record start/end timestamps; store elapsed ms in a `timings` map
  // R4 — on plugin rejection, re-throw a PluginError-shaped object with
  //       brand = plugin.name, message = error message, cause = original error
  // R5 — return { ctx, timings } on success
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 6. TODO — `composePlugins` utility
// ---------------------------------------------------------------------------

/**
 * TODO: Implement `composePlugins` — takes two compatible plugins and returns
 * a single merged `PluginDef` whose:
 *   - `Reads`  = `A`'s Reads (the composed plugin requires what `A` requires)
 *   - `Writes` = `MergeCtx<AWrites, BWrites>` (both plugins' outputs merged)
 *   - `EBrand` = `AEBrand | BEBrand`
 *   - `name`   = `"${A.name}+${B.name}"` (template literal)
 *   - `run`    = runs A then B sequentially, passing A's output merged with
 *               the incoming ctx to B.
 *
 * Constraint: `B`'s Reads must be satisfied by `MergeCtx<AReads, AWrites>`.
 */
export function composePlugins<
  AReads extends BaseCtx,
  AWrites extends BaseCtx,
  AEBrand extends string | never,
  BReads extends BaseCtx,
  BWrites extends BaseCtx,
  BEBrand extends string | never
>(
  a: PluginDef<AReads, AWrites, AEBrand>,
  b: PluginDef<BReads, BWrites, BEBrand>
): PluginDef<AReads, MergeCtx<AWrites, BWrites>, AEBrand | BEBrand> {
  // TODO: implement
  // Hint: run `a`, merge result into ctx, run `b` with merged ctx, merge both results.
  throw new Error("Not implemented");
}
