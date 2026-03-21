// ============================================================
// Typed Expense Report Aggregator
// challenge.ts
// ============================================================
// Compile target: TypeScript 5.x, strict: true, no `any`
// ============================================================

// -----------------------------------------------------------
// 1. DOMAIN TYPES
// -----------------------------------------------------------

/** Allowed spending categories */
export type ExpenseCategory =
  | "travel"
  | "meals"
  | "software"
  | "equipment"
  | "other";

/** Raw shape coming in from a form submission (all fields untrusted) */
export interface RawExpenseEntry {
  readonly employeeId: unknown;
  readonly description: unknown;
  readonly category: unknown;
  readonly amountUSD: unknown;
  readonly submittedAt: unknown; // ISO-8601 date string
}

/** A validated, fully-typed expense entry */
export interface ExpenseEntry {
  readonly employeeId: string;
  readonly description: string;
  readonly category: ExpenseCategory;
  readonly amountUSD: number;
  readonly submittedAt: Date;
}

// -----------------------------------------------------------
// 2. REIMBURSEMENT STATUS — discriminated union
// -----------------------------------------------------------

/**
 * Derived from the validated entry:
 *   - "auto_approved"  : amountUSD <= AUTO_APPROVE_LIMIT
 *   - "needs_review"   : amountUSD >  AUTO_APPROVE_LIMIT && amountUSD <= REVIEW_LIMIT
 *   - "flagged"        : amountUSD >  REVIEW_LIMIT
 */
export type ReimbursementStatus =
  | { readonly kind: "auto_approved"; readonly approvedAt: Date }
  | { readonly kind: "needs_review"; readonly reason: string }
  | { readonly kind: "flagged"; readonly reason: string; readonly flaggedAmount: number };

export const AUTO_APPROVE_LIMIT = 50;   // USD
export const REVIEW_LIMIT       = 500;  // USD

/** An expense entry enriched with its reimbursement status */
export interface TaggedExpenseEntry extends ExpenseEntry {
  readonly status: ReimbursementStatus;
}

// -----------------------------------------------------------
// 3. VALIDATION ERRORS — discriminated union
// -----------------------------------------------------------

export type ValidationError =
  | { readonly kind: "missing_field";  readonly field: string }
  | { readonly kind: "invalid_type";   readonly field: string; readonly expected: string }
  | { readonly kind: "invalid_value";  readonly field: string; readonly message: string };

// -----------------------------------------------------------
// 4. RESULT TYPE
// -----------------------------------------------------------

export type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

// -----------------------------------------------------------
// 5. SUMMARY TYPE
// -----------------------------------------------------------

/** Per-category aggregate produced by the final summary step */
export interface CategorySummary {
  readonly category: ExpenseCategory;
  readonly totalUSD: number;
  readonly count: number;
  /** Breakdown by reimbursement status kind */
  readonly byStatus: Record<ReimbursementStatus["kind"], number>;
}

/** Top-level report returned by `buildExpenseReport` */
export interface ExpenseReport {
  /** All successfully tagged entries */
  readonly entries: ReadonlyArray<TaggedExpenseEntry>;
  /** Entries sorted by amountUSD descending */
  readonly sortedByAmount: ReadonlyArray<TaggedExpenseEntry>;
  /** One summary object per category that appears in the valid entries */
  readonly categorySummaries: ReadonlyArray<CategorySummary>;
  /** Grand total across all valid entries */
  readonly grandTotalUSD: number;
  /** Raw entries that failed validation, paired with their errors */
  readonly rejected: ReadonlyArray<{
    readonly raw: RawExpenseEntry;
    readonly error: ValidationError;
  }>;
}

// -----------------------------------------------------------
// 6. FUNCTIONS TO IMPLEMENT
// -----------------------------------------------------------

/**
 * TODO 1 — validateExpenseEntry
 *
 * Validate a single `RawExpenseEntry` and return a `Result`.
 *
 * Requirements:
 *  a) `employeeId`  must be a non-empty string
 *  b) `description` must be a non-empty string
 *  c) `category`    must be one of the `ExpenseCategory` union members
 *  d) `amountUSD`   must be a finite number > 0
 *  e) `submittedAt` must be a string that parses to a valid Date
 *
 * Return the FIRST validation error encountered (fail-fast).
 * On success, return the fully-typed `ExpenseEntry`.
 */
export function validateExpenseEntry(
  raw: RawExpenseEntry
): Result<ExpenseEntry, ValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 2 — deriveStatus
 *
 * Given a validated `ExpenseEntry`, compute its `ReimbursementStatus`.
 *
 * Rules:
 *  - amountUSD <= AUTO_APPROVE_LIMIT  →  auto_approved  (approvedAt = entry.submittedAt)
 *  - amountUSD <= REVIEW_LIMIT        →  needs_review   (reason = "Amount exceeds auto-approval threshold")
 *  - otherwise                        →  flagged        (reason = "Amount exceeds review limit", flaggedAmount = amountUSD)
 */
export function deriveStatus(entry: ExpenseEntry): ReimbursementStatus {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 3 — buildExpenseReport
 *
 * Process an array of raw entries end-to-end:
 *  a) Validate each entry with `validateExpenseEntry`
 *  b) Tag valid entries with `deriveStatus`
 *  c) Build `sortedByAmount` (descending by amountUSD)
 *  d) Build `categorySummaries` — one per distinct category, each with:
 *       - totalUSD  : sum of amountUSD for that category
 *       - count     : number of entries in that category
 *       - byStatus  : count of entries per ReimbursementStatus kind
 *  e) Compute `grandTotalUSD` as the sum of all valid entry amounts
 *  f) Collect rejected entries (raw + first error)
 *
 * The `entries` array must preserve the original relative order of valid entries.
 */
export function buildExpenseReport(
  raws: ReadonlyArray<RawExpenseEntry>
): ExpenseReport {
  // TODO: implement
  throw new Error("Not implemented");
}
