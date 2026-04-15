// ============================================================
// Typed CSV Report Parser
// challenge.ts
// ============================================================
// SCENARIO:
//   You are building the data-import pipeline for a sales analytics
//   dashboard. Raw CSV text arrives from uploaded files as plain
//   strings. Your parser must validate each row, transform it into
//   a strongly-typed SaleRecord, and return a fully-typed ParseReport.
//
// RULES:
//   • No `any`, no type assertions (`as`), no non-null assertions (`!`)
//   • strict: true must pass
//   • All logic lives in the functions below — do not add extra exports
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES  (do not change these)
// ------------------------------------------------------------------

/** The canonical shape of one validated sale row. */
export interface SaleRecord {
  id: string;
  region: Region;
  product: string;
  quantity: number;
  unitPrice: number;
  saleDate: Date;
}

/** Allowed sales regions. */
export type Region = "NA" | "EU" | "APAC" | "LATAM";

// ------------------------------------------------------------------
// 2. RESULT TYPES  (you must fill in the bodies marked TODO)
// ------------------------------------------------------------------

/**
 * A discriminated union representing the outcome of parsing a single row.
 *
 * TODO – Define two variants:
 *   • { ok: true;  value: SaleRecord }
 *   • { ok: false; rowIndex: number; raw: string; errors: string[] }
 */
export type RowResult = TODO_RowResult; // replace TODO_RowResult

type TODO_RowResult = never; // ← delete this line and replace with your union

/**
 * The final report returned by `parseCSV`.
 *
 * TODO – Define this interface with at least:
 *   • totalRows:   number
 *   • successRows: number
 *   • failedRows:  number
 *   • records:     SaleRecord[]          (only the valid ones)
 *   • failures:    Extract<RowResult, { ok: false }>[]
 */
export interface ParseReport {
  // TODO – add fields here
}

// ------------------------------------------------------------------
// 3. HELPER — column schema
// ------------------------------------------------------------------

/**
 * Describes how to parse and validate a single CSV column.
 *
 * TODO – Make this generic so that `parse` returns `T` and
 *        `validate` receives `T`.  The type parameter T should
 *        default to `string`.
 *
 * Requirements:
 *   • `header`   – the expected column header string
 *   • `parse`    – converts the raw cell string to T (may throw)
 *   • `validate` – returns an error message string if invalid,
 *                  or null if the value is acceptable
 */
export interface ColumnSchema<T = string> {
  // TODO – add fields here
}

// ------------------------------------------------------------------
// 4. COLUMN DEFINITIONS  (you must implement these)
// ------------------------------------------------------------------

/**
 * TODO – Define the full array of ColumnSchema entries that
 *        describe the expected CSV columns IN ORDER:
 *
 *   id        | string  | must be non-empty
 *   region    | Region  | must be one of "NA" | "EU" | "APAC" | "LATAM"
 *   product   | string  | must be non-empty
 *   quantity  | number  | must be a positive integer
 *   unitPrice | number  | must be > 0
 *   saleDate  | Date    | must parse as a valid date (new Date(...))
 *
 * Hint: you will need a tuple / readonly array typed with
 *       `satisfies ReadonlyArray<ColumnSchema<unknown>>` so that
 *       each entry can have its own T while still being collected.
 */
export const SALE_COLUMNS = [
  // TODO – fill in ColumnSchema objects
] satisfies ReadonlyArray<ColumnSchema<unknown>>;

// ------------------------------------------------------------------
// 5. CORE FUNCTIONS  (you must implement these)
// ------------------------------------------------------------------

/**
 * Parses a single CSV data row (already split on commas) against
 * the provided column schemas.
 *
 * Requirements:
 *   # 1  If `cells.length !== schemas.length`, return a failure with
 *        error "Expected <N> columns, got <M>".
 *   # 2  For each column, call `schema.parse`. If it throws, record
 *        the error "<header>: parse error – <message>".
 *   # 3  For each successfully parsed value, call `schema.validate`.
 *        If it returns a non-null string, record the error
 *        "<header>: <validation message>".
 *   # 4  If any errors were collected, return a failure RowResult.
 *   # 5  Otherwise assemble and return a success RowResult whose
 *        `value` is a SaleRecord built from the parsed cells.
 *
 * @param cells     - the raw cell strings for this row
 * @param rowIndex  - 0-based row index (header row is NOT counted)
 * @param raw       - the original unsplit row string (for error context)
 * @param schemas   - the column schema array to validate against
 */
export function parseRow(
  cells: string[],
  rowIndex: number,
  raw: string,
  schemas: ReadonlyArray<ColumnSchema<unknown>>
): RowResult {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Parses a full CSV string and returns a ParseReport.
 *
 * Requirements:
 *   # 1  Split the input on newlines; treat the first line as the
 *        header row and verify it matches SALE_COLUMNS headers
 *        (comma-joined).  If it doesn't match, throw an Error with
 *        message "Invalid CSV header".
 *   # 2  Skip blank lines.
 *   # 3  For each remaining data line, split on commas and call
 *        `parseRow`, collecting RowResults.
 *   # 4  Build and return a ParseReport from the collected results.
 *
 * @param csv - the full CSV text (header + data rows, newline-separated)
 */
export function parseCSV(csv: string): ParseReport {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Aggregates a list of SaleRecords into a per-region revenue map.
 *
 * Requirements:
 *   # 1  Return a `Record<Region, number>` where each value is the
 *        sum of (quantity * unitPrice) for that region.
 *   # 2  Regions with no sales must still appear in the result with
 *        value 0.
 *   # 3  Values must be rounded to 2 decimal places.
 *
 * @param records - validated sale records to aggregate
 */
export function revenueByRegion(records: SaleRecord[]): Record<Region, number> {
  // TODO
  throw new Error("Not implemented");
}
