// ============================================================
// Typed Middleware Pipeline with Context Narrowing
// challenge.ts
// ============================================================
// REQUIREMENTS
// 1. A middleware is a function that receives a context of type `In`,
//    and returns a Promise resolving to either:
//    - A "next" result carrying an enriched context of type `Out`, or
//    - A "halt" result carrying a typed error — halting the pipeline.
//
// 2. `createPipeline` must accept an ordered tuple of middleware functions
//    where each step's output context type feeds into the next step's
//    input context type. The compiler must reject pipelines where adjacent
//    middleware types are incompatible.
//
// 3. `createPipeline` returns a `run` function. When called with an
//    initial context, it executes middleware in order. If any step halts,
//    the pipeline short-circuits and returns the typed halt error. If all
//    steps pass, the final enriched context is returned.
//
// 4. The `run` return type must be a discriminated union:
//    `PipelineResult<FinalCtx, PipelineError>` — where `FinalCtx` is
//    the output context of the LAST middleware in the tuple.
//
// 5. Implement three concrete middleware for a real-world auth flow:
//    - `parseTokenMiddleware`  : BaseCtx  → TokenCtx  (extracts a bearer token)
//    - `verifyTokenMiddleware` : TokenCtx → AuthCtx   (validates the token)
//    - `loadUserMiddleware`    : AuthCtx  → UserCtx   (attaches a user record)
//
// 6. Implement `createPipeline` and wire the three middleware above into
//    `authPipeline`. The compiler must infer that `authPipeline.run`
//    returns `Promise<PipelineResult<UserCtx, PipelineError>>`.
//
// 7. No `any`, no type assertions (`as`), no non-null assertions (`!`).
// ============================================================

// ------------------------------------------------------------------
// Core result types
// ------------------------------------------------------------------

export type NextResult<Out> = {
  kind: "next";
  ctx: Out;
};

export type HaltResult<E> = {
  kind: "halt";
  error: E;
};

export type MiddlewareResult<Out, E> = NextResult<Out> | HaltResult<E>;

// ------------------------------------------------------------------
// Typed pipeline error hierarchy  (discriminated union)
// ------------------------------------------------------------------

export type MissingTokenError = {
  code: "MISSING_TOKEN";
  message: string;
};

export type InvalidTokenError = {
  code: "INVALID_TOKEN";
  message: string;
  raw: string;
};

export type UserNotFoundError = {
  code: "USER_NOT_FOUND";
  message: string;
  userId: string;
};

export type PipelineError = MissingTokenError | InvalidTokenError | UserNotFoundError;

// ------------------------------------------------------------------
// Middleware type
// ------------------------------------------------------------------

// TODO: Define the `Middleware<In, Out, E>` type alias.
// A middleware is an async function: (ctx: In) => Promise<MiddlewareResult<Out, E>>
export type Middleware<In, Out, E> = /* TODO */ never;

// ------------------------------------------------------------------
// Helper types for pipeline tuple inference
// ------------------------------------------------------------------

// TODO: Define `MiddlewareTuple<Steps>` — a recursive conditional type
// that validates an ordered tuple of middleware, ensuring each step's
// output context flows into the next step's input context.
//
// Hint: You'll need to use `infer` to extract In/Out types from each
// Middleware and recurse over the tuple.
//
// `Steps` should extend `readonly Middleware<unknown, unknown, PipelineError>[]`
// (or a suitable constraint).

// TODO: Define `FinalCtx<Steps>` — extracts the output context type
// of the LAST middleware in the tuple.

// TODO: Define `InitialCtx<Steps>` — extracts the input context type
// of the FIRST middleware in the tuple.

// ------------------------------------------------------------------
// Pipeline result
// ------------------------------------------------------------------

export type PipelineResult<Ctx, E> =
  | { outcome: "success"; ctx: Ctx }
  | { outcome: "halted"; error: E };

// ------------------------------------------------------------------
// Pipeline factory
// ------------------------------------------------------------------

// TODO: Implement `createPipeline`.
//
// Signature sketch (you must refine the generics):
//
//   function createPipeline<Steps extends ...>(
//     steps: MiddlewareTuple<Steps>
//   ): {
//     run: (initialCtx: InitialCtx<Steps>) => Promise<PipelineResult<FinalCtx<Steps>, PipelineError>>
//   }
//
// Requirements:
// - Execute middleware sequentially, passing each step's output ctx to the next.
// - On the first `halt`, short-circuit and return `{ outcome: "halted", error }`.
// - On full completion, return `{ outcome: "success", ctx: <final ctx> }`.
export function createPipeline(/* TODO */): never {
  throw new Error("TODO: implement createPipeline");
}

// ------------------------------------------------------------------
// Concrete context types for the auth flow
// ------------------------------------------------------------------

export type BaseCtx = {
  requestId: string;
  headers: Record<string, string>;
};

export type TokenCtx = BaseCtx & {
  token: string;
};

export type AuthCtx = TokenCtx & {
  userId: string;
  scopes: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
};

export type UserCtx = AuthCtx & {
  user: User;
};

// ------------------------------------------------------------------
// Mock data helpers (use these inside your middleware implementations)
// ------------------------------------------------------------------

const VALID_TOKENS: Record<string, { userId: string; scopes: string[] }> = {
  "tok_abc123": { userId: "u_001", scopes: ["read", "write"] },
  "tok_viewer": { userId: "u_002", scopes: ["read"] },
};

const USER_DB: Record<string, User> = {
  "u_001": { id: "u_001", name: "Alice Admin", email: "alice@example.com", role: "admin" },
  "u_002": { id: "u_002", name: "Bob Viewer", email: "bob@example.com", role: "viewer" },
};

// ------------------------------------------------------------------
// Concrete middleware implementations
// ------------------------------------------------------------------

// TODO: Implement `parseTokenMiddleware`.
// - Look for an "authorization" header in `ctx.headers`.
// - If present and starts with "Bearer ", extract the token string.
// - Otherwise, halt with a `MissingTokenError`.
export const parseTokenMiddleware: Middleware<BaseCtx, TokenCtx, PipelineError> =
  async (_ctx) => {
    throw new Error("TODO: implement parseTokenMiddleware");
  };

// TODO: Implement `verifyTokenMiddleware`.
// - Look up `ctx.token` in `VALID_TOKENS`.
// - If found, enrich with `userId` and `scopes`.
// - Otherwise, halt with an `InvalidTokenError` (include the raw token).
export const verifyTokenMiddleware: Middleware<TokenCtx, AuthCtx, PipelineError> =
  async (_ctx) => {
    throw new Error("TODO: implement verifyTokenMiddleware");
  };

// TODO: Implement `loadUserMiddleware`.
// - Look up `ctx.userId` in `USER_DB`.
// - If found, attach the `user` record.
// - Otherwise, halt with a `UserNotFoundError` (include the userId).
export const loadUserMiddleware: Middleware<AuthCtx, UserCtx, PipelineError> =
  async (_ctx) => {
    throw new Error("TODO: implement loadUserMiddleware");
  };

// ------------------------------------------------------------------
// Wire up the auth pipeline
// ------------------------------------------------------------------

// TODO: Create `authPipeline` using `createPipeline` with the three
// middleware above, in order. The inferred type of `authPipeline.run`
// must be:
//   (initialCtx: BaseCtx) => Promise<PipelineResult<UserCtx, PipelineError>>
export const authPipeline = createPipeline(/* TODO */);
