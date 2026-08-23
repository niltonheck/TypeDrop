// ============================================================
// Typed Middleware Pipeline with Branded Types & Conditional Inference
// ============================================================
// REQUIREMENTS
// 1. Define a `Brand<T, B>` utility that creates a nominal/branded primitive type.
// 2. Define branded types: `RequestId`, `UserId`, and `AuthToken` (all branded strings).
// 3. Define the base `RawContext` and progressively enriched context types using
//    intersection types so each middleware stage adds its own fields.
// 4. Implement `MiddlewareFn<In, Out, E>` — a function type that takes a context of
//    type `In` and returns `Promise<MiddlewareResult<Out, E>>`.
// 5. Implement the `MiddlewareResult<T, E>` discriminated union:
//    - `{ status: "continue"; ctx: T }` — pass enriched context to the next stage
//    - `{ status: "halt"; error: E }` — short-circuit with a typed error
// 6. Implement `GatewayError` as a discriminated union covering at least:
//    - `{ kind: "unauthenticated"; message: string }`
//    - `{ kind: "rate_limited"; retryAfterMs: number }`
//    - `{ kind: "parse_error"; field: string; reason: string }`
//    - `{ kind: "forbidden"; requiredRole: string }`
// 7. Implement `composeMiddleware<Stages extends readonly MiddlewareFn<unknown, unknown, GatewayError>[]>`:
//    a generic function that accepts a tuple of middleware functions and returns a single
//    composed async function. The composed function must thread the context through each
//    stage in order, halting (and returning the error) on the first `"halt"` result.
//    Use conditional types / `infer` to extract the output context type of the LAST
//    middleware in the tuple.
// 8. Implement the four concrete middleware functions with the correct input/output context
//    types (see stubs below). Each function must only access fields that exist on its
//    specific `In` type.
// 9. Implement `handleRequest` which composes all four middleware in order and runs a
//    final handler only if all stages succeed.
// 10. Implement `matchGatewayError` — an exhaustive pattern-match helper that maps every
//     `GatewayError` variant to an HTTP-style `{ statusCode: number; body: string }`.

import { randomUUID } from "crypto";

// ------------------------------------------------------------------
// 1. Branding utility
// ------------------------------------------------------------------

// TODO: Define Brand<T, B> so that Brand<string, "RequestId"> is distinct from plain string.
export type Brand<T, B extends string> = never; // replace `never`

// TODO: Define the three branded string types.
export type RequestId = never; // replace
export type UserId    = never; // replace
export type AuthToken = never; // replace

// ------------------------------------------------------------------
// 2. Context shapes (progressive enrichment via intersections)
// ------------------------------------------------------------------

/** The raw context that exists before any middleware runs. */
export type RawContext = {
  requestId: RequestId;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  headers: Readonly<Record<string, string>>;
  rawBody: string;
};

/** After authentication middleware — token has been validated. */
export type AuthedContext = RawContext & {
  authToken: AuthToken;
  userId: UserId;
};

/** After rate-limit middleware — quota has been checked. */
export type RateLimitedContext = AuthedContext & {
  remainingQuota: number;
};

/** After body-parsing middleware — body has been decoded. */
export type ParsedContext = RateLimitedContext & {
  parsedBody: unknown; // intentionally `unknown`; downstream must narrow
};

// ------------------------------------------------------------------
// 3. Middleware result & function types
// ------------------------------------------------------------------

// TODO: Define MiddlewareResult<T, E> as a discriminated union.
export type MiddlewareResult<T, E> = never; // replace

// TODO: Define MiddlewareFn<In, Out, E>.
// A middleware takes a context of type In and returns Promise<MiddlewareResult<Out, E>>.
export type MiddlewareFn<In, Out, E> = never; // replace

// ------------------------------------------------------------------
// 4. GatewayError discriminated union
// ------------------------------------------------------------------

// TODO: Define GatewayError covering the four variants described in requirement 6.
export type GatewayError = never; // replace

// ------------------------------------------------------------------
// 5. composeMiddleware
// ------------------------------------------------------------------

