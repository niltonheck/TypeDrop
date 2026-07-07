
// ============================================================
// Typed Middleware Pipeline with Typed Context Propagation
// challenge.ts — fill in all TODOs; no `any`, no `as`
// ============================================================

// -----------------------------------------------------------
// 1. BRANDED TYPES
// -----------------------------------------------------------

/** Opaque brand helper — do not change */
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type UserId   = Brand<string, "UserId">;
export type ClientId = Brand<string, "ClientId">;

// -----------------------------------------------------------
// 2. ERROR TYPES (discriminated union)
// -----------------------------------------------------------

export type AuthError      = { kind: "auth";       message: string; statusCode: 401 };
export type RateLimitError = { kind: "rate_limit"; message: string; statusCode: 429 };
export type TransformError = { kind: "transform";  message: string; statusCode: 422 };
export type LogError       = { kind: "log";        message: string; statusCode: 500 };

/** Union of all possible gateway errors */
export type GatewayError = AuthError | RateLimitError | TransformError | LogError;

// -----------------------------------------------------------
// 3. CONTEXT TYPES — each layer adds its own properties
// -----------------------------------------------------------

/** Every request starts with at least this */
export type BaseContext = {
  requestId: string;
  path:      string;
  method:    "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers:   Record<string, string>;
  body:      unknown;
};

/** After auth middleware runs */
export type AuthContext = BaseContext & {
  userId:   UserId;
  clientId: ClientId;
  scopes:   readonly string[];
};

/** After rate-limit middleware runs */
export type RateLimitContext = AuthContext & {
  remainingQuota: number;
  quotaResetAt:   Date;
};

/** After transform middleware runs */
export type TransformContext = RateLimitContext & {
  parsedBody: Record<string, unknown>;
  traceId:    string;
};

/** After log middleware runs (final context) */
export type LogContext = TransformContext & {
  loggedAt:     Date;
  durationMs:   number;
};

// -----------------------------------------------------------
// 4. MIDDLEWARE RESULT & PIPELINE TYPES
// -----------------------------------------------------------

/** A middleware either continues with enriched context, or halts with an error */
export type MiddlewareResult<TCtx, E extends GatewayError> =
  | { status: "continue"; ctx: TCtx }
  | { status: "halt";     error: E };

/**
 * A single middleware function: receives current context TIn,
 * returns a promise of a MiddlewareResult with enriched context TOut or error E.
 */
export type Middleware<TIn, TOut extends TIn, E extends GatewayError> = (
  ctx: TIn
) => Promise<MiddlewareResult<TOut, E>>;

/**
 * TODO 1 — MiddlewareTuple
 *
 * Define `MiddlewareTuple<TInitial, TFinal, E>` as the type of a heterogeneous
 * readonly tuple that threads the context type from TInitial → TFinal through
 * a chain of Middleware steps.
 *
 * Requirements:
 * - The first element must accept TInitial as its input.
 * - Each subsequent element's input must be the output of the previous element.
 * - The last element must produce TFinal as its output.
 * - E is the union of all possible error types across all layers.
 *
 * Hint: A recursive conditional type or a fixed-length overload set both work.
 * For this challenge, define it for chains of length 1–4 using overloads/union.
 */
export type MiddlewareTuple<TInitial, TFinal extends TInitial, E extends GatewayError> =
  // TODO 1: replace `never` with the correct type
  never;

// -----------------------------------------------------------
// 5. PIPELINE OUTCOME
// -----------------------------------------------------------

/** The final result after running all middleware */
export type PipelineOutcome<TFinal, E extends GatewayError> =
  | { status: "success"; ctx: TFinal }
  | { status: "error";   error: E };

// -----------------------------------------------------------
// 6. runPipeline
// -----------------------------------------------------------

/**
 * TODO 2 — runPipeline
 *
 * Execute middleware layers sequentially:
 * - Start with `initial` context.
 * - Pass the current context to each middleware in order.
 * - If any middleware returns `{ status: "halt", error }`, immediately
 *   return `{ status: "error", error }`.
 * - If all middleware succeed, return `{ status: "success", ctx: finalCtx }`.
 *
 * The function signature is already provided; implement the body.
 */
export async function runPipeline<
  TInitial extends BaseContext,
  TFinal extends TInitial,
  E extends GatewayError
