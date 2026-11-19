// ============================================================
// Typed Expense Report: Categorisation, Budgets & Summary Rollup
// ============================================================
// SCENARIO:
//   Raw expense data arrives as `unknown` JSON from a form
//   submission API. You must:
//     1. Parse & validate each raw entry into a typed Expense
//     2. Evaluate each expense against a category Budget
//     3. Produce a per-category BudgetStatus
//     4. Roll everything up into a typed ExpenseSummary report
//
// Compile target: TypeScript 5.x, strict: true, no `any`.
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES — fill in / extend as needed
// ------------------------------------------------------------------

/** The accepted expense categories. */
export type ExpenseCategory =
  | "travel"
  | "meals"
  | "accommodation"
  | "equipment"
  | "software"
  | "other";

/**
 * A validated, parsed expense record.
 * All monetary amounts are in the same currency (integers, cents).
 */
export interface Expense {
  id: string;
  submittedBy: string;
  category: ExpenseCategory;
  /** Amount in cents (must be > 0). */
  amountCents: number;
  /** ISO-8601 date string, e.g. "2026-11-19" */
  date: string;
  description: string;
}

/**
 * A budget allocation for a single category.
 * `limitCents` is the maximum total allowed for the period.
 */
export interface Budget {
  category: ExpenseCategory;
  /** Budget ceiling in cents. */
  limitCents: number;
}

// ------------------------------------------------------------------
// 2. RESULT / ERROR TYPES
// ------------------------------------------------------------------

/**
 * TODO: Define a discriminated-union Result type:
 *   - { ok: true;  value: T }
 *   - { ok: false; error: ParseError }
 */
export type Result<T> = // TODO

/**
 * TODO: Define a ParseError discriminated union covering at least:
 *   - "missing_field"   — a required field is absent
 *   - "invalid_type"    — a field has the wrong type
 *   - "invalid_value"   — a field value is out of range / not in enum
 *
 * Each variant must carry: { kind: <discriminant>; field: string; message: string }
 */
export type ParseError = // TODO

// ------------------------------------------------------------------
// 3. BUDGET STATUS TYPES
// ------------------------------------------------------------------

/**
 * TODO: Define a BudgetStatus discriminated union:
 *   - "under_budget"  — totalSpentCents < limitCents
 *   - "at_limit"      — totalSpentCents === limitCents
 *   - "over_budget"   — totalSpentCents > limitCents
 *
 * Every variant must carry:
 *   category, totalSpentCents, limitCents
 *
 * "under_budget" additionally carries:
 *   remainingCents: number
 *
 * "over_budget" additionally carries:
 *   overageCents: number
 */
export type BudgetStatus = // TODO

// ------------------------------------------------------------------
// 4. SUMMARY REPORT TYPE
// ------------------------------------------------------------------

/**
 * TODO: Define ExpenseSummary — the final rollup report shape:
 *   - expenses:        Expense[]            — all valid expenses
 *   - parseErrors:     Array<{ raw: unknown; error: ParseError }>
 *                                          — entries that failed validation
 *   - budgetStatuses:  BudgetStatus[]       — one per category that has
 *                                            at least one expense OR a budget
 *   - totalSpentCents: number               — grand total across all expenses
 *   - periodStart:     string               — earliest expense date (ISO-8601)
 *   - periodEnd:       string               — latest  expense date (ISO-8601)
 */
export type ExpenseSummary = // TODO

// ------------------------------------------------------------------
// 5. FUNCTIONS TO IMPLEMENT
// ------------------------------------------------------------------

/**
 * REQUIREMENT 1 — parseExpense
 *
 * Validate an `unknown` value and, if valid, return
 * `{ ok: true, value: Expense }`.
 * On any validation failure return `{ ok: false, error: ParseError }`.
 *
 * Validation rules:
 *   - `id`          must be a non-empty string
 *   - `submittedBy` must be a non-empty string
 *   - `category`    must be one of the ExpenseCategory literals
 *   - `amountCents` must be a positive integer (> 0)
 *   - `date`        must be a string matching /^\d{4}-\d{2}-\d{2}$/
 *   - `description` must be a string (may be empty)
 *
 * Return the FIRST error encountered in the order listed above.
 */
export function parseExpense(raw: unknown): Result<Expense> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2 — evaluateBudget
 *
 * Given a list of already-validated expenses and a Budget,
 * compute the BudgetStatus for that category.
 *
 * Only expenses whose `category` matches the budget's category
 * should be counted.
 *
 * Use strict equality for "at_limit".
 */
export function evaluateBudget(
  expenses: readonly Expense[],
  budget: Budget
): BudgetStatus {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 3 — buildSummary
 *
 * Process a mixed array of raw (unknown) inputs and an optional
 * array of Budget definitions, and return a fully-typed
 * ExpenseSummary.
 *
 * Steps:
 *   a. Run parseExpense on every raw entry; split into
 *      valid expenses and parse errors.
 *   b. Collect every category that appears in either the valid
 *      expenses OR the provided budgets.
 *   c. For each such category, call evaluateBudget.
 *      If no Budget is defined for a category, treat limitCents as 0
 *      (every expense is "over_budget").
 *   d. Compute totalSpentCents, periodStart, and periodEnd from
 *      valid expenses only.
 *      If there are no valid expenses, periodStart and periodEnd
 *      should both be "" (empty string).
 *
 * @param rawEntries  - array of unknown values from the API
 * @param budgets     - optional budget definitions (default: [])
 */
export function buildSummary(
  rawEntries: readonly unknown[],
  budgets?: readonly Budget[]
): ExpenseSummary {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. BONUS — type-level exhaustiveness helper
// ------------------------------------------------------------------

/**
 * TODO (stretch): Implement a typed helper
 *
 *   formatBudgetStatus(status: BudgetStatus): string
 *
 * that returns a human-readable one-liner for each variant and
 * uses a `never`-based exhaustiveness check so the compiler
 * catches any future variant additions at compile time.
 */
export function formatBudgetStatus(status: BudgetStatus): string {
  // TODO
  throw new Error("Not implemented");
}
