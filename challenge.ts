// ============================================================
// Typed Expense Splitter
// ============================================================
// GOAL: Implement the four functions below so the test harness
// passes. The HARDEST part is getting the TYPES right — read
// every type alias and requirement comment carefully.
// ============================================================

// -----------------------------------------------------------
// Domain types — do NOT modify these
// -----------------------------------------------------------

/** Every participant is identified by a plain string name. */
export type Participant = string;

/**
 * How an expense is divided among participants.
 *
 * "equal"  — split evenly among ALL participants in the group
 * "shares" — each listed participant pays proportionally to
 *             their share count (shares must be > 0)
 * "exact"  — each listed participant owes the exact amount
 *             given (amounts must sum to the expense total)
 */
export type SplitRule =
  | { kind: "equal" }
  | { kind: "shares"; participants: Record<Participant, number> }
  | { kind: "exact"; participants: Record<Participant, number> };

/** A single shared expense logged by one payer. */
export interface Expense {
  id: string;
  description: string;
  /** The person who paid the full amount up-front. */
  paidBy: Participant;
  /** Total amount paid, in cents (integer, > 0). */
  amountCents: number;
  splitRule: SplitRule;
}

/**
 * Net balance per participant, in cents.
 * Positive  → they are owed money (they overpaid).
 * Negative  → they owe money (they underpaid).
 */
export type Balances = Record<Participant, number>;

/**
 * A single directed settlement transfer.
 * `from` owes `to` exactly `amountCents`.
 */
export interface Settlement {
  from: Participant;
  to: Participant;
  amountCents: number;
}

/**
 * The final summary returned to the caller.
 * `settled` is true when every balance rounds to zero.
 */
export interface SplitSummary {
  balances: Balances;
  settlements: Settlement[];
  settled: boolean;
}

// -----------------------------------------------------------
// Requirement 1 — computeBalances
// -----------------------------------------------------------
// Given a list of expenses and the full list of group
// participants, return a Balances map initialised to 0 for
// every participant, then adjusted for each expense:
//
//   • Credit the payer with +amountCents (they fronted the cash).
//   • Debit each participant their share according to splitRule:
//       - "equal"  : amountCents / participants.length each
//                    (use Math.floor; add any remainder cent to
//                     the FIRST participant alphabetically)
//       - "shares" : proportion = participantShares / totalShares
//                    amountCents * proportion (Math.floor each;
//                    add leftover cents to the participant with
//                    the largest share, tie-break alphabetically)
//       - "exact"  : use the amounts as-is (they already sum to
//                    amountCents — no rounding needed)
//
// REQUIREMENT: The function must be generic over the participant
// list so that TypeScript infers the return type as
// Record<Participant, number> (Balances).  Use a discriminated
// union type guard (or narrowing) when switching on splitRule.kind.
export function computeBalances(
  expenses: Expense[],
  participants: Participant[]
): Balances {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// Requirement 2 — minimiseSettlements
// -----------------------------------------------------------
// Given a Balances map, produce the MINIMUM list of Settlement
// transfers that zeros every balance.
//
// Algorithm (greedy):
//   1. Separate participants into "creditors" (balance > 0) and
//      "debtors" (balance < 0).
//   2. Repeatedly match the largest debtor with the largest
//      creditor, transfer min(|debt|, credit), and remove the
//      participant whose balance reaches 0.
//   3. Continue until all balances are 0.
//
// Return Settlement[] sorted by `from` name ascending,
// then `to` name ascending.
//
// REQUIREMENT: The parameter type must be exactly `Balances`
// (no widening). Participants with a balance of exactly 0
// must be ignored entirely.
export function minimiseSettlements(balances: Balances): Settlement[] {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// Requirement 3 — splitExpenses
// -----------------------------------------------------------
// Compose computeBalances + minimiseSettlements and return a
// SplitSummary.
//
// `settled` is true when every value in balances is 0
// (i.e., settlements is empty after minimisation).
//
// REQUIREMENT: Return type must be explicitly annotated as
// SplitSummary — do not let it be inferred as a wider type.
export function splitExpenses(
  expenses: Expense[],
  participants: Participant[]
): SplitSummary {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// Requirement 4 — formatSettlement
// -----------------------------------------------------------
// Return a human-readable string for a single Settlement:
//
//   "<from> owes <to> $<dollars>.<cents>"
//
// Where dollars and cents are derived from amountCents:
//   amountCents = 1525  →  "$15.25"
//   amountCents = 300   →  "$3.00"
//   amountCents = 5     →  "$0.05"
//
// REQUIREMENT: Use a template literal type for the return type:
//
//   `${string} owes ${string} $${string}`
//
// The function signature must reflect this return type exactly.
export function formatSettlement(
  settlement: Settlement
): `${string} owes ${string} $${string}` {
  // TODO: implement
  throw new Error("Not implemented");
}
