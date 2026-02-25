// ============================================================
// Typed Middleware Pipeline Builder
// 2026-02-25 | Medium
// ============================================================
//
// SCENARIO:
// You are building the request-handling core of an internal HTTP
// gateway. Middleware functions transform a typed context object
// one step at a time. Your job is to compose them into a pipeline
// where each middleware's output type flows into the next
// middleware's input, all enforced at compile time.
//
// ============================================================
// CORE TYPES — do not modify
// ============================================================

/** A single middleware: receives a context of type In, returns Out. */
export type Middleware<In, Out> = (ctx: In) => Out;

/** A middleware that may do async work. */
export type AsyncMiddleware<In, Out> = (ctx: In) => Promise<Out>;

/**
 * Unwrap a Promise<T> to T; leave non-promise types unchanged.
 * REQUIREMENT 1 — implement this conditional type.
 */
export type Awaited_<T> = T extends Promise<infer U> ? U : T;

/**
 * Given a tuple of middleware types, compute the output type of
 * the final middleware in the pipeline.
 *
 * REQUIREMENT 2 — implement this recursive conditional type.
 *
 * Examples:
 *   PipelineOutput<[Middleware<A,B>, Middleware<B,C>]>  →  C
 *   PipelineOutput<[AsyncMiddleware<A,B>]>              →  Promise<B>
 *   PipelineOutput<[]>                                  →  never
 */
export type PipelineOutput<
  Middlewares extends readonly Middleware<unknown, unknown>[]
> = Middlewares extends readonly [...infer _Init, infer Last]
  ? Last extends Middleware<unknown, infer Out>
    ? Out
    : never
  : never;

// ============================================================
// RESULT TYPE
// ============================================================

/** Discriminated union returned by runPipeline. */
export type PipelineResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; step: number };

// ============================================================
// REQUIREMENT 3
// Implement `compose`:
//
// Takes exactly TWO middlewares and returns a new middleware
// whose input is the input of the first, and whose output is
// the output of the second. The intermediate type (output of
// the first / input of the second) must be inferred — no
// manual type parameters at call sites.
//
// Signature hint: compose<A, B, C>(f: Middleware<A,B>, g: Middleware<B,C>): Middleware<A,C>
// ============================================================

export function compose<A, B, C>(
  f: Middleware<A, B>,
  g: Middleware<B, C>
): Middleware<A, C> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// REQUIREMENT 4
// Implement `composeAsync`:
//
// Same as compose, but both middlewares are async. The returned
// middleware is also async, and intermediate values are properly
// awaited. No `any` allowed.
// ============================================================

export function composeAsync<A, B, C>(
  f: AsyncMiddleware<A, B>,
  g: AsyncMiddleware<B, C>
): AsyncMiddleware<A, C> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// REQUIREMENT 5
// Implement `runPipeline`:
//
// Accepts an INITIAL context value and an ordered array of
// synchronous middlewares. Runs each middleware in sequence,
// passing the output of one as the input to the next.
//
// - If a middleware throws, catch the error and return:
//     { ok: false, error: <message>, step: <0-based index> }
// - If all middlewares succeed, return:
//     { ok: true, value: <final output> }
//
// Constraints:
//   • The function must be generic — callers should not need
//     to supply type parameters manually.
//   • The array of middlewares uses the type:
//       Array<Middleware<unknown, unknown>>
//     because TypeScript cannot easily enforce chained tuple
//     types at runtime — that's fine. Focus on the return type.
//   • Return type must be PipelineResult<unknown> — you may
//     widen the value type here since the tuple constraint
//     is enforced at the compose/composeAsync level.
// ============================================================

export function runPipeline(
  initial: unknown,
  middlewares: Array<Middleware<unknown, unknown>>
): PipelineResult<unknown> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// REQUIREMENT 6 — Branded context type
//
// Define a branded type `AuthedContext` that extends a plain
// `RequestContext` with an `userId` field, and is branded so
// that an unauthed context cannot be passed where an authed
// one is expected.
//
// Then implement `withAuth`: a middleware that receives a
// `RequestContext`, checks that `headers["x-user-id"]` is a
// non-empty string, and returns an `AuthedContext` (or throws
// if missing).
// ============================================================

export type RequestContext = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  body: unknown;
};

/** TODO: declare the Brand helper type */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/** TODO: declare AuthedContext as a branded RequestContext + userId */
export type AuthedContext = Brand<RequestContext & { userId: string }, "AuthedContext">;

/** TODO: implement withAuth */
export const withAuth: Middleware<RequestContext, AuthedContext> = (ctx) => {
  // TODO: implement — throw if x-user-id header is missing or empty
  throw new Error("Not implemented");
};
