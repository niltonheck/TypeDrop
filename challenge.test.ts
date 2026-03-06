// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts
// Run with: npx ts-node --strict challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import {
  EventAggregator,
  toTs,
  WindowId,
  renderMetrics,
  type TelemetryEvent,
  type WindowSnapshot,
  type EventMetrics,
  type EventKind,
} from "./challenge";

// ─── Mock Data ────────────────────────────────────────────────────────────────
// windowSizeMs = 10_000 (10 seconds)
// Window "0"  → ts 0..9999
// Window "1"  → ts 10000..19999

const WINDOW_MS = 10_000;

const events: TelemetryEvent[] = [
  // --- Window 0 ---
  { kind: "view",     streamId: "s1", userId: "u1", durationMs: 4000, ts: toTs(1000)  },
  { kind: "view",     streamId: "s1", userId: "u2", durationMs: 6000, ts: toTs(2000)  },
  { kind: "view",     streamId: "s1", userId: "u1", durationMs: 2000, ts: toTs(3000)  }, // u1 again
  { kind: "reaction", streamId: "s1", userId: "u1", emoji: "🔥",      ts: toTs(4000)  },
  { kind: "reaction", streamId: "s1", userId: "u2", emoji: "🔥",      ts: toTs(5000)  },
  { kind: "reaction", streamId: "s1", userId: "u3", emoji: "❤️",      ts: toTs(6000)  },
  { kind: "chat",     streamId: "s1", userId: "u1", messageLength: 80, ts: toTs(7000) },
  { kind: "chat",     streamId: "s1", userId: "u2", messageLength: 40, ts: toTs(8000) },
  { kind: "error",    streamId: "s1", code: 500, message: "ISE",       ts: toTs(9000) },
  { kind: "error",    streamId: "s1", code: 500, message: "ISE again", ts: toTs(9500) },
  { kind: "error",    streamId: "s1", code: 404, message: "Not found", ts: toTs(9800) },

  // --- Window 1 ---
  { kind: "view",     streamId: "s2", userId: "u5", durationMs: 1000, ts: toTs(10000) },
  { kind: "chat",     streamId: "s2", userId: "u5", messageLength: 20, ts: toTs(11000) },
];

const agg = new EventAggregator(WINDOW_MS);
agg.ingest(events);

const W0 = "0" as WindowId;
const W1 = "1" as WindowId;
const W_MISSING = "99" as WindowId;

// ─── Test 1: computeWindow returns correct ViewMetrics for window 0 ───────────
const w0Result = agg.computeWindow(W0);
console.assert(w0Result.ok === true, "Test 1a: window 0 should be found");
if (w0Result.ok) {
  const vm = w0Result.value.metrics.view!;
  console.assert(vm.count === 3,           `Test 1b: view count should be 3, got ${vm.count}`);
  console.assert(vm.uniqueUsers === 2,     `Test 1c: unique users should be 2, got ${vm.uniqueUsers}`);
  console.assert(vm.totalDurationMs === 12000, `Test 1d: totalDurationMs should be 12000, got ${vm.totalDurationMs}`);
  console.assert(vm.avgDurationMs === 4000,    `Test 1e: avgDurationMs should be 4000, got ${vm.avgDurationMs}`);
  console.log("✅ Test 1 passed: ViewMetrics for window 0");
}

// ─── Test 2: ReactionMetrics — topEmoji and breakdown ─────────────────────────
if (w0Result.ok) {
  const rm = w0Result.value.metrics.reaction!;
  console.assert(rm.count === 3,        `Test 2a: reaction count should be 3, got ${rm.count}`);
  console.assert(rm.topEmoji === "🔥",  `Test 2b: topEmoji should be 🔥, got ${rm.topEmoji}`);
  console.assert(rm.emojiBreakdown["🔥"] === 2, `Test 2c: 🔥 count should be 2`);
  console.assert(rm.emojiBreakdown["❤️"] === 1, `Test 2d: ❤️ count should be 1`);
  console.log("✅ Test 2 passed: ReactionMetrics for window 0");
}

// ─── Test 3: ErrorMetrics ─────────────────────────────────────────────────────
if (w0Result.ok) {
  const em = w0Result.value.metrics.error!;
  console.assert(em.count === 3,             `Test 3a: error count should be 3, got ${em.count}`);
  console.assert(em.uniqueCodes === 2,        `Test 3b: uniqueCodes should be 2, got ${em.uniqueCodes}`);
  console.assert(em.mostFrequentCode === 500, `Test 3c: mostFrequentCode should be 500, got ${em.mostFrequentCode}`);
  console.log("✅ Test 3 passed: ErrorMetrics for window 0");
}

// ─── Test 4: getMetricsForKind generic return type ────────────────────────────
const chatResult = agg.getMetricsForKind(W0, "chat");
console.assert(chatResult.ok === true, "Test 4a: chat metrics should be found");
if (chatResult.ok) {
  // TypeScript must infer chatResult.value as ChatMetrics (no cast needed)
  const cm: EventMetrics<"chat"> = chatResult.value;
  console.assert(cm.count === 2,           `Test 4b: chat count should be 2, got ${cm.count}`);
  console.assert(cm.avgMessageLength === 60, `Test 4c: avgMessageLength should be 60, got ${cm.avgMessageLength}`);
  console.log("✅ Test 4 passed: getMetricsForKind<'chat'>");
}

// ─── Test 5: WINDOW_NOT_FOUND error ──────────────────────────────────────────
const missing = agg.computeWindow(W_MISSING);
console.assert(missing.ok === false, "Test 5a: missing window should return Err");
if (!missing.ok) {
  console.assert(missing.error.kind === "WINDOW_NOT_FOUND", `Test 5b: error kind should be WINDOW_NOT_FOUND`);
  console.log("✅ Test 5 passed: WINDOW_NOT_FOUND error");
}

// ─── Test 6: queryRange returns sorted snapshots ──────────────────────────────
const rangeResult = agg.queryRange(toTs(0), toTs(19999));
console.assert(rangeResult.ok === true, "Test 6a: range query should succeed");
if (rangeResult.ok) {
  console.assert(rangeResult.value.length === 2, `Test 6b: should return 2 windows, got ${rangeResult.value.length}`);
  console.assert(rangeResult.value[0].windowId === W0, "Test 6c: first window should be W0");
  console.assert(rangeResult.value[1].windowId === W1, "Test 6d: second window should be W1");
  console.log("✅ Test 6 passed: queryRange returns sorted snapshots");
}

// ─── Test 7: INVALID_RANGE error ─────────────────────────────────────────────
const badRange = agg.queryRange(toTs(9999), toTs(0));
console.assert(badRange.ok === false, "Test 7a: inverted range should return Err");
if (!badRange.ok) {
  console.assert(badRange.error.kind === "INVALID_RANGE", "Test 7b: error kind should be INVALID_RANGE");
  console.log("✅ Test 7 passed: INVALID_RANGE error");
}

// ─── Test 8: renderMetrics exhaustiveness ────────────────────────────────────
if (w0Result.ok) {
  const rendered = renderMetrics(w0Result.value);
  console.assert(typeof rendered.view === "string",     "Test 8a: view summary should be a string");
  console.assert(typeof rendered.reaction === "string", "Test 8b: reaction summary should be a string");
  console.assert(typeof rendered.chat === "string",     "Test 8c: chat summary should be a string");
  console.assert(typeof rendered.error === "string",    "Test 8d: error summary should be a string");
  console.log("✅ Test 8 passed: renderMetrics produces strings for all kinds");
  console.log("   Rendered output:", rendered);
}

console.log("\n🎉 All tests completed.");
