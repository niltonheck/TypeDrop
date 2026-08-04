// ============================================================
// Typed Middleware Pipeline with Context Narrowing
// ============================================================
// SCENARIO:
//   An API gateway processes requests through a chain of middleware.
//   Each middleware receives the current context and returns a NEW
//   context with additional properties merged in. The pipeline must
//   be fully type-safe: the output type of one middleware becomes the
//   input type of the next, and the final handler only compiles when
//   the context contains ALL required fields.
// ============================================================

// ── Base context every request starts with ──────────────────
export interface BaseContext {
  requestId: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  headers: Record<string, string>;
  startedAt: number; // Date.now()
}

// ── Shapes added by individual middleware ────────────────────
export interface AuthContext {
  auth: {
    userId: string;
    role: "admin" | "user" | "guest";
    scopes: string[];
  };
}

export interface ParsedBodyContext {
  body: unknown; // raw parsed JSON — intentionally unknown
}

export interface ValidatedBodyContext<T> {
  validatedBody: T; // narrowed by a schema-aware middleware
}

export interface RateLimitContext {
  rateLimit: {
    limit: number;
    remaining: number;
    resetAt: number;
  };
}

// ── Result type returned by every middleware ─────────────────
// A middleware either:
//   - succeeds and returns the enriched context
//   - short-circuits with a typed error response
export type MiddlewareResult<TCtx> =
  | { ok: true; ctx: TCtx }
  | { ok: false; status: number; message: string };

// ── Core middleware type ─────────────────────────────────────
// A middleware is a function that takes a context of type TIn and
// returns a Promise resolving to a MiddlewareResult whose success
// branch carries a context of type TOut.
//
// TODO (1): Define the `Middleware<TIn, TOut>` generic type alias.
//           TOut must extend TIn (every output is a superset of the input).
export type Middleware<TIn, TOut extends TIn> = (
  ctx: TIn
) => Promise<MiddlewareResult<TOut>>;

// ── Pipeline builder ─────────────────────────────────────────
// TODO (2): Implement `createPipeline`.
//
// Requirements:
//   - Accepts a tuple of middleware where each step's output type
//     flows into the next step's input type.
//   - Returns a `run` function that accepts a BaseContext and
//     executes each middleware in sequence.
//   - If any middleware returns `{ ok: false }`, the pipeline
//     short-circuits and returns that error immediately.
//   - If all middleware succeed, `run` returns `{ ok: true, ctx: <final ctx> }`.
//
// The tricky part: the return type of `run` must reflect the
// accumulated context type after ALL middleware have run.
//
// Hint: you will need overloads OR a variadic generic approach.
// For this challenge, implement overloads for pipelines of
// length 1, 2, 3, and 4 middleware, plus a fallback.

export function createPipeline<
  T0 extends BaseContext,
  T1 extends T0,
>(
  m0: Middleware<T0, T1>
): { run: (ctx: T0) => Promise<MiddlewareResult<T1>> };

export function createPipeline<
  T0 extends BaseContext,
  T1 extends T0,
  T2 extends T1,
>(
  m0: Middleware<T0, T1>,
  m1: Middleware<T1, T2>
): { run: (ctx: T0) => Promise<MiddlewareResult<T2>> };

export function createPipeline<
  T0 extends BaseContext,
  T1 extends T0,
  T2 extends T1,
  T3 extends T2,
>(
  m0: Middleware<T0, T1>,
  m1: Middleware<T1, T2>,
  m2: Middleware<T2, T3>
): { run: (ctx: T0) => Promise<MiddlewareResult<T3>> };

export function createPipeline<
  T0 extends BaseContext,
  T1 extends T0,
  T2 extends T1,
  T3 extends T2,
  T4 extends T3,
>(
  m0: Middleware<T0, T1>,
  m1: Middleware<T1, T2>,
  m2: Middleware<T2, T3>,
  m3: Middleware<T3, T4>
): { run: (ctx: T0) => Promise<MiddlewareResult<T4>> };

