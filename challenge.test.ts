// ============================================================
// challenge.test.ts
// ============================================================
import {
  validateRawEvent,
  parseEvent,
  ingestEvents,
  extractCategory,
  summarize,
  type ParseResult,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const rawEvents: unknown[] = [
  // valid error events
  { id: "e1", category: "error", ts: 1716700000000, payload: { message: "Disk full",   code: 500, fatal: true  } },
  { id: "e2", category: "error", ts: 1716700001000, payload: { message: "Timeout",     code: 408, fatal: false } },
  { id: "e3", category: "error", ts: 1716700002000, payload: { message: "Bad gateway", code: 502, fatal: false } },
  { id: "e4", category: "error", ts: 1716700003000, payload: { message: "Disk full 2", code: 500, fatal: true  } },
  // valid metric events
  { id: "m1", category: "metric", ts: 1716700004000, payload: { name: "cpu",    value: 72,  unit: "%" } },
  { id: "m2", category: "metric", ts: 1716700005000, payload: { name: "cpu",    value: 88,  unit: "%" } },
  { id: "m3", category: "metric", ts: 1716700006000, payload: { name: "memory", value: 512, unit: "MB" } },
  // valid audit events
  { id: "a1", category: "audit", ts: 1716700007000, payload: { actor: "alice", action: "login",  resource: "/dashboard" } },
  { id: "a2", category: "audit", ts: 1716700008000, payload: { actor: "bob",   action: "login",  resource: "/settings"  } },
  { id: "a3", category: "audit", ts: 1716700009000, payload: { actor: "alice", action: "delete", resource: "/file/42"   } },
  // invalid events
  { id: "bad1", category: "error",   ts: 1716700010000, payload: { message: 999, code: "oops", fatal: "yes" } }, // wrong payload types
  { id: "",     category: "metric",  ts: 1716700011000, payload: { name: "disk", value: 10, unit: "GB" } },       // empty id
  { id: "bad3", category: "unknown", ts: 1716700012000, payload: { foo: "bar" } },                                // unknown category
];

// ------------------------------------------------------------------
// Run ingestion
// ------------------------------------------------------------------

const results: ParseResult[] = ingestEvents(rawEvents);

// ------------------------------------------------------------------
// Test 1: correct number of successful vs failed parses
// ------------------------------------------------------------------
const successes = results.filter(r => r.ok);
const failures  = results.filter(r => !r.ok);

console.assert(successes.length === 10, `Expected 10 successes, got ${successes.length}`);
console.assert(failures.length  === 3,  `Expected 3 failures, got ${failures.length}`);

// ------------------------------------------------------------------
// Test 2: extractCategory returns only the right events
// ------------------------------------------------------------------
const errorEvents  = extractCategory(results, "error");
const metricEvents = extractCategory(results, "metric");
const auditEvents  = extractCategory(results, "audit");

console.assert(errorEvents.length  === 4, `Expected 4 error events, got ${errorEvents.length}`);
console.assert(metricEvents.length === 3, `Expected 3 metric events, got ${metricEvents.length}`);
console.assert(auditEvents.length  === 3, `Expected 3 audit events, got ${auditEvents.length}`);

// Type-check: TypeScript should know these are narrowed
const _fatalCheck: boolean = errorEvents[0].payload.fatal;
const _unitCheck:  string  = metricEvents[0].payload.unit;
const _actorCheck: string  = auditEvents[0].payload.actor;

// ------------------------------------------------------------------
// Test 3: error summary
// ------------------------------------------------------------------
const errSummary = summarize(results, "error");

console.assert(errSummary.totalCount === 4,   `Expected totalCount 4, got ${errSummary.totalCount}`);
console.assert(errSummary.fatalCount === 2,   `Expected fatalCount 2, got ${errSummary.fatalCount}`);
console.assert(errSummary.topCode    === 500, `Expected topCode 500, got ${errSummary.topCode}`);

// ------------------------------------------------------------------
// Test 4: metric summary
// ------------------------------------------------------------------
const metSummary = summarize(results, "metric");

console.assert(metSummary.totalCount === 3, `Expected totalCount 3, got ${metSummary.totalCount}`);
console.assert(metSummary.byName["cpu"]    !== undefined, "Expected cpu entry");
console.assert(metSummary.byName["cpu"].count === 2,      `Expected cpu count 2, got ${metSummary.byName["cpu"].count}`);
console.assert(metSummary.byName["cpu"].avg   === 80,     `Expected cpu avg 80, got ${metSummary.byName["cpu"].avg}`);

// ------------------------------------------------------------------
// Test 5: audit summary
// ------------------------------------------------------------------
const audSummary = summarize(results, "audit");

console.assert(audSummary.totalCount         === 3,       `Expected totalCount 3, got ${audSummary.totalCount}`);
console.assert(audSummary.uniqueActors        === 2,       `Expected 2 unique actors, got ${audSummary.uniqueActors}`);
console.assert(audSummary.actionBreakdown["login"]  === 2, `Expected login count 2, got ${audSummary.actionBreakdown["login"]}`);
console.assert(audSummary.actionBreakdown["delete"] === 1, `Expected delete count 1, got ${audSummary.actionBreakdown["delete"]}`);

console.log("All tests passed ✅");
