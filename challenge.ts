// ============================================================
// Typed Middleware Pipeline with Inferred Context Accumulation
// ============================================================
// A middleware pipeline where each layer can read the current
// context and return an enriched version of it. The TypeScript
// type system must track which fields exist at each stage so
// that downstream middleware only sees what upstream provided.
//
// Topics: conditional types, infer, generics, mapped types,
//         function overloads, discriminated unions, Result types
// ============================================================

// --------------- Base Types --------------------------------

/** The minimal shape every pipeline context must satisfy. */
export type BaseCtx = Record<string, unknown>;

/**
 * A Result type for middleware that may fail.
 * On success it carries the enriched context; on failure a typed error.
 */
export type MiddlewareResult<TOut extends BaseCtx> =
  | { ok: true; ctx: TOut }
  | { ok: false; error: MiddlewareError };

/** Structured error produced by any middleware layer. */
export type MiddlewareError = {
  layer: string;         // name of the middleware that failed
  code: string;          // machine-readable error code
  message: string;
};

// --------------- Middleware Shape --------------------------

/**
 * A single middleware layer.
 *  - `name`    : human-readable identifier (used in errors)
 *  - `handler` : receives the current context TIn, returns a
 *                Promise resolving to MiddlewareResult<TOut>
 *
 * REQUIREMENT 1:
 *   TOut must extend TIn — a middleware may only ADD new keys,
 *   never remove or change the type of existing ones.
 */
export type Middleware<TIn extends BaseCtx, TOut extends TIn> = {
  name: string;
  handler: (ctx: TIn) => Promise<MiddlewareResult<TOut>>;
};

// --------------- Pipeline Builder --------------------------

/**
 * REQUIREMENT 2 — implement `createPipeline`.
 *
 * `createPipeline` is a **builder** that accumulates middleware
 * layers one at a time and tracks the growing context type.
 *
 * It must expose:
 *   • `use<TOut>(mw: Middleware<TCtx, TOut>): Pipeline<TOut>`
 *       Appends a middleware. Returns a NEW pipeline whose context
 *       type is TOut (the enriched type after this layer).
 *
 *   • `run(initialCtx: TCtx): Promise<MiddlewareResult<TCtx>>`
 *       Executes all middleware in order, threading the context
 *       through each layer.
 *       - If any layer returns `{ ok: false }`, stop immediately
 *         and return that error result (short-circuit).
 *       - If all layers succeed, return `{ ok: true, ctx: finalCtx }`.
 *
 * The returned type of `run` must be the FINAL accumulated context,
 * not just TCtx at the point `run` is called.
 *
 * Hint: you will need a recursive / variadic generic approach or
 * an internal mutable list + a clever cast-free public API.
 */
export interface Pipeline<TCtx extends BaseCtx> {
  use<TOut extends TCtx>(mw: Middleware<TCtx, TOut>): Pipeline<TOut>;
  run(initialCtx: TCtx): Promise<MiddlewareResult<TCtx>>;
}

/**
 * Factory that creates an empty pipeline starting with context type T.
 *
 * Usage:
 *   const pipeline = createPipeline<{ requestId: string }>()
 *     .use(authMiddleware)      // adds { userId: string }
 *     .use(rateLimitMiddleware) // adds { remaining: number }
 *     .use(loggingMiddleware);  // adds { loggedAt: Date }
 *
 *   const result = await pipeline.run({ requestId: "abc-123" });
 */
export function createPipeline<T extends BaseCtx>(): Pipeline<T> {
  // TODO: implement the pipeline builder.
  // Store middleware handlers in an internal array and thread the
  // context through them sequentially inside `run`.
  throw new Error("Not implemented");
}

// --------------- Utility Types ----------------------------

/**
 * REQUIREMENT 3 — implement `ExtractCtx`.
 *
 * A utility type that extracts the final context type from a
 * Pipeline instance.
 *
 * Example:
 *   type MyPipeline = Pipeline<{ requestId: string; userId: string }>;
 *   type Ctx = ExtractCtx<MyPipeline>;
 *   // => { requestId: string; userId: string }
 */
export type ExtractCtx<P> = P extends Pipeline<infer TCtx> ? TCtx : never;

/**
 * REQUIREMENT 4 — implement `ContextDiff`.
 *
 * A utility type that, given two context types TBefore and TAfter,
 * produces only the NEW keys added by a middleware (i.e. keys in
 * TAfter that are NOT in TBefore).
 *
 * Example:
 *   type Before = { requestId: string };
 *   type After  = { requestId: string; userId: string; role: "admin" | "user" };
 *   type Added  = ContextDiff<Before, After>;
 *   // => { userId: string; role: "admin" | "user" }
 */
export type ContextDiff<TBefore extends BaseCtx, TAfter extends TBefore> = {
  // TODO: map over keys of TAfter, keep only those not in TBefore
  [K in keyof TAfter as K extends keyof TBefore ? never : K]: TAfter[K];
};

/**
 * REQUIREMENT 5 — implement `composeMiddleware`.
 *
 * A helper that merges two compatible middleware into one,
 * so that:
 *   composeMiddleware(mwA, mwB)
 * returns a single Middleware<TIn, TOut> that runs mwA then mwB.
 *
 * - The name of the composed middleware is `"${mwA.name}+${mwB.name}"`.
 * - If mwA fails, return its error immediately (do not run mwB).
 * - TMiddle must extend TIn, TOut must extend TMiddle.
 */
export function composeMiddleware<
  TIn extends BaseCtx,
  TMiddle extends TIn,
  TOut extends TMiddle
>(
  mwA: Middleware<TIn, TMiddle>,
  mwB: Middleware<TMiddle, TOut>
): Middleware<TIn, TOut> {
  // TODO: implement composition
  throw new Error("Not implemented");
}

// --------------- Concrete Middleware Examples --------------
// These are provided for you — use them in your tests.
// They demonstrate the expected middleware shape.

/** Adds { userId: string } to the context. */
export const authMiddleware: Middleware<
  { requestId: string },
  { requestId: string; userId: string }
> = {
  name: "auth",
  handler: async (ctx) => {
    if (!ctx.requestId) {
      return { ok: false, error: { layer: "auth", code: "MISSING_REQUEST_ID", message: "No requestId" } };
    }
    return { ok: true, ctx: { ...ctx, userId: `user-${ctx.requestId}` } };
  },
};

/** Adds { remaining: number } to the context. */
export const rateLimitMiddleware: Middleware<
  { requestId: string; userId: string },
  { requestId: string; userId: string; remaining: number }
> = {
  name: "rateLimit",
  handler: async (ctx) => {
    // Simulate: users starting with "user-fail" are rate-limited
    if (ctx.userId.endsWith("fail")) {
      return { ok: false, error: { layer: "rateLimit", code: "RATE_LIMITED", message: "Too many requests" } };
    }
    return { ok: true, ctx: { ...ctx, remaining: 99 } };
  },
};

/** Adds { loggedAt: Date } to the context. */
export const loggingMiddleware: Middleware<
  { requestId: string; userId: string; remaining: number },
  { requestId: string; userId: string; remaining: number; loggedAt: Date }
> = {
  name: "logging",
  handler: async (ctx) => {
    return { ok: true, ctx: { ...ctx, loggedAt: new Date() } };
  },
};
