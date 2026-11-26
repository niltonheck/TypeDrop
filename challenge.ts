// ============================================================
// Typed Expense Splitter: Group Bills, Share Calculation & Settlement Summary
// ============================================================
// SCENARIO:
//   Friends on a trip log shared expenses. Each expense has a payer,
//   a list of participants, a split strategy, and an amount. Your job
//   is to compute each person's net balance and produce a minimal list
//   of typed settlement transactions.
//
// REQUIREMENTS:
//   1. Define a `SplitStrategy` discriminated union with two variants:
//        - "equal"  — amount divided evenly among all participants
//        - "custom" — each participant has an explicit `share` (numbers
//                     that must sum to the expense amount; you may assume
//                     the caller provides valid shares)
//   2. Define an `Expense` type that captures:
//        - id: string
//        - description: string
//        - paidBy: string          (participant name)
//        - participants: string[]  (everyone who owes a share, including payer)
//        - amount: number          (total bill in cents to avoid float issues)
//        - split: SplitStrategy
//   3. Define a `Settlement` type representing one payment:
//        - from: string
//        - to: string
//        - amount: number          (in cents)
//   4. Define a `SplitSummary` type:
//        - balances: Record<string, number>   (net cents per person; positive = owed money, negative = owes money)
//        - settlements: Settlement[]
//   5. Implement `computeShares(expense: Expense): Record<string, number>`
//        Returns how many cents each participant owes FOR this expense
//        (the payer's share is what they owe themselves — included for
//        completeness but nets to zero in their balance).
//        - "equal" : Math.floor(amount / participants.length) per person;
//          any remainder (amount % participants.length cents) is added to
//          the FIRST participant's share.
//        - "custom": return each participant's explicit share directly.
//   6. Implement `computeBalances(expenses: Expense[]): Record<string, number>`
//        Aggregates net balances across all expenses.
//        For each expense, the payer GAINS the full amount; every participant
//        (including the payer) LOSES their computed share.
//   7. Implement `settleDebts(balances: Record<string, number>): Settlement[]`
//        Produces a minimal list of Settlement objects that zero out all
//        balances. Use a simple greedy approach:
//          - Separate people into "creditors" (balance > 0) and
//            "debtors"   (balance < 0).
//          - Repeatedly match the largest creditor with the largest debtor,
//            settle the minimum of the two absolute balances, and reduce both.
//          - Stop when all balances are zero (ignore dust < 1 cent).
//   8. Implement `splitExpenses(expenses: Expense[]): SplitSummary`
//        Composes the above: compute balances, compute settlements, return
//        a `SplitSummary`.
// ============================================================

// TODO 1 — Define SplitStrategy (discriminated union: "equal" | "custom")
// Hint: the "custom" variant needs a `shares` field: Record<string, number>
export type SplitStrategy = never; // replace this

// TODO 2 — Define Expense
export type Expense = never; // replace this

// TODO 3 — Define Settlement
export type Settlement = never; // replace this

// TODO 4 — Define SplitSummary
export type SplitSummary = never; // replace this

// TODO 5 — Implement computeShares
export function computeShares(expense: Expense): Record<string, number> {
  throw new Error("Not implemented");
}

// TODO 6 — Implement computeBalances
export function computeBalances(expenses: Expense[]): Record<string, number> {
  throw new Error("Not implemented");
}

// TODO 7 — Implement settleDebts
export function settleDebts(balances: Record<string, number>): Settlement[] {
  throw new Error("Not implemented");
}

// TODO 8 — Implement splitExpenses
export function splitExpenses(expenses: Expense[]): SplitSummary {
  throw new Error("Not implemented");
}
