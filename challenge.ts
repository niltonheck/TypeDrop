// ============================================================
// Typed Middleware Pipeline Builder
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// ============================================================

// --------------- Base Context & Result Types ----------------

/** The initial shape of every incoming request context. */
export interface BaseContext {
  requestId: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers: Record<string, string>;
}

/**
 * A typed error that middleware can produce when short-circuiting.
 * Discriminated by `kind`.
 */
export type MiddlewareError =
  | { kind: "unauthorized"; message: string }
  | { kind: "forbidden"; message: string; requiredRole: string }
  | { kind: "validation_failed"; message: string; fields: string[] }
  | { kind: "rate_limited"; message: string; retryAfterMs: number }
  | { kind: "internal"; message: string };

/**
 * What a middleware step returns:
 *   - `{ ok: true; ctx: C }` — enriched context, continue the chain
 *   - `{ ok: false; error: MiddlewareError }` — short-circuit, stop the chain
 */
export type StepResult<C> =
  | { ok: true; ctx: C }
  | { ok: false; error: MiddlewareError };

// --------------- Middleware & Pipeline Types -----------------

/**
 * A single middleware function.
 * Receives the current context `C` and returns a StepResult
 * that may carry a richer context `C & Extra`.
 *
 * REQUIREMENT 1:
 * Define `Middleware<C, Extra>` as a function type where:
 *   - input:  context of type `C`
 *   - output: `Promise<StepResult<C & Extra>>`
 *
 * `Extra` should default to `Record<string, never>` (no additions)
 * so a pass-through middleware needs no second type argument.
 */
// TODO: export type Middleware<C, Extra = ...> = ...

/**
 * The final handler that runs only if every middleware step succeeds.
 * Receives the fully-enriched context and returns a plain value `T`.
 */
export type FinalHandler<C, T> = (ctx: C) => Promise<T>;

/**
 * The result of running the full pipeline.
 * Discriminated by `ok`.
 */
export type PipelineResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: MiddlewareError };

// --------------- Pipeline Builder ---------------------------

/**
 * REQUIREMENT 2 — `Pipeline<C>` class
 *
 * A builder that accumulates middleware steps and executes them in order.
 * The generic `C` tracks the *current* fully-enriched context type as
 * steps are added.
 *
 * Implement the following methods:
 *
 *   use<Extra>(step: Middleware<C, Extra>): Pipeline<C & Extra>
 *     — Appends one middleware step and returns a NEW Pipeline whose
 *       context type is widened to `C & Extra`.
 *     — The returned pipeline must carry ALL previously registered steps
 *       plus the new one, so `run()` executes them in registration order.
 *
 *   run<T>(handler: FinalHandler<C, T>): Promise<PipelineResult<T>>
 *     — Executes every registered step sequentially.
 *     — If any step returns `{ ok: false, error }`, stop immediately and
 *       return `{ ok: false, error }`.
 *     — If all steps succeed, call `handler` with the final enriched
 *       context and return `{ ok: true, value: result }`.
 *     — Any thrown exception should be caught and returned as:
 *       `{ ok: false, error: { kind: "internal", message: <string> } }`
 *
 * HINT: Internally you'll need to store steps as an array. Because each
 * step widens the type, you'll have to think carefully about how to type
 * that internal array without reaching for `any`.
 */
export class Pipeline<C> {
  // TODO: add private field(s) to store the initial context and steps

  // TODO: constructor — accepts the starting context value
  constructor(_initialCtx: C) {
    throw new Error("Not implemented");
  }

  // TODO: use<Extra>(step: Middleware<C, Extra>): Pipeline<C & Extra>
  use<Extra>(
    _step: /* TODO: fill in the correct Middleware type */ never
  ): Pipeline<C & Extra> {
    throw new Error("Not implemented");
  }

  // TODO: run<T>(handler: FinalHandler<C, T>): Promise<PipelineResult<T>>
  run<T>(_handler: FinalHandler<C, T>): Promise<PipelineResult<T>> {
    throw new Error("Not implemented");
  }
}

// --------------- Built-in Middleware Factories ---------------

/**
 * REQUIREMENT 3 — `authMiddleware`
 *
 * A middleware factory that inspects `ctx.headers["authorization"]`.
 *   - If the header is missing or does not start with "Bearer ",
 *     return `{ ok: false, error: { kind: "unauthorized", message: "..." } }`.
 *   - Otherwise extract the token string (everything after "Bearer ")
 *     and return `{ ok: true, ctx: { ...ctx, auth: { token } } }`.
 *
 * The returned middleware must be typed as:
 *   Middleware<BaseContext, { auth: { token: string } }>
 */
export function authMiddleware(): /* TODO */ never {
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 4 — `roleMiddleware`
 *
 * A middleware factory that accepts a `requiredRole: string`.
 * It expects the incoming context to already have `auth: { token: string }`
 * (i.e. it should run AFTER authMiddleware).
 *
 * For this exercise, use the following deterministic mock role-lookup:
 *   token "admin-token"  → role "admin"
 *   token "editor-token" → role "editor"
 *   anything else        → role "viewer"
 *
 *   - If the resolved role does NOT equal `requiredRole`, return:
 *     `{ ok: false, error: { kind: "forbidden", message: "...", requiredRole } }`
 *   - Otherwise return:
 *     `{ ok: true, ctx: { ...ctx, user: { role } } }`
 *
 * The returned middleware must be typed as:
 *   Middleware<BaseContext & { auth: { token: string } }, { user: { role: string } }>
 */
export function roleMiddleware(
  requiredRole: string
): /* TODO */ never {
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5 — `rateLimitMiddleware`
 *
 * A middleware factory that accepts `maxRequests: number` and a
 * `windowMs: number`. It tracks how many times it has been invoked
 * (across all calls to the returned middleware function) using a simple
 * closure counter.
 *
 *   - If the invocation count EXCEEDS `maxRequests`, return:
 *     `{ ok: false, error: { kind: "rate_limited", message: "...", retryAfterMs: windowMs } }`
 *   - Otherwise increment the counter and return:
 *     `{ ok: true, ctx: { ...ctx, rateLimit: { remaining: maxRequests - count } } }`
 *
 * The returned middleware must be typed as:
 *   Middleware<BaseContext, { rateLimit: { remaining: number } }>
 */
export function rateLimitMiddleware(
  maxRequests: number,
  windowMs: number
): /* TODO */ never {
  throw new Error("Not implemented");
}

// --------------- Exhaustive Error Reporter ------------------

/**
 * REQUIREMENT 6 — `describeError`
 *
 * Accepts a `MiddlewareError` and returns a human-readable string
 * that includes ALL fields of the specific error variant.
 * TypeScript must prove the switch is exhaustive (no default needed,
 * but you may add one that calls a `never`-typed helper).
 *
 * Examples:
 *   { kind: "unauthorized", message: "No token" }
 *     → "401 Unauthorized: No token"
 *
 *   { kind: "forbidden", message: "Access denied", requiredRole: "admin" }
 *     → "403 Forbidden: Access denied (requires role: admin)"
 *
 *   { kind: "validation_failed", message: "Bad input", fields: ["email","age"] }
 *     → "400 Validation Failed: Bad input (fields: email, age)"
 *
 *   { kind: "rate_limited", message: "Slow down", retryAfterMs: 5000 }
 *     → "429 Rate Limited: Slow down (retry after 5000ms)"
 *
 *   { kind: "internal", message: "Boom" }
 *     → "500 Internal Error: Boom"
 */
export function describeError(error: MiddlewareError): string {
  // TODO: implement exhaustive switch on error.kind
  throw new Error("Not implemented");
}
