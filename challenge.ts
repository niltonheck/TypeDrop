// ============================================================
// Typed Expense Report Summarizer
// ============================================================
// SCENARIO: Finance teams upload raw expense entries and need a
// strongly-typed summary grouped by category, with per-category
// totals and an overall grand total.
//
// Your task: implement the three functions below so that all
// types are satisfied under strict: true with no `any`.
// ============================================================

// --------------- Domain Types --------------------------------

export type ExpenseCategory =
  | "travel"
  | "meals"
  | "software"
  | "hardware"
  | "office"
  | "other";

export interface Expense {
  id: string;
  submittedBy: string;
  category: ExpenseCategory;
  amountUSD: number;          // always positive
  description: string;
  date: string;               // ISO 8601 date, e.g. "2026-09-19"
}

// --------------- Result Types --------------------------------

export interface CategorySummary {
  category: ExpenseCategory;
  totalUSD: number;
  count: number;
  /** The single highest-cost expense in this category */
  largestExpense: Expense;
}

export interface ExpenseReport {
  /** One entry per category that appears in the input */
  byCategory: Record<ExpenseCategory, CategorySummary>;
  grandTotalUSD: number;
  totalCount: number;
  /** ISO date string of the earliest expense, or null if input is empty */
  earliestDate: string | null;
  /** ISO date string of the latest expense, or null if input is empty */
  latestDate: string | null;
}

// --------------- Utility Types (fill these in) ---------------

/**
 * REQUIREMENT 1
 * A mapped type that produces an object whose keys are
 * ExpenseCategory and whose values are V.
 * Use this instead of a plain Record where you need to build
 * the accumulator incrementally.
 *
 * Hint: use a mapped type with `Partial` semantics so that
 * keys may be absent while building.
 */
export type PartialCategoryMap<V> = {
  // TODO: replace `unknown` with the correct mapped-type body
  [K in ExpenseCategory]?: V;
};

/**
 * REQUIREMENT 2
 * A type that picks only the numeric fields from Expense.
 * Use TypeScript's built-in utility types and/or conditional
 * types — do NOT manually list field names.
 */
export type NumericExpenseFields = {
  // TODO: replace `unknown` with the correct conditional/mapped body
  [K in keyof Expense as Expense[K] extends number ? K : never]: number;
};

// --------------- Functions to Implement ----------------------

/**
 * REQUIREMENT 3
 * Given a list of expenses, return an array of unique categories
 * present in that list, preserving first-seen order.
 * Return type must be inferred as `ExpenseCategory[]` — no widening.
 */
export function extractCategories(expenses: Expense[]): ExpenseCategory[] {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 4
 * Group expenses by category.
 * Return type: PartialCategoryMap<Expense[]>
 * Each key is only present if at least one expense belongs to it.
 */
export function groupByCategory(
  expenses: Expense[]
): PartialCategoryMap<Expense[]> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5
 * Given a non-empty array of expenses (all same category),
 * compute and return a CategorySummary.
 *
 * - totalUSD: sum of all amountUSD values (round to 2 decimal places)
 * - count: number of expenses
 * - largestExpense: the expense with the highest amountUSD
 *   (if tied, pick the one that appears first)
 */
export function summarizeCategory(expenses: Expense[]): CategorySummary {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 6
 * Build the full ExpenseReport from a flat list of expenses.
 *
 * - byCategory: only includes categories that appear in the input
 *   (the Record type allows this since all keys are optional at
 *    runtime — but the TYPE must be Record<ExpenseCategory, CategorySummary>)
 * - grandTotalUSD: sum of all amountUSD values (round to 2 decimal places)
 * - totalCount: total number of expense entries
 * - earliestDate / latestDate: min/max of expense.date (lexicographic
 *   comparison is valid for ISO 8601 date strings), null if empty
 *
 * Must call groupByCategory and summarizeCategory internally.
 */
export function buildExpenseReport(expenses: Expense[]): ExpenseReport {
  // TODO
  throw new Error("Not implemented");
}