// Helper type: given a tuple of MiddlewareFn, infer the output context of the LAST element.
// TODO: Define LastOutput<T> using conditional types and `infer`.
// Hint: you may need a recursive or indexed approach.
export type LastOutput<T extends readonly MiddlewareFn<unknown, unknown, GatewayError>[]> = never; // replace

/**
 * Composes an ordered tuple of middleware into a single async function.
 * Threads context through each stage; halts on the first error.
 *
 * TODO: Implement this function.
 * The return type should be inferred as:
 *   (ctx: RawContext) => Promise<MiddlewareResult<LastOutput<Stages>, GatewayError>>
 */
export function composeMiddleware<
  const Stages extends readonly MiddlewareFn<unknown, unknown, GatewayError>[]
>(stages: Stages): (ctx: RawContext) => Promise<MiddlewareResult<LastOutput<Stages>, GatewayError>> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. Concrete middleware implementations
// ------------------------------------------------------------------

/**
 * Reads the `Authorization: Bearer <token>` header.
 * Halts with `{ kind: "unauthenticated" }` if missing or malformed.
 * On success, adds `authToken` and `userId` to the context.
 *
 * For the stub: treat any token that starts with "valid-" as authenticated;
 * extract userId as the substring after "valid-" (branded appropriately).
 *
 * TODO: Implement.
 */
export const authMiddleware: MiddlewareFn<RawContext, AuthedContext, GatewayError> = async (_ctx) => {
  throw new Error("Not implemented");
};

/**
 * Checks a simple in-memory rate-limit map (provided as a closure or module-level var).
 * Halts with `{ kind: "rate_limited"; retryAfterMs: ... }` if the userId has exceeded
 * the limit (> 5 calls tracked in the module-level map below).
 * On success, adds `remainingQuota` to the context.
 *
 * TODO: Implement.
 */
export const rateLimitMap = new Map<UserId, number>();

export const rateLimitMiddleware: MiddlewareFn<AuthedContext, RateLimitedContext, GatewayError> = async (_ctx) => {
  throw new Error("Not implemented");
};

/**
 * Attempts `JSON.parse(ctx.rawBody)`.
 * Halts with `{ kind: "parse_error"; field: "rawBody"; reason: ... }` on failure.
 * On success, adds `parsedBody` to the context.
 *
 * TODO: Implement.
 */
export const bodyParserMiddleware: MiddlewareFn<RateLimitedContext, ParsedContext, GatewayError> = async (_ctx) => {
  throw new Error("Not implemented");
};

/**
 * Checks that `parsedBody` is an object with a `role` field equal to `"admin"`.
 * Halts with `{ kind: "forbidden"; requiredRole: "admin" }` otherwise.
 * On success, returns the context unchanged (ParsedContext → ParsedContext).
 *
 * TODO: Implement.
 */
export const authzMiddleware: MiddlewareFn<ParsedContext, ParsedContext, GatewayError> = async (_ctx) => {
  throw new Error("Not implemented");
};

// ------------------------------------------------------------------
// 7. handleRequest
// ------------------------------------------------------------------

export type FinalHandler = (ctx: ParsedContext) => Promise<{ statusCode: number; body: string }>;

/**
 * Composes all four middleware in order, then calls `handler` if all stages pass.
 * Returns a plain HTTP-style response object in all cases.
 *
 * TODO: Implement.
 */
export async function handleRequest(
  rawCtx: RawContext,
  handler: FinalHandler
): Promise<{ statusCode: number; body: string }> {
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 8. matchGatewayError — exhaustive error mapper
// ------------------------------------------------------------------

/**
 * Maps every GatewayError variant to an HTTP-style response.
 * Must be exhaustive — TypeScript should error if a variant is unhandled.
 *
 * Suggested mappings:
 *   unauthenticated → 401
 *   rate_limited    → 429
 *   parse_error     → 400
 *   forbidden       → 403
 *
 * TODO: Implement using a switch on `error.kind`.
 */
export function matchGatewayError(error: GatewayError): { statusCode: number; body: string } {
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. Helper: makeRequestId (provided — no changes needed)
// ------------------------------------------------------------------
export function makeRequestId(): RequestId {
  return randomUUID() as unknown as RequestId; // sole allowed cast — in provided code
}
