// challenge.test.ts
import {
  computeShares,
  computeBalances,
  settleDebts,
  splitExpenses,
  type Expense,
  type SplitSummary,
} from "./challenge";

// ── Mock Data ────────────────────────────────────────────────

// Alice pays a $30.00 (3000 cents) dinner split equally among Alice, Bob, Carol
const dinnerExpense: Expense = {
  id: "exp-1",
  description: "Dinner",
  paidBy: "Alice",
  participants: ["Alice", "Bob", "Carol"],
  amount: 3000,
  split: { kind: "equal" },
};

// Bob pays a $25.00 (2500 cents) taxi; custom split: Bob 1000, Carol 1500
const taxiExpense: Expense = {
  id: "exp-2",
  description: "Taxi",
  paidBy: "Bob",
  participants: ["Bob", "Carol"],
  amount: 2500,
  split: {
    kind: "custom",
    shares: { Bob: 1000, Carol: 1500 },
  },
};

// Carol pays a $10.01 (1001 cents) coffee split equally among Alice, Carol
// (tests remainder rounding: 1001 / 2 = 500 remainder 1 → first participant gets 501)
const coffeeExpense: Expense = {
  id: "exp-3",
  description: "Coffee",
  paidBy: "Carol",
  participants: ["Alice", "Carol"],
  amount: 1001,
  split: { kind: "equal" },
};

// ── Test 1: computeShares — equal split ─────────────────────
const dinnerShares = computeShares(dinnerExpense);
console.assert(
  dinnerShares["Alice"] === 1000 &&
    dinnerShares["Bob"] === 1000 &&
    dinnerShares["Carol"] === 1000,
  `TEST 1 FAILED — equal split shares should each be 1000, got: ${JSON.stringify(dinnerShares)}`
);
console.log("TEST 1 passed — equal split shares:", dinnerShares);

// ── Test 2: computeShares — equal split with remainder ──────
const coffeeShares = computeShares(coffeeExpense);
console.assert(
  coffeeShares["Alice"] === 501 && coffeeShares["Carol"] === 500,
  `TEST 2 FAILED — remainder should go to first participant, got: ${JSON.stringify(coffeeShares)}`
);
console.log("TEST 2 passed — remainder rounding:", coffeeShares);

// ── Test 3: computeShares — custom split ────────────────────
const taxiShares = computeShares(taxiExpense);
console.assert(
  taxiShares["Bob"] === 1000 && taxiShares["Carol"] === 1500,
  `TEST 3 FAILED — custom shares should match input, got: ${JSON.stringify(taxiShares)}`
);
console.log("TEST 3 passed — custom split shares:", taxiShares);

// ── Test 4: computeBalances ──────────────────────────────────
// Dinner:  Alice pays 3000, each owes 1000  → Alice net: +3000-1000=+2000, Bob: -1000, Carol: -1000
// Taxi:    Bob pays 2500, Bob owes 1000, Carol owes 1500 → Bob net: +2500-1000=+1500, Carol: -1500
// Coffee:  Carol pays 1001, Alice owes 501, Carol owes 500 → Carol net: +1001-500=+501, Alice: -501
// Combined: Alice: 2000-501=1499, Bob: -1000+1500=500, Carol: -1000-1500+501=-1999
const balances = computeBalances([dinnerExpense, taxiExpense, coffeeExpense]);
console.assert(
  balances["Alice"] === 1499 &&
    balances["Bob"] === 500 &&
    balances["Carol"] === -1999,
  `TEST 4 FAILED — balances should be Alice:1499, Bob:500, Carol:-1999, got: ${JSON.stringify(balances)}`
);
console.log("TEST 4 passed — net balances:", balances);

// ── Test 5: splitExpenses — settlements zero out balances ───
const summary: SplitSummary = splitExpenses([
  dinnerExpense,
  taxiExpense,
  coffeeExpense,
]);
const checkBalances = { ...summary.balances };
for (const s of summary.settlements) {
  checkBalances[s.from] = (checkBalances[s.from] ?? 0) + s.amount;
  checkBalances[s.to] = (checkBalances[s.to] ?? 0) - s.amount;
}
const allZeroed = Object.values(checkBalances).every((v) => Math.abs(v) < 1);
console.assert(
  allZeroed,
  `TEST 5 FAILED — settlements should zero out all balances, residuals: ${JSON.stringify(checkBalances)}`
);
console.log(
  "TEST 5 passed — settlements zero out balances:",
  summary.settlements
);