>(
  initial: TInitial,
  // TODO: update the pipeline parameter type to use your MiddlewareTuple once defined
  pipeline: ReadonlyArray<Middleware<BaseContext, BaseContext, E>>
): Promise<PipelineOutcome<TFinal, E>> {
  // TODO 2: implement sequential execution with short-circuit on halt
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. CONCRETE MIDDLEWARE FACTORIES
// -----------------------------------------------------------

/**
 * TODO 3 — makeAuthMiddleware
 *
 * Returns a Middleware<BaseContext, AuthContext, AuthError>.
 * Logic:
 * - Extract the `authorization` header (case-insensitive).
 * - If missing or not starting with "Bearer ", halt with AuthError
 *   { kind: "auth", message: "Missing or invalid token", statusCode: 401 }.
 * - Otherwise, parse the token as "<userId>:<clientId>:<scope1>,<scope2>,...".
 *   If the format is wrong (fewer than 3 colon-separated parts), halt with
 *   { kind: "auth", message: "Malformed token", statusCode: 401 }.
 * - On success, continue with AuthContext (spread BaseContext, add userId,
 *   clientId, scopes).
 *
 * Brand the userId/clientId values using the Brand helpers above.
 * (Hint: you may use a small helper function to attach the brand safely
 *  without `as` — think about how `satisfies` or a construction function works.)
 */
export function makeAuthMiddleware(): Middleware<BaseContext, AuthContext, AuthError> {
  // TODO 3
  throw new Error("Not implemented");
}

/**
 * TODO 4 — makeRateLimitMiddleware
 *
 * Returns a Middleware<AuthContext, RateLimitContext, RateLimitError>.
 * Accepts a `limits` map: Record<ClientId, number> (quota per client).
 * Logic:
 * - Look up `ctx.clientId` in limits.
 * - If not found, treat quota as 0.
 * - If quota <= 0, halt with RateLimitError
 *   { kind: "rate_limit", message: "Quota exceeded", statusCode: 429 }.
 * - Otherwise, continue with RateLimitContext, setting:
 *     remainingQuota: limits[clientId] - 1
 *     quotaResetAt:   new Date(Date.now() + 60_000)
 */
export function makeRateLimitMiddleware(
  limits: Partial<Record<ClientId, number>>
): Middleware<AuthContext, RateLimitContext, RateLimitError> {
  // TODO 4
  throw new Error("Not implemented");
}

/**
 * TODO 5 — makeTransformMiddleware
 *
 * Returns a Middleware<RateLimitContext, TransformContext, TransformError>.
 * Logic:
 * - Attempt to parse `ctx.body` as a JSON object (Record<string, unknown>).
 *   - If `ctx.body` is already a non-null object (typeof === "object"), use it.
 *   - If `ctx.body` is a string, try JSON.parse; catch and halt with
 *     { kind: "transform", message: "Invalid JSON body", statusCode: 422 }.
 *   - Otherwise halt with
 *     { kind: "transform", message: "Unsupported body type", statusCode: 422 }.
 * - Generate a traceId as `${ctx.requestId}-${Date.now()}`.
 * - Continue with TransformContext.
 */
export function makeTransformMiddleware(): Middleware<RateLimitContext, TransformContext, TransformError> {
  // TODO 5
  throw new Error("Not implemented");
}

/**
 * TODO 6 — makeLogMiddleware
 *
 * Returns a Middleware<TransformContext, LogContext, LogError>.
 * Accepts a `logFn: (entry: LogEntry) => void`.
 * Logic:
 * - Compute durationMs as Date.now() minus a startTime captured when the
 *   middleware *factory* is called (not when the middleware runs).
 *   (This simulates measuring pipeline startup-to-log latency.)
 * - Build a LogEntry (see type below) and call logFn.
 * - If logFn throws, halt with
 *   { kind: "log", message: "Logging failed", statusCode: 500 }.
 * - Otherwise continue with LogContext.
 */
export type LogEntry = {
  requestId:   string;
  userId:      UserId;
  path:        string;
  method:      BaseContext["method"];
  statusCode:  200;
  durationMs:  number;
  loggedAt:    Date;
};

export function makeLogMiddleware(
  logFn: (entry: LogEntry) => void
): Middleware<TransformContext, LogContext, LogError> {
  // TODO 6
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 8. HttpResponse & handleOutcome
// -----------------------------------------------------------

export type HttpResponse = {
  statusCode: number;
  body:       Record<string, unknown>;
};

/**
 * TODO 7 — handleOutcome
 *
 * Map a PipelineOutcome<LogContext, GatewayError> to an HttpResponse.
 * Requirements:
 * - On success: { statusCode: 200, body: { requestId, userId, path, traceId } }
 * - On each specific error kind, return an appropriate HttpResponse:
 *     "auth"       → statusCode 401, body: { error: error.message }
 *     "rate_limit" → statusCode 429, body: { error: error.message, retryAfter: 60 }
 *     "transform"  → statusCode 422, body: { error: error.message }
 *     "log"        → statusCode 500, body: { error: "Internal server error" }
 * - The switch/if-else over error kinds must be EXHAUSTIVE — TypeScript should
 *   produce a compile error if a new GatewayError kind is added but not handled.
 *   Use the `never` trick to enforce this.
 */
export function handleOutcome(
  outcome: PipelineOutcome<LogContext, GatewayError>
): HttpResponse {
  // TODO 7
  throw new Error("Not implemented");
}
