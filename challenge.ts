// challenge.ts
// ============================================================
// Typed CSV Report Pipeline with Aggregation & Validation
// ============================================================
// SCENARIO:
//   Raw CSV rows arrive as unknown[] from a file-upload parser.
//   Your pipeline must:
//     1. Validate each row into a strongly-typed SalesRecord
//     2. Aggregate metrics in a single pass over valid rows
//     3. Return a fully-typed ReportResult (success or failure)
// ============================================================

// ---------------------------------------------------------------------------
// 1. DOMAIN TYPES
// ---------------------------------------------------------------------------

/** The canonical region values allowed in a sales record. */
export type Region = "north" | "south" | "east" | "west";

/** A valid, parsed sales record. */
export interface SalesRecord {
  id: string;
  region: Region;
  product: string;
  quantity: number;   // positive integer
  unitPrice: number;  // positive number, up to 2 decimal places
  saleDate: string;   // ISO 8601 date string, e.g. "2026-01-15"
}

// ---------------------------------------------------------------------------
// 2. VALIDATION TYPES  (Result / Either pattern)
// ---------------------------------------------------------------------------

export type ValidationSuccess<T> = {
  readonly status: "ok";
  readonly value: T;
};

export type ValidationFailure = {
  readonly status: "error";
  readonly rowIndex: number;
  readonly field: keyof SalesRecord | "unknown";
  readonly message: string;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

// ---------------------------------------------------------------------------
// 3. AGGREGATION TYPES
// ---------------------------------------------------------------------------

/**
 * Per-region breakdown produced during aggregation.
 * All numeric fields must be rounded to 2 decimal places.
 */
export interface RegionSummary {
  region: Region;
  totalRevenue: number;
  totalQuantity: number;
  averageUnitPrice: number;
  recordCount: number;
}

/** Top-level report produced by the pipeline. */
export interface ReportSummary {
  totalRecords: number;        // total rows processed (valid + invalid)
  validRecords: number;
  invalidRecords: number;
  grandTotalRevenue: number;   // rounded to 2 decimal places
  byRegion: Record<Region, RegionSummary>;
  errors: ValidationFailure[];
}

// ---------------------------------------------------------------------------
// 4. PIPELINE RESULT  (discriminated union)
// ---------------------------------------------------------------------------

export type PipelineResult =
  | { status: "complete"; report: ReportSummary }
  | { status: "empty";    message: string }
  | { status: "fatal";    error: string };

// ---------------------------------------------------------------------------
// 5. STUBS — implement all three functions
// ---------------------------------------------------------------------------

/**
 * REQUIREMENT 1 — Row Validator
 *
 * Validate a single raw value (from the CSV parser) at a given row index.
 * Return a ValidationSuccess<SalesRecord> if every field is valid, or a
 * ValidationFailure pointing to the FIRST invalid field found (check fields
 * in the order they appear in SalesRecord: id, region, product, quantity,
 * unitPrice, saleDate).
 *
 * Validation rules:
 *  - id:        non-empty string
 *  - region:    one of the four Region literals
 *  - product:   non-empty string
 *  - quantity:  integer > 0
 *  - unitPrice: number > 0
 *  - saleDate:  matches /^\d{4}-\d{2}-\d{2}$/ (basic ISO date check)
 *
 * The incoming `row` is `unknown`; you must narrow it entirely — no `as`, no `any`.
 */
export function validateRow(
  row: unknown,
  rowIndex: number
): ValidationResult<SalesRecord> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2 — Single-Pass Aggregator
 *
 * Given an array of already-validated SalesRecord values, compute a
 * ReportSummary fragment containing only the aggregation fields:
 *   - grandTotalRevenue
 *   - byRegion  (one RegionSummary per Region that appears in the data)
 *
 * IMPORTANT: you must do this in a SINGLE pass (one loop / one reduce).
 * Revenue for a row = quantity * unitPrice.
 * averageUnitPrice per region = sum(unitPrice) / recordCount  (rounded to 2dp).
 * All monetary values rounded to 2 decimal places.
 *
 * Regions with zero records still appear in byRegion with all-zero values.
 */
export function aggregateRecords(records: SalesRecord[]): Pick<ReportSummary, "grandTotalRevenue" | "byRegion"> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 3 — Pipeline Orchestrator
 *
 * Accept `rawRows: unknown[]` and run the full pipeline:
 *   a. If rawRows is empty, return { status: "empty", message: "No rows to process" }
 *   b. Validate every row with validateRow (pass the array index as rowIndex)
 *   c. Collect ValidationFailure entries into errors[]
 *   d. Aggregate the valid SalesRecord entries with aggregateRecords
 *   e. Return { status: "complete", report: ReportSummary }
 *
 * The pipeline should NEVER throw — wrap the body in a try/catch and return
 * { status: "fatal", error: <message> } if an unexpected error occurs.
 */
export function runPipeline(rawRows: unknown[]): PipelineResult {
  // TODO: implement
  throw new Error("Not implemented");
}
