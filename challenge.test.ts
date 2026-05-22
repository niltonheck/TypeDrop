// ============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validateRequest,
  authMiddleware,
  makeRateLimitMiddleware,
  transformMiddleware,
  runPipeline,
  reportError,
  toUserId,
  toTraceId,
  toTenantId,
  type RateLimitStore,
  type BaseContext,
  type FullContext,
  type AnyPipelineError,
  type RawRequest,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

async function assertAsync(
  fn: () => Promise<boolean>,
  label: string
): Promise<void> {
  try {
    const result = await fn();
    assert(result, label);
  } catch (e) {
    console.error(`  ❌ FAIL (threw): ${label}`, e);
    failed++;
  }
}

function makeStore(limit = 5): RateLimitStore {
  return {
    limit,
    windowResetAt: Date.now() + 60_000,
    counts: new Map(),
  };
}

// ── 1. validateRequest ────────────────────────────────────────
console.log("\n── 1. validateRequest ──");

{
  const good = {
    method: "POST",
    path: "/api/data",
    headers: { "content-type": "application/json", "x-user-id": "u1" },
    body: { foo: 1 },
  };
  const r = validateRequest(good);
  assert(r.ok === true, "valid request returns ok:true");
  if (r.ok) {
    assert(r.value.method === "POST", "method preserved");
    assert(r.value.path === "/api/data", "path preserved");
  }
}

{
  const r = validateRequest(null);
  assert(r.ok === false, "null input → ok:false");
  if (!r.ok) assert(r.error.kind === "VALIDATION_ERROR", "null → VALIDATION_ERROR");
}

{
  const r = validateRequest({ method: "GET", path: "no-slash", headers: {}, body: null });
  assert(r.ok === false, "path without leading slash → ok:false");
}

{
  const r = validateRequest({ method: "", path: "/x", headers: {}, body: null });
  assert(r.ok === false, "empty method → ok:false");
}

{
  const r = validateRequest({
    method: "GET",
    path: "/x",
    headers: { bad: 42 },  // non-string header value
    body: null,
  });
  assert(r.ok === false, "non-string header value → ok:false");
}

// ── 2. authMiddleware ─────────────────────────────────────────
console.log("\n── 2. authMiddleware ──");

const validRaw: RawRequest = {
  method: "GET",
  path: "/items",
  headers: { "x-user-id": "user-99", "x-tenant-id": "tenant-42" },
  body: null,
};

const baseCtx: BaseContext = {
  traceId: toTraceId("trace-abc"),
  rawRequest: validRaw,
  startedAt: Date.now(),
};

await assertAsync(async () => {
  const r = await authMiddleware(baseCtx);
  if (!r.ok) return false;
  return r.value.userId === toUserId("user-99") &&
         r.value.tenantId === toTenantId("tenant-42");
}, "authMiddleware enriches context with userId & tenantId");

await assertAsync(async () => {
  const noAuth: BaseContext = {
    ...baseCtx,
    rawRequest: { ...validRaw, headers: {} },
  };
  const r = await authMiddleware(noAuth);
  return r.ok === false && r.error.kind === "AUTH_ERROR";
}, "authMiddleware returns AUTH_ERROR when headers missing");

// ── 3. rateLimitMiddleware ────────────────────────────────────
console.log("\n── 3. rateLimitMiddleware ──");

await assertAsync(async () => {
  const store = makeStore(3);
  const authCtx = {
    ...baseCtx,
    userId: toUserId("u1"),
    tenantId: toTenantId("t1"),
  };
  const mw = makeRateLimitMiddleware(store);

  // Exhaust the limit
  await mw(authCtx);
  await mw(authCtx);
  await mw(authCtx);
  const r = await mw(authCtx); // 4th call → over limit
  return r.ok === false && r.error.kind === "RATE_LIMIT_ERROR";
}, "rateLimitMiddleware blocks after limit exceeded");

await assertAsync(async () => {
  const store = makeStore(10);
  const authCtx = {
    ...baseCtx,
    userId: toUserId("u2"),
    tenantId: toTenantId("t1"),
  };
  const r = await makeRateLimitMiddleware(store)(authCtx);
  if (!r.ok) return false;
  return r.value.requestsRemaining === 9;
}, "rateLimitMiddleware returns correct requestsRemaining");

// ── 4. transformMiddleware ────────────────────────────────────
console.log("\n── 4. transformMiddleware ──");

await assertAsync(async () => {
  const store = makeStore();
  const rlCtx = {
    ...baseCtx,
    userId: toUserId("u3"),
    tenantId: toTenantId("t3"),
    requestsRemaining: 4,
    windowResetAt: Date.now() + 60_000,
    rawRequest: {
      ...validRaw,
      body: JSON.stringify({ hello: "world" }),
    },
  };
  const r = await transformMiddleware(rlCtx);
  if (!r.ok) return false;
  return (r.value.parsedBody as { hello: string }).hello === "world";
}, "transformMiddleware parses JSON string body");

await assertAsync(async () => {
  const rlCtx = {
    ...baseCtx,
    userId: toUserId("u4"),
    tenantId: toTenantId("t4"),
    requestsRemaining: 4,
    windowResetAt: Date.now() + 60_000,
    rawRequest: { ...validRaw, body: null },
  };
  const r = await transformMiddleware(rlCtx);
  if (!r.ok) return false;
  return typeof r.value.parsedBody === "object" &&
    Object.keys(r.value.parsedBody).length === 0;
}, "transformMiddleware treats null body as empty object");

// ── 5. runPipeline (end-to-end) ───────────────────────────────
console.log("\n── 5. runPipeline ──");

await assertAsync(async () => {
  const store = makeStore();
  const raw = {
    method: "POST",
    path: "/api/order",
    headers: { "x-user-id": "alice", "x-tenant-id": "acme" },
    body: { item: "widget", qty: 3 },
  };
  const r = await runPipeline(raw, store);
  if (!r.ok) return false;
  const ctx: FullContext = r.value;
  return (
    ctx.userId === toUserId("alice") &&
    ctx.tenantId === toTenantId("acme") &&
    ctx.requestsRemaining === 4 &&
    (ctx.parsedBody as { item: string }).item === "widget"
  );
}, "runPipeline succeeds end-to-end and returns FullContext");

await assertAsync(async () => {
  const store = makeStore();
  const raw = {
    method: "DELETE",
    path: "/x",
    headers: {}, // missing auth headers
    body: null,
  };
  const r = await runPipeline(raw, store);
  return r.ok === false && r.error.kind === "AUTH_ERROR";
}, "runPipeline short-circuits with AUTH_ERROR when auth headers missing");

// ── 6. reportError ────────────────────────────────────────────
console.log("\n── 6. reportError ──");

{
  const err: AnyPipelineError = {
    kind: "RATE_LIMIT_ERROR",
    message: "Too many requests",
    traceId: toTraceId("t-xyz"),
  };
  const msg = reportError(err);
  assert(
    typeof msg === "string" && msg.includes("Too many requests") && msg.includes("t-xyz"),
    "reportError includes message and traceId for RATE_LIMIT_ERROR"
  );
}

{
  const err: AnyPipelineError = {
    kind: "AUTH_ERROR",
    message: "Unauthorized",
    traceId: toTraceId("t-abc"),
  };
  const msg = reportError(err);
  assert(
    typeof msg === "string" && msg.includes("Unauthorized"),
    "reportError handles AUTH_ERROR"
  );
}

// ── summary ───────────────────────────────────────────────────
console.log(`\n${"─".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
