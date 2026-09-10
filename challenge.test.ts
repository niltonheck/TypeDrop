// challenge.test.ts
import { asCents, computeSplit, formatSummary, Expense } from "./challenge";

// ── Helper ────────────────────────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const participants = ["Alice", "Bob", "Carol"];

const expenses: readonly Expense[] = [
  {
    id: "e1",
    description: "Hotel (3 nights)",
    paidBy: "Alice",
    amount: asCents(30000), // $300.00
    splitAmong: ["Alice", "Bob", "Carol"],
  },
  {
    id: "e2",
    description: "Groceries",
    paidBy: "Bob",
    amount: asCents(4001), // $40.01  (tests remainder distribution)
    splitAmong: ["Alice", "Bob", "Carol"],
  },
  {
    id: "e3",
    description: "Museum tickets (Alice + Bob only)",
    paidBy: "Alice",
    amount: asCents(5000), // $50.00
    splitAmong: ["Alice", "Bob"],
  },
];

// ── Test 1: asCents branding & validation ─────────────────────────────────────
console.log("\nTest 1 — asCents");
assert(asCents(100) === 100, "asCents(100) returns 100");
let threw = false;
try { asCents(1.5); } catch { threw = true; }
assert(threw, "asCents(1.5) throws RangeError for non-integer");

// ── Test 2: error on empty participants ───────────────────────────────────────
console.log("\nTest 2 — NO_PARTICIPANTS error");
const emptyResult = computeSplit([], expenses);
assert(emptyResult.ok === false, "ok is false for empty participants");
if (!emptyResult.ok) {
  assert(emptyResult.error.kind === "NO_PARTICIPANTS", "error kind is NO_PARTICIPANTS");
}

// ── Test 3: error on unknown payer ────────────────────────────────────────────
console.log("\nTest 3 — UNKNOWN_PAYER error");
const badPayer: Expense = {
  id: "e99",
  description: "Mystery expense",
  paidBy: "Dave", // not in participants
  amount: asCents(1000),
  splitAmong: ["Alice"],
};
const badPayerResult = computeSplit(participants, [badPayer]);
assert(badPayerResult.ok === false, "ok is false for unknown payer");
if (!badPayerResult.ok) {
  assert(badPayerResult.error.kind === "UNKNOWN_PAYER", "error kind is UNKNOWN_PAYER");
}

// ── Test 4: correct balances & transfers ──────────────────────────────────────
console.log("\nTest 4 — balances & transfers");
const result = computeSplit(participants, expenses);
assert(result.ok === true, "ok is true for valid inputs");

if (result.ok) {
  // Alice paid 30000 + 5000 = 35000
  // Alice owes (30000/3 + floor(4001/3) + 5000/2) = 10000 + 1333 + 2500 = 13833
  // Alice net = 35000 - 13833 = +21167
  const alice = result.balances.find((b) => b.participant === "Alice");
  assert(alice !== undefined, "Alice has a balance entry");
  assert(alice?.netCents === 21167, `Alice net = 21167 cents (got ${alice?.netCents})`);

  // Transfers should be non-empty and all have amountCents > 0
  assert(result.transfers.length > 0, "there is at least one transfer");
  assert(
    result.transfers.every((t) => t.amountCents > 0),
    "all transfers have positive amountCents"
  );
}

// ── Test 5: formatSummary ─────────────────────────────────────────────────────
console.log("\nTest 5 — formatSummary");
const summary = formatSummary(result);
assert(typeof summary === "string", "formatSummary returns a string");
assert(summary.includes("→"), "summary contains arrow separators");
assert(!summary.startsWith("Error:"), "summary does not start with Error for valid result");

const errorSummary = formatSummary(emptyResult);
assert(errorSummary.startsWith("Error:"), "error summary starts with 'Error:'");

// ── Test 6: all-settled scenario ──────────────────────────────────────────────
console.log("\nTest 6 — all settled up");
const settledResult = computeSplit(["Alice"], [
  { id: "s1", description: "Solo lunch", paidBy: "Alice", amount: asCents(1200), splitAmong: ["Alice"] },
]);
assert(settledResult.ok === true, "single-participant expense is ok");
if (settledResult.ok) {
  assert(settledResult.transfers.length === 0, "no transfers needed when solo");
  assert(formatSummary(settledResult) === "All settled up!", "formatSummary returns settled message");
}

console.log("\nDone.\n");
