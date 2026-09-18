// ============================================================
// Typed Middleware Pipeline with Context Propagation
// ============================================================
// REQUIREMENTS
// ------------
// 1. Define a `Middleware<TIn, TOut>` type that represents a function
//    receiving a context of shape TIn and a `next` function, and
//    returning a Promise<void>. Calling `next` must pass a context
//    that extends TIn with the additional properties TOut adds.
//
// 2. Implement `createPipeline`, a generic builder that accepts an
//    initial context value and lets the caller chain `.use(middleware)`
//    calls, accumulating context types at each step (TIn → TIn & TOut).
//    The pipeline must carry the accumulated type through each `.use()`
//    so that downstream middleware can read all previously added fields.
//
// 3. Implement `.run(handler)` which executes the middleware chain in
//    order and finally calls the typed handler with the fully-enriched
//    context. `handler` must accept exactly the accumulated context type.
//
// 4. Implement the following four concrete middleware factories:
//
//    a) `withRequestId(prefix: string)` — appends `{ requestId: string }`
//       to the context (e.g. "req_abc123").
//
//    b) `withAuth(token: string)` — validates the token (non-empty string
//       = valid). If invalid, throws an `AuthError`. If valid, appends
//       `{ userId: string; role: "admin" | "user" }`. For the mock, derive
//       userId as `"user_${token.length}"` and role as `"admin"` when
//       token starts with "admin_", otherwise `"user"`.
//
//    c) `withTimestamp()` — appends `{ timestamp: number }` (Date.now()).
//
//    d) `withParsedBody<T>(parser: (raw: string) => T)` — reads
//       `ctx.rawBody` (must already exist on context) and appends
//       `{ body: T }`. The compiler must enforce that `rawBody: string`
//       is present on TIn before this middleware can be used.
//
// 5. Define a typed `AuthError` class (extends Error) with a `code`
//    property of literal type "UNAUTHORIZED".
//
// 6. No `any`, `as`, or non-null assertions (!). strict: true.
// ============================================================

// --------------- Error Types ---------------

export class AuthError extends Error {
  readonly code = "UNAUTHORIZED" as const;
  // TODO: implement constructor(message: string)
}

// --------------- Core Types ---------------

/**
 * A middleware function that receives the current context TIn and a
 * `next` function. Calling next(enrichedCtx) passes control forward.
 * TODO: define Middleware<TIn, TOut>
 */
export type Middleware<TIn, TOut> = unknown; // TODO: replace with correct type

/**
 * The pipeline builder returned by createPipeline.
 * TODO: define Pipeline<TCtx>
 *
 * Requirements:
 *  - .use<TOut>(mw: Middleware<TCtx, TOut>): Pipeline<TCtx & TOut>
 *  - .run(handler: (ctx: TCtx) => Promise<void>): Promise<void>
 */
export type Pipeline<TCtx> = unknown; // TODO: replace with correct type

// --------------- Core Implementation ---------------

/**
 * Creates a new middleware pipeline seeded with `initialCtx`.
 * TODO: implement createPipeline
 */
export function createPipeline<TCtx extends object>(
  initialCtx: TCtx
): Pipeline<TCtx> {
  // TODO: implement
  throw new Error("Not implemented");
}

// --------------- Concrete Middleware ---------------

/**
 * Appends { requestId: string } to the context.
 * TODO: implement withRequestId
 */
export function withRequestId(
  prefix: string
): Middleware<object, { requestId: string }> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * Validates token; throws AuthError if empty.
 * Appends { userId: string; role: "admin" | "user" }.
 * TODO: implement withAuth
 */
export function withAuth(
  token: string
): Middleware<object, { userId: string; role: "admin" | "user" }> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * Appends { timestamp: number } (Date.now()).
 * TODO: implement withTimestamp
 */
export function withTimestamp(): Middleware<object, { timestamp: number }> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * Reads ctx.rawBody (must exist on TIn!) and appends { body: T }.
 * The constraint `TIn extends { rawBody: string }` must be enforced
 * at the type level so this middleware cannot be used without rawBody.
 * TODO: implement withParsedBody
 */
export function withParsedBody<T, TIn extends { rawBody: string }>(
  parser: (raw: string) => T
): Middleware<TIn, { body: T }> {
  // TODO: implement
  throw new Error("Not implemented");
}