// TODO (3): Write the single implementation signature and body.
//   - Use a rest parameter typed as Middleware<BaseContext, BaseContext>[]
//     for the implementation (the overloads handle precise typing).
//   - Iterate through middleware, threading the context forward.
//   - Short-circuit on the first { ok: false } result.
export function createPipeline(
  ...middleware: Middleware<BaseContext, BaseContext>[]
): { run: (ctx: BaseContext) => Promise<MiddlewareResult<BaseContext>> } {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Built-in middleware factories ────────────────────────────

// TODO (4): Implement `makeAuthMiddleware`.
//
// Requirements:
//   - Accepts a `verify` function: (token: string) => AuthContext["auth"] | null
//   - Reads `ctx.headers["authorization"]`, strips the "Bearer " prefix.
//   - If the header is missing or `verify` returns null, short-circuit
//     with status 401 and message "Unauthorized".
//   - Otherwise return { ok: true, ctx: { ...ctx, auth: <result> } }.
export function makeAuthMiddleware<TIn extends BaseContext>(
  verify: (token: string) => AuthContext["auth"] | null
): Middleware<TIn, TIn & AuthContext> {
  // TODO: implement
  throw new Error("Not implemented");
}

// TODO (5): Implement `makeBodyParserMiddleware`.
//
// Requirements:
//   - Accepts a `readRawBody` async function: (ctx: TIn) => string
//   - Tries JSON.parse on the result; if it throws, short-circuit
//     with status 400 and message "Invalid JSON body".
//   - Otherwise return { ok: true, ctx: { ...ctx, body: <parsed> } }.
export function makeBodyParserMiddleware<TIn extends BaseContext>(
  readRawBody: (ctx: TIn) => Promise<string>
): Middleware<TIn, TIn & ParsedBodyContext> {
  // TODO: implement
  throw new Error("Not implemented");
}

// TODO (6): Implement `makeBodyValidatorMiddleware`.
//
// Requirements:
//   - Generic over TIn (must extend BaseContext & ParsedBodyContext)
//     and TBody (the expected validated shape).
//   - Accepts a `validate` function: (raw: unknown) => TBody | null
//   - If validate returns null, short-circuit with status 422
//     and message "Validation failed".
//   - Otherwise return { ok: true, ctx: { ...ctx, validatedBody: <result> } }.
export function makeBodyValidatorMiddleware<
  TIn extends BaseContext & ParsedBodyContext,
  TBody,
>(
  validate: (raw: unknown) => TBody | null
): Middleware<TIn, TIn & ValidatedBodyContext<TBody>> {
  // TODO: implement
  throw new Error("Not implemented");
}

// TODO (7): Implement `makeRateLimitMiddleware`.
//
// Requirements:
//   - Accepts a `checkLimit` async function:
//       (userId: string) => RateLimitContext["rateLimit"]
//     Note: TIn must extend BaseContext & AuthContext so userId is available.
//   - If `rateLimit.remaining === 0`, short-circuit with status 429
//     and message "Rate limit exceeded".
//   - Otherwise return { ok: true, ctx: { ...ctx, rateLimit: <result> } }.
export function makeRateLimitMiddleware<TIn extends BaseContext & AuthContext>(
  checkLimit: (userId: string) => Promise<RateLimitContext["rateLimit"]>
): Middleware<TIn, TIn & RateLimitContext> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Route handler helper ─────────────────────────────────────
// TODO (8): Implement `makeHandler`.
//
// A route handler is just a function that receives a fully-enriched
// context and returns a typed response payload.
//
// Requirements:
//   - Generic over TCtx (the final enriched context) and TResponse.
//   - Accepts a `pipeline` produced by `createPipeline` and a
//     `handler` function: (ctx: TCtx) => Promise<TResponse>.
//   - Returns an async function that takes a BaseContext, runs the
//     pipeline, and:
//       * On pipeline error → returns { ok: false, status, message }
//       * On success → calls handler(ctx) and returns
//         { ok: true, data: <TResponse> }
export type HandlerResponse<TResponse> =
  | { ok: true; data: TResponse }
  | { ok: false; status: number; message: string };

export function makeHandler<TCtx extends BaseContext, TResponse>(
  pipeline: { run: (ctx: BaseContext) => Promise<MiddlewareResult<TCtx>> },
  handler: (ctx: TCtx) => Promise<TResponse>
): (ctx: BaseContext) => Promise<HandlerResponse<TResponse>> {
  // TODO: implement
  throw new Error("Not implemented");
}
