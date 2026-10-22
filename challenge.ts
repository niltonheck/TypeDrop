// ============================================================
// Typed Middleware Pipeline with Context Propagation
// ============================================================
// SCENARIO:
// You're building the request-processing backbone for an HTTP gateway.
// Each middleware layer declares what context keys it READS and WRITES.
// The compiler must:
//  1. Accumulate context contributions across the pipeline in order.
//  2. Reject any middleware that reads a key not yet written by a prior layer.
//  3. Reject a final handler that references keys absent from the accumulated context.
//  4. Produce a fully typed accumulated context at every stage.
//
// REQUIREMENTS (implement each marked TODO):
// ============================================================

// ------------------------------------------------------------------
// § 1 — Core domain types (do NOT change these)
// ------------------------------------------------------------------

/** A raw incoming HTTP-like request. */
export interface RawRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
}

/** A response produced by the final handler. */
export interface PipelineResponse {
  status: number;
  body: unknown;
}

// ------------------------------------------------------------------
// § 2 — Context accumulation helpers
// ------------------------------------------------------------------

/**
 * TODO 1 — `Spread<A, B>`
 * A utility type that merges two object types, with B's keys overriding A's.
 * Equivalent to `Omit<A, keyof B> & B` but expressed as a clean mapped type
 * so that the result is a single flat object type (not an intersection).
 *
 * Example:
 *   Spread<{ a: number; b: string }, { b: boolean; c: Date }>
 *   // => { a: number; b: boolean; c: Date }
 */
export type Spread<A extends object, B extends object> = {
  // TODO: implement
  [K in keyof A | keyof B]: K extends keyof B ? B[K] : K extends keyof A ? A[K] : never;
};

/**
 * TODO 2 — `AccumulateContext<Middlewares, Ctx>`
 * A recursive conditional type that walks a tuple of middleware descriptors
 * and accumulates their `writes` into the context type, left to right.
 *
 * `Middlewares` is a tuple of `MiddlewareDescriptor<any, any>` (defined below).
 * `Ctx` is the context accumulated so far (starts as `{}`).
 *
 * Base case: empty tuple → return `Ctx`.
 * Recursive case: take the head, spread its `writes` into `Ctx`, recurse on tail.
 */
export type MiddlewareDescriptor<
  Reads extends object,
  Writes extends object
> = {
  reads: Reads;   // phantom — shape of context keys this middleware needs
  writes: Writes; // phantom — shape of keys this middleware contributes
};

export type AccumulateContext<
  Middlewares extends MiddlewareDescriptor<object, object>[],
  Ctx extends object = {}
> = Middlewares extends [
  infer Head extends MiddlewareDescriptor<object, object>,
  ...infer Tail extends MiddlewareDescriptor<object, object>[]
]
  ? AccumulateContext<Tail, Spread<Ctx, Head["writes"]>>
  : Ctx; // TODO: implement (the stub above is the skeleton — fill in the body)

/**
 * TODO 3 — `VerifyReads<Reads, Ctx>`
 * Produces `true` if every key of `Reads` is present in `Ctx`, `false` otherwise.
 * Use a mapped + conditional type approach (no `extends keyof` shortcut in one step).
 *
 * Hint: map over `keyof Reads` and check each against `keyof Ctx`,
 * then reduce with `[keyof Reads] extends [never] ? true : ...`.
 */
export type VerifyReads<Reads extends object, Ctx extends object> =
  // TODO: implement
  keyof Reads extends keyof Ctx ? true : false;

// ------------------------------------------------------------------
// § 3 — Middleware handler shape
// ------------------------------------------------------------------

/**
 * A middleware function receives:
 *  - `req`  — the raw request
 *  - `ctx`  — the accumulated context so far (typed as `Ctx`)
 *  - `next` — calls the next layer with the updated context
 *
 * It must return a `PipelineResponse` (possibly async).
 */
export type MiddlewareFn<Ctx extends object, Contribution extends object> = (
  req: RawRequest,
  ctx: Ctx,
  next: (contribution: Contribution) => Promise<PipelineResponse>
) => Promise<PipelineResponse>;

// ------------------------------------------------------------------
// § 4 — Pipeline builder
// ------------------------------------------------------------------

