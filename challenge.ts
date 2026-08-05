// ============================================================
// challenge.ts — Typed Safe JSON Parser & Result Unwrapper
// ============================================================
// Rules:
//   • No `any`, no `as`, no non-null assertions (!), no type assertions
//   • Must compile under strict: true
//   • All TODOs must be replaced with real implementations
// ============================================================

// -----------------------------------------------------------
// 1. Result type  (a simple Either / Result monad)
// -----------------------------------------------------------

/** A successful result carrying a value of type T. */
export type Ok<T> = { readonly kind: "ok"; readonly value: T };

/** A failed result carrying a typed error. */
export type Err<E> = { readonly kind: "err"; readonly error: E };

/** Discriminated union: every operation returns one of these. */
export type Result<T, E> = Ok<T> | Err<E>;

// -----------------------------------------------------------
// 2. Smart constructors
// -----------------------------------------------------------

/** Wrap a value in Ok. */
// TODO: implement ok<T>(value: T): Ok<T>
export function ok<T>(value: T): Ok<T> {
  // TODO
  throw new Error("Not implemented");
}

/** Wrap an error in Err. */
// TODO: implement err<E>(error: E): Err<E>
export function err<E>(error: E): Err<E> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 3. ParseError hierarchy  (discriminated union)
// -----------------------------------------------------------

export type ParseError =
  | { readonly kind: "invalid_json"; readonly raw: string }
  | { readonly kind: "missing_field"; readonly field: string }
  | { readonly kind: "wrong_type"; readonly field: string; readonly expected: string };

// -----------------------------------------------------------
// 4. Webhook payload shapes
// -----------------------------------------------------------

export interface OrderPayload {
  readonly orderId: string;
  readonly customerId: string;
  readonly totalCents: number;
  readonly placedAt: string; // ISO-8601 date string
}

export interface RefundPayload {
  readonly refundId: string;
  readonly orderId: string;
  readonly amountCents: number;
}

// -----------------------------------------------------------
// 5. safeParseJSON
//
// Requirement 1 — Parse a raw string into `unknown` without throwing.
//   • If JSON.parse throws, return Err<ParseError> with kind "invalid_json".
//   • On success, return Ok<unknown> wrapping the parsed value.
// -----------------------------------------------------------
export function safeParseJSON(raw: string): Result<unknown, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 6. Field extractors (helpers you'll use inside validators)
//
// Requirement 2 — getString(obj: unknown, field: string): Result<string, ParseError>
//   • Verify obj is a non-null object.
//   • If the field is missing, return Err with kind "missing_field".
//   • If the field exists but is not a string, return Err with kind "wrong_type", expected "string".
//   • Otherwise return Ok<string>.
//
// Requirement 3 — getNumber(obj: unknown, field: string): Result<number, ParseError>
//   • Same rules, but expected type is "number".
// -----------------------------------------------------------
export function getString(obj: unknown, field: string): Result<string, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

export function getNumber(obj: unknown, field: string): Result<number, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. Payload validators
//
// Requirement 4 — parseOrderPayload(raw: string): Result<OrderPayload, ParseError>
//   • Use safeParseJSON, then getString / getNumber to validate every field.
//   • Return the first error encountered (fail-fast), or Ok<OrderPayload>.
//   • Required fields: orderId (string), customerId (string),
//                      totalCents (number), placedAt (string).
//
// Requirement 5 — parseRefundPayload(raw: string): Result<RefundPayload, ParseError>
//   • Same pattern.
//   • Required fields: refundId (string), orderId (string), amountCents (number).
// -----------------------------------------------------------
export function parseOrderPayload(raw: string): Result<OrderPayload, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

export function parseRefundPayload(raw: string): Result<RefundPayload, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 8. unwrapOr
//
// Requirement 6 — unwrapOr<T, E>(result: Result<T, E>, fallback: T): T
//   • If result is Ok, return its value.
//   • If result is Err, return fallback.
//   • The type parameter must be inferred — no explicit annotation needed at call sites.
// -----------------------------------------------------------
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 9. describeError
//
// Requirement 7 — describeError(error: ParseError): string
//   • Return a human-readable sentence for each error kind.
//   • Must be EXHAUSTIVE: TypeScript should catch an unhandled branch at compile time.
//   • Suggested messages (you may adjust wording):
//       invalid_json  → 'Invalid JSON: <first 40 chars of raw>...'
//       missing_field → 'Missing required field: "<field>"'
//       wrong_type    → 'Field "<field>" must be a <expected>'
// -----------------------------------------------------------
export function describeError(error: ParseError): string {
  // TODO — use a switch on error.kind; add a compile-time exhaustiveness guard
  throw new Error("Not implemented");
}
