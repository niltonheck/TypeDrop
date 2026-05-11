// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validateServiceConfig,
  createBreakerEngine,
  initGateway,
  serviceId,
  ms,
  ServiceConfig,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const validRaw = {
  id: "payments",
  failureThreshold: 3,
  recoveryTimeout: 5000,
  callTimeout: 1000,
  maxRetries: 2,
};

const validRaw2 = {
  id: "inventory",
  failureThreshold: 2,
  recoveryTimeout: 3000,
  callTimeout: 500,
  maxRetries: 1,
};

const invalidRaw1 = { id: "", failureThreshold: 3, recoveryTimeout: 5000, callTimeout: 1000, maxRetries: 2 };
const invalidRaw2 = { id: "orders", failureThreshold: -1, recoveryTimeout: 5000, callTimeout: 1000, maxRetries: 2 };
const invalidRaw3 = "not-an-object";

// ------------------------------------------------------------------
// Test 1: validateServiceConfig — happy path
// ------------------------------------------------------------------
{
  const cfg = validateServiceConfig(validRaw);
  console.assert(cfg.id === "payments",           "T1a: id should be 'payments'");
  console.assert(cfg.failureThreshold === 3,      "T1b: failureThreshold should be 3");
  console.assert(cfg.maxRetries === 2,            "T1c: maxRetries should be 2");
  console.log("✅ Test 1 passed: validateServiceConfig happy path");
}

// ------------------------------------------------------------------
// Test 2: validateServiceConfig — rejects invalid configs
// ------------------------------------------------------------------
{
  let caught = 0;
  for (const bad of [invalidRaw1, invalidRaw2, invalidRaw3]) {
    try { validateServiceConfig(bad); }
    catch (e) { if (e instanceof TypeError) caught++; }
  }
  console.assert(caught === 3, `T2: expected 3 TypeErrors, got ${caught}`);
  console.log("✅ Test 2 passed: validateServiceConfig rejects bad configs");
}

// ------------------------------------------------------------------
// Test 3: circuit breaker — closed state, successful call
// ------------------------------------------------------------------
async function test3() {
  const cfg = validateServiceConfig(validRaw);
  const engine = createBreakerEngine([cfg]);
  const id = serviceId("payments");

  const outcome = await engine.call(id, () => Promise.resolve(42));
  console.assert(outcome.ok === true, "T3a: outcome should be ok");
  if (outcome.ok) {
    console.assert(outcome.value === 42, "T3b: value should be 42");
  }
  const report = engine.getReport();
  console.assert(report.services.length === 1,        "T3c: report should have 1 service");
  console.assert(report.summary["closed"] === 1,      "T3d: summary closed should be 1");
  console.assert(report.summary["open"] === 0,        "T3e: summary open should be 0");
  console.log("✅ Test 3 passed: closed-state successful call");
}

// ------------------------------------------------------------------
// Test 4: circuit breaker — trips to open after threshold failures
// ------------------------------------------------------------------
async function test4() {
  const cfg = validateServiceConfig({ ...validRaw, failureThreshold: 2, maxRetries: 0 });
  const engine = createBreakerEngine([cfg]);
  const id = serviceId("payments");

  const fail = () => Promise.reject(new Error("upstream down"));

  // Two consecutive failures should trip the breaker
  await engine.call(id, fail);
  await engine.call(id, fail);

  const outcome = await engine.call(id, fail);
  console.assert(outcome.ok === false,                        "T4a: should be failure");
  if (!outcome.ok) {
    console.assert(outcome.reason === "circuit-open",         "T4b: reason should be circuit-open");
  }
  const report = engine.getReport();
  console.assert(report.summary["open"] === 1,               "T4c: breaker should be open");
  console.log("✅ Test 4 passed: breaker trips to open");
}

// ------------------------------------------------------------------
// Test 5: initGateway — mixed valid/invalid, engine works, errors collected
// ------------------------------------------------------------------
async function test5() {
  const { engine, errors } = initGateway([validRaw, validRaw2, invalidRaw1, invalidRaw2]);
  console.assert(errors.length === 2,  "T5a: should collect 2 validation errors");

  const report = engine.getReport();
  console.assert(report.services.length === 2, "T5b: engine should have 2 valid services");

  // Successful call on a valid service
  const outcome = await engine.call(serviceId("inventory"), () => Promise.resolve("ok"));
  console.assert(outcome.ok === true,  "T5c: call on valid service should succeed");
  console.log("✅ Test 5 passed: initGateway mixed batch");
}

// ------------------------------------------------------------------
// Run all async tests
// ------------------------------------------------------------------
(async () => {
  await test3();
  await test4();
  await test5();
  console.log("\n🎉 All tests passed!");
})().catch(err => {
  console.error("❌ Test suite error:", err);
  process.exit(1);
});
