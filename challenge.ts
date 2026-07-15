// ============================================================
// Challenge: Typed CSV Row Parser & Aggregator
// Date: 2026-07-15 | Difficulty: Easy
// ============================================================
// SCENARIO
// You're building the data-import feature for a budgeting app.
// Raw CSV rows arrive as plain strings. Your module must:
//   1. Parse & validate each row into a typed Transaction record.
//   2. Collect structured parse errors for invalid rows.
//   3. Aggregate valid transactions into a per-category SpendingSummary.
// ============================================================

// --------------- Domain Types --------------------------------

export type Category = "food" | "transport" | "utilities" | "entertainment" | "other";

/**
 * A valid, parsed transaction row.
 * date  – ISO-8601 date string (YYYY-MM-DD)
 * amount – positive number (dollars, two decimal places max)
 * category – one of the Category union members
 * description – non-empty string
 */
export interface Transaction {
  date: string;
  amount: number;
  category: Category;
  description: string;
}

// --------------- Result Types --------------------------------

// Requirement 1 ─ Define a discriminated union `ParseResult<T>` with two
// variants: { ok: true; value: T } and { ok: false; error: string }.
// Use a generic type parameter T.
export type ParseResult<T> = /* TODO */ never;

// --------------- Row Parser ----------------------------------

/**
 * Requirement 2 ─ Implement `parseTransactionRow`.
 *
 * Input format (comma-separated, no extra whitespace):
 *   "<date>,<amount>,<category>,<description>"
 *   e.g. "2026-07-01,12.50,food,Coffee at Blue Bottle"
 *
 * Validation rules (return { ok: false, error: <message> } on failure):
 *   a) Must have exactly 4 comma-separated fields.
 *   b) `date` must match /^\d{4}-\d{2}-\d{2}$/.
 *   c) `amount` must be a finite positive number.
 *   d) `category` must be one of the Category union values.
 *   e) `description` must be a non-empty string.
 *
 * On success return { ok: true, value: Transaction }.
 */
export function parseTransactionRow(row: string): ParseResult<Transaction> {
  // TODO
  throw new Error("Not implemented");
}

// --------------- Batch Parser --------------------------------

/**
 * Requirement 3 ─ Implement `parseAll`.
 *
 * Given an array of raw CSV strings, run `parseTransactionRow` on each.
 * Return an object with:
 *   valid   – Transaction[]  (only successfully parsed rows)
 *   errors  – Array<{ row: string; error: string }>  (failed rows + reason)
 */
export interface ParseAllResult {
  valid: Transaction[];
  errors: Array<{ row: string; error: string }>;
}

export function parseAll(rows: string[]): ParseAllResult {
  // TODO
  throw new Error("Not implemented");
}

// --------------- Aggregator ----------------------------------

/**
 * Requirement 4 ─ Define `SpendingSummary` as a mapped type over Category.
 * Each key maps to:  { total: number; count: number }
 *
 * Hint: use a mapped type — { [K in Category]: ... }
 */
export type SpendingSummary = /* TODO */ never;

/**
 * Requirement 5 ─ Implement `summariseByCategory`.
 *
 * Given a Transaction[], return a SpendingSummary where:
 *   - `total` is the sum of amounts for that category (rounded to 2 decimal places).
 *   - `count` is the number of transactions in that category.
 * Categories with no transactions should have total: 0, count: 0.
 */
export function summariseByCategory(transactions: Transaction[]): SpendingSummary {
  // TODO
  throw new Error("Not implemented");
}
