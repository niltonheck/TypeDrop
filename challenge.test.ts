// ============================================================
// challenge.test.ts — Test Harness
// ============================================================
import {
  parseEvent,
  aggregateEvents,
  processEventLog,
  type AuditEvent,
  type UserSummaryMap,
} from "./challenge";

// -----------------------------------------------------------
// Mock raw data
// -----------------------------------------------------------
const rawEvents: unknown[] = [
  // Valid page_view — user A
  {
    eventId: "e1",
    userId: "userA",
    occurredAt: "2026-06-07T08:00:00Z",
    kind: "page_view",
    payload: { path: "/dashboard", durationMs: 1200 },
  },
  // Valid page_view — user A (duplicate path, should de-dup)
  {
    eventId: "e2",
    userId: "userA",
    occurredAt: "2026-06-07T08:05:00Z",
    kind: "page_view",
    payload: { path: "/dashboard", durationMs: 800 },
  },
  // Valid page_view — user A (new path)
  {
    eventId: "e3",
    userId: "userA",
    occurredAt: "2026-06-07T08:10:00Z",
    kind: "page_view",
    payload: { path: "/settings", durationMs: 300 },
  },
  // Valid api_call — user A (success)
  {
    eventId: "e4",
    userId: "userA",
    occurredAt: "2026-06-07T08:12:00Z",
    kind: "api_call",
    payload: { endpoint: "/api/data", statusCode: 200, latencyMs: 45 },
  },
  // Valid api_call — user A (failure)
  {
    eventId: "e5",
    userId: "userA",
    occurredAt: "2026-06-07T08:13:00Z",
    kind: "api_call",
    payload: { endpoint: "/api/export", statusCode: 500, latencyMs: 120 },
  },
  // Valid error — user A (non-fatal)
  {
    eventId: "e6",
    userId: "userA",
    occurredAt: "2026-06-07T08:14:00Z",
    kind: "error",
    payload: { code: "TIMEOUT", message: "Request timed out", fatal: false },
  },
  // Valid error — user A (fatal)
  {
    eventId: "e7",
    userId: "userA",
    occurredAt: "2026-06-07T08:15:00Z",
    kind: "error",
    payload: { code: "CRASH", message: "Unhandled exception", fatal: true },
  },
  // Valid api_call — user B
  {
    eventId: "e8",
    userId: "userB",
    occurredAt: "2026-06-07T09:00:00Z",
    kind: "api_call",
    payload: { endpoint: "/api/users", statusCode: 404, latencyMs: 30 },
  },
  // INVALID — missing userId
  {
    eventId: "e9",
    occurredAt: "2026-06-07T09:01:00Z",
    kind: "page_view",
    payload: { path: "/home", durationMs: 500 },
  },
  // INVALID — unknown kind
  {
    eventId: "e10",
    userId: "userC",
    occurredAt: "2026-06-07T09:02:00Z",
    kind: "login",
    payload: {},
  },
  // INVALID — payload field wrong type
  {
    eventId: "e11",
    userId: "userB",
    occurredAt: "2026-06-07T09:03:00Z",
    kind: "api_call",
    payload: { endpoint: "/api/health", statusCode: "200", latencyMs: 10 },
  },
];

// -----------------------------------------------------------
// Run the full pipeline
// -----------------------------------------------------------
const result = processEventLog(rawEvents);
const { summary, failures } = result;

// -----------------------------------------------------------
// Assertions
// -----------------------------------------------------------

// 1. Exactly 3 raw events should fail validation
console.assert(
  failures.length === 3,
  `Expected 3 failures, got ${failures.length}`
);

// 2. userA should have 7 valid events
console.assert(
  summary["userA"] !== undefined,
  "Expected userA in summary"
);
console.assert(
  summary["userA"].totalEvents === 7,
  `Expected userA.totalEvents = 7, got ${summary["userA"]?.totalEvents}`
);

// 3. userA page view stats
console.assert(
  summary["userA"].pageViews === 3,
  `Expected userA.pageViews = 3, got ${summary["userA"]?.pageViews}`
);
console.assert(
  JSON.stringify(summary["userA"].uniquePaths) ===
    JSON.stringify(["/dashboard", "/settings"]),
  `Expected uniquePaths = ["/dashboard", "/settings"], got ${JSON.stringify(summary["userA"]?.uniquePaths)}`
);

// 4. userA API call stats
console.assert(
  summary["userA"].apiCalls === 2,
  `Expected userA.apiCalls = 2, got ${summary["userA"]?.apiCalls}`
);
console.assert(
  summary["userA"].avgApiLatencyMs === 82.5,
  `Expected userA.avgApiLatencyMs = 82.5, got ${summary["userA"]?.avgApiLatencyMs}`
);
console.assert(
  summary["userA"].failedApiCalls === 1,
  `Expected userA.failedApiCalls = 1, got ${summary["userA"]?.failedApiCalls}`
);

// 5. userA error stats
console.assert(
  summary["userA"].errors === 2,
  `Expected userA.errors = 2, got ${summary["userA"]?.errors}`
);
console.assert(
  summary["userA"].fatalErrors === 1,
  `Expected userA.fatalErrors = 1, got ${summary["userA"]?.fatalErrors}`
);

// 6. userB should have 1 valid event (e8 — e11 has invalid payload)
console.assert(
  summary["userB"] !== undefined,
  "Expected userB in summary"
);
console.assert(
  summary["userB"].totalEvents === 1,
  `Expected userB.totalEvents = 1, got ${summary["userB"]?.totalEvents}`
);
console.assert(
  summary["userB"].avgApiLatencyMs === 30,
  `Expected userB.avgApiLatencyMs = 30, got ${summary["userB"]?.avgApiLatencyMs}`
);
console.assert(
  summary["userB"].failedApiCalls === 1,
  `Expected userB.failedApiCalls = 1, got ${summary["userB"]?.failedApiCalls}`
);

// 7. userC should NOT appear (its only event was invalid)
console.assert(
  summary["userC"] === undefined,
  "Expected userC to be absent from summary"
);

// 8. parseEvent returns Ok for a valid event
const okResult = parseEvent({
  eventId: "x1",
  userId: "userX",
  occurredAt: "2026-06-07T10:00:00Z",
  kind: "error",
  payload: { code: "ERR", message: "Oops", fatal: false },
});
console.assert(okResult.ok === true, "Expected Ok result for valid error event");

// 9. parseEvent returns Err for null input
const errResult = parseEvent(null);
console.assert(errResult.ok === false, "Expected Err result for null input");

console.log("All assertions passed! ✅");