/**
 * TODO 4 — `Pipeline<Middlewares>`
 * A class (or interface — your choice) that:
 *
 *  a) Has a static or instance `.use<Reads, Writes>(fn: MiddlewareFn<Reads, Writes>)`
 *     method that appends a middleware to the pipeline.
 *
 *     Constraints enforced by the compiler:
 *       - `Reads` must be satisfied by the CURRENT accumulated context.
 *         If `VerifyReads<Reads, CurrentCtx>` is `false`, the type of `fn`
 *         should become `never` (making the call a type error).
 *       - After `.use(...)`, the returned `Pipeline` has an updated
 *         `Middlewares` tuple reflecting the new descriptor.
 *
 *  b) Has a `.handle<Reads>(handler: FinalHandler<Reads, AccumulatedCtx>)`
 *     method that:
 *       - Accepts a `FinalHandler` (defined below) whose `Reads` must be
 *         satisfied by the fully accumulated context.
 *       - Returns an `ExecutablePipeline` (defined below).
 *
 * You may introduce additional helper types as needed.
 */

/** The final handler — no `next`, just produces a response. */
export type FinalHandler<Ctx extends object> = (
  req: RawRequest,
  ctx: Ctx
) => Promise<PipelineResponse>;

/** A built pipeline ready to execute. */
export interface ExecutablePipeline {
  execute(req: RawRequest): Promise<PipelineResponse>;
}

/**
 * TODO 4 (continued) — implement the `Pipeline` class.
 *
 * Requirements:
 *  - `use` must be generic over `Reads extends object` and `Writes extends object`.
 *  - The `fn` parameter type must be `VerifyReads<Reads, CurrentCtx> extends true
 *      ? MiddlewareFn<Reads, Writes>
 *      : never`
 *    so the compiler rejects middleware that reads keys not yet in the context.
 *  - `handle` must be generic over `Reads extends object`.
 *  - The `handler` parameter type must similarly guard on `VerifyReads`.
 *  - `execute` must run middleware in order, threading the context forward,
 *    and finally invoke the handler.
 *
 * You may use a runtime array of functions internally; the TYPE safety comes
 * from the generic parameter bookkeeping on the class itself.
 */
export class Pipeline<
  Middlewares extends MiddlewareDescriptor<object, object>[] = [],
  CurrentCtx extends object = {}
> {
  // TODO: store middleware fns at runtime
  private readonly _fns: MiddlewareFn<object, object>[];

  constructor(fns: MiddlewareFn<object, object>[] = []) {
    this._fns = fns;
  }

  /**
   * Append a middleware. Returns a new Pipeline with updated type params.
   * The `fn` parameter is `never` when `Reads` is not satisfied by `CurrentCtx`.
   */
  use<Reads extends object, Writes extends object>(
    fn: VerifyReads<Reads, CurrentCtx> extends true
      ? MiddlewareFn<Reads, Writes>
      : never
  ): Pipeline<[...Middlewares, MiddlewareDescriptor<Reads, Writes>], Spread<CurrentCtx, Writes>> {
    // TODO: implement — return a new Pipeline with fn appended
    return new Pipeline([...this._fns, fn as MiddlewareFn<object, object>]);
  }

  /**
   * Attach the final handler and build an ExecutablePipeline.
   * The `handler` parameter is `never` when `Reads` is not satisfied by `CurrentCtx`.
   */
  handle<Reads extends object>(
    handler: VerifyReads<Reads, CurrentCtx> extends true
      ? FinalHandler<Reads>
      : never
  ): ExecutablePipeline {
    // TODO: implement — return an object whose `execute` threads context through fns then calls handler
    const fns = this._fns;
    return {
      async execute(req: RawRequest): Promise<PipelineResponse> {
        // TODO: implement the recursive dispatch
        let ctx: object = {};

        const dispatch = async (index: number, currentCtx: object): Promise<PipelineResponse> => {
          if (index < fns.length) {
            return fns[index](req, currentCtx, async (contribution) => {
              return dispatch(index + 1, { ...currentCtx, ...contribution });
            });
          }
          return (handler as FinalHandler<object>)(req, currentCtx);
        };

        return dispatch(0, ctx);
      },
    };
  }
}

// ------------------------------------------------------------------
// § 5 — Concrete middleware factories (implement these)
// ------------------------------------------------------------------

