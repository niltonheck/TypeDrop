// ============================================================
// Typed Middleware Pipeline with Typed Context & Error Boundaries
// challenge.ts
// ============================================================
// Rules:
//   - strict: true, NO `any`, NO type assertions (`as`), NO `@ts-ignore`
//   - All TODOs must be replaced with real implementations
//   - The test harness imports everything from this file
// ============================================================

// ------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------

// TODO: Define a branded type helper `Brand<T, Tag>` that produces a
//       nominal type from a base type T and a unique string tag.
//       e.g.  type UserId = Brand<string, "UserId">
export type Brand<T, Tag extends string> = T & { readonly __brand: Tag };

export type UserId   = Brand<string, "UserId">;
export type TraceId  = Brand<string, "TraceId">;
export type TenantId = Brand<string, "TenantId">;

// Helper constructors (already provided — do NOT change)
export const toUserId   = (s: string): UserId   => s as UserId;
export const toTraceId  = (s: string): TraceId  => s as TraceId;
export const toTenantId = (s: string): TenantId => s as TenantId;

// ------------------------------------------------------------
// 2. RAW REQUEST (arrives as `unknown` from the network layer)
// ------------------------------------------------------------

export interface RawRequest {
  readonly method: string;
  readonly path: string;
  readonly headers: Record<string, string>;
  readonly body: unknown;
}

// ------------------------------------------------------------
// 3. PIPELINE CONTEXT
//    Each middleware stage adds fields to a shared context.
//    Use intersection types / generics to accumulate them.
// ------------------------------------------------------------

// Base context — always present
export interface BaseContext {
  readonly traceId: TraceId;
  readonly rawRequest: RawRequest;
  readonly startedAt: number; // Date.now()
}

// Fields added by the auth middleware
export interface AuthFields {
  readonly userId: UserId;
  readonly tenantId: TenantId;
}

// Fields added by the rate-limit middleware
export interface RateLimitFields {
  readonly requestsRemaining: number;
  readonly windowResetAt: number;
}

// Fields added by the transform middleware
export interface TransformFields {
  readonly parsedBody: Record<string, unknown>;
}

// TODO: Define a type alias `FullContext` that is the intersection of
//       BaseContext & AuthFields & RateLimitFields & TransformFields.
export type FullContext = BaseContext & AuthFields & RateLimitFields & TransformFields;

// ------------------------------------------------------------
// 4. TYPED ERRORS (discriminated union)
// ------------------------------------------------------------

export type PipelineErrorKind =
  | "VALIDATION_ERROR"
  | "AUTH_ERROR"
  | "RATE_LIMIT_ERROR"
  | "TRANSFORM_ERROR"
  | "HANDLER_ERROR";

// TODO: Define `PipelineError<K extends PipelineErrorKind>` as a generic
//       interface with fields:
//         kind: K
//         message: string
//         traceId: TraceId
//         detail?: Record<string, unknown>
export interface PipelineError<K extends PipelineErrorKind> {
  readonly kind: K;
  readonly message: string;
  readonly traceId: TraceId;
  readonly detail?: Record<string, unknown>;
}

// Convenience union of all concrete error types
export type AnyPipelineError =
  | PipelineError<"VALIDATION_ERROR">
  | PipelineError<"AUTH_ERROR">
  | PipelineError<"RATE_LIMIT_ERROR">
  | PipelineError<"TRANSFORM_ERROR">
  | PipelineError<"HANDLER_ERROR">;

// ------------------------------------------------------------
// 5. RESULT TYPE
// ------------------------------------------------------------

// TODO: Define `Result<T, E>` as a discriminated union:
//         { ok: true;  value: T }
//       | { ok: false; error: E }
export type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

// ------------------------------------------------------------
// 6. MIDDLEWARE TYPE
// ------------------------------------------------------------

// A middleware takes a context of type `In`, and either:
//   - returns a Result<Out, AnyPipelineError> synchronously/asynchronously
//     where Out is In *extended* with additional fields, OR
//   - short-circuits with an error.
//
// TODO: Define `Middleware<In, Out extends In>` as a function type that
//       accepts `ctx: In` and returns `Promise<Result<Out, AnyPipelineError>>`.
export type Middleware<In, Out extends In> = (
  ctx: In
) => Promise<Result<Out, AnyPipelineError>>;

// ------------------------------------------------------------
// 7. VALIDATE RAW REQUEST
// ------------------------------------------------------------

