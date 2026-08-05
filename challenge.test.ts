// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  safeParseJSON,
  parseOrderPayload,
  parseRefundPayload,
  unwrapOr,
  describeError,
  ok,
  err,
} from "./challenge";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

// -----------------------------------------------------------
// Test 1 — safeParseJSON with valid JSON
// -----------------------------------------------------------
console.log("\n── safeParseJSON ──");
const validResult = safeParseJSON('{"hello":"world"}');
assert(
  "valid JSON returns Ok",
  validResult.kind === "ok"
);

// -----------------------------------------------------------
// Test 2 — safeParseJSON with invalid JSON
// -----------------------------------------------------------
const invalidResult = safeParseJSON("{not valid json}");
assert(
  "invalid JSON returns Err with kind 'invalid_json'",
  invalidResult.kind === "err" &&
    invalidResult.error.kind === "invalid_json"
);

// -----------------------------------------------------------
// Test 3 — parseOrderPayload happy path
// -----------------------------------------------------------
console.log("\n── parseOrderPayload ──");
const goodOrder = JSON.stringify({
  orderId: "ord_001",
  customerId: "cust_42",
  totalCents: 4999,
  placedAt: "2026-08-05T10:00:00Z",
});
const orderResult = parseOrderPayload(goodOrder);
assert(
  "valid order payload returns Ok with correct orderId",
  orderResult.kind === "ok" && orderResult.value.orderId === "ord_001"
);
assert(
  "valid order payload has correct totalCents",
  orderResult.kind === "ok" && orderResult.value.totalCents === 4999
);

// -----------------------------------------------------------
// Test 4 — parseOrderPayload missing field
// -----------------------------------------------------------
const missingField = JSON.stringify({
  orderId: "ord_002",
  customerId: "cust_99",
  // totalCents intentionally omitted
  placedAt: "2026-08-05T11:00:00Z",
});
const missingResult = parseOrderPayload(missingField);
assert(
  "missing field returns Err with kind 'missing_field'",
  missingResult.kind === "err" &&
    missingResult.error.kind === "missing_field" &&
    missingResult.error.field === "totalCents"
);

// -----------------------------------------------------------
// Test 5 — parseOrderPayload wrong type
// -----------------------------------------------------------
const wrongType = JSON.stringify({
  orderId: "ord_003",
  customerId: "cust_77",
  totalCents: "not-a-number", // ← wrong type
  placedAt: "2026-08-05T12:00:00Z",
});
const wrongTypeResult = parseOrderPayload(wrongType);
assert(
  "wrong type returns Err with kind 'wrong_type'",
  wrongTypeResult.kind === "err" &&
    wrongTypeResult.error.kind === "wrong_type" &&
    wrongTypeResult.error.field === "totalCents"
);

// -----------------------------------------------------------
// Test 6 — parseRefundPayload happy path
// -----------------------------------------------------------
console.log("\n── parseRefundPayload ──");
const goodRefund = JSON.stringify({
  refundId: "ref_001",
  orderId: "ord_001",
  amountCents: 1000,
});
const refundResult = parseRefundPayload(goodRefund);
assert(
  "valid refund payload returns Ok",
  refundResult.kind === "ok" && refundResult.value.refundId === "ref_001"
);

// -----------------------------------------------------------
// Test 7 — unwrapOr
// -----------------------------------------------------------
console.log("\n── unwrapOr ──");
assert(
  "unwrapOr returns value for Ok",
  unwrapOr(ok(42), 0) === 42
);
assert(
  "unwrapOr returns fallback for Err",
  unwrapOr(err({ kind: "invalid_json" as const, raw: "{}" }), 99) === 99
);

// -----------------------------------------------------------
// Test 8 — describeError
// -----------------------------------------------------------
console.log("\n── describeError ──");
const msg1 = describeError({ kind: "missing_field", field: "orderId" });
assert(
  "describeError missing_field mentions the field name",
  msg1.includes("orderId")
);
const msg2 = describeError({ kind: "wrong_type", field: "totalCents", expected: "number" });
assert(
  "describeError wrong_type mentions field and expected type",
  msg2.includes("totalCents") && msg2.includes("number")
);
const msg3 = describeError({ kind: "invalid_json", raw: '{"broken":' });
assert(
  "describeError invalid_json mentions the raw snippet",
  msg3.includes("{\"broken\":")
);

// -----------------------------------------------------------
// Summary
// -----------------------------------------------------------
console.log(`\n${"─".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
