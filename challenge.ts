// ============================================================
// Typed Plugin Middleware Chain Executor
// challenge.ts — fill in every TODO. No `any`, no `as` casts.
// Must compile under strict: true.
// ============================================================

// ── 1. Result monad ─────────────────────────────────────────

// TODO 1: Define `Result<T, E>` as a discriminated union with
//         two variants: Ok<T> ({ ok: true; value: T }) and
//         Err<E> ({ ok: false; error: E }).
export type Result<T, E> = never; // replace `never`

// TODO 2: Implement helper constructors `ok<T>` and `err<E>`
//         that return the correct Result variant.
export function ok<T>(value: T): Result<T, never> {
  // TODO
  throw new Error("not implemented");
}

export function err<E>(error: E): Result<never, E> {
  // TODO
  throw new Error("not implemented");
}

// ── 2. Core context & plugin types ──────────────────────────

// A plugin execution trace entry
export interface TraceEntry {
  pluginId: string;
  durationMs: number;
  /** Whether this plugin mutated the context */
  mutated: boolean;
}

// The base context every middleware receives and may extend.
// It carries an immutable `requestId` plus an open-ended
// `meta` bag that plugins can add typed keys to.
export interface BaseContext {
  readonly requestId: string;
  meta: Record<string, unknown>;
}

// A typed middleware function:
//   - receives the current context (typed as `In`)
//   - returns a Promise that resolves to Result<Out, PluginError>
//   - `Out` must extend `In` (plugins can only ADD to the context)
export type MiddlewareFn<In extends BaseContext, Out extends In> = (
  ctx: In
) => Promise<Result<Out, PluginError>>;

// ── 3. Plugin error types ────────────────────────────────────

// TODO 3: Define a discriminated-union `PluginError` covering
//         exactly these three variants (discriminant: `kind`):
//
//   a) "validation"  – { kind: "validation"; pluginId: string; message: string }
//   b) "timeout"     – { kind: "timeout";    pluginId: string; limitMs: number }
//   c) "dependency"  – { kind: "dependency"; pluginId: string; missing: string[] }
export type PluginError = never; // replace `never`

// ── 4. Plugin descriptor ─────────────────────────────────────

// TODO 4: Define `Plugin<In, Out>` as an interface with:
//   - id: string
//   - timeoutMs: number          (executor will enforce this)
//   - run: MiddlewareFn<In, Out>
//
// `In` must extend BaseContext; `Out` must extend `In`.
export interface Plugin<In extends BaseContext, Out extends In> {
  // TODO
}

// ── 5. Chain execution result ────────────────────────────────

// The final result returned by `executeChain`:
//   - On full success: ok  → { finalContext, trace }
//   - On first failure: err → { error: PluginError; trace: TraceEntry[] }
//
// TODO 5: Define `ChainSuccess<Ctx>` and `ChainFailure` interfaces,
//         then define `ChainResult<Ctx>` as Result<ChainSuccess<Ctx>, ChainFailure>.
export interface ChainSuccess<Ctx extends BaseContext> {
  // TODO
}

export interface ChainFailure {
  // TODO
}

export type ChainResult<Ctx extends BaseContext> = never; // replace `never`

// ── 6. Plugin registry ───────────────────────────────────────

// TODO 6: Implement `PluginRegistry` — a class that:
//   a) Holds an ordered list of plugins (each typed Plugin<any-safe-bound, any-safe-bound>).
//      HINT: use `Plugin<BaseContext, BaseContext>` as the stored type.
//   b) `register<In extends BaseContext, Out extends In>(plugin: Plugin<In, Out>): this`
//      Appends the plugin and returns `this` (fluent API).
//   c) `list(): ReadonlyArray<Plugin<BaseContext, BaseContext>>`
//      Returns the registered plugins in insertion order.
export class PluginRegistry {
  // TODO
}

// ── 7. Chain executor ────────────────────────────────────────

// TODO 7: Implement `executeChain`.
//
// Requirements (numbered for the checklist):
//
//   R1. Accept an initial context `initCtx: BaseContext` and a
//       `registry: PluginRegistry`.
//
//   R2. Run each plugin sequentially (not in parallel).
//       Pass the accumulated context from the previous step as
//       the input to the next plugin.
//
//   R3. Enforce `plugin.timeoutMs`: if `plugin.run(ctx)` does not
//       settle within that many ms, short-circuit with a
//       PluginError of kind "timeout".
//       Use Promise.race to implement the timeout.
//
//   R4. If any plugin returns `err(...)`, stop the chain immediately
//       and return ChainResult as an Err containing ChainFailure
//       (include the trace entries collected so far).
//
//   R5. Record a TraceEntry for every plugin that was *started*,
//       including failed/timed-out ones.
//       `mutated` is true when the plugin returned ok and the
//       output context reference differs from the input reference.
//
//   R6. On full success, return ChainResult as Ok containing
//       ChainSuccess with the final context and the full trace.
//
//   R7. The function must be typed so that callers who pass a
//       concrete `initCtx` typed as `BaseContext` get back
//       `ChainResult<BaseContext>`. (No need to thread the full
//       accumulated generic through the return type — BaseContext
//       is the safe public contract here.)

export async function executeChain(
  initCtx: BaseContext,
  registry: PluginRegistry
): Promise<ChainResult<BaseContext>> {
  // TODO
  throw new Error("not implemented");
}

// ── 8. Exhaustive error reporter ─────────────────────────────

// TODO 8: Implement `formatPluginError(error: PluginError): string`.
//
//   - "validation"  → `[validation] <pluginId>: <message>`
//   - "timeout"     → `[timeout] <pluginId> exceeded <limitMs>ms`
//   - "dependency"  → `[dependency] <pluginId> missing: <missing joined by ", ">`
//
// TypeScript must prove the switch is exhaustive (use a
// `never`-typed default branch that throws).
export function formatPluginError(error: PluginError): string {
  // TODO
  throw new Error("not implemented");
}
