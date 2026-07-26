// ============================================================
// challenge.ts — Typed Safe JSON Parser with Result Type
// ============================================================
// Rules:
//   • No `any`, no `as`, no non-null assertions (!), no @ts-ignore
//   • All functions must compile under strict: true
//   • Fill in every section marked TODO
// ============================================================

// ── 1. Result type ───────────────────────────────────────────
// Requirement 1: Define a discriminated-union Result<T, E> with
//   two variants:
//     • { ok: true;  value: T }
//     • { ok: false; error: E }

export type Result<T, E> = TODO; // ← replace TODO

// ── 2. ParseError ────────────────────────────────────────────
// Requirement 2: Define a discriminated union ParseError with
//   exactly three variants, each carrying a `kind` string literal
//   and a human-readable `message` string:
//     • kind: "SyntaxError"    – raw JSON.parse failure
//     • kind: "ValidationError"– value didn't match expected shape
//     • kind: "EmptyInput"     – the input string was blank/empty

export type ParseError = TODO; // ← replace TODO

// ── 3. safeParseJSON ─────────────────────────────────────────
// Requirement 3: Implement safeParseJSON(raw: string).
//   • If `raw` is empty / whitespace-only → EmptyInput error
//   • If JSON.parse throws               → SyntaxError error
//   • Otherwise                          → ok result with `unknown` value
//   Return type must be Result<unknown, ParseError>.

export function safeParseJSON(raw: string): Result<unknown, ParseError> {
  // TODO
}

// ── 4. Validator<T> ──────────────────────────────────────────
// Requirement 4: Define a Validator<T> type — a function that
//   receives an `unknown` value and returns Result<T, ParseError>.
//   (This is a type alias, not a class.)

export type Validator<T> = TODO; // ← replace TODO

// ── 5. Built-in primitive validators ─────────────────────────
// Requirement 5: Implement the following validators that return
//   a ValidationError when the value doesn't match:

export const validateString: Validator<string> = (value) => {
  // TODO
};

export const validateNumber: Validator<number> = (value) => {
  // TODO
};

export const validateBoolean: Validator<boolean> = (value) => {
  // TODO
};

// ── 6. validateObject ────────────────────────────────────────
// Requirement 6: Implement a generic validateObject<T> that
//   accepts a "schema" — a mapped type where each key of T maps
//   to a Validator for that key's value type — and returns a
//   Validator<T>.
//
//   • If the input is not a plain object (or is null/array),
//     return a ValidationError.
//   • Run each field's validator; return the FIRST field error
//     encountered (include the field name in the message).
//   • If all fields pass, return ok with the assembled object.
//
//   The schema type should be:  { [K in keyof T]: Validator<T[K]> }

export function validateObject<T extends Record<string, unknown>>(
  schema: { [K in keyof T]: Validator<T[K]> }
): Validator<T> {
  // TODO
}

// ── 7. parseTo ───────────────────────────────────────────────
// Requirement 7: Implement parseTo<T>(raw: string, validator: Validator<T>).
//   Compose safeParseJSON + the validator in a single call.
//   • If safeParseJSON fails, propagate its error.
//   • Otherwise run the validator on the parsed value.
//   Return type: Result<T, ParseError>

export function parseTo<T>(
  raw: string,
  validator: Validator<T>
): Result<T, ParseError> {
  // TODO
}

// ── 8. mapResult ─────────────────────────────────────────────
// Requirement 8: Implement a generic helper mapResult<T, U, E>
//   that transforms the `value` inside a successful Result using
//   a mapping function, leaving error results unchanged.
//   Signature:
//     mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>

export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  // TODO
}
