// challenge.ts
//
// Typed Plugin Middleware Pipeline
// =================================
// You are building the request-processing core for an API gateway.
// Plugins are registered at startup and form a typed middleware chain.
// Each plugin declares the context fields it READS and WRITES, and the
// pipeline must enforce — at the TYPE level — that every field a plugin
// reads has already been produced by an earlier plugin in the chain.
//
// Topics exercised: generics, conditional types, mapped types, template
// literal types, discriminated unions, intersection accumulation, infer,
// satisfies, Result<T,E> error handling.
// ─────────────────────────────────────────────────────────────────────

// ─── Core result type ────────────────────────────────────────────────

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

// ─── Pipeline context ────────────────────────────────────────────────

/**
 * The base request context every pipeline starts with.
 * Plugins may read these fields and/or extend the context with new ones.
 */
export type BaseContext = {
  readonly requestId: string;
  readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  readonly path: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
};

// ─── Plugin error ────────────────────────────────────────────────────

export type PluginError = {
  readonly pluginName: string;
  readonly message: string;
  readonly statusCode: number;
};

// ─── Plugin definition ───────────────────────────────────────────────

/**
 * A Plugin<Reads, Writes> describes one middleware step.
 *
 * @typeParam Reads  - The shape of context fields this plugin requires as input.
 *                    Must be a subset of what has already been accumulated.
 * @typeParam Writes - The new fields (key→value pairs) this plugin adds to the context.
 *
 * Requirements:
 * 1. `name`    — unique string identifier for the plugin.
 * 2. `execute` — receives the portion of the context it declared it reads,
 *                and returns a Result whose Ok value contains ONLY the new
 *                fields it declared it writes (Writes). On Err, returns PluginError.
 */
export type Plugin<Reads extends object, Writes extends object> = {
  readonly name: string;
  readonly execute: (ctx: Reads) => Promise<Result<Writes, PluginError>>;
};

// ─── Accumulator helper types ─────────────────────────────────────────
//
// TODO 1 — Define `Accumulate<Plugins>`:
//   A recursive conditional type that, given a tuple of Plugin types,
//   computes the union of ALL context fields available after every plugin
//   has run (i.e. BaseContext merged with each plugin's Writes in order).
//
//   Signature hint:
//     type Accumulate<Plugins extends readonly Plugin<object, object>[]>
//       = /* your implementation */
//
//   Example:
//     type A = Accumulate<[Plugin<BaseContext, { userId: string }>,
//                          Plugin<BaseContext & { userId: string }, { role: "admin" | "user" }>]>
//     // → BaseContext & { userId: string } & { role: "admin" | "user" }

export type Accumulate<
  Plugins extends readonly Plugin<object, object>[],
  Acc extends object = BaseContext
> = /* TODO 1 */ never;

// ─── Plugin write extractor ───────────────────────────────────────────
//
// TODO 2 — Define `PluginWrites<P>`:
//   Given a single Plugin type, extract the `Writes` type parameter.
//
//   Signature hint:
//     type PluginWrites<P> = P extends Plugin<infer _R, infer W> ? W : never

export type PluginWrites<P> = /* TODO 2 */ never;

// ─── Plugin reads extractor ───────────────────────────────────────────
//
// TODO 3 — Define `PluginReads<P>`:
//   Given a single Plugin type, extract the `Reads` type parameter.

export type PluginReads<P> = /* TODO 3 */ never;

// ─── Validate pipeline ordering ──────────────────────────────────────
//
// TODO 4 — Define `ValidPipeline<Plugins, Acc>`:
//   A recursive conditional type that validates a tuple of plugins.
//   For each plugin at position i, its `Reads` must be assignable to
//   the accumulated context so far (Acc). If valid, recurse with
//   Acc & PluginWrites<Plugins[i]>. If invalid, return `never`.
//
//   This is what makes the pipeline "self-enforcing" at the type level.
//
//   Signature hint:
//     type ValidPipeline<
//       Plugins extends readonly Plugin<object, object>[],
//       Acc extends object = BaseContext
//     > = /* your implementation */

export type ValidPipeline<
  Plugins extends readonly Plugin<object, object>[],
  Acc extends object = BaseContext
> = /* TODO 4 */ never;

// ─── Pipeline result ─────────────────────────────────────────────────

/**
 * The final context produced by running all plugins in sequence.
 * It is BaseContext merged with every plugin's Writes.
 */
export type PipelineResult<Plugins extends readonly Plugin<object, object>[]> =
  Result<Accumulate<Plugins>, PluginError>;

// ─── createPipeline ──────────────────────────────────────────────────
//
// TODO 5 — Implement `createPipeline`:
//   Factory that accepts a validated tuple of plugins and returns a
//   `run` function. The `run` function:
//     a) Accepts a `BaseContext`.
//     b) Executes each plugin sequentially (NOT in parallel).
//     c) Passes the full accumulated context so far to each plugin's execute().
//     d) If any plugin returns Err, the pipeline short-circuits and returns
//        that Err immediately (no further plugins run).
//     e) Returns Ok<Accumulate<Plugins>> on full success.
//
//   The overload/signature must ensure that only a ValidPipeline is accepted.
//   Hint: use a conditional return type or a generic constraint so that
//   passing an invalid plugin order is a compile-time error.
//
// Requirement R1: Sequential execution — plugins run one after another.
// Requirement R2: Short-circuit on first Err.
// Requirement R3: Each plugin receives the FULL accumulated context.
// Requirement R4: The return type is PipelineResult<Plugins>.
// Requirement R5: No `any`, no type assertions (`as`).

export function createPipeline<
  const Plugins extends readonly Plugin<object, object>[]
>(
  // TODO 5a: constrain `plugins` so the tuple is only accepted when ValidPipeline<Plugins> extends Plugins
  plugins: ValidPipeline<Plugins> extends never ? never : Plugins
): {
  run: (ctx: BaseContext) => Promise<PipelineResult<Plugins>>;
} {
  // TODO 5b: implement the sequential execution loop
  throw new Error("Not implemented");
}

// ─── makePlugin helper ────────────────────────────────────────────────
//
// TODO 6 — Implement `makePlugin<Reads, Writes>`:
//   A typed constructor helper. Returns a Plugin<Reads, Writes> given
//   a name and an execute function. This lets callers avoid writing the
//   full Plugin<...> annotation by hand.
//
// Requirement R6: Reads and Writes are inferred from the execute parameter.

export function makePlugin<Reads extends object, Writes extends object>(
  name: string,
  execute: (ctx: Reads) => Promise<Result<Writes, PluginError>>
): Plugin<Reads, Writes> {
  // TODO 6: implement
  throw new Error("Not implemented");
}

// ─── Example plugin shapes (for reference in tests) ──────────────────
//
// The test harness will construct plugins of these shapes. You do NOT
// need to implement them here — they are illustrative only.
//
// Plugin 1 — AuthPlugin
//   Reads:  BaseContext (needs `headers`)
//   Writes: { userId: string; role: "admin" | "user" }
//
// Plugin 2 — RateLimitPlugin
//   Reads:  BaseContext & { userId: string }   ← needs Plugin 1's output
//   Writes: { requestsRemaining: number }
//
// Plugin 3 — LogPlugin
//   Reads:  BaseContext & { userId: string; requestsRemaining: number }
//   Writes: { logEntryId: string }
//
// An attempt to place RateLimitPlugin BEFORE AuthPlugin must be a
// compile-time error (because userId would not yet exist in the context).
