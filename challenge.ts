// ============================================================
// Typed Middleware Pipeline with Typed Context & Error Boundaries
// ============================================================
// REQUIREMENTS
// 1. Define a branded `RequestId` type (string brand).
// 2. Define the discriminated union `PipelineError` covering at least:
//    - AuthError   { kind: "auth";       message: string; statusCode: 401 | 403 }
//    - RateLimitError { kind: "rate_limit"; retryAfterMs: number }
//    - ValidationError { kind: "validation"; fields: string[]; message: string }
//    - UpstreamError  { kind: "upstream";   cause: unknown; statusCode: number }
// 3. Define `Result<T, E>` as a discriminated union ({ ok: true; value: T } | { ok: false; error: E }).
// 4. Define `BaseContext` with: requestId: RequestId, startedAt: number, path: string, method: HttpMethod.
//    `HttpMethod` must be a union of the 5 common HTTP verbs (GET POST PUT PATCH DELETE).
// 5. Define the `Middleware<In, Out>` type:
//    - It is an async function that receives a context of type `In`
//      and a `next` function that accepts `Out` and returns Promise<Result<FinalOutput, PipelineError>>.
//    - It returns Promise<Result<FinalOutput, PipelineError>>.
//    - `FinalOutput` is a generic the whole pipeline shares (see Pipeline class).
// 6. Implement `Pipeline<Ctx, FinalOutput>`:
//    - Constructor accepts an initial context factory: () => Ctx.
//    - `.use<NextCtx>(mw: Middleware<Ctx, NextCtx, FinalOutput>): Pipeline<NextCtx, FinalOutput>`
//      Returns a NEW Pipeline whose context is now `NextCtx` (the enriched context).
//    - `.run(): Promise<Result<FinalOutput, PipelineError>>`
//      Executes the chain. If a middleware returns an `{ ok: false }` result it short-circuits
//      immediately (subsequent middleware are NOT called).
// 7. Implement three concrete middleware factories:
//    a. `withAuth(token: string): Middleware<BaseContext, AuthedContext, FinalOutput>`
//       - Adds `userId: string` and `roles: string[]` to context.
//       - Returns AuthError if token === "invalid".
//    b. `withRateLimit(limitPerMinute: number): Middleware<AuthedContext, AuthedContext, FinalOutput>`
//       - Simulates a rate-limit check: always passes in tests, but if limitPerMinute === 0
//         returns a RateLimitError with retryAfterMs: 60_000.
//       - Does NOT add new fields; Out === In.
//    c. `withBodyValidation<B>(validate: (raw: unknown) => B | null, body: unknown):
//         Middleware<AuthedContext, ValidatedContext<B>, FinalOutput>`
//       - Adds `body: B` to context.
//       - Returns ValidationError (fields: ["body"], message: "Invalid body") if validate returns null.
// 8. All types must satisfy strict: true with no `any`, no `as`, no non-null assertions.

// ── Branded type ────────────────────────────────────────────
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// TODO: Define RequestId
export type RequestId = Brand<string, "RequestId">;
export function makeRequestId(raw: string): RequestId {
  // TODO: return raw as RequestId — hint: use the Brand helper, not `as`
  throw new Error("TODO");
}

// ── HTTP Method ──────────────────────────────────────────────
// TODO: Define HttpMethod union
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; // already done — extend if needed

// ── Result<T, E> ─────────────────────────────────────────────
// TODO: Define Result<T, E>
export type Result<T, E> = never; // replace with correct discriminated union

// ── PipelineError ─────────────────────────────────────────────
// TODO: Define each error variant and the union
export type AuthError = never;        // replace
export type RateLimitError = never;   // replace
export type ValidationError = never;  // replace
export type UpstreamError = never;    // replace
export type PipelineError =
  | AuthError
  | RateLimitError
  | ValidationError
  | UpstreamError;

// ── Contexts ──────────────────────────────────────────────────
export type BaseContext = {
  // TODO: fill in (requestId, startedAt, path, method)
};

export type AuthedContext = BaseContext & {
  // TODO: add userId and roles
};

export type ValidatedContext<B> = AuthedContext & {
  // TODO: add body: B
};

// ── Middleware type ───────────────────────────────────────────
// Requirement 5: Middleware<In, Out, FinalOutput>
// `next` receives the enriched context (Out) and returns the pipeline's final Result.
export type Middleware<In, Out, FinalOutput> = (
  ctx: In,
  next: (enriched: Out) => Promise<Result<FinalOutput, PipelineError>>
) => Promise<Result<FinalOutput, PipelineError>>;

// ── Pipeline class ────────────────────────────────────────────
// TODO: Implement Pipeline<Ctx, FinalOutput>
export class Pipeline<Ctx, FinalOutput> {
  // TODO: store context factory and the composed middleware chain

  constructor(
    private readonly contextFactory: () => Ctx,
    // hint: you may need an internal "runner" that accepts the current ctx
    // and returns Promise<Result<FinalOutput, PipelineError>>
  ) {
    throw new Error("TODO");
  }

  /**
   * Attach the next middleware, returning a new Pipeline whose context is NextCtx.
   */
  use<NextCtx>(
    mw: Middleware<Ctx, NextCtx, FinalOutput>
  ): Pipeline<NextCtx, FinalOutput> {
    // TODO
    throw new Error("TODO");
  }

  /**
   * Execute the pipeline.
   * The LAST middleware in the chain must call next() with the final context,
   * and the outermost `run()` wires up a terminal `next` that resolves the FinalOutput
   * from the context itself.
   *
   * Hint: design your terminal `next` to return { ok: true, value: ctx as FinalOutput }
   * when Ctx === FinalOutput, or require callers to pass a resolver.
   *
   * Alternative (recommended): accept an optional terminal handler:
   */
  run(
    terminal: (ctx: Ctx) => Promise<Result<FinalOutput, PipelineError>>
  ): Promise<Result<FinalOutput, PipelineError>> {
    // TODO
    throw new Error("TODO");
  }
}

// ── Concrete middleware factories ─────────────────────────────

// Requirement 7a
export function withAuth<FinalOutput>(
  token: string
): Middleware<BaseContext, AuthedContext, FinalOutput> {
  // TODO
  throw new Error("TODO");
}

// Requirement 7b
export function withRateLimit<FinalOutput>(
  limitPerMinute: number
): Middleware<AuthedContext, AuthedContext, FinalOutput> {
  // TODO
  throw new Error("TODO");
}

// Requirement 7c
export function withBodyValidation<B, FinalOutput>(
  validate: (raw: unknown) => B | null,
  body: unknown
): Middleware<AuthedContext, ValidatedContext<B>, FinalOutput> {
  // TODO
  throw new Error("TODO");
}

// ── Helper constructors ───────────────────────────────────────
export function ok<T, E>(value: T): Result<T, E> {
  // TODO
  throw new Error("TODO");
}

export function err<T, E>(error: E): Result<T, E> {
  // TODO
  throw new Error("TODO");
}
