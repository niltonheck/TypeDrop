// ============================================================
// Typed Expense Report Aggregator
// challenge.ts
// ============================================================
// Compile with: tsc --strict --noEmit challenge.ts
// Do NOT use `any`, `as`, or non-narrowing type assertions.
// ============================================================

// ── 1. Domain Types ─────────────────────────────────────────

/** Allowed expense categories. */
export type ExpenseCategory =
  | "travel"
  | "meals"
  | "accommodation"
  | "equipment"
  | "other";

/**
 * A validated, strongly-typed expense entry.
 * `date` must be a valid ISO-8601 date string (YYYY-MM-DD).
 * `amountCents` is a positive integer (cents, never fractional).
 */
export interface Expense {
  id: string;
  submittedBy: string;
  category: ExpenseCategory;
  description: string;
  amountCents: number;
  date: string; // YYYY-MM-DD
}

// ── 2. Validation Result Types ───────────────────────────────

/** A field-level validation error on a single raw entry. */
export interface ExpenseFieldError {
  field: string;
  message: string;
}

/** Discriminated union: a raw entry either parses cleanly or carries errors. */
export type ExpenseParseResult =
  | { ok: true; expense: Expense }
  | { ok: false; rawIndex: number; errors: ExpenseFieldError[] };

// ── 3. Aggregation Types ─────────────────────────────────────

/** Per-category summary produced during aggregation. */
export interface CategorySummary {
  category: ExpenseCategory;
  count: number;
  totalCents: number;
}

/**
 * The final report returned by `buildExpenseReport`.
 * `byCategory` must contain one entry per category that had
 * at least one valid expense; categories with no expenses are omitted.
 */
export interface ExpenseReport {
  validCount: number;
  invalidCount: number;
  totalCents: number;
  byCategory: CategorySummary[];
  parseErrors: Array<{ rawIndex: number; errors: ExpenseFieldError[] }>;
}

// ── 4. Utility: branded type for a validated ISO date string ─

/** Branded string that guarantees YYYY-MM-DD format. */
export type ISODateString = string & { readonly __brand: "ISODateString" };

/**
 * TODO (Task A): Implement this type guard.
 * Returns true — and narrows `value` to `ISODateString` — when
 * `value` is a non-empty string matching /^\d{4}-\d{2}-\d{2}$/.
 */
export function isISODateString(value: unknown): value is ISODateString {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO (Task B): Implement this type guard.
 * Returns true when `value` is one of the five valid ExpenseCategory strings.
 *
 * Requirement: the set of valid values must be derived from a
 * `const` array so that adding a new category only requires one
 * code change (the array), not touching the guard body.
 */
export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  // TODO: implement — hint: declare a readonly const tuple of all categories
  throw new Error("Not implemented");
}

// ── 5. Core Functions ────────────────────────────────────────

/**
 * TODO (Task C): Implement `parseExpense`.
 *
 * Validates a single raw (unknown) value into an `Expense`.
 * Returns `{ ok: true, expense }` on success.
 * Returns `{ ok: false, rawIndex, errors }` if ANY field is invalid.
 *
 * Validation rules (collect ALL errors before returning):
 *   - `id`           : must be a non-empty string
 *   - `submittedBy`  : must be a non-empty string
 *   - `category`     : must satisfy `isExpenseCategory`
 *   - `description`  : must be a non-empty string
 *   - `amountCents`  : must be a positive integer (> 0, Number.isInteger)
 *   - `date`         : must satisfy `isISODateString`
 *
 * The `rawIndex` parameter is the 0-based position in the original array
 * (used for error reporting).
 */
export function parseExpense(raw: unknown, rawIndex: number): ExpenseParseResult {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO (Task D): Implement `buildExpenseReport`.
 *
 * Accepts an array of raw (unknown) entries, parses each one,
 * and returns a complete `ExpenseReport`.
 *
 * Requirements:
 *   1. Parse every entry with `parseExpense` (preserve original indices).
 *   2. Aggregate valid expenses into per-category `CategorySummary` objects.
 *      Use a `Map<ExpenseCategory, CategorySummary>` for efficient grouping.
 *   3. `byCategory` in the result must be sorted A-Z by category name.
 *   4. `totalCents` is the sum across ALL valid expenses.
 *   5. `parseErrors` lists only the failed entries (rawIndex + errors).
 *   6. Categories with zero valid expenses must NOT appear in `byCategory`.
 */
export function buildExpenseReport(rawEntries: unknown[]): ExpenseReport {
  // TODO: implement
  throw new Error("Not implemented");
}
