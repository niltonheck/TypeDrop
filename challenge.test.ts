// challenge.test.ts
import {
  parseApiResponse,
  describePayload,
  isApiPayload,
  type ApiPayload,
  type ParseError,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────

const validUser = JSON.stringify({
  kind: "user",
  id: 42,
  name: "Alice",
  email: "alice@example.com",
});

const validOrder = JSON.stringify({
  kind: "order",
  orderId: "ORD-001",
  total: 99.95,
  items: ["widget", "gadget"],
});

const validError = JSON.stringify({
  kind: "error",
  code: 404,
  message: "Not found",
});

const invalidJson = "{ not valid json }}}";

const unknownShape = JSON.stringify({ kind: "invoice", amount: 50 });

const missingField = JSON.stringify({ kind: "user", id: 1, name: "Bob" }); // missing email

// ── Tests ─────────────────────────────────────────────────────

// Test 1: valid user parses successfully
const userResult = parseApiResponse(validUser);
console.assert(userResult.ok === true, "FAIL T1: valid user should parse ok");
if (userResult.ok) {
  console.assert(
    userResult.value.kind === "user",
    "FAIL T1b: kind should be 'user'"
  );
}

// Test 2: valid order parses successfully and describes correctly
const orderResult = parseApiResponse(validOrder);
console.assert(
  orderResult.ok === true,
  "FAIL T2: valid order should parse ok"
);
if (orderResult.ok) {
  const desc = describePayload(orderResult.value);
  console.assert(
    desc === "Order ORD-001: 2 item(s), $99.95",
    `FAIL T2b: unexpected description "${desc}"`
  );
}

// Test 3: invalid JSON returns invalid-json error
const badJsonResult = parseApiResponse(invalidJson);
console.assert(
  badJsonResult.ok === false,
  "FAIL T3: invalid JSON should not parse ok"
);
if (!badJsonResult.ok) {
  console.assert(
    badJsonResult.error.reason === "invalid-json",
    "FAIL T3b: reason should be 'invalid-json'"
  );
}

// Test 4: unknown shape returns unknown-shape error
const unknownResult = parseApiResponse(unknownShape);
console.assert(
  unknownResult.ok === false,
  "FAIL T4: unknown shape should not parse ok"
);
if (!unknownResult.ok) {
  console.assert(
    unknownResult.error.reason === "unknown-shape",
    "FAIL T4b: reason should be 'unknown-shape'"
  );
}

// Test 5: missing required field is rejected
const missingResult = parseApiResponse(missingField);
console.assert(
  missingResult.ok === false,
  "FAIL T5: missing field should not parse ok"
);

// Test 6: describePayload formats user correctly
const userPayload: ApiPayload = {
  kind: "user",
  id: 7,
  name: "Carol",
  email: "carol@example.com",
};
console.assert(
  describePayload(userPayload) === "User #7: Carol (carol@example.com)",
  "FAIL T6: user description incorrect"
);

// Test 7: describePayload formats error correctly
const errorResult = parseApiResponse(validError);
if (errorResult.ok) {
  console.assert(
    describePayload(errorResult.value) === "API Error 404: Not found",
    "FAIL T7: error description incorrect"
  );
}

console.log("All assertions passed ✓");
