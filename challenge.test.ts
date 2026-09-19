// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  Expense,
  ExpenseCategory,
  NumericExpenseFields,
  PartialCategoryMap,
  extractCategories,
  groupByCategory,
  summarizeCategory,
  buildExpenseReport,
} from "./challenge";

// --------------- Mock Data -----------------------------------

const expenses: Expense[] = [
  {
    id: "e1",
    submittedBy: "alice",
    category: "travel",
    amountUSD: 320.5,
    description: "Flight to NYC",
    date: "2026-08-01",
  },
  {
    id: "e2",
    submittedBy: "bob",
    category: "meals",
    amountUSD: 45.0,
    description: "Team lunch",
    date: "2026-08-03",
  },
  {
    id: "e3",
    submittedBy: "alice",
    category: "travel",
    amountUSD: 180.0,
    description: "Hotel stay",
    date: "2026-08-02",
  },
  {
    id: "e4",
    submittedBy: "carol",
    category: "software",
    amountUSD: 99.0,
    description: "SaaS subscription",
    date: "2026-09-01",
  },
  {
    id: "e5",
    submittedBy: "bob",
    category: "meals",
    amountUSD: 22.75,
    description: "Coffee meeting",
    date: "2026-07-15",
  },
];

// --------------- Type-level checks (compile-time) ------------

// PartialCategoryMap<number> must allow partial assignment
const _partial: PartialCategoryMap<number> = { travel: 1, meals: 2 };
// NumericExpenseFields must have amountUSD and no string fields
const _numeric: NumericExpenseFields = { amountUSD: 100 };
// @ts-expect-error — 'description' is not a numeric field
const _bad: NumericExpenseFields = { amountUSD: 50, description: "oops" };

// --------------- Runtime checks (3-5 asserts) ----------------

// ASSERT 1: extractCategories returns unique categories, first-seen order
const cats = extractCategories(expenses);
console.assert(
  JSON.stringify(cats) === JSON.stringify(["travel", "meals", "software"]),
  `FAIL extractCategories: got ${JSON.stringify(cats)}`
);
console.log("PASS extractCategories");

// ASSERT 2: groupByCategory groups correctly
const grouped = groupByCategory(expenses);
console.assert(
  grouped["travel"]?.length === 2,
  `FAIL groupByCategory travel count: got ${grouped["travel"]?.length}`
);
console.assert(
  grouped["meals"]?.length === 2,
  `FAIL groupByCategory meals count: got ${grouped["meals"]?.length}`
);
console.assert(
  grouped["hardware"] === undefined,
  `FAIL groupByCategory hardware should be absent`
);
console.log("PASS groupByCategory");

// ASSERT 3: summarizeCategory sums correctly and picks largest
const travelSummary = summarizeCategory(
  expenses.filter((e) => e.category === "travel")
);
console.assert(
  travelSummary.totalUSD === 500.5,
  `FAIL summarizeCategory totalUSD: got ${travelSummary.totalUSD}`
);
console.assert(
  travelSummary.count === 2,
  `FAIL summarizeCategory count: got ${travelSummary.count}`
);
console.assert(
  travelSummary.largestExpense.id === "e1",
  `FAIL summarizeCategory largestExpense: got ${travelSummary.largestExpense.id}`
);
console.log("PASS summarizeCategory");

// ASSERT 4: buildExpenseReport grand total and date range
const report = buildExpenseReport(expenses);
const expectedGrand = parseFloat((320.5 + 45.0 + 180.0 + 99.0 + 22.75).toFixed(2));
console.assert(
  report.grandTotalUSD === expectedGrand,
  `FAIL buildExpenseReport grandTotalUSD: got ${report.grandTotalUSD}`
);
console.assert(
  report.totalCount === 5,
  `FAIL buildExpenseReport totalCount: got ${report.totalCount}`
);
console.assert(
  report.earliestDate === "2026-07-15",
  `FAIL buildExpenseReport earliestDate: got ${report.earliestDate}`
);
console.assert(
  report.latestDate === "2026-09-01",
  `FAIL buildExpenseReport latestDate: got ${report.latestDate}`
);
console.log("PASS buildExpenseReport dates & totals");

// ASSERT 5: buildExpenseReport on empty input
const emptyReport = buildExpenseReport([]);
console.assert(
  emptyReport.grandTotalUSD === 0,
  `FAIL empty grandTotalUSD: got ${emptyReport.grandTotalUSD}`
);
console.assert(
  emptyReport.earliestDate === null,
  `FAIL empty earliestDate: got ${emptyReport.earliestDate}`
);
console.assert(
  emptyReport.latestDate === null,
  `FAIL empty latestDate: got ${emptyReport.latestDate}`
);
console.log("PASS buildExpenseReport empty input");

console.log("\nAll checks passed! ✅");
