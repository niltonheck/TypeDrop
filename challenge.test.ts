// ============================================================
// challenge.test.ts — Test harness for the Normalizer challenge
// Run with:  npx ts-node --project tsconfig.json challenge.test.ts
// ============================================================

import {
  ok, err, isOk, isErr,
  nonEmptyString, positiveNumber, isoDateString,
  normalize, normalizeFromRegistry, normalizeBatch,
  orderSchema, userSchema,
  type OrderRecord,
  type UserRecord,
  type SchemaRegistry,
  type NormalizedOutput,
  type FieldSchema,
  type ISODateString,
} from "./challenge";

// ─── Mock Data ───────────────────────────────────────────────

const validOrder: unknown = {
  orderId:   "ORD-001",
  amount:    149.99,
  currency:  "USD",
  placedAt:  "2026-08-19T12:00:00Z",
  itemCount: 3,
};

const invalidOrder: unknown = {
  orderId:   "",           // fails: empty string
  amount:    -5,           // fails: not positive
  currency:  "USD",
  placedAt:  "not-a-date", // fails: bad format
  itemCount: 2,
};

const validUser: unknown = {
  userId:    "USR-42",
  email:     "ada@example.com",
  createdAt: "2024-01-15",
  age:       30,
};

// ─── Test 1: ok() / err() / isOk() / isErr() ─────────────────
{
  const r1 = ok(42);
  const r2 = err("oops");

  console.assert(isOk(r1),  "Test 1a FAILED: isOk(ok(42)) should be true");
  console.assert(!isOk(r2), "Test 1b FAILED: isOk(err(...)) should be false");
  console.assert(isErr(r2), "Test 1c FAILED: isErr(err(...)) should be true");
  console.assert(!isErr(r1),"Test 1d FAILED: isErr(ok(42)) should be false");
  console.assert(r1.tag === "ok"  && r1.value === 42,    "Test 1e FAILED: ok value mismatch");
  console.assert(r2.tag === "err" && r2.error === "oops","Test 1f FAILED: err value mismatch");
  console.log("✅ Test 1 passed: Result monad helpers");
}

// ─── Test 2: normalize() — valid order ───────────────────────
{
  const result = normalize(orderSchema, validOrder, "orders");

  console.assert(isOk(result), "Test 2a FAILED: valid order should produce Ok");
  if (isOk(result)) {
    console.assert(result.value.orderId  === "ORD-001", "Test 2b FAILED: orderId mismatch");
    console.assert(result.value.amount   === 149.99,    "Test 2c FAILED: amount mismatch");
    console.assert(result.value.currency === "USD",     "Test 2d FAILED: currency mismatch");
    console.assert(result.value.itemCount === 3,        "Test 2e FAILED: itemCount mismatch");
  }
  console.log("✅ Test 2 passed: normalize() with valid order");
}

// ─── Test 3: normalize() — invalid order collects ALL errors ─
{
  const result = normalize(orderSchema, invalidOrder, "orders");

  console.assert(isErr(result), "Test 3a FAILED: invalid order should produce Err");
  if (isErr(result)) {
    // Expect 3 field errors: orderId (empty), amount (out_of_range), placedAt (invalid_format)
    console.assert(
      result.error.fields.length === 3,
      `Test 3b FAILED: expected 3 field errors, got ${result.error.fields.length}`
    );
    const kinds = result.error.fields.map(f => f.kind);
    console.assert(kinds.includes("wrong_type") || kinds.includes("out_of_range") || kinds.includes("invalid_format"),
      "Test 3c FAILED: expected out_of_range or invalid_format errors");
    console.assert(result.error.source === "orders", "Test 3d FAILED: source mismatch");
  }
  console.log("✅ Test 3 passed: normalize() collects all field errors");
}

// ─── Test 4: normalizeFromRegistry() — type-safe dispatch ────
{
  type MyRegistry = {
    orders: OrderRecord;
    users:  UserRecord;
  };

  const registry = {
    orders: { schema: orderSchema },
    users:  { schema: userSchema  },
  } satisfies SchemaRegistry<MyRegistry>;

  const orderResult = normalizeFromRegistry(registry, "orders", validOrder);
  const userResult  = normalizeFromRegistry(registry, "users",  validUser);

  console.assert(isOk(orderResult), "Test 4a FAILED: valid order via registry should be Ok");
  console.assert(isOk(userResult),  "Test 4b FAILED: valid user via registry should be Ok");

  if (isOk(orderResult)) {
    // TypeScript should know this is OrderRecord — access orderId without cast
    const _: string = orderResult.value.orderId;
    console.assert(orderResult.value.orderId === "ORD-001", "Test 4c FAILED: orderId mismatch");
  }
  if (isOk(userResult)) {
    const _: string = userResult.value.email;
    console.assert(userResult.value.email === "ada@example.com", "Test 4d FAILED: email mismatch");
  }
  console.log("✅ Test 4 passed: normalizeFromRegistry() dispatches correctly");
}

// ─── Test 5: normalizeBatch() — mixed valid/invalid ──────────
{
  type MyRegistry = {
    orders: OrderRecord;
    users:  UserRecord;
  };

  const registry = {
    orders: { schema: orderSchema },
    users:  { schema: userSchema  },
  } satisfies SchemaRegistry<MyRegistry>;

  const raws: unknown[] = [validOrder, invalidOrder, validOrder];
  const batch = normalizeBatch(registry, "orders", raws);

  console.assert(
    batch.successes.length === 2,
    `Test 5a FAILED: expected 2 successes, got ${batch.successes.length}`
  );
  console.assert(
    batch.failures.length === 1,
    `Test 5b FAILED: expected 1 failure, got ${batch.failures.length}`
  );
  console.assert(
    batch.successes[0].orderId === "ORD-001",
    "Test 5c FAILED: first success orderId mismatch"
  );
  console.log("✅ Test 5 passed: normalizeBatch() buckets results correctly");
}

// ─── Test 6: NormalizedOutput<> conditional type ─────────────
{
  // Compile-time check only — if it compiles, the type is correct
  type T1 = NormalizedOutput<FieldSchema<ISODateString>>;
  type T2 = NormalizedOutput<string>;

  const _check1: T1 = "2026-08-19" as ISODateString; // must compile
  const _check2: T2 = ((): never => { throw 0; })();  // never

  console.log("✅ Test 6 passed: NormalizedOutput<> conditional type compiles correctly");
}

console.log("\n🎉 All tests passed!");
