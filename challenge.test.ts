// ============================================================
// challenge.test.ts
// ============================================================
import { processCart, validateCart, buildOrderSummary } from "./challenge";
import type { Cart, OrderSummary, Result, ValidationError } from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok === true;
}

function isFail<T, E>(r: Result<T, E>): r is { ok: false; error: E } {
  return r.ok === false;
}

// ── Mock Data ─────────────────────────────────────────────────

const validCartRaw = {
  currency: "USD",
  items: [
    { productId: "p1", name: "Widget",  unitPrice: 1000, quantity: 2 },
    { productId: "p2", name: "Gadget",  unitPrice: 2500, quantity: 1 },
  ],
  discount: { kind: "percentage", percent: 10 },
};

const fixedDiscountCartRaw = {
  currency: "EUR",
  items: [
    { productId: "p3", name: "Doohickey", unitPrice: 500, quantity: 3 },
  ],
  discount: { kind: "fixed", amount: 200 },
};

const noDiscountCartRaw = {
  currency: "GBP",
  items: [
    { productId: "p4", name: "Thingamajig", unitPrice: 750, quantity: 4 },
  ],
};

// ── Test 1: Valid cart with percentage discount ───────────────
console.log("\nTest 1 — percentage discount");
{
  const result = processCart(validCartRaw);
  assert(isOk(result), "processCart returns ok: true for valid input");
  if (isOk(result)) {
    const s: OrderSummary = result.value;
    // subtotal = 1000*2 + 2500*1 = 4500
    // discountApplied = floor(4500 * 10 / 100) = 450
    // total = 4500 - 450 = 4050
    assert(s.currency === "USD",  "currency is USD");
    assert(s.subtotal === 4500,   "subtotal = 4500");
    assert(s.discountApplied === 450, "discountApplied = 450");
    assert(s.total === 4050,      "total = 4050");
    assert(s.lines.length === 2,  "two line items");
    assert(s.lines[0].lineTotal === 2000, "Widget lineTotal = 2000");
    assert(s.lines[1].lineTotal === 2500, "Gadget lineTotal = 2500");
  }
}

// ── Test 2: Valid cart with fixed discount ────────────────────
console.log("\nTest 2 — fixed discount");
{
  const result = processCart(fixedDiscountCartRaw);
  assert(isOk(result), "processCart returns ok: true");
  if (isOk(result)) {
    const s = result.value;
    // subtotal = 500*3 = 1500
    // discountApplied = min(200, 1500) = 200
    // total = 1300
    assert(s.subtotal === 1500,       "subtotal = 1500");
    assert(s.discountApplied === 200, "discountApplied = 200 (fixed)");
    assert(s.total === 1300,          "total = 1300");
  }
}

// ── Test 3: Valid cart with no discount ───────────────────────
console.log("\nTest 3 — no discount");
{
  const result = processCart(noDiscountCartRaw);
  assert(isOk(result), "processCart returns ok: true");
  if (isOk(result)) {
    const s = result.value;
    // subtotal = 750*4 = 3000
    assert(s.subtotal === 3000,   "subtotal = 3000");
    assert(s.discountApplied === 0, "discountApplied = 0");
    assert(s.total === 3000,      "total = 3000");
  }
}

// ── Test 4: Fixed discount larger than subtotal ───────────────
console.log("\nTest 4 — fixed discount capped at subtotal");
{
  const bigDiscount = {
    currency: "USD",
    items: [{ productId: "p5", name: "Cheapo", unitPrice: 100, quantity: 1 }],
    discount: { kind: "fixed", amount: 9999 },
  };
  const result = processCart(bigDiscount);
  assert(isOk(result), "processCart returns ok: true");
  if (isOk(result)) {
    const s = result.value;
    assert(s.discountApplied === 100, "discount capped at subtotal (100)");
    assert(s.total === 0,             "total is 0, never negative");
  }
}

// ── Test 5: Invalid inputs produce ValidationErrors ───────────
console.log("\nTest 5 — validation errors");
{
  const badCart = {
    currency: "JPY",          // invalid currency
    items: [],                // empty array
    discount: { kind: "percentage", percent: 0 }, // percent must be > 0
  };
  const result = processCart(badCart);
  assert(isFail(result), "processCart returns ok: false for invalid input");
  if (isFail(result)) {
    const errors: ValidationError[] = result.error;
    assert(errors.length >= 3, "at least 3 errors collected (currency, items, discount)");
    const fields = errors.map((e) => e.field);
    assert(fields.includes("currency"), "currency error reported");
    assert(fields.includes("items"),    "items error reported");
    assert(fields.includes("discount"), "discount error reported");
  }
}

// ── Test 6: Completely non-object input ───────────────────────
console.log("\nTest 6 — non-object input");
{
  const result = processCart(null);
  assert(isFail(result), "null input → validation failure");
}

console.log("\nDone.\n");
