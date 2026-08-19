// ============================================================
// challenge.ts — Schema-Validated API Response Normalizer
// Difficulty: Hard | Date: 2026-08-19
// ============================================================
// Topics: conditional types, infer, discriminated unions,
//         mapped types, branded types, Result<T,E> monad,
//         generics, satisfies, type narrowing
// ============================================================

// ─── 1. BRANDED TYPES ────────────────────────────────────────
// Requirement 1: Define branded primitive types so that raw
// strings/numbers cannot be assigned to domain values without
// going through a validator.

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type ISODateString = Brand<string, "ISODateString">;
export type PositiveNumber = Brand<number, "PositiveNumber">;
export type NonEmptyString = Brand<string, "NonEmptyString">;

// ─── 2. RESULT MONAD ─────────────────────────────────────────
// Requirement 2: Implement the Result<T, E> discriminated union
// and the helper functions ok(), err(), isOk(), isErr().

export type Ok<T> = { readonly tag: "ok"; readonly value: T };
export type Err<E> = { readonly tag: "err"; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  // TODO: implement
  throw new Error("Not implemented");
}

export function err<E>(error: E): Err<E> {
  // TODO: implement
  throw new Error("Not implemented");
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  // TODO: implement
  throw new Error("Not implemented");
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ─── 3. VALIDATION ERRORS ────────────────────────────────────
// Requirement 3: Define a discriminated union of typed validation
// errors. Each variant must carry enough context for the caller
// to know exactly which field failed and why.

export type FieldError =
  | { readonly kind: "missing";  readonly field: string }
  | { readonly kind: "wrong_type"; readonly field: string; readonly expected: string; readonly got: string }
  | { readonly kind: "out_of_range"; readonly field: string; readonly min?: number; readonly max?: number }
  | { readonly kind: "invalid_format"; readonly field: string; readonly pattern: string };

export type ValidationError = {
  readonly source: string;       // e.g. vendor name
  readonly fields: FieldError[]; // one entry per failing field
};

// ─── 4. SCHEMA DEFINITION (zod-style, but hand-rolled) ───────
// Requirement 4: Define a `FieldSchema<T>` type that describes
// how to validate and coerce a single field from `unknown` into
// a typed value T. Then define `Schema<R>` as a mapped type
// over a record type R, producing a FieldSchema for each key.

export type FieldSchema<T> = {
  // The field name to read from the raw object
  readonly key: string;
  // Returns Ok<T> if valid, Err<FieldError> if not
  readonly validate: (raw: unknown) => Result<T, FieldError>;
};

// Requirement 5: `Schema<R>` maps each key K of R to a
// FieldSchema<R[K]>. Complete this mapped type.
export type Schema<R extends Record<string, unknown>> = {
  // TODO: fill in the mapped type body
  [K in keyof R]: FieldSchema<R[K]>;
};

// ─── 5. DOMAIN RECORDS ───────────────────────────────────────
// These are the normalized shapes your normalizer must produce.

export type OrderRecord = {
  orderId:    NonEmptyString;
  amount:     PositiveNumber;
  currency:   NonEmptyString;
  placedAt:   ISODateString;
  itemCount:  PositiveNumber;
};

export type UserRecord = {
  userId:    NonEmptyString;
  email:     NonEmptyString;
  createdAt: ISODateString;
  age:       PositiveNumber;
};

// ─── 6. BUILT-IN FIELD VALIDATORS ────────────────────────────
// Requirement 6: Implement the following primitive validators.
// Each returns a FieldSchema for the given field name.

/** Validates that a field is a non-empty string. */
export function nonEmptyString(field: string, key: string): FieldSchema<NonEmptyString> {
  // TODO: implement
  // Hint: use `typeof raw === "string"` narrowing; brand on success
  throw new Error("Not implemented");
}

/** Validates that a field is a number strictly greater than 0. */
export function positiveNumber(field: string, key: string): FieldSchema<PositiveNumber> {
  // TODO: implement
  // Hint: check typeof, then check raw > 0; brand on success
  throw new Error("Not implemented");
}

/**
 * Validates that a field is a string matching ISO 8601 date format.
 * Accept strings matching: /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/
 */
export function isoDateString(field: string, key: string): FieldSchema<ISODateString> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ─── 7. GENERIC NORMALIZER ───────────────────────────────────
// Requirement 7: Implement `normalize`. Given a Schema<R> and a
// raw `unknown` blob, attempt to validate every field. Collect
// ALL field errors (do not short-circuit on first failure).
// Return Ok<R> if every field passed, or Err<ValidationError>
// listing every field that failed.

export function normalize<R extends Record<string, unknown>>(
  schema: Schema<R>,
  raw: unknown,
  source: string
): Result<R, ValidationError> {
  // TODO: implement
  // Steps:
  //   a) If raw is not a plain object, return a single "missing" error
  //      for field "__root__".
  //   b) Iterate over every key in schema, run its .validate(),
  //      collect Err results into FieldError[].
  //   c) If errors.length > 0  → return err({ source, fields: errors })
  //   d) Otherwise assemble and return ok(record as R)
  throw new Error("Not implemented");
}

// ─── 8. SCHEMA REGISTRY & TYPED DISPATCH ─────────────────────
// Requirement 8: Define a `SchemaRegistry` that maps string
// source names to their Schema + output record type, then
// implement `normalizeFromRegistry` which looks up the right
// schema by source name and runs it.

// A registry entry pairs a Schema with its output type R.
export type RegistryEntry<R extends Record<string, unknown>> = {
  readonly schema: Schema<R>;
};

// The registry maps source names to entries. The output type of
// each entry may differ — use a generic record to preserve types.
export type SchemaRegistry<
  M extends Record<string, Record<string, unknown>>
> = {
  [K in keyof M]: RegistryEntry<M[K]>;
};

/**
 * Requirement 9: Implement `normalizeFromRegistry`.
 *
 * Given a registry typed as SchemaRegistry<M>, a source key K
 * (keyof M), and a raw unknown blob, return
 * Result<M[K], ValidationError>.
 *
 * The return type must be inferred from K — no manual type
 * assertions allowed.
 */
export function normalizeFromRegistry<
  M extends Record<string, Record<string, unknown>>,
  K extends keyof M & string
>(
  registry: SchemaRegistry<M>,
  source: K,
  raw: unknown
): Result<M[K], ValidationError> {
  // TODO: implement — look up registry[source], call normalize()
  throw new Error("Not implemented");
}

// ─── 9. BATCH NORMALIZER ─────────────────────────────────────
// Requirement 10: Implement `normalizeBatch`.
//
// Given a registry, a source key K, and an array of unknown
// blobs, return an object:
//   { successes: M[K][]; failures: ValidationError[] }
// Process all items (never throw), collecting results into the
// appropriate bucket.

export type BatchResult<R> = {
  readonly successes: R[];
  readonly failures: ValidationError[];
};

export function normalizeBatch<
  M extends Record<string, Record<string, unknown>>,
  K extends keyof M & string
>(
  registry: SchemaRegistry<M>,
  source: K,
  raws: unknown[]
): BatchResult<M[K]> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ─── 10. CONDITIONAL TYPE UTILITY ────────────────────────────
// Requirement 11: Define the conditional type `NormalizedOutput<S>`
// that, given a FieldSchema<T>, extracts T. If S is not a
// FieldSchema, resolve to never.
//
// Example:
//   NormalizedOutput<FieldSchema<ISODateString>> → ISODateString
//   NormalizedOutput<string>                     → never

export type NormalizedOutput<S> =
  // TODO: fill in using conditional type + infer
  never;

// ─── 11. SATISFIES CONSTRAINT ────────────────────────────────
// Requirement 12: Declare concrete schemas for OrderRecord and
// UserRecord using your field validators, and assert them with
// `satisfies Schema<OrderRecord>` / `satisfies Schema<UserRecord>`.
// This ensures the compiler validates your schema definitions.

export const orderSchema = {
  // TODO: populate using nonEmptyString / positiveNumber / isoDateString
} satisfies Schema<OrderRecord>;

export const userSchema = {
  // TODO: populate using nonEmptyString / positiveNumber / isoDateString
} satisfies Schema<UserRecord>;
