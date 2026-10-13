// ============================================================
// Challenge: Typed Safe JSON Parser with Result Type
// ============================================================
// You are building a safe JSON parsing utility for an API client.
// Raw strings arrive over the wire and must be validated into known
// shapes. Callers must always handle both success and failure paths.
//
// RULES:
//   - No `any`, no `as`, no type assertions anywhere in your solution
//   - All code must compile under strict: true
// ============================================================

// ── 1. Result Type ───────────────────────────────────────────
// Define a generic discriminated union `Result<T, E>` with two
// variants:
//   • { ok: true;  value: T }
//   • { ok: false; error: E }

// TODO: Define Result<T, E> here

// ── 2. Known API Response Shapes ────────────────────────────
// These are the shapes that can arrive from the API.

export interface UserPayload {
  kind: "user";
  id: number;
  name: string;
  email: string;
}

export interface OrderPayload {
  kind: "order";
  orderId: string;
  total: number;
  items: string[];
}

export interface ErrorPayload {
  kind: "error";
  code: number;
  message: string;
}

// Requirement 1: Define `ApiPayload` as a discriminated union of
// UserPayload | OrderPayload | ErrorPayload, discriminated on `kind`.
export type ApiPayload = /* TODO */;

// ── 3. ParseError ───────────────────────────────────────────
// Requirement 2: Define a `ParseError` type (plain object, no class)
// with two variants, discriminated on `reason`:
//   • { reason: "invalid-json"; raw: string }
//   • { reason: "unknown-shape"; parsed: unknown }

export type ParseError = /* TODO */;

// ── 4. Type Guard ────────────────────────────────────────────
// Requirement 3: Implement `isApiPayload(value: unknown): value is ApiPayload`
// A value is a valid ApiPayload if:
//   • It is a non-null object
//   • Its `kind` field is one of "user" | "order" | "error"
//   • For kind "user":  id is number, name is string, email is string
//   • For kind "order": orderId is string, total is number, items is an array
//   • For kind "error": code is number, message is string

export function isApiPayload(value: unknown): value is ApiPayload {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 5. Safe Parser ───────────────────────────────────────────
// Requirement 4: Implement `parseApiResponse`, which:
//   • Accepts a raw `string`
//   • Returns `Result<ApiPayload, ParseError>`
//   • Returns { ok: false, error: { reason: "invalid-json", raw } }
//     if JSON.parse throws
//   • Returns { ok: false, error: { reason: "unknown-shape", parsed } }
//     if the parsed value does not satisfy isApiPayload
//   • Returns { ok: true, value: payload } on success

export function parseApiResponse(raw: string): Result<ApiPayload, ParseError> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 6. Exhaustive Payload Handler ────────────────────────────
// Requirement 5: Implement `describePayload(payload: ApiPayload): string`
// using a switch on `payload.kind` that:
//   • "user"  → returns `"User #<id>: <name> (<email>)"`
//   • "order" → returns `"Order <orderId>: <items.length> item(s), $<total>"`
//   • "error" → returns `"API Error <code>: <message>"`
//   • Has an exhaustive default branch that makes the compiler
//     error if a new kind is ever added without handling it.
//     Hint: assign the payload to `never` in the default branch.

export function describePayload(payload: ApiPayload): string {
  // TODO: implement
  throw new Error("Not implemented");
}