/**
 * TODO 5a — `makeAuthMiddleware`
 * Reads: {} (no prior context needed)
 * Writes: { userId: string; role: "admin" | "user" }
 *
 * Runtime behaviour:
 *  - Reads `req.headers["x-user-id"]` and `req.headers["x-role"]`.
 *  - If either is missing, returns `{ status: 401, body: "Unauthorized" }` WITHOUT calling next.
 *  - If role is not "admin" or "user", returns `{ status: 403, body: "Forbidden" }`.
 *  - Otherwise calls `next({ userId, role })`.
 */
export function makeAuthMiddleware(): MiddlewareFn<
  {},
  { userId: string; role: "admin" | "user" }
> {
  // TODO: implement
  return async (req, _ctx, next) => {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-role"];
    if (!userId || !role) {
      return { status: 401, body: "Unauthorized" };
    }
    if (role !== "admin" && role !== "user") {
      return { status: 403, body: "Forbidden" };
    }
    return next({ userId, role: role as "admin" | "user" });
  };
}

/**
 * TODO 5b — `makeLoggingMiddleware`
 * Reads: { userId: string } (must come after auth)
 * Writes: { requestId: string; loggedAt: Date }
 *
 * Runtime behaviour:
 *  - Generates a `requestId` (you may use `Math.random().toString(36).slice(2)`).
 *  - Sets `loggedAt` to `new Date()`.
 *  - Logs `[requestId] userId=<userId> method=<method> path=<path>` to console.
 *  - Calls `next({ requestId, loggedAt })`.
 */
export function makeLoggingMiddleware(): MiddlewareFn<
  { userId: string },
  { requestId: string; loggedAt: Date }
> {
  // TODO: implement
  return async (req, ctx, next) => {
    const requestId = Math.random().toString(36).slice(2);
    const loggedAt = new Date();
    console.log(`[${requestId}] userId=${ctx.userId} method=${req.method} path=${req.path}`);
    return next({ requestId, loggedAt });
  };
}

/**
 * TODO 5c — `makeRateLimitMiddleware`
 * Reads: { role: "admin" | "user" } (must come after auth)
 * Writes: { remainingQuota: number }
 *
 * Runtime behaviour:
 *  - Admins get quota 1000, users get quota 100 (simple static rule).
 *  - Always calls `next({ remainingQuota })` (no actual blocking needed for this exercise).
 */
export function makeRateLimitMiddleware(): MiddlewareFn<
  { role: "admin" | "user" },
  { remainingQuota: number }
> {
  // TODO: implement
  return async (_req, ctx, next) => {
    const remainingQuota = ctx.role === "admin" ? 1000 : 100;
    return next({ remainingQuota });
  };
}

// ------------------------------------------------------------------
// § 6 — Final handler factory (implement this)
// ------------------------------------------------------------------

/**
 * TODO 6 — `makeEchoHandler`
 * Reads: { userId: string; requestId: string; remainingQuota: number }
 * (all three must be present in the accumulated context)
 *
 * Runtime behaviour:
 *  - Returns status 200 with body:
 *    { echo: req.body, userId, requestId, remainingQuota }
 */
export function makeEchoHandler(): FinalHandler<{
  userId: string;
  requestId: string;
  remainingQuota: number;
}> {
  // TODO: implement
  return async (req, ctx) => ({
    status: 200,
    body: {
      echo: req.body,
      userId: ctx.userId,
      requestId: ctx.requestId,
      remainingQuota: ctx.remainingQuota,
    },
  });
}

// ------------------------------------------------------------------
// § 7 — Assemble the pipeline (implement this)
// ------------------------------------------------------------------

/**
 * TODO 7 — `buildGatewayPipeline`
 * Compose the three middleware factories and the echo handler into a
 * single `ExecutablePipeline` using the `Pipeline` class.
 *
 * Order must be: auth → logging → rateLimit → echoHandler
 *
 * The compiler should accept this composition without errors.
 * Swapping the order (e.g. logging before auth) should be a TYPE ERROR.
 */
export function buildGatewayPipeline(): ExecutablePipeline {
  // TODO: implement
  return new Pipeline()
    .use(makeAuthMiddleware())
    .use(makeLoggingMiddleware())
    .use(makeRateLimitMiddleware())
    .handle(makeEchoHandler());
}
