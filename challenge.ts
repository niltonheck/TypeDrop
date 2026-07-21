// ============================================================
// Typed Middleware Pipeline with Branching & Typed Context
// challenge.ts
// ============================================================
// Requirements:
//  1. A middleware function receives the current context and a `next`
//     function. Calling `next(patch)` merges `patch` into the context
//     and passes control to the following middleware; returning a
//     `PipelineResponse` short-circuits the rest of the chain.
//  2. `Pipeline<TCtx>` is a builder that accumulates middleware via
//     `.use(middleware)`. Each call to `.use()` may WIDEN the context
//     type by merging in the patch shape the middleware adds — downstream
//     middleware must see the enriched context type.
//  3. `Pipeline<TCtx>.run(initialCtx)` executes middleware in order and
//     returns `Promise<PipelineResponse>`.
//  4. If every middleware calls `next` without short-circuiting, the
//     pipeline returns a default 200 response.
//  5. `PipelineResponse` is a discriminated union of `OkResponse` and
//     `ErrorResponse` (see stubs below).
//  6. `MiddlewareFn<TCtx, TPatch>` must be typed so that:
//       a. `ctx` is exactly `TCtx`.
//       b. `next` accepts only a value assignable to `TPatch` and
//          returns `Promise<PipelineResponse>`.
//       c. The middleware may return `Promise<PipelineResponse>` (to
//          short-circuit) or call `next` and return its result.
//  7. `createPipeline<TCtx>(initialCtx)` is the entry-point factory.
//     `TCtx` represents the INITIAL context shape.
//  8. Implement `withLogging`: a pre-built middleware that adds
//     `{ log: string[] }` to the context (appending a timestamp entry
//     on the way in) and must compile without errors when used as the
//     first middleware on any pipeline.
//  9. Implement `withAuth`: a pre-built middleware that reads
//     `ctx.token` (string) from the context, validates it is non-empty,
//     and either short-circuits with a 401 ErrorResponse or adds
//     `{ userId: string }` to the context (derive userId as
//     `"user-" + ctx.token` for this exercise).
// 10. Implement `withRateLimit`: a pre-built middleware that reads
//     `ctx.userId` (string) from the context (must already be present —
//     enforce this at the type level), checks a provided in-memory
//     `RateLimiter` store, and short-circuits with a 429 ErrorResponse
//     if the user has exceeded `maxRequests` within the window — otherwise
//     increments the counter and calls `next({})`.
// ============================================================

// --- Core response types ---

export type OkResponse = {
  readonly kind: "ok";
  readonly status: number;
  readonly body: unknown;
};

export type ErrorResponse = {
  readonly kind: "error";
  readonly status: number;
  readonly message: string;
};

export type PipelineResponse = OkResponse | ErrorResponse;

// --- Helper: deep-readonly context (contexts are never mutated in place) ---

export type Merge<A, B> = Omit<A, keyof B> & B;

// --- Middleware types ---

// TODO: Define `MiddlewareFn<TCtx, TPatch extends object>`
// It is a function (ctx: TCtx, next: NextFn<TCtx, TPatch>) => Promise<PipelineResponse>
// where NextFn<TCtx, TPatch> accepts a TPatch and returns Promise<PipelineResponse>
export type NextFn<TCtx, TPatch extends object> = (
  patch: TPatch
) => Promise<PipelineResponse>;

export type MiddlewareFn<TCtx, TPatch extends object> = (
  ctx: TCtx,
  next: NextFn<TCtx, TPatch>
) => Promise<PipelineResponse>;

// --- Pipeline builder ---

// TODO: Define `Pipeline<TCtx>` — a class or interface with:
//   .use<TPatch extends object>(fn: MiddlewareFn<TCtx, TPatch>): Pipeline<Merge<TCtx, TPatch>>
//   .run(ctx: TCtx): Promise<PipelineResponse>
export interface Pipeline<TCtx> {
  use<TPatch extends object>(
    fn: MiddlewareFn<TCtx, TPatch>
  ): Pipeline<Merge<TCtx, TPatch>>;
  run(ctx: TCtx): Promise<PipelineResponse>;
}

// TODO: Implement `createPipeline<TCtx>(): Pipeline<TCtx>`
// The returned Pipeline starts with zero middleware registered.
// Requirement 4: if no middleware short-circuits, resolve with
//   { kind: "ok", status: 200, body: null }
export function createPipeline<TCtx>(): Pipeline<TCtx> {
  // TODO: implement
  throw new Error("Not implemented");
}

// --- Rate limiter store (in-memory, provided to withRateLimit) ---

export type RateLimiterEntry = {
  count: number;
  windowStart: number; // Date.now() ms
};

export class RateLimiter {
  private store = new Map<string, RateLimiterEntry>();

  /** Returns true if the user is within the limit, and records the hit. */
  hit(userId: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.store.get(userId);
    if (!entry || now - entry.windowStart > windowMs) {
      this.store.set(userId, { count: 1, windowStart: now });
      return true;
    }
    if (entry.count >= maxRequests) return false;
    entry.count++;
    return true;
  }

  /** Reset a user's entry (useful for tests). */
  reset(userId: string): void {
    this.store.delete(userId);
  }
}

// --- Pre-built middleware ---

// TODO: Implement `withLogging`
// Adds `{ log: string[] }` to the context.
// On entry, push `[${new Date().toISOString()}] request received` into log.
// IMPORTANT: if the incoming context already has a `log` array, append to it;
// otherwise start a fresh array. The patch must always include the full `log` array.
export const withLogging: MiddlewareFn<
  object,
  { log: string[] }
> = async (ctx, next) => {
  // TODO: implement
  throw new Error("Not implemented");
};

// TODO: Implement `withAuth`
// Requires `ctx.token: string` to already be in the context.
// If token is empty → short-circuit with { kind: "error", status: 401, message: "Unauthorized" }
// Otherwise → next({ userId: "user-" + ctx.token })
export const withAuth: MiddlewareFn<
  { token: string },
  { userId: string }
> = async (ctx, next) => {
  // TODO: implement
  throw new Error("Not implemented");
};

// TODO: Implement `withRateLimit`
// Requires `ctx.userId: string` to already be in the context (enforced by TCtx).
// Uses the provided RateLimiter instance.
// If rate-limited → { kind: "error", status: 429, message: "Too Many Requests" }
// Otherwise → next({})
export function withRateLimit(
  limiter: RateLimiter,
  maxRequests: number,
  windowMs: number
): MiddlewareFn<{ userId: string }, Record<string, never>> {
  // TODO: implement
  throw new Error("Not implemented");
}
