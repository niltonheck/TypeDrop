// ============================================================
// Typed Expense Report Categorizer
// ============================================================
// SCENARIO: Employees submit raw expense entries. Your job is to
// validate them, apply per-category reimbursement caps, and
// produce a typed per-employee summary report.
// ============================================================

// ----------------------------
// Domain Types
// ----------------------------

/** All valid expense categories */
export type ExpenseCategory =
  | "travel"
  | "meals"
  | "software"
  | "hardware"
  | "training"
  | "other";

/** An expense entry as submitted by an employee (raw / unvalidated) */
export interface RawExpense {
  id: string;
  employeeId: string;
  category: string;       // might not be a valid ExpenseCategory
  amountUSD: number;      // might be negative or zero
  description: string;
  submittedAt: string;    // ISO date string — might be malformed
}

/** A validated, well-typed expense ready for processing */
export interface ValidExpense {
  id: string;
  employeeId: string;
  category: ExpenseCategory;
  amountUSD: number;      // guaranteed > 0
  description: string;
  submittedAt: Date;
}

/** Reasons an expense can fail validation — discriminated union */
export type ValidationFailure =
  | { reason: "invalid_category"; raw: string }
  | { reason: "non_positive_amount"; raw: number }
  | { reason: "invalid_date"; raw: string };

/** Result of validating a single RawExpense */
export type ValidationResult =
  | { ok: true;  expense: ValidExpense }
  | { ok: false; id: string; failures: ValidationFailure[] };

// ----------------------------
// Reimbursement caps (USD) per category
// ----------------------------

/** Caps are defined for every ExpenseCategory — no category may be missing */
export type CategoryCaps = Record<ExpenseCategory, number>;

export const DEFAULT_CAPS: CategoryCaps = {
  travel:   1500,
  meals:     75,
  software:  500,
  hardware: 1000,
  training:  800,
  other:     200,
};

// ----------------------------
// Summary Types
// ----------------------------

/** Per-category breakdown inside an employee summary */
export interface CategorySummary {
  totalSubmitted: number;   // sum of all valid amounts in this category
  totalReimbursed: number;  // capped at DEFAULT_CAPS[category] per expense
  expenseCount: number;
}

/** Full summary for one employee */
export interface EmployeeSummary {
  employeeId: string;
  byCategory: Partial<Record<ExpenseCategory, CategorySummary>>;
  grandTotalSubmitted: number;
  grandTotalReimbursed: number;
  rejectedCount: number;    // number of raw expenses that failed validation
}

// ----------------------------
// TODO 1 — validateExpense
// ----------------------------
// Validate a single RawExpense.
//
// Requirements:
//   1. The `category` field must be one of the valid ExpenseCategory values.
//   2. `amountUSD` must be strictly greater than 0.
//   3. `submittedAt` must parse to a valid (non-NaN) Date.
//   4. Collect ALL failures (don't short-circuit after the first).
//   5. If there are no failures, return { ok: true, expense: ValidExpense }.
//   6. If there are any failures, return { ok: false, id, failures }.
//
export function validateExpense(raw: RawExpense): ValidationResult {
  // TODO: implement
  throw new Error("Not implemented");
}

// ----------------------------
// TODO 2 — applyCap
// ----------------------------
// Return the reimbursable amount for a single valid expense.
//
// Requirements:
//   1. The reimbursed amount is Math.min(expense.amountUSD, caps[expense.category]).
//   2. The function must accept a `caps` parameter typed as CategoryCaps
//      so callers can pass custom caps in tests.
//
export function applycap(expense: ValidExpense, caps: CategoryCaps): number {
  // TODO: implement
  throw new Error("Not implemented");
}

// ----------------------------
// TODO 3 — buildEmployeeSummaries
// ----------------------------
// Process a list of RawExpenses and return one EmployeeSummary per employee.
//
// Requirements:
//   1. Validate every raw expense using `validateExpense`.
//   2. For valid expenses, accumulate CategorySummary data under `byCategory`.
//      Use `applycap` with DEFAULT_CAPS to compute `totalReimbursed`.
//   3. Count invalid expenses in `rejectedCount`.
//   4. Compute `grandTotalSubmitted` and `grandTotalReimbursed` from all
//      valid expenses for that employee.
//   5. Return an array of EmployeeSummary — one entry per unique employeeId
//      seen across ALL raw expenses (valid or not).
//   6. The return type must be EmployeeSummary[] — no extra properties allowed.
//
export function buildEmployeeSummaries(raws: RawExpense[]): EmployeeSummary[] {
  // TODO: implement
  throw new Error("Not implemented");
}
