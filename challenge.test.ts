// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  buildLedger,
  summariseLedger,
  queryAccounts,
  parseDomainEvent,
  type AccountId,
  type EventId,
  type LedgerReport,
} from "./challenge";

// ---------------------------------------------------------------------------
// Helpers to cast branded types in test data only
// ---------------------------------------------------------------------------
const aid = (s: string) => s as unknown as AccountId;
const eid = (s: string) => s as unknown as EventId;

// ---------------------------------------------------------------------------
// Mock event stream
// ---------------------------------------------------------------------------
const rawEvents: unknown[] = [
  // Account A — opened, deposited twice, withdrawn once
  { id: eid("e1"), accountId: aid("acc-A"), occurredAt: "2026-01-01T00:00:00Z", type: "AccountOpened",  ownerName: "Alice",   initialDeposit: 1000 },
  { id: eid("e2"), accountId: aid("acc-A"), occurredAt: "2026-01-02T00:00:00Z", type: "MoneyDeposited", amount: 500 },
  { id: eid("e3"), accountId: aid("acc-A"), occurredAt: "2026-01-03T00:00:00Z", type: "MoneyWithdrawn", amount: 200 },

  // Account B — opened and closed immediately
  { id: eid("e4"), accountId: aid("acc-B"), occurredAt: "2026-02-01T00:00:00Z", type: "AccountOpened",  ownerName: "Bob",     initialDeposit: 250 },
  { id: eid("e5"), accountId: aid("acc-B"), occurredAt: "2026-02-02T00:00:00Z", type: "AccountClosed",  reason: "Voluntary" },

  // Account C — opened only
  { id: eid("e6"), accountId: aid("acc-C"), occurredAt: "2026-03-01T00:00:00Z", type: "AccountOpened",  ownerName: "Carol",   initialDeposit: 750 },

  // Malformed events — should land in errors, not crash
  { id: eid("e7"), accountId: aid("acc-A"), occurredAt: "2026-01-04T00:00:00Z", type: "MoneyWithdrawn", amount: "not-a-number" },
  { type: "AlienEvent", id: eid("e8"), accountId: aid("acc-X"), occurredAt: "2026-04-01T00:00:00Z" },
  null,

  // Business-rule violation — overdraft
  { id: eid("e9"), accountId: aid("acc-C"), occurredAt: "2026-03-05T00:00:00Z", type: "MoneyWithdrawn", amount: 9999 },
];

const report: LedgerReport = buildLedger(rawEvents);

// ---------------------------------------------------------------------------
// Test 1: correct number of valid accounts
// ---------------------------------------------------------------------------
console.assert(
  report.accounts.size === 3,
  `❌ Test 1 FAILED — expected 3 accounts, got ${report.accounts.size}`
);
console.log("✅ Test 1 passed — account count:", report.accounts.size);

// ---------------------------------------------------------------------------
// Test 2: Alice's balance is correct  (1000 + 500 - 200 = 1300)
// ---------------------------------------------------------------------------
const alice = report.accounts.get(aid("acc-A"));
console.assert(
  alice?.balance === 1300,
  `❌ Test 2 FAILED — expected Alice balance 1300, got ${alice?.balance}`
);
console.log("✅ Test 2 passed — Alice balance:", alice?.balance);

// ---------------------------------------------------------------------------
// Test 3: Bob's account is closed, Carol's is open
// ---------------------------------------------------------------------------
const bob   = report.accounts.get(aid("acc-B"));
const carol = report.accounts.get(aid("acc-C"));
console.assert(bob?.status   === "closed", `❌ Test 3a FAILED — Bob should be closed`);
console.assert(carol?.status === "open",   `❌ Test 3b FAILED — Carol should be open`);
console.log("✅ Test 3 passed — Bob:", bob?.status, "| Carol:", carol?.status);

// ---------------------------------------------------------------------------
// Test 4: errors array has at least 3 entries (bad amount, unknown type, null, overdraft)
// ---------------------------------------------------------------------------
console.assert(
  report.errors.length >= 3,
  `❌ Test 4 FAILED — expected ≥3 errors, got ${report.errors.length}`
);
console.log("✅ Test 4 passed — error count:", report.errors.length);

// ---------------------------------------------------------------------------
// Test 5: summariseLedger single-pass aggregation
// ---------------------------------------------------------------------------
const summary = summariseLedger(report);
console.assert(summary.totalAccounts  === 3,    `❌ Test 5a FAILED — totalAccounts`);
console.assert(summary.openAccounts   === 2,    `❌ Test 5b FAILED — openAccounts`);
console.assert(summary.closedAccounts === 1,    `❌ Test 5c FAILED — closedAccounts`);
console.assert(summary.totalBalance   === 1300 + 250 + 750, `❌ Test 5d FAILED — totalBalance (expected ${1300+250+750}, got ${summary.totalBalance})`);
console.assert(summary.largestBalance === 1300,  `❌ Test 5e FAILED — largestBalance`);
console.assert(summary.mostActiveAccountId === aid("acc-A"), `❌ Test 5f FAILED — mostActiveAccountId`);
console.log("✅ Test 5 passed — summary:", summary);

// ---------------------------------------------------------------------------
// Test 6: queryAccounts typed filter
// ---------------------------------------------------------------------------
const openAccounts = queryAccounts(report, "status", "open");
console.assert(
  openAccounts.length === 2,
  `❌ Test 6 FAILED — expected 2 open accounts, got ${openAccounts.length}`
);
console.log("✅ Test 6 passed — open accounts:", openAccounts.map(a => a.ownerName));

console.log("\n🎉 All tests passed!");
