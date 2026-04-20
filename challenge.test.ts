// ============================================================
// challenge.test.ts
// ============================================================
import {
  parseTelemetryEvent,
  aggregateSession,
  type TelemetryEvent,
  type AggregationReport,
} from "./challenge";

// ── Mock raw feed ────────────────────────────────────────────

const SESSION = "sess_abc123";

const rawFeed: unknown[] = [
  // valid – page_view
  { kind: "page_view",    sessionId: SESSION,      timestamp: 1000, url: "/home",    referrer: null },
  // valid – page_view
  { kind: "page_view",    sessionId: SESSION,      timestamp: 1500, url: "/pricing", referrer: "/home" },
  // valid – button_click
  { kind: "button_click", sessionId: SESSION,      timestamp: 2000, buttonId: "cta-buy", label: "Buy Now" },
  // valid – button_click (same button, second time)
  { kind: "button_click", sessionId: SESSION,      timestamp: 2100, buttonId: "cta-buy", label: "Buy Now" },
  // valid – purchase
  { kind: "purchase",     sessionId: SESSION,      timestamp: 3000, orderId: "ord_1", amountCents: 4999, currency: "USD" },
  // valid – purchase (different currency)
  { kind: "purchase",     sessionId: SESSION,      timestamp: 3100, orderId: "ord_2", amountCents: 1500, currency: "EUR" },
  // valid – error
  { kind: "error",        sessionId: SESSION,      timestamp: 4000, code: 500, message: "Internal error", fatal: false },
  // valid – session_end
  { kind: "session_end",  sessionId: SESSION,      timestamp: 5000, durationMs: 4000 },
  // INVALID – missing `url` on page_view
  { kind: "page_view",    sessionId: SESSION,      timestamp: 6000, referrer: null },
  // WRONG SESSION – should be counted as skipped
  { kind: "button_click", sessionId: "sess_other", timestamp: 2200, buttonId: "cta-buy", label: "Buy Now" },
  // INVALID – unknown kind
  { kind: "hover",        sessionId: SESSION,      timestamp: 7000 },
];

// ── Run aggregation ──────────────────────────────────────────

const report: AggregationReport = aggregateSession(SESSION, rawFeed);

// ── Assertions ───────────────────────────────────────────────

// 1. Correct processed / skipped counts
console.assert(
  report.totalProcessed === 8,
  `Expected 8 processed, got ${report.totalProcessed}`,
);
console.assert(
  report.totalSkipped === 3,
  `Expected 3 skipped (2 invalid + 1 wrong session), got ${report.totalSkipped}`,
);

// 2. Page views recorded in order
console.assert(
  JSON.stringify(report.summary.pageViews) === JSON.stringify(["/home", "/pricing"]),
  `Unexpected pageViews: ${JSON.stringify(report.summary.pageViews)}`,
);

// 3. Click counts aggregated
console.assert(
  report.summary.clicks["cta-buy"] === 2,
  `Expected 2 clicks for cta-buy, got ${report.summary.clicks["cta-buy"]}`,
);

// 4. Spend and currencies
console.assert(
  report.summary.totalSpentCents === 6499,
  `Expected totalSpentCents 6499, got ${report.summary.totalSpentCents}`,
);
console.assert(
  report.summary.currencies.has("USD") && report.summary.currencies.has("EUR"),
  "Expected both USD and EUR in currencies",
);

// 5. Kind counts
console.assert(
  report.kindCounts["page_view"] === 2 &&
  report.kindCounts["button_click"] === 2 &&
  report.kindCounts["purchase"] === 2 &&
  report.kindCounts["error"] === 1 &&
  report.kindCounts["session_end"] === 1,
  `Unexpected kindCounts: ${JSON.stringify(report.kindCounts)}`,
);

// 6. Session end timestamp
console.assert(
  report.summary.endedAt === 5000,
  `Expected endedAt 5000, got ${report.summary.endedAt}`,
);

// 7. parseTelemetryEvent returns null for bad input
console.assert(
  parseTelemetryEvent(null) === null,
  "Expected null for null input",
);
console.assert(
  parseTelemetryEvent({ kind: "page_view", sessionId: SESSION, timestamp: 1 }) === null,
  "Expected null for page_view missing url",
);

console.log("All assertions passed ✓");
