// ============================================================
// Challenge: Typed Safe JSON Parser with Result & Schema Validation
// ============================================================
// You must implement several utilities that safely parse raw JSON strings
// and validate them against expected shapes — all without using `any`,
// type assertions (`as`), or throwing exceptions to the caller.
// ============================================================

// ------------------------------------------------------------------
// 1. RESULT TYPE  (do not modify)
// ------------------------------------------------------------------
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ------------------------------------------------------------------
// 2. ERROR HIERARCHY  (do not modify)
// ------------------------------------------------------------------
/** The raw string was not valid JSON. */
export type SyntaxParseError = {
  kind: "SyntaxError";
  message: string;
  raw: string;
};

/** The JSON parsed successfully but failed a field-level check. */
export type ValidationError = {
  kind: "ValidationError";
  message: string;
  field: string;
};

/** Union of all errors that can come out of this module. */
export type ParseError = SyntaxParseError | ValidationError;

// ------------------------------------------------------------------
// 3. SCHEMA PRIMITIVES  (do not modify)
// ------------------------------------------------------------------
/**
 * A schema is a plain object whose values describe the *expected* type
 * of each field.  Only these four primitive descriptors are supported.
 */
export type FieldKind = "string" | "number" | "boolean" | "string[]";

/**
 * Maps each key in K to one of the four primitive descriptors.
 * Example:
 *   type S = Schema<{ name: string; age: number }>;
 *   // { name: "string"; age: "number" }
 */
export type Schema<T extends Record<string, unknown>> = {
  [K in keyof T]: FieldKind;
};

// ------------------------------------------------------------------
// 4. INFER TYPESCRIPT TYPE FROM A SCHEMA  ← TODO
// ------------------------------------------------------------------
/**
 * Given a concrete Schema object type S, produce the TypeScript type
 * it describes.
 *
 * Requirements:
 *   - "string"   → string
 *   - "number"   → number
 *   - "boolean"  → boolean
 *   - "string[]" → string[]
 *
 * Example:
 *   type S = { name: "string"; age: "number"; active: "boolean" };
 *   InferSchema<S>  →  { name: string; age: number; active: boolean }
 *
 * Hint: mapped type + conditional type on FieldKind.
 */
export type InferSchema<S extends Record<string, FieldKind>> = {
  // TODO: replace `never` with the correct mapped + conditional type
  [K in keyof S]: never;
};

// ------------------------------------------------------------------
// 5. safeParseJSON  ← TODO
// ------------------------------------------------------------------
/**
 * Attempt to JSON.parse `raw`.
 *
 * - On success  → Result<unknown, never> with ok: true  (value is unknown, not any)
 * - On failure  → Result<never, SyntaxParseError> with ok: false
 *
 * Requirements:
 *   R1. Must NOT throw — all errors must be returned, not raised.
 *   R2. The happy-path value type must be `unknown` (force callers to narrow).
 *   R3. Use a try/catch; convert the caught value to a SyntaxParseError.
 */
export function safeParseJSON(raw: string): Result<unknown, SyntaxParseError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. validateShape  ← TODO
// ------------------------------------------------------------------
/**
 * Given an already-parsed `unknown` value and a schema S, check that:
 *   a) The value is a non-null object (not an array).
 *   b) Every key declared in the schema is present on the object.
 *   c) Each field's runtime type matches the FieldKind declared in the schema:
 *        "string"   → typeof v === "string"
 *        "number"   → typeof v === "number"
 *        "boolean"  → typeof v === "boolean"
 *        "string[]" → Array.isArray(v) && every element is a string
 *
 * Requirements:
 *   R4. Return Result<InferSchema<S>, ValidationError>.
 *   R5. On the first failing field, return a ValidationError naming that field.
 *   R6. On success, return the value cast to InferSchema<S> via a single,
 *       localised type assertion — only inside this function, nowhere else.
 *   R7. Extra keys on the object are allowed (don't reject them).
 */
export function validateShape<S extends Record<string, FieldKind>>(
  value: unknown,
  schema: S
): Result<InferSchema<S>, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 7. parseAndValidate  ← TODO
// ------------------------------------------------------------------
/**
 * Compose safeParseJSON and validateShape into a single pipeline.
 *
 * Requirements:
 *   R8.  If parsing fails, propagate the SyntaxParseError.
 *   R9.  If validation fails, propagate the ValidationError.
 *   R10. On full success, return Result<InferSchema<S>, never>.
 *   R11. The return type must be Result<InferSchema<S>, ParseError>.
 */
export function parseAndValidate<S extends Record<string, FieldKind>>(
  raw: string,
  schema: S
): Result<InferSchema<S>, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 8. BONUS (stretch goal — optional)
// ------------------------------------------------------------------
// Implement `parseAndValidateMany`, which accepts an array of raw JSON
// strings and returns an array of Result<InferSchema<S>, ParseError>.
// It must process all inputs — never short-circuit on the first error.
