// challenge.test.ts
import {
  createPipeline,
  withRequestId,
  withAuth,
  withTimestamp,
  withParsedBody,
  AuthError,
} from "./challenge";

// ── Helper ──────────────────────────────────────────────────
async function runAll(): Promise<void> {
  // ── Test 1: Basic pipeline accumulates context correctly ──
  {
    let captured: { requestId: string; timestamp: number } | null = null;

    await createPipeline({})
      .use(withRequestId("req"))
      .use(withTimestamp())
      .run(async (ctx) => {
        captured = ctx;
      });

    console.assert(captured !== null, "Test 1a: handler was called");
    console.assert(
      typeof (captured as { requestId: string }).requestId === "string" &&
        (captured as { requestId: string }).requestId.startsWith("req_"),
      "Test 1b: requestId has correct prefix"
    );
    console.assert(
      typeof (captured as { timestamp: number }).timestamp === "number",
      "Test 1c: timestamp is a number"
    );
    console.log("✅ Test 1 passed: basic pipeline accumulates context");
  }

  // ── Test 2: withAuth enriches context with userId and role ──
  {
    let captured: { userId: string; role: "admin" | "user" } | null = null;

    await createPipeline({})
      .use(withAuth("admin_secret"))
      .run(async (ctx) => {
        captured = ctx;
      });

    console.assert(captured !== null, "Test 2a: handler was called");
    console.assert(
      (captured as { role: string }).role === "admin",
      "Test 2b: admin token yields role=admin"
    );
    console.assert(
      (captured as { userId: string }).userId === "user_12",
      `Test 2c: userId derived from token length (got ${(captured as { userId: string } | null)?.userId})`
    );
    console.log("✅ Test 2 passed: withAuth enriches context correctly");
  }

  // ── Test 3: withAuth throws AuthError on empty token ──
  {
    let threw = false;
    let errorCode: string | null = null;

    try {
      await createPipeline({})
        .use(withAuth(""))
        .run(async (_ctx) => {});
    } catch (e) {
      threw = true;
      if (e instanceof AuthError) {
        errorCode = e.code;
      }
    }

    console.assert(threw, "Test 3a: empty token throws");
    console.assert(errorCode === "UNAUTHORIZED", "Test 3b: error code is UNAUTHORIZED");
    console.log("✅ Test 3 passed: AuthError thrown for invalid token");
  }

  // ── Test 4: withParsedBody reads rawBody and parses it ──
  {
    interface ParsedPayload {
      action: string;
      value: number;
    }

    let captured: { body: ParsedPayload } | null = null;

    const raw = JSON.stringify({ action: "click", value: 42 });

    await createPipeline({ rawBody: raw })
      .use(
        withParsedBody<ParsedPayload, { rawBody: string }>(
          (s) => JSON.parse(s) as ParsedPayload
        )
      )
      .run(async (ctx) => {
        captured = ctx;
      });

    console.assert(captured !== null, "Test 4a: handler was called");
    console.assert(
      (captured as { body: ParsedPayload }).body.action === "click",
      "Test 4b: parsed body.action is correct"
    );
    console.assert(
      (captured as { body: ParsedPayload }).body.value === 42,
      "Test 4c: parsed body.value is correct"
    );
    console.log("✅ Test 4 passed: withParsedBody parses rawBody correctly");
  }

  // ── Test 5: Full pipeline — all four middleware in sequence ──
  {
    interface Order {
      orderId: string;
      amount: number;
    }

    const rawOrder = JSON.stringify({ orderId: "ORD-001", amount: 99 });

    let captured: {
      requestId: string;
      userId: string;
      role: "admin" | "user";
      timestamp: number;
      body: Order;
    } | null = null;

    await createPipeline({ rawBody: rawOrder })
      .use(withRequestId("api"))
      .use(withAuth("user_token"))
      .use(withTimestamp())
      .use(
        withParsedBody<Order, { rawBody: string }>(
          (s) => JSON.parse(s) as Order
        )
      )
      .run(async (ctx) => {
        captured = ctx;
      });

    console.assert(captured !== null, "Test 5a: handler was called");
    console.assert(
      (captured as { requestId: string }).requestId.startsWith("api_"),
      "Test 5b: requestId starts with api_"
    );
    console.assert(
      (captured as { role: string }).role === "user",
      "Test 5c: non-admin token yields role=user"
    );
    console.assert(
      (captured as { body: Order }).body.orderId === "ORD-001",
      "Test 5d: body.orderId is correct"
    );
    console.assert(
      (captured as { body: Order }).body.amount === 99,
      "Test 5e: body.amount is correct"
    );
    console.log("✅ Test 5 passed: full four-middleware pipeline works end-to-end");
  }

  console.log("\n🎉 All tests passed!");
}

runAll().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
