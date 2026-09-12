// ============================================================
// Typed Middleware Pipeline with Typed Context & Error Propagation
// ============================================================
// REQUIREMENTS
// 1. Define a discriminated-union `PipelineError` with at least four variants:
//    AuthError, RateLimitError, ValidationError, and UpstreamError.
//    Each variant must carry a unique `kind` literal and variant-specific fields.
//
// 2. Define a `Result<T, E>` generic type that is either
//    { ok: true; value: T } or { ok: false; error: E }.
//
// 3. Define a `Context` base type and a family of "enriched" context types
//    using intersection types or mapped/conditional types so that each
//    middleware layer can NARROW the context type it receives and WIDEN it
//    for downstream middleware.
//    Concretely you need:
//      - RawContext        — only { requestId: string; path: string; method: HttpMethod }
//      - AuthedContext     — RawContext & { userId: string; roles: Role[] }
//      - RateLimitedContext — AuthedContext & { remainingQuota: number }
//      - ValidatedContext  — RateLimitedContext & { body: unknown }
//
// 4. Define an `HttpMethod` union: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
//
// 5. Define a `Role` union: "admin" | "editor" | "viewer"
//
// 6. A `Middleware<In, Out>` is an async function that receives a context of
//    type `In` and returns `Result<Out, PipelineError>`.
//    Type it so that `Out` must extend `In` (i.e. middleware can only ADD fields).
//
// 7. Implement `composePipeline` — a function that accepts a tuple of middleware
//    and chains them left-to-right, threading the context through each step.
//    If any middleware returns { ok: false }, the pipeline short-circuits and
//    returns that error immediately.
//    The function signature must be FULLY GENERIC so the compiler infers the
//    correct input and output context types from the middleware tuple.
//    Provide at minimum these two overloads:
//      composePipeline(m1, m2)         → pipeline from In1 to Out2
//      composePipeline(m1, m2, m3)     → pipeline from In1 to Out3
//    (You may add a fourth overload or a variadic fallback as a stretch goal.)
//
// 8. Implement `runPipeline<In, Out>` — given a composed pipeline and an initial
//    context of type `In`, execute it and return `Promise<Result<Out, PipelineError>>`.
//
// 9. Implement `matchError` — an exhaustive pattern-match helper that accepts a
//    `PipelineError` and a record of handlers (one per `kind`), and returns the
//    result of the matching handler. The compiler must enforce that ALL variants
//    are handled (no missing keys, no excess keys).
//
// 10. Implement `createAuthMiddleware`, `createRateLimitMiddleware`, and
//     `createValidationMiddleware` — factory functions that return correctly typed
//     `Middleware` instances. Each must validate its preconditions and return the
//     appropriate `PipelineError` variant on failure.
//
// ============================================================

// --- 4. HttpMethod ---
export type HttpMethod = // TODO

// --- 5. Role ---
export type Role = // TODO

// --- 1. PipelineError discriminated union ---
// AuthError fields:      kind, message, requiredRoles
// RateLimitError fields: kind, message, retryAfterMs
// ValidationError fields: kind, message, fields (array of invalid field names)
// UpstreamError fields:  kind, message, statusCode, upstreamService
export type PipelineError = // TODO

// --- 2. Result<T, E> ---
export type Result<T, E> = // TODO

// --- 3. Context family ---
export type RawContext = // TODO
export type AuthedContext = // TODO
export type RateLimitedContext = // TODO
export type ValidatedContext = // TODO

// --- 6. Middleware<In, Out> ---
// Constraint: Out extends In
export type Middleware<In, Out extends In> = // TODO

// --- 7. composePipeline overloads ---
// Return type should be Middleware<In1, OutN> for each overload.
export function composePipeline<
  In1,
  Out1 extends In1,
  Out2 extends Out1
>(
  m1: Middleware<In1, Out1>,
  m2: Middleware<Out1, Out2>
): Middleware<In1, Out2>

export function composePipeline<
  In1,
  Out1 extends In1,
  Out2 extends Out1,
  Out3 extends Out2
>(
  m1: Middleware<In1, Out1>,
  m2: Middleware<Out1, Out2>,
  m3: Middleware<Out2, Out3>
): Middleware<In1, Out3>

// TODO: implement the overloads above (and optionally a 4-middleware overload)
export function composePipeline(
  ...middlewares: Array<Middleware<unknown, unknown>>
): Middleware<unknown, unknown> {
  // TODO
  throw new Error("Not implemented");
}

// --- 8. runPipeline ---
export async function runPipeline<In, Out extends In>(
  pipeline: Middleware<In, Out>,
  initialContext: In
): Promise<Result<Out, PipelineError>> {
  // TODO
  throw new Error("Not implemented");
}

// --- 9. matchError ---
// Hint: use a mapped type over PipelineError["kind"] to build the handlers record.
type ErrorByKind<E extends PipelineError> = {
  [K in E["kind"]]: Extract<E, { kind: K }>
}

export type ErrorHandlers<E extends PipelineError, R> = {
  [K in E["kind"]]: (error: Extract<E, { kind: K }>) => R
}

export function matchError<R>(
  error: PipelineError,
  handlers: ErrorHandlers<PipelineError, R>
): R {
  // TODO
  throw new Error("Not implemented");
}

// --- 10. Middleware factories ---

// Auth middleware: checks that a token exists in the raw context (simulate via
// a lookup map). Returns AuthedContext on success, AuthError on failure.
export function createAuthMiddleware(
  tokenUserMap: Record<string, { userId: string; roles: Role[] }>
): Middleware<RawContext & { token?: string }, AuthedContext> {
  // TODO
  throw new Error("Not implemented");
}

// Rate-limit middleware: checks that a userId's request count (from a provided
// counter map) is below a given limit. Returns RateLimitedContext on success,
// RateLimitError on failure.
export function createRateLimitMiddleware(
  requestCounts: Record<string, number>,
  limitPerWindow: number,
  retryAfterMs: number
): Middleware<AuthedContext, RateLimitedContext> {
  // TODO
  throw new Error("Not implemented");
}

// Validation middleware: checks that `body` is a non-null object and that all
// `requiredFields` exist as own keys. Returns ValidatedContext on success,
// ValidationError on failure.
export function createValidationMiddleware(
  body: unknown,
  requiredFields: string[]
): Middleware<RateLimitedContext, ValidatedContext> {
  // TODO
  throw new Error("Not implemented");
}