// TODO: Implement `validateRequest(raw: unknown): Result<RawRequest, PipelineError<"VALIDATION_ERROR">>`
//
// Requirements:
//   1. `raw` must be a non-null object
//   2. `method` must be a non-empty string
//   3. `path` must be a non-empty string starting with "/"
//   4. `headers` must be a non-null object whose values are all strings
//   5. `body` may be anything (pass through as-is)
//   6. Return ok:true with the validated RawRequest on success
//   7. Return ok:false with a VALIDATION_ERROR on any failure
export function validateRequest(
  raw: unknown
): Result<RawRequest, PipelineError<"VALIDATION_ERROR">> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------
// 8. MIDDLEWARE IMPLEMENTATIONS
// ------------------------------------------------------------

// --- 8a. Auth Middleware ---
// TODO: Implement `authMiddleware: Middleware<BaseContext, BaseContext & AuthFields>`
//
// Requirements:
//   1. Read `headers["x-user-id"]` and `headers["x-tenant-id"]` from ctx.rawRequest
//   2. If either header is missing or empty → return AUTH_ERROR
//   3. Otherwise brand them as UserId / TenantId and return ok:true with the enriched context
export const authMiddleware: Middleware<BaseContext, BaseContext & AuthFields> =
  async (ctx) => {
    // TODO
    throw new Error("Not implemented");
  };

// --- 8b. Rate-Limit Middleware ---
// TODO: Implement `rateLimitMiddleware: Middleware<BaseContext & AuthFields, BaseContext & AuthFields & RateLimitFields>`
//
// Requirements:
//   1. Accept a `store: RateLimitStore` as a parameter (use a closure — see type below)
//   2. Look up the current count for `ctx.userId` in the store
//   3. If count >= store.limit → return RATE_LIMIT_ERROR with detail: { userId, limit, windowResetAt }
//   4. Otherwise increment the count, compute requestsRemaining = limit - newCount,
//      and return ok:true with the enriched context
//   5. windowResetAt is provided by the store
export interface RateLimitStore {
  readonly limit: number;
  readonly windowResetAt: number;
  counts: Map<UserId, number>;
}

export function makeRateLimitMiddleware(
  store: RateLimitStore
): Middleware<BaseContext & AuthFields, BaseContext & AuthFields & RateLimitFields> {
  return async (ctx) => {
    // TODO
    throw new Error("Not implemented");
  };
}

// --- 8c. Transform Middleware ---
// TODO: Implement `transformMiddleware: Middleware<BaseContext & AuthFields & RateLimitFields, FullContext>`
//
// Requirements:
//   1. Attempt to parse ctx.rawRequest.body as a JSON object
//      - If body is already a Record<string, unknown>, use it directly
//      - If body is a string, attempt JSON.parse; on failure → TRANSFORM_ERROR
//      - If body is null/undefined, treat as empty object {}
//      - Otherwise → TRANSFORM_ERROR (unexpected body type)
//   2. Return ok:true with parsedBody added to the context
export const transformMiddleware: Middleware<
  BaseContext & AuthFields & RateLimitFields,
  FullContext
> = async (ctx) => {
  // TODO
  throw new Error("Not implemented");
};

// ------------------------------------------------------------
// 9. PIPELINE RUNNER
// ------------------------------------------------------------

// TODO: Implement `runPipeline(raw: unknown, store: RateLimitStore): Promise<Result<FullContext, AnyPipelineError>>`
//
// Requirements:
//   1. Validate `raw` with `validateRequest`; short-circuit on error
//   2. Build the initial BaseContext: generate a random TraceId (use `toTraceId(Math.random().toString(36).slice(2))`)
//      set startedAt = Date.now(), rawRequest = validated request
//   3. Run authMiddleware → short-circuit on error
//   4. Run makeRateLimitMiddleware(store) → short-circuit on error
//   5. Run transformMiddleware → short-circuit on error
//   6. Return the final FullContext wrapped in ok:true
//   7. Each short-circuit must preserve the original typed error (no re-wrapping)
export async function runPipeline(
  raw: unknown,
  store: RateLimitStore
): Promise<Result<FullContext, AnyPipelineError>> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------
// 10. EXHAUSTIVE ERROR REPORTER
// ------------------------------------------------------------

// TODO: Implement `reportError(err: AnyPipelineError): string`
//
// Requirements:
//   1. Use a switch on `err.kind` that covers ALL variants of PipelineErrorKind
//   2. Each branch must return a distinct, human-readable string that includes
//      err.message and err.traceId
//   3. After the switch, add an exhaustiveness check using a `never`-typed variable
//      so TypeScript enforces that all cases are handled
export function reportError(err: AnyPipelineError): string {
  // TODO
  throw new Error("Not implemented");
}
