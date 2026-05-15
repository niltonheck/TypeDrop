// ============================================================
// Typed Streaming ETL Pipeline with Middleware
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// ============================================================

// ── 1. BRANDED TYPES ────────────────────────────────────────

/** Opaque brand helper — do NOT change this. */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type RecordId   = Brand<string, "RecordId">;
export type SourceName = Brand<string, "SourceName">;

// ── 2. RAW / UNKNOWN INPUT ──────────────────────────────────

/**
 * Raw records arrive as `unknown` from external sources.
 * A valid raw record must satisfy this shape at runtime.
 */
export interface RawRecord {
  id:        string;
  source:    string;
  timestamp: number; // Unix ms
  payload:   Record<string, unknown>;
}

// ── 3. PIPELINE RECORD STATES (discriminated union) ─────────

/** A record that passed validation and entered the pipeline. */
export interface ValidatedRecord {
  readonly stage:     "validated";
  readonly id:        RecordId;
  readonly source:    SourceName;
  readonly timestamp: Date;
  readonly payload:   Record<string, unknown>;
}

/** A record that has been transformed by at least one middleware. */
export interface TransformedRecord {
  readonly stage:     "transformed";
  readonly id:        RecordId;
  readonly source:    SourceName;
  readonly timestamp: Date;
  readonly payload:   Record<string, unknown>;
  /** Keys modified/added by middleware, in order. */
  readonly mutations: ReadonlyArray<string>;
}

/** A record that was explicitly dropped by a filter middleware. */
export interface DroppedRecord {
  readonly stage:  "dropped";
  readonly id:     RecordId;
  readonly source: SourceName;
  readonly reason: string;
}

/** A record that failed validation or threw during processing. */
export interface FailedRecord {
  readonly stage:  "failed";
  readonly id:     RecordId | null; // null when id itself is invalid
  readonly source: SourceName | null;
  readonly error:  string;
}

export type PipelineRecord =
  | ValidatedRecord
  | TransformedRecord
  | DroppedRecord
  | FailedRecord;

// ── 4. MIDDLEWARE ────────────────────────────────────────────

/**
 * A middleware receives the current record and a `next` function.
 * - Call `next(record)` to pass the (possibly mutated) record downstream.
 * - Return a DroppedRecord to halt the chain and drop the record.
 * - Throw to fail the record.
 *
 * REQUIREMENT 4a: Middleware may only receive/return
 *   ValidatedRecord | TransformedRecord (not Dropped/Failed).
 */
export type ProcessableRecord = ValidatedRecord | TransformedRecord;

export type MiddlewareNext = (
  record: ProcessableRecord
) => Promise<ProcessableRecord | DroppedRecord>;

export type Middleware = (
  record: ProcessableRecord,
  next:   MiddlewareNext
) => Promise<ProcessableRecord | DroppedRecord>;

// ── 5. MIDDLEWARE FACTORIES ──────────────────────────────────

/**
 * REQUIREMENT 5a — implement `createTransformMiddleware`
 *
 * Returns a Middleware that:
 *  - Calls `transform(record.payload)` to get a new payload.
 *  - Merges the result into the record, upgrading stage to "transformed".
 *  - Tracks which top-level keys were added or changed in `mutations`
 *    (union with any existing mutations if the record is already transformed).
 *  - Then calls `next` with the updated record.
 *
 * @param name      - label for this transformer (used in mutations list)
 * @param transform - pure function: old payload → patch (partial new payload)
 */
export function createTransformMiddleware(
  name:      string,
  transform: (payload: Record<string, unknown>) => Record<string, unknown>
): Middleware {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5b — implement `createFilterMiddleware`
 *
 * Returns a Middleware that:
 *  - Calls `predicate(record)` — if it returns false, returns a DroppedRecord
 *    with the provided `reason` string.
 *  - Otherwise calls `next`.
 */
export function createFilterMiddleware(
  predicate: (record: ProcessableRecord) => boolean,
  reason:    string
): Middleware {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5c — implement `createEnrichMiddleware`
 *
 * Returns a Middleware that:
 *  - Awaits `enrich(record)` to get a patch object.
 *  - Merges the patch into payload, upgrades stage to "transformed".
 *  - Tracks mutated keys (same rule as createTransformMiddleware).
 *  - Then calls `next`.
 *
 * @param enrich - async function: record → patch
 */
export function createEnrichMiddleware(
  enrich: (record: ProcessableRecord) => Promise<Record<string, unknown>>
): Middleware {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 6. PIPELINE COMPOSITION ─────────────────────────────────

/**
 * REQUIREMENT 6 — implement `composeMiddleware`
 *
 * Composes an ordered array of Middleware into a single Middleware.
 * The first element in the array is the outermost (runs first).
 * If the array is empty, the composed middleware simply calls `next`.
 *
 * This is the classic "onion" / koa-style compose pattern.
 */
export function composeMiddleware(middlewares: ReadonlyArray<Middleware>): Middleware {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 7. VALIDATION ────────────────────────────────────────────

/**
 * REQUIREMENT 7 — implement `validateRecord`
 *
 * Validates an `unknown` value as a RawRecord at runtime.
 * Returns a ValidatedRecord on success, or a FailedRecord on failure.
 *
 * Rules:
 *  - `id` must be a non-empty string  → becomes RecordId (branded)
 *  - `source` must be a non-empty string → becomes SourceName (branded)
 *  - `timestamp` must be a finite number → becomes new Date(timestamp)
 *  - `payload` must be a non-null object (not an array)
 *  - On any failure, FailedRecord.id and .source should be extracted
 *    if possible (best-effort), otherwise null.
 */
export function validateRecord(raw: unknown): ValidatedRecord | FailedRecord {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 8. PIPELINE RUNNER ───────────────────────────────────────

export interface PipelineConfig {
  /** Maximum number of records processed concurrently. */
  readonly concurrency: number;
  /** Composed or single middleware to run on each validated record. */
  readonly middleware:  Middleware;
}

export interface PipelineReport {
  readonly totalInput:    number;
  readonly validated:     number;
  readonly transformed:   number;
  readonly dropped:       number;
  readonly failed:        number;
  /** Final state of every record, in input order. */
  readonly records:       ReadonlyArray<PipelineRecord>;
  /** Wall-clock duration in milliseconds. */
  readonly durationMs:    number;
}

/**
 * REQUIREMENT 8 — implement `runPipeline`
 *
 * Processes `rawRecords` through the ETL pipeline:
 *  1. Validate each record (§7).
 *  2. For records that pass validation, run them through `config.middleware`.
 *     - The terminal `next` for the composed chain should resolve with the
 *       record as-is (identity — no further middleware).
 *  3. Respect `config.concurrency`: at most N records in-flight at once.
 *  4. Preserve input order in `report.records`.
 *  5. Populate all counts in PipelineReport correctly.
 *  6. Measure wall-clock duration.
 *
 * REQUIREMENT 8a — typed concurrency helper
 *
 * You must implement an internal generic helper:
 *   async function runConcurrent<T>(
 *     tasks:       ReadonlyArray<() => Promise<T>>,
 *     concurrency: number
 *   ): Promise<ReadonlyArray<T>>
 *
 * that executes tasks with at most `concurrency` in-flight at once
 * and returns results in the original order.
 */
export async function runPipeline(
  rawRecords: ReadonlyArray<unknown>,
  config:     PipelineConfig
): Promise<PipelineReport> {
  // TODO: implement (including the internal runConcurrent<T> helper)
  throw new Error("Not implemented");
}
