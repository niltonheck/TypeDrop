// ============================================================
// Typed Expense Report Summariser
// ============================================================
// SCENARIO:
//   Raw expense entries arrive as `unknown` JSON from a mobile
//   upload. Your job is to:
//     1. Validate each raw entry into a typed `Expense`
//     2. Group expenses by category
//     3. Produce a per-category `ExpenseSummary`
//     4. Return a final `ExpenseReport` — all with zero `any`
// ============================================================

// --------------- Domain Types --------------------------------

export type ExpenseCategory =
  | "travel"
  | "meals"
  | "software"
  | "hardware"
  | "other";

/** A single validated expense entry. */
export interface Expense {
  id: string;
  description: string;
  amountCents: number;   // integer, > 0
  category: ExpenseCategory;
  date: string;          // ISO-8601 date string e.g. "2026-03-12"
  submittedBy: string;
}

/** Aggregated totals for one category. */
export interface ExpenseSummary {
  category: ExpenseCategory;
  totalCents: number;
  count: number;
  items: Expense[];
}

/** The final report returned to callers. */
export interface ExpenseReport {
  generatedAt: string;           // ISO-8601 datetime
  totalCents: number;            // grand total across all categories
  summaries: ExpenseSummary[];   // one entry per category that has ≥1 expense
}

// --------------- Result Type ---------------------------------

// REQUIREMENT 1:
//   Define a discriminated-union `Result<T, E>` with two variants:
//     - { ok: true;  value: T }
//     - { ok: false; error: E }

export type Result<T, E> = // TODO: fill in the discriminated union


// --------------- Validation Error ----------------------------

// REQUIREMENT 2:
//   Define a `ValidationError` interface with:
//     - field: string          — the name of the invalid field
//     - message: string        — human-readable reason
//     - rawValue: unknown      — the offending value (kept as unknown)

export interface ValidationError {
  // TODO
}

// --------------- Helper: isExpenseCategory ------------------

// REQUIREMENT 3:
//   Implement a type-guard function:
//     isExpenseCategory(value: unknown): value is ExpenseCategory
//   It must return true only for the five valid category strings.

export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  // TODO
}

// --------------- Core: validateExpense ----------------------

// REQUIREMENT 4:
//   Implement:
//     validateExpense(raw: unknown): Result<Expense, ValidationError[]>
//
//   Rules:
//     - `raw` must be a non-null object
//     - `id`          — non-empty string
//     - `description` — non-empty string
//     - `amountCents` — integer number > 0
//     - `category`    — must satisfy isExpenseCategory
//     - `date`        — string matching /^\d{4}-\d{2}-\d{2}$/
//     - `submittedBy` — non-empty string
//
//   If ANY field is invalid, collect ALL errors and return
//   { ok: false, error: ValidationError[] }.
//   Only return { ok: true, value: Expense } when every field passes.

export function validateExpense(raw: unknown): Result<Expense, ValidationError[]> {
  // TODO
}

// --------------- Core: groupByCategory ----------------------

// REQUIREMENT 5:
//   Implement:
//     groupByCategory(expenses: Expense[]): Map<ExpenseCategory, Expense[]>
//
//   Use a Map (not a plain object) keyed by ExpenseCategory.
//   Only categories that have at least one expense should appear as keys.

export function groupByCategory(
  expenses: Expense[]
): Map<ExpenseCategory, Expense[]> {
  // TODO
}

// --------------- Core: buildReport --------------------------

// REQUIREMENT 6:
//   Implement:
//     buildReport(expenses: Expense[]): ExpenseReport
//
//   - Compute one `ExpenseSummary` per category present in `expenses`
//   - Sort `summaries` by `totalCents` descending
//   - Set `generatedAt` to new Date().toISOString()
//   - Set `totalCents` to the grand total across all summaries

export function buildReport(expenses: Expense[]): ExpenseReport {
  // TODO
}

// --------------- Core: processRawExpenses -------------------

// REQUIREMENT 7:
//   Implement:
//     processRawExpenses(rawEntries: unknown[]): {
//       report:  ExpenseReport;
//       invalid: Array<{ raw: unknown; errors: ValidationError[] }>;
//     }
//
//   - Validate every entry with `validateExpense`
//   - Collect failed entries (with their errors) in `invalid`
//   - Build and return the report from the valid entries only
//   - Use the `Result` type internally — no try/catch needed

export function processRawExpenses(rawEntries: unknown[]): {
  report: ExpenseReport;
  invalid: Array<{ raw: unknown; errors: ValidationError[] }>;
} {
  // TODO
}
