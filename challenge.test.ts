// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parseEvent,
  aggregateEvents,
  groupBy,
  filterByKind,
  type AnalyticsEvent,
  type AggregationReport,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────────────────

const rawEvents: unknown[] = [
  // Session A
  { kind: "page_view",   sessionId: "A", url: "/home",    durationMs: 1200, timestamp: 1000 },
  { kind: "click",       sessionId: "A", elementId: "btn-signup",           timestamp: 1500 },
  { kind: "form_submit", sessionId: "A", formId: "signup", success: true,   timestamp: 2000 },
  { kind: "page_view",   sessionId: "A", url: "/dashboard", durationMs: 800, timestamp: 2500 },
  // Session B
  { kind: "page_view",   sessionId: "B", url: "/pricing",  durationMs: 400, timestamp: 500  },
  { kind: "error",       sessionId: "B", message: "Network timeout",        timestamp: 600  },
  { kind: "form_submit", sessionId: "B", formId: "contact", success: false,  timestamp: 700  },
  { kind: "form_submit", sessionId: "B", formId: "contact", success: true,   timestamp: 800  },
  // Bad events (should be counted as parse errors)
  { kind: "unknown_kind", sessionId: "X", timestamp: 999 },
  { kind: "click",        sessionId: "",  elementId: "x",  timestamp: 999 },
  { kind: "page_view",    sessionId: "C", url: "",         durationMs: 0,   timestamp: 100  }, // url empty → error
  null,
  42,
];

// ── Test 1: parseEvent happy paths ────────────────────────────────────────
const p1 = parseEvent({ kind: "click", sessionId: "S1", elementId: "logo", timestamp: 123 });
console.assert(p1.ok === true, "Test 1a FAILED: valid click should parse ok");
if (p1.ok) {
  console.assert(p1.value.kind === "click", "Test 1b FAILED: parsed kind should be 'click'");
}

const p2 = parseEvent({ kind: "page_view", sessionId: "S2", url: "", durationMs: 100, timestamp: 1 });
console.assert(p2.ok === false, "Test 1c FAILED: empty url should fail");

// ── Test 2: groupBy ───────────────────────────────────────────────────────
const sampleEvents: AnalyticsEvent[] = [
  { kind: "click", sessionId: "X", elementId: "a", timestamp: 1 },
  { kind: "click", sessionId: "Y", elementId: "b", timestamp: 2 },
  { kind: "click", sessionId: "X", elementId: "c", timestamp: 3 },
];
const grouped = groupBy(sampleEvents, (e) => e.sessionId);
console.assert(grouped.get("X")?.length === 2, "Test 2a FAILED: session X should have 2 events");
console.assert(grouped.get("Y")?.length === 1, "Test 2b FAILED: session Y should have 1 event");

// ── Test 3: aggregateEvents ───────────────────────────────────────────────
const report: AggregationReport = aggregateEvents(rawEvents);

// Session order: B (firstEventAt=500) before A (firstEventAt=1000)
console.assert(report.sessions.length === 2, `Test 3a FAILED: expected 2 sessions, got ${report.sessions.length}`);
console.assert(report.sessions[0].sessionId === "B", `Test 3b FAILED: first session should be B, got ${report.sessions[0]?.sessionId}`);
console.assert(report.sessions[1].sessionId === "A", `Test 3c FAILED: second session should be A, got ${report.sessions[1]?.sessionId}`);

const sessionA = report.sessions.find((s) => s.sessionId === "A")!;
console.assert(sessionA.pageViews === 2,          `Test 3d FAILED: A.pageViews expected 2, got ${sessionA.pageViews}`);
console.assert(sessionA.totalDurationMs === 2000, `Test 3e FAILED: A.totalDurationMs expected 2000, got ${sessionA.totalDurationMs}`);
console.assert(sessionA.clicks === 1,             `Test 3f FAILED: A.clicks expected 1, got ${sessionA.clicks}`);
console.assert(sessionA.formSubmissions === 1,    `Test 3g FAILED: A.formSubmissions expected 1, got ${sessionA.formSubmissions}`);
console.assert(sessionA.formSuccessRate === 1,    `Test 3h FAILED: A.formSuccessRate expected 1, got ${sessionA.formSuccessRate}`);
console.assert(sessionA.errors === 0,             `Test 3i FAILED: A.errors expected 0, got ${sessionA.errors}`);
console.assert(sessionA.firstEventAt === 1000,    `Test 3j FAILED: A.firstEventAt expected 1000, got ${sessionA.firstEventAt}`);
console.assert(sessionA.lastEventAt === 2500,     `Test 3k FAILED: A.lastEventAt expected 2500, got ${sessionA.lastEventAt}`);

const sessionB = report.sessions.find((s) => s.sessionId === "B")!;
console.assert(sessionB.formSuccessRate === 0.5,  `Test 3l FAILED: B.formSuccessRate expected 0.5, got ${sessionB.formSuccessRate}`);
console.assert(sessionB.errors === 1,             `Test 3m FAILED: B.errors expected 1, got ${sessionB.errors}`);

// 3 bad events: unknown_kind, empty sessionId, empty url  + null + 42 = 5 parse errors
// (Session C's page_view with empty url is also invalid → 5 total)
console.assert(report.totalParseErrors === 5,     `Test 3n FAILED: expected 5 parse errors, got ${report.totalParseErrors}`);
console.assert(report.totalEvents === 8,          `Test 3o FAILED: expected 8 valid events, got ${report.totalEvents}`);

// ── Test 4: filterByKind ──────────────────────────────────────────────────
const mixed: AnalyticsEvent[] = [
  { kind: "page_view",   sessionId: "Z", url: "/x", durationMs: 0, timestamp: 1 },
  { kind: "click",       sessionId: "Z", elementId: "y",            timestamp: 2 },
  { kind: "error",       sessionId: "Z", message: "oops",           timestamp: 3 },
  { kind: "page_view",   sessionId: "Z", url: "/y", durationMs: 5, timestamp: 4 },
];
const pageViews = filterByKind(mixed, "page_view");
console.assert(pageViews.length === 2, `Test 4a FAILED: expected 2 page_view events, got ${pageViews.length}`);
// TypeScript should narrow the type: accessing .url must compile
const urls = pageViews.map((e) => e.url);
console.assert(urls[0] === "/x", `Test 4b FAILED: first url should be /x, got ${urls[0]}`);

console.log("All assertions passed ✅");
