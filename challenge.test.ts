// ============================================================
// challenge.test.ts — Typed Event Sourcing Ledger Reconstructor
// ============================================================
import {
  parseLedgerEvent,
  replayEvents,
  reconstructLedger,
  type AccountId,
  type TransactionId,
  type LedgerEvent,
  type LedgerReport,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────
function brand<T extends string>(v: string): T { return v as T; }
const acctId  = brand<AccountId>("acct-001");
const tx1     = brand<TransactionId>("tx-001");
const tx2     = brand<TransactionId>("tx-002");

// ── Mock Event Stream ─────────────────────────────────────
const validRaw: unknown[] = [
  { type: "account_opened",  accountId: "acct-001", occurredAt: 1000, owner: "Alice",  initialBalance: 500 },
  { type: "funds_deposited", accountId: "acct-001", occurredAt: 2000, transactionId: "tx-001", amount: 200 },
  { type: "funds_withdrawn", accountId: "acct-001", occurredAt: 3000, transactionId: "tx-002", amount: 100 },
];

const withBadEvent: unknown[] = [
  ...validRaw,
  { type: "teleport_funds", accountId: "acct-001", occurredAt: 4000 }, // unknown event type
];

const overdraftRaw: unknown[] = [
  { type: "account_opened",  accountId: "acct-001", occurredAt: 1000, owner: "Bob", initialBalance: 50 },
  { type: "funds_withdrawn", accountId: "acct-001", occurredAt: 2000, transactionId: "tx-001", amount: 200 },
];

const closedThenDepositRaw: unknown[] = [
  { type: "account_opened",  accountId: "acct-001", occurredAt: 1000, owner: "Carol", initialBalance: 300 },
  { type: "account_closed",  accountId: "acct-001", occurredAt: 2000, reason: "Customer request" },
  { type: "funds_deposited", accountId: "acct-001", occurredAt: 3000, transactionId: "tx-001", amount: 100 },
];

// ── Test 1: parseLedgerEvent — valid event ────────────────
const parseResult = parseLedgerEvent(validRaw[0]);
console.assert(
  parseResult.ok === true,
  "T1 FAIL: parseLedgerEvent should succeed for a valid account_opened event"
);

// ── Test 2: parseLedgerEvent — unknown event type ─────────
const badTypeResult = parseLedgerEvent({ type: "teleport_funds", accountId: "acct-001", occurredAt: 9999 });
console.assert(
  badTypeResult.ok === false && badTypeResult.error.kind === "unknown_event",
  "T2 FAIL: parseLedgerEvent should return unknown_event for unrecognised type"
);

// ── Test 3: reconstructLedger — happy path ────────────────
const happy = reconstructLedger(validRaw);
console.assert(
  happy.snapshot !== null &&
  happy.snapshot.balance === 600 &&        // 500 + 200 − 100
  happy.snapshot.transactions.length === 2 &&
  happy.snapshot.owner === "Alice" &&
  happy.parseErrors.length === 0 &&
  happy.replayError === null,
  `T3 FAIL: happy-path snapshot incorrect. Got: ${JSON.stringify(happy.snapshot)}`
);

// ── Test 4: reconstructLedger — parse error collected ─────
const withBad = reconstructLedger(withBadEvent);
console.assert(
  withBad.parseErrors.length === 1 &&
  withBad.parseErrors[0].kind === "unknown_event" &&
  withBad.snapshot !== null, // valid events still produce a snapshot
  `T4 FAIL: should collect 1 parse error and still produce snapshot. Got: ${JSON.stringify(withBad)}`
);

// ── Test 5: replayEvents — overdraft returns ReplayError ──
const parsed = (validRaw as unknown[])
  .concat(overdraftRaw.slice(1))
  .map((r) => parseLedgerEvent(r))
  .filter((r): r is Extract<typeof r, { ok: true }> => r.ok)
  .map((r) => r.value);

// Use overdraft stream directly
const overdraftParsed: LedgerEvent[] = overdraftRaw
  .map((r) => parseLedgerEvent(r))
  .filter((r): r is Extract<typeof r, { ok: true }> => r.ok)
  .map((r) => r.value);

const overdraftResult = replayEvents(overdraftParsed);
console.assert(
  overdraftResult.ok === false &&
  overdraftResult.error.kind === "insufficient_funds" &&
  (overdraftResult.error as Extract<typeof overdraftResult.error, { kind: "insufficient_funds" }>).balance === 50,
  `T5 FAIL: overdraft should return insufficient_funds. Got: ${JSON.stringify(overdraftResult)}`
);
