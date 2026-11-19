// challenge.test.ts
// Run with: npx ts-node --project tsconfig.json challenge.test.ts
// (tsconfig must have strict: true)

import {
  parseExpense,
  evaluateBudget,
  buildSummary,
  formatBudgetStatus,
  type Expense,
  type Budget,
  type BudgetStatus,
  type ExpenseSummary,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const validRaw1: unknown = {
  id: "exp-001",
  submittedBy: "alice",
  category: "travel",
  amountCents: 12000,
  date: "2026-11-01",
  description: "Train to client site",
};

const validRaw2: unknown = {
  id: "exp-002",
  submittedBy: "bob",
  category: "meals",
  amountCents: 4500,
  date: "2026-11-05",
  description: "Team lunch",
};

const validRaw3: unknown = {
  id: "exp-003",
  submittedBy: "alice",
  category: "travel",
  amountCents: 8000,
  date: "2026-11-19",
  description: "Taxi to airport",
};

const invalidRaw1: unknown = {
  // missing `id`
  submittedBy: "carol",
  category: "equipment",
  amountCents: 5000,
  date: "2026-11-10",
  description: "Keyboard",
};

const invalidRaw2: unknown = {
  id: "exp-004",
  submittedBy: "dave",
  category: "equipment",
  amountCents: -100, // invalid: not positive
  date: "2026-11-12",
  description: "Broken item",
};

const invalidRaw3: unknown = {
  id: "exp-005",
  submittedBy: "eve",
  category: "flying_carpet", // invalid category
  amountCents: 9999,
  date: "2026-11-15",
  description: "Magic transport",
};

const budgets: Budget[] = [
  { category: "travel", limitCents: 20000 },
  { category: "meals",  limitCents: 4500  },
];

// ------------------------------------------------------------------
// TEST 1 — parseExpense: valid entry
// ------------------------------------------------------------------
const r1 = parseExpense(validRaw1);
console.assert(r1.ok === true, "TEST 1a FAILED: valid raw should parse ok");
if (r1.ok) {
  console.assert(
    r1.value.id === "exp-001",
    "TEST 1b FAILED: parsed id should be 'exp-001'"
  );
  console.assert(
    r1.value.amountCents === 12000,
    "TEST 1c FAILED: amountCents should be 12000"
  );
}
console.log("TEST 1 passed ✓ — parseExpense accepts a valid entry");

// ------------------------------------------------------------------
// TEST 2 — parseExpense: various invalid entries
// ------------------------------------------------------------------
const r2a = parseExpense(invalidRaw1);
console.assert(r2a.ok === false, "TEST 2a FAILED: missing id should fail");
if (!r2a.ok) {
  console.assert(
    r2a.error.kind === "missing_field" && r2a.error.field === "id",
    `TEST 2a FAILED: expected missing_field/id, got ${JSON.stringify(r2a.error)}`
  );
}

const r2b = parseExpense(invalidRaw2);
console.assert(r2b.ok === false, "TEST 2b FAILED: negative amount should fail");
if (!r2b.ok) {
  console.assert(
    r2b.error.kind === "invalid_value" && r2b.error.field === "amountCents",
    `TEST 2b FAILED: expected invalid_value/amountCents, got ${JSON.stringify(r2b.error)}`
  );
}

const r2c = parseExpense(invalidRaw3);
console.assert(r2c.ok === false, "TEST 2c FAILED: bad category should fail");
if (!r2c.ok) {
  console.assert(
    r2c.error.kind === "invalid_value" && r2c.error.field === "category",
    `TEST 2c FAILED: expected invalid_value/category, got ${JSON.stringify(r2c.error)}`
  );
}
console.log("TEST 2 passed ✓ — parseExpense rejects invalid entries correctly");

// ------------------------------------------------------------------
// TEST 3 — evaluateBudget
// ------------------------------------------------------------------
const validExpenses: Expense[] = [
  (parseExpense(validRaw1) as { ok: true; value: Expense }).value,
  (parseExpense(validRaw2) as { ok: true; value: Expense }).value,
  (parseExpense(validRaw3) as { ok: true; value: Expense }).value,
];

// travel: 12000 + 8000 = 20000 vs limit 20000 → "at_limit"
const travelStatus = evaluateBudget(validExpenses, { category: "travel", limitCents: 20000 });
console.assert(
  travelStatus.status === "at_limit",
  `TEST 3a FAILED: expected at_limit, got ${travelStatus.status}`
);

// meals: 4500 vs limit 3000 → "over_budget", overage = 1500
const mealsOver = evaluateBudget(validExpenses, { category: "meals", limitCents: 3000 });
console.assert(
  mealsOver.status === "over_budget",
  `TEST 3b FAILED: expected over_budget, got ${mealsOver.status}`
);
if (mealsOver.status === "over_budget") {
  console.assert(
    mealsOver.overageCents === 1500,
    `TEST 3c FAILED: expected overageCents 1500, got ${mealsOver.overageCents}`
  );
}

// meals: 4500 vs limit 10000 → "under_budget", remaining = 5500
const mealsUnder = evaluateBudget(validExpenses, { category: "meals", limitCents: 10000 });
console.assert(
  mealsUnder.status === "under_budget",
  `TEST 3d FAILED: expected under_budget, got ${mealsUnder.status}`
);
if (mealsUnder.status === "under_budget") {
  console.assert(
    mealsUnder.remainingCents === 5500,
    `TEST 3e FAILED: expected remainingCents 5500, got ${mealsUnder.remainingCents}`
  );
}
console.log("TEST 3 passed ✓ — evaluateBudget computes all three statuses");

// ------------------------------------------------------------------
// TEST 4 — buildSummary
// ------------------------------------------------------------------
const rawEntries: unknown[] = [
  validRaw1, validRaw2, validRaw3,
  invalidRaw1, invalidRaw2, invalidRaw3,
];

const summary: ExpenseSummary = buildSummary(rawEntries, budgets);

console.assert(
  summary.expenses.length === 3,
  `TEST 4a FAILED: expected 3 valid expenses, got ${summary.expenses.length}`
);
console.assert(
  summary.parseErrors.length === 3,
  `TEST 4b FAILED: expected 3 parse errors, got ${summary.parseErrors.length}`
);
console.assert(
  summary.totalSpentCents === 24500,
  `TEST 4c FAILED: expected totalSpentCents 24500, got ${summary.totalSpentCents}`
);
console.assert(
  summary.periodStart === "2026-11-01",
  `TEST 4d FAILED: expected periodStart 2026-11-01, got ${summary.periodStart}`
);
console.assert(
  summary.periodEnd === "2026-11-19",
  `TEST 4e FAILED: expected periodEnd 2026-11-19, got ${summary.periodEnd}`
);
// travel should be "at_limit" (20000 / 20000)
const travelSummaryStatus = summary.budgetStatuses.find(
  (s) => s.category === "travel"
);
console.assert(
  travelSummaryStatus?.status === "at_limit",
  `TEST 4f FAILED: expected travel at_limit, got ${travelSummaryStatus?.status}`
);
console.log("TEST 4 passed ✓ — buildSummary produces correct rollup");

// ------------------------------------------------------------------
// TEST 5 — formatBudgetStatus exhaustiveness (stretch)
// ------------------------------------------------------------------
const underMsg = formatBudgetStatus({
  status: "under_budget",
  category: "meals",
  totalSpentCents: 2000,
  limitCents: 5000,
  remainingCents: 3000,
} satisfies BudgetStatus);
console.assert(
  typeof underMsg === "string" && underMsg.length > 0,
  "TEST 5a FAILED: formatBudgetStatus should return a non-empty string"
);

const overMsg = formatBudgetStatus({
  status: "over_budget",
  category: "travel",
  totalSpentCents: 25000,
  limitCents: 20000,
  overageCents: 5000,
} satisfies BudgetStatus);
console.assert(
  typeof overMsg === "string" && overMsg.length > 0,
  "TEST 5b FAILED: formatBudgetStatus should return a non-empty string"
);
console.log("TEST 5 passed ✓ — formatBudgetStatus handles all variants");

console.log("\n✅ All tests passed!");
