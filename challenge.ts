// ============================================================
// Typed Schema-Validated ETL Pipeline with Branded Results
// challenge.ts
// ============================================================
// REQUIREMENTS
// 1. Define a branded type `Validated<T>` that wraps a value T
//    proven to have passed runtime validation (brand it so raw
//    T cannot be assigned to Validated<T> without going through
//    the validator).
// 2. Define a `FieldSchema` discriminated union covering at least:
//    "string", "number", "boolean", and "literal" (with a value).
// 3. Define a `TableSchema` as a Record of field names to
//    FieldSchema entries, plus an optional `required` string array.
// 4. Implement `inferRow<S extends TableSchema>` — a conditional /
//    mapped type that converts a TableSchema into the TypeScript
//    type of a validated row (required fields are non-optional,
//    non-required fields are optional). Fields typed "literal"
//    must infer the exact literal type of their value.
// 5. Implement `validateRow<S extends TableSchema>(
//      schema: S,
//      raw: unknown
//    ): Result<Validated<inferRow<S>>, ValidationError>`
//    — parse raw, check every field, and return Ok or Err.
// 6. Define a `Transformer<S extends TableSchema, Out>` as a
//    function type `(row: Validated<inferRow<S>>) => Out`.
// 7. Implement `runPipeline<S extends TableSchema, Out>(
//      schema: S,
//      transformer: Transformer<S, Out>,
//      records: unknown[],
//      sink: Sink<Out>
//    ): PipelineReport`
//    — validate each record, transform valid ones and push to
//    the sink, collect ValidationErrors for invalid ones, and
//    return a PipelineReport.
// 8. The `Sink<Out>` type must be a typed interface with a single
//    `write(row: Out): void` method.
// 9. `PipelineReport` must carry: total, passed, failed counts,
//    and a `errors` array of `{ index: number } & ValidationError`.
// 10. All types must be inferred — no explicit `any`, no `as`.
// ============================================================

// ------------------------------------------------------------------
// 1. Result type  (Ok / Err discriminated union)
// ------------------------------------------------------------------

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

// ------------------------------------------------------------------
// 2. Branded type
// ------------------------------------------------------------------

// TODO: Define a `Validated<T>` branded type.
// It should be impossible to assign a plain T to Validated<T>
// without going through `validateRow`.
export type Validated<T> = T & { readonly __validated: unique symbol };

// ------------------------------------------------------------------
// 3. FieldSchema discriminated union
// ------------------------------------------------------------------

// TODO: Define `FieldSchema` covering:
//   { kind: "string" }
//   { kind: "number" }
//   { kind: "boolean" }
//   { kind: "literal"; value: string | number | boolean }
export type FieldSchema = never; // replace this

// ------------------------------------------------------------------
// 4. TableSchema
// ------------------------------------------------------------------

// TODO: Define `TableSchema`.
// It must have:
//   - `fields`: Record<string, FieldSchema>
//   - `required`: readonly string[] (optional on the object)
export type TableSchema = never; // replace this

// ------------------------------------------------------------------
// 5. inferRow<S> — mapped + conditional type
// ------------------------------------------------------------------

// TODO: Implement `inferRow<S extends TableSchema>` so that:
//   - Fields listed in S["required"] are required (non-optional)
//   - All other fields are optional
//   - "string"  → string
//   - "number"  → number
//   - "boolean" → boolean
//   - "literal" → the exact literal type of .value
//
// Hint: You will need helper conditional types, and you may find
// `S["required"][number]` useful for extracting required keys.
export type inferRow<S extends TableSchema> = never; // replace this

// ------------------------------------------------------------------
// 6. ValidationError
// ------------------------------------------------------------------

// TODO: Define `ValidationError` with at minimum:
//   - `field`: the name of the failing field (or "__root__" for
//     structural errors like "not an object")
//   - `message`: human-readable description
//   - `received`: unknown  (the actual value seen at runtime)
export type ValidationError = never; // replace this

// ------------------------------------------------------------------
// 7. Transformer & Sink
// ------------------------------------------------------------------

// TODO: Define `Transformer<S extends TableSchema, Out>` as a
// function type that takes Validated<inferRow<S>> and returns Out.
export type Transformer<S extends TableSchema, Out> = never; // replace this

// TODO: Define `Sink<Out>` interface with `write(row: Out): void`.
export interface Sink<Out> {
  // TODO
}

// ------------------------------------------------------------------
// 8. PipelineReport
// ------------------------------------------------------------------

// TODO: Define `PipelineReport`.
export type PipelineReport = never; // replace this

// ------------------------------------------------------------------
// 9. validateRow
// ------------------------------------------------------------------

// TODO: Implement validateRow.
// It must:
//   - Return Err<ValidationError> if `raw` is not a plain object
//   - For each field in schema.fields, check the value matches
//     the declared FieldSchema kind (and exact value for "literal")
//   - Return Err for the FIRST failing field encountered
//   - Return Ok<Validated<inferRow<S>>> on full success
//     (use a type-assertion-free approach if possible; one
//      carefully placed `as` on the final happy-path return is
//      acceptable given the runtime checks that precede it)
export function validateRow<S extends TableSchema>(
  schema: S,
  raw: unknown
): Result<Validated<inferRow<S>>, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 10. runPipeline
// ------------------------------------------------------------------

// TODO: Implement runPipeline.
// For each record at index i:
//   - Call validateRow; on Err, push { index: i, ...error } to report
//   - On Ok, call transformer then sink.write with the result
// Return a fully populated PipelineReport.
export function runPipeline<S extends TableSchema, Out>(
  schema: S,
  transformer: Transformer<S, Out>,
  records: unknown[],
  sink: Sink<Out>
): PipelineReport {
  // TODO
  throw new Error("Not implemented");
}
