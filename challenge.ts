// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed Expense Splitter with Settlement Calculation
// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO
// You're building the core logic for a group-trip expense-splitting app.
// Participants log expenses paid on behalf of the group, and the app must:
//   1. Compute each person's net balance (positive = owed money, negative = owes money).
//   2. Produce the minimal list of cash transfers to settle all debts.
//
// All amounts are in whole cents (integers) to avoid floating-point issues.
// ─────────────────────────────────────────────────────────────────────────────

// ── Branded type ─────────────────────────────────────────────────────────────

/** Whole-cent integer amount. Use `asCents(n)` to create one. */
type Cents = number & { readonly __brand: "Cents" };

/**
 * REQUIREMENT 1
 * Implement `asCents`: accepts a plain `number` and returns a `Cents` branded value.
 * Throw a RangeError if `n` is not a finite integer.
 */
export function asCents(n: number): Cents {
  // TODO
  throw new Error("Not implemented");
}

// ── Core domain types ─────────────────────────────────────────────────────────

/** A single expense paid by one participant on behalf of a subset of the group. */
export interface Expense {
  /** Unique identifier for this expense. */
  readonly id: string;
  /** Display label (e.g. "Dinner at Luigi's"). */
  readonly description: string;
  /** Who paid. Must be a key in the participant map. */
  readonly paidBy: string;
  /** Total amount paid, in cents. */
  readonly amount: Cents;
  /**
   * Participants who share this expense (including the payer if they share it).
   * Must be a non-empty array.
   */
  readonly splitAmong: readonly string[];
}

/** Net financial position of one participant after all expenses are considered. */
export interface Balance {
  readonly participant: string;
  /** Positive → is owed this amount. Negative → owes this amount. */
  readonly netCents: Cents;
}

/** A single directed cash transfer that settles part of the debt. */
export interface Transfer {
  readonly from: string;
  readonly to: string;
  readonly amountCents: Cents;
}

// ── Result type ───────────────────────────────────────────────────────────────

export type SplitResult =
  | { readonly ok: true;  readonly balances: readonly Balance[]; readonly transfers: readonly Transfer[] }
  | { readonly ok: false; readonly error: SplitError };

// ── Typed error union ─────────────────────────────────────────────────────────

/**
 * REQUIREMENT 2
 * Define `SplitError` as a discriminated union with (at minimum) these three variants:
 *   - "NO_PARTICIPANTS"   — the participants list is empty
 *   - "UNKNOWN_PAYER"     — expense.paidBy is not in the participants list
 *   - "EMPTY_SPLIT"       — expense.splitAmong is empty
 *
 * Each variant must carry a `kind` discriminant and a human-readable `message` string.
 * You may add extra fields to individual variants if useful.
 */
export type SplitError =
  // TODO — replace this placeholder with your discriminated union
  never;

// ── Main function ─────────────────────────────────────────────────────────────

/**
 * REQUIREMENT 3 — `computeSplit`
 *
 * Given a list of participant names and a list of expenses, return a `SplitResult`.
 *
 * Steps:
 *  a) Validate inputs:
 *       - Return `{ ok: false, error: { kind: "NO_PARTICIPANTS", ... } }` if participants is empty.
 *       - For each expense, return an error if `paidBy` is not in participants.
 *       - For each expense, return an error if `splitAmong` is empty.
 *       (Return the FIRST error encountered; do not accumulate multiple errors.)
 *
 *  b) Compute balances:
 *       - Each participant's balance starts at 0.
 *       - For each expense: the payer's balance increases by `amount`.
 *         Each person in `splitAmong` has their balance decreased by
 *         `Math.floor(amount / splitAmong.length)`.
 *         Any remainder cents (amount % splitAmong.length) are subtracted
 *         from the FIRST person in `splitAmong`.
 *
 *  c) Compute minimal transfers (greedy creditor–debtor matching):
 *       - Separate participants into creditors (netCents > 0) and debtors (netCents < 0).
 *       - Repeatedly match the largest creditor with the largest debtor, emit a Transfer,
 *         and reduce both balances until all are settled (within ±1 cent due to rounding).
 *       - Transfers with amountCents === 0 should NOT be included.
 *
 *  d) Return `{ ok: true, balances, transfers }`.
 *
 * All `netCents` and `amountCents` values in the output must be `Cents` branded values.
 */
export function computeSplit(
  participants: readonly string[],
  expenses: readonly Expense[]
): SplitResult {
  // TODO
  throw new Error("Not implemented");
}

// ── Utility: narrow a SplitResult ────────────────────────────────────────────

/**
 * REQUIREMENT 4 — `formatSummary`
 *
 * Given a `SplitResult`, return a human-readable summary string:
 *   - If `ok` is false: return `"Error: <message>"` using the error's `message` field.
 *   - If `ok` is true:
 *       • If there are no transfers, return `"All settled up!"`.
 *       • Otherwise, return one line per transfer, joined by "\n":
 *           `"<from> → <to>: $<dollars>.<cents padded to 2 digits>"`
 *         e.g. `"Alice → Bob: $5.03"`
 *
 * Use type narrowing on `result.ok` — no type assertions allowed.
 */
export function formatSummary(result: SplitResult): string {
  // TODO
  throw new Error("Not implemented");
}
