// challenge.test.ts
import {
  computeBalances,
  minimiseSettlements,
  splitExpenses,
  formatSettlement,
  type Expense,
  type Participant,
  type Balances,
  type Settlement,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const participants: Participant[] = ["Alice", "Bob", "Carol"];

const expenses: Expense[] = [
  {
    id: "e1",
    description: "Dinner",
    paidBy: "Alice",
    amountCents: 3000, // $30.00 split equally among 3 → $10 each
    splitRule: { kind: "equal" },
  },
  {
    id: "e2",
    description: "Taxi",
    paidBy: "Bob",
    amountCents: 1000, // $10.00 split by shares: Alice=1, Bob=1, Carol=2
    splitRule: {
      kind: "shares",
      participants: { Alice: 1, Bob: 1, Carol: 2 },
    },
  },
  {
    id: "e3",
    description: "Museum tickets",
    paidBy: "Carol",
    amountCents: 2400, // $24.00 exact: Alice=$8, Bob=$16
    splitRule: {
      kind: "exact",
      participants: { Alice: 800, Bob: 1600 },
    },
  },
];

// -----------------------------------------------------------
// Test 1 — computeBalances: all participants initialised
// -----------------------------------------------------------
const balances: Balances = computeBalances(expenses, participants);

console.assert(
  Object.keys(balances).length === 3,
  "Test 1a FAILED: expected 3 participants in balances"
);
console.assert(
  "Alice" in balances && "Bob" in balances && "Carol" in balances,
  "Test 1b FAILED: expected Alice, Bob, Carol in balances"
);

// -----------------------------------------------------------
// Test 2 — computeBalances: correct net values
// -----------------------------------------------------------
// Alice:  paid 3000, owes 1000(equal) + 250(taxi share) + 800(exact) = 2050 → net = +950
// Bob:    paid 1000, owes 1000(equal) + 250(taxi share) + 1600(exact) = 2850 → net = -1850
// Carol:  paid 2400, owes 1000(equal) + 500(taxi share) + 0(exact)   = 1500 → net = +900

console.assert(
  balances["Alice"] === 950,
  `Test 2a FAILED: Alice balance expected 950, got ${balances["Alice"]}`
);
console.assert(
  balances["Bob"] === -1850,
  `Test 2b FAILED: Bob balance expected -1850, got ${balances["Bob"]}`
);
console.assert(
  balances["Carol"] === 900,
  `Test 2c FAILED: Carol balance expected 900, got ${balances["Carol"]}`
);

// -----------------------------------------------------------
// Test 3 — minimiseSettlements: correct transfers
// -----------------------------------------------------------
// Bob owes 1850. Alice is owed 950, Carol is owed 900.
// Greedy: Bob→Alice 950, Bob→Carol 900  (2 transfers, fully settled)
const settlements = minimiseSettlements(balances);

console.assert(
  settlements.length === 2,
  `Test 3a FAILED: expected 2 settlements, got ${settlements.length}`
);

const bobToAlice = settlements.find(
  (s) => s.from === "Bob" && s.to === "Alice"
);
const bobToCarol = settlements.find(
  (s) => s.from === "Bob" && s.to === "Carol"
);

console.assert(
  bobToAlice !== undefined && bobToAlice.amountCents === 950,
  `Test 3b FAILED: expected Bob→Alice 950, got ${JSON.stringify(bobToAlice)}`
);
console.assert(
  bobToCarol !== undefined && bobToCarol.amountCents === 900,
  `Test 3c FAILED: expected Bob→Carol 900, got ${JSON.stringify(bobToCarol)}`
);

// -----------------------------------------------------------
// Test 4 — splitExpenses: settled flag and round-trip
// -----------------------------------------------------------
const summary = splitExpenses(expenses, participants);

console.assert(
  summary.settled === true,
  `Test 4a FAILED: expected settled=true, got ${summary.settled}`
);
console.assert(
  summary.settlements.length === 2,
  `Test 4b FAILED: expected 2 settlements in summary, got ${summary.settlements.length}`
);

// -----------------------------------------------------------
// Test 5 — formatSettlement: template literal output
// -----------------------------------------------------------
const sampleSettlement: Settlement = {
  from: "Bob",
  to: "Alice",
  amountCents: 950,
};

const formatted = formatSettlement(sampleSettlement);

console.assert(
  formatted === "Bob owes Alice $9.50",
  `Test 5a FAILED: expected "Bob owes Alice $9.50", got "${formatted}"`
);

const zeroish: Settlement = { from: "Dan", to: "Eve", amountCents: 5 };
console.assert(
  formatSettlement(zeroish) === "Dan owes Eve $0.05",
  `Test 5b FAILED: expected "Dan owes Eve $0.05", got "${formatSettlement(zeroish)}"`
);

console.log("All tests passed! ✅");
