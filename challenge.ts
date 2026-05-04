// ============================================================
// Typed Expense Report Builder
// ============================================================
// SCENARIO:
//   Raw expense entries arrive as `unknown` from an employee
//   submission form. Your job is to validate each entry, group
//   the valid ones by category, and produce a typed report
//   summary. Invalid entries must be collected separately.
//
// RULES:
//   - No `any`, no type assertions (`as`), no non-null assertions (`!`)
//   - Implement every function marked TODO
//   - All code must compile under strict: true
// ============================================================

// ── 1. Domain types ─────────────────────────────────────────

/** Allowed expense categories. */
export type ExpenseCategory =
  | "travel"
  | "meals"
  | "accommodation"
  | "equipment"
  | "other";

/** A validated, strongly-typed expense entry. */
export interface ExpenseEntry {
  id: string;
  employeeId: string;
  category: ExpenseCategory;
  /** Amount in cents (positive integer). */
  amountCents: number;
  /** ISO-8601 date string, e.g. "2026-05-04" */
  date: string;
  description: string;
}

// ── 2. Result / validation types ────────────────────────────

export interface ValidationSuccess {
  kind: "success";
  entry: ExpenseEntry;
}

export interface ValidationFailure {
  kind: "failure";
  /** The original raw value that failed validation. */
  raw: unknown;
  reason: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

// ── 3. Report types ─────────────────────────────────────────

/**
 * Per-category summary produced by the report builder.
 * Keyed by ExpenseCategory.
 */
export type CategorySummary = Record<
  ExpenseCategory,
  { totalCents: number; count: number }
>;

export interface ExpenseReport {
  /** All successfully validated entries. */
  entries: ExpenseEntry[];
  /** Aggregated totals per category. */
  categorySummary: CategorySummary;
  /** Grand total across all categories, in cents. */
  grandTotalCents: number;
  /** Entries that failed validation. */
  failures: ValidationFailure[];
}

// ── 4. Helpers ───────────────────────────────────────────────

const VALID_CATEGORIES = new Set<ExpenseCategory>([
  "travel",
  "meals",
  "accommodation",
  "equipment",
  "other",
]);

/**
 * TODO: Return true when `value` is one of the valid ExpenseCategory strings.
 *
 * Requirements:
 *   R1. Must act as a type predicate so the caller's type narrows correctly.
 *   R2. Use the VALID_CATEGORIES set for the membership check.
 */
export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Validate a single raw value and return a ValidationResult.
 *
 * Requirements:
 *   R3.  `raw` must be a non-null object.
 *   R4.  `id` must be a non-empty string.
 *   R5.  `employeeId` must be a non-empty string.
 *   R6.  `category` must pass `isExpenseCategory`.
 *   R7.  `amountCents` must be a positive integer (> 0, Math.trunc check).
 *   R8.  `date` must be a non-empty string matching /^\d{4}-\d{2}-\d{2}$/.
 *   R9.  `description` must be a string (may be empty).
 *   R10. On the first failed check return a ValidationFailure with a
 *        descriptive `reason`; on success return a ValidationSuccess.
 */
export function validateExpenseEntry(raw: unknown): ValidationResult {
  // TODO
  throw new Error("Not implemented");
}

// ── 5. Core function ─────────────────────────────────────────

/**
 * TODO: Build a complete ExpenseReport from an array of unknown payloads.
 *
 * Requirements:
 *   R11. Validate every element of `rawEntries` using `validateExpenseEntry`.
 *   R12. Collect successes into `entries` and failures into `failures`.
 *   R13. Populate `categorySummary` so every ExpenseCategory key is present,
 *        even if its count is 0 and totalCents is 0.
 *   R14. Accumulate `totalCents` and `count` for each valid entry's category.
 *   R15. Compute `grandTotalCents` as the sum of all valid amountCents.
 */
export function buildExpenseReport(rawEntries: unknown[]): ExpenseReport {
  // TODO
  throw new Error("Not implemented");
}
