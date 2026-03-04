// ============================================================
// challenge.ts — Typed Plugin Middleware Chain
// Compile target: TypeScript 5.x  strict: true  no `any`
// ============================================================

// ─── 1. BRANDED TYPES ────────────────────────────────────────
// TODO: Define branded types for:
//   - RequestId   (string brand)
//   - PluginName  (string brand)
export type RequestId = string & { readonly __brand: "RequestId" };
export type PluginName = string & { readonly __brand: "PluginName" };

export function makeRequestId(id: string): RequestId {
  return id as RequestId;
}
export function makePluginName(name: string): PluginName {
  return name as PluginName;
}

// ─── 2. REQUEST CONTEXT ──────────────────────────────────────
// The mutable bag that flows through the chain.
// TODO: Define RequestContext with at least:
//   - id: RequestId
//   - path: string
//   - method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
//   - headers: Record<string, string>
//   - metadata: Record<string, unknown>   ← plugins write here
export interface RequestContext {
  // TODO
}

// ─── 3. TYPED ERROR HIERARCHY ────────────────────────────────
// Each error variant must carry a `kind` discriminant plus its
// own payload so callers can exhaustively switch on them.
//
// Required variants:
//   AuthError      – kind: "auth"        payload: { reason: string }
//   RateLimitError – kind: "rate_limit"  payload: { retryAfterMs: number }
//   ValidationError– kind: "validation"  payload: { field: string; issue: string }
//   UpstreamError  – kind: "upstream"    payload: { statusCode: number; body: string }
//
// TODO: Define each error interface and the PluginError union.
export interface AuthError {
  // TODO
}
export interface RateLimitError {
  // TODO
}
export interface ValidationError {
  // TODO
}
export interface UpstreamError {
  // TODO
}
export type PluginError = AuthError | RateLimitError | ValidationError | UpstreamError;

// ─── 4. RESULT TYPE ──────────────────────────────────────────
// TODO: Define a generic Result<T, E> discriminated union:
//   - { ok: true;  value: T }
//   - { ok: false; error: E }
export type Result<T, E> = // TODO

// ─── 5. PLUGIN INTERFACE ─────────────────────────────────────
// A plugin receives the current context (it may mutate metadata),
// and returns a Promise<Result<RequestContext, PluginError>>.
//   - ok: true  → pass the (possibly mutated) context downstream
//   - ok: false → short-circuit; downstream plugins do NOT run
//
// TODO: Define the Plugin interface with:
//   - name: PluginName
//   - execute(ctx: RequestContext): Promise<Result<RequestContext, PluginError>>
export interface Plugin {
  // TODO
}

// ─── 6. PLUGIN EXECUTION RECORD ──────────────────────────────
// After the chain runs, callers need a per-plugin audit trail.
// TODO: Define PluginRecord as a discriminated union:
//   - { plugin: PluginName; status: "passed"; durationMs: number }
//   - { plugin: PluginName; status: "failed"; durationMs: number; error: PluginError }
//   - { plugin: PluginName; status: "skipped" }   ← not reached due to earlier failure
export type PluginRecord = // TODO

// ─── 7. CHAIN RESULT ─────────────────────────────────────────
// The final outcome of running the full chain.
// TODO: Define ChainResult as a discriminated union:
//   - { outcome: "success"; finalContext: RequestContext; audit: PluginRecord[] }
//   - { outcome: "failure"; failedPlugin: PluginName; error: PluginError; audit: PluginRecord[] }
export type ChainResult = // TODO

// ─── 8. MIDDLEWARE CHAIN RUNNER ──────────────────────────────
// TODO: Implement runChain.
//
// Requirements:
//   R1. Execute plugins sequentially in order.
//   R2. If a plugin returns ok:false, immediately stop; mark remaining
//       plugins as "skipped" in the audit trail.
//   R3. Each PluginRecord must record accurate durationMs
//       (wall-clock time for that plugin's execute() call).
//   R4. On full success return outcome:"success" with the final
//       mutated context and the complete audit trail.
//   R5. On failure return outcome:"failure" with failedPlugin,
//       the PluginError, and the complete audit trail.
//   R6. The function signature must be fully typed — no `any`.
export async function runChain(
  plugins: Plugin[],
  initialContext: RequestContext
): Promise<ChainResult> {
  // TODO
}

// ─── 9. ERROR RENDERER ───────────────────────────────────────
// TODO: Implement renderError(error: PluginError): string
//
// Requirements:
//   R7. Must exhaustively handle every PluginError variant via
//       a switch on `error.kind`.
//   R8. Return a human-readable summary string per variant:
//       - auth:        "Auth failed: <reason>"
//       - rate_limit:  "Rate limited — retry after <retryAfterMs>ms"
//       - validation:  "Validation error on '<field>': <issue>"
//       - upstream:    "Upstream error <statusCode>: <body>"
//   R9. TypeScript must be able to prove the switch is exhaustive
//       (hint: use a never-assertion helper in the default branch).
export function renderError(error: PluginError): string {
  // TODO
}

// ─── 10. AUDIT SUMMARISER ────────────────────────────────────
// TODO: Implement summariseAudit(audit: PluginRecord[]): AuditSummary
//
// AuditSummary shape (define the interface):
//   - passed:  number   ← count of "passed" records
//   - failed:  number   ← count of "failed" records
//   - skipped: number   ← count of "skipped" records
//   - totalDurationMs: number  ← sum of durationMs for passed + failed records
//   - errors: Array<{ plugin: PluginName; error: PluginError }>
export interface AuditSummary {
  // TODO
}

export function summariseAudit(audit: PluginRecord[]): AuditSummary {
  // TODO
}
