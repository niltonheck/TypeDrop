// ============================================================
// challenge.test.ts — Test harness for the Query Planner
// ============================================================
import {
  makeResolverPath,
  createConcurrencyLimiter,
  validateQueryDocument,
  buildExecutionPlan,
  runQuery,
  ResolverRegistry,
  ResolverContext,
  ResponseNode,
} from "./challenge";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const ctx: ResolverContext = { requestId: "req-001", userId: "user-42" };

function makeRegistry(): ResolverRegistry {
  const reg: ResolverRegistry = new Map();

  reg.set(makeResolverPath("me"), async (_parent, _args, context) => ({
    id: context.userId ?? "anon",
    name: "Alice",
  }));

  reg.set(makeResolverPath("me.posts"), async (_parent, args, _ctx) => {
    const limit = typeof args["limit"] === "number" ? args["limit"] : 2;
    return Array.from({ length: limit }, (_, i) => ({
      id: String(i + 1),
      title: `Post ${i + 1}`,
    }));
  });

  reg.set(makeResolverPath("me.posts.title"), async (parent, _args, _ctx) => {
    const p = parent as { title: string };
    return p.title;
  });

  reg.set(makeResolverPath("serverTime"), async () =>
    new Date("2026-06-18T00:00:00Z").toISOString()
  );

  return reg;
}

// ------------------------------------------------------------------
// Test 1: validateQueryDocument — rejects invalid input
// ------------------------------------------------------------------
const badResult = validateQueryDocument({ operation: "subscribe", selections: [] });
console.assert(
  badResult.ok === false,
  "TEST 1 FAILED: should reject unknown operation 'subscribe'"
);
console.log("TEST 1 passed:", !badResult.ok && badResult.error);

// ------------------------------------------------------------------
// Test 2: validateQueryDocument — accepts valid document
// ------------------------------------------------------------------
const rawDoc = {
  operation: "query",
  selections: [
    {
      name: "me",
      selections: [
        { name: "posts", args: { limit: 3 }, selections: [{ name: "title" }] },
      ],
    },
    { name: "serverTime" },
  ],
};
const goodResult = validateQueryDocument(rawDoc);
console.assert(goodResult.ok === true, "TEST 2 FAILED: should accept valid document");
console.log("TEST 2 passed:", goodResult.ok);

// ------------------------------------------------------------------
// Test 3: buildExecutionPlan — correct path construction
// ------------------------------------------------------------------
if (goodResult.ok) {
  const plan = buildExecutionPlan(goodResult.value);
  console.assert(plan.roots.length === 2, "TEST 3 FAILED: expected 2 root nodes");
  const meNode = plan.roots.find((r) => r.fieldName === "me");
  console.assert(meNode !== undefined, "TEST 3 FAILED: missing 'me' root node");
  if (meNode) {
    const postsNode = meNode.children.find((c) => c.fieldName === "posts");
    console.assert(postsNode !== undefined, "TEST 3 FAILED: missing 'posts' child");
    if (postsNode) {
      console.assert(
        postsNode.path === "me.posts",
        `TEST 3 FAILED: expected path "me.posts", got "${postsNode.path}"`
      );
      const titleNode = postsNode.children.find((c) => c.fieldName === "title");
      console.assert(
        titleNode?.path === "me.posts.title",
        `TEST 3 FAILED: expected "me.posts.title", got "${titleNode?.path}"`
      );
    }
  }
  console.log("TEST 3 passed: path construction correct");
}

// ------------------------------------------------------------------
// Test 4: runQuery — full pipeline, missing resolver produces error
// ------------------------------------------------------------------
(async () => {
  const registry = makeRegistry();
  const queryWithMissing = {
    operation: "query",
    selections: [
      { name: "serverTime" },
      { name: "ghost" }, // no resolver registered
    ],
  };
  const response = await runQuery(queryWithMissing, registry, ctx);

  console.assert(
    typeof response.data["serverTime"] === "string",
    "TEST 4 FAILED: serverTime should resolve to a string"
  );
  console.assert(
    response.errors.length >= 1,
    "TEST 4 FAILED: expected at least one error for 'ghost'"
  );
  const ghostError = response.errors.find((e) => e.path === "ghost");
  console.assert(ghostError !== undefined, "TEST 4 FAILED: missing error for 'ghost'");
  console.log("TEST 4 passed:", response.data["serverTime"], "| errors:", response.errors.length);
})();

// ------------------------------------------------------------------
// Test 5: createConcurrencyLimiter — enforces max concurrency
// ------------------------------------------------------------------
(async () => {
  const limiter = createConcurrencyLimiter(2);
  let running = 0;
  let maxObserved = 0;

  const task = () =>
    limiter.schedule(async () => {
      running++;
      if (running > maxObserved) maxObserved = running;
      await new Promise<void>((res) => setTimeout(res, 20));
      running--;
    });

  await Promise.all([task(), task(), task(), task(), task()]);

  console.assert(
    maxObserved <= 2,
    `TEST 5 FAILED: concurrency exceeded limit — max observed: ${maxObserved}`
  );
  console.log(`TEST 5 passed: max concurrent tasks observed = ${maxObserved}`);
})();

// ------------------------------------------------------------------
// Test 6: runQuery — validation failure returns structured error
// ------------------------------------------------------------------
(async () => {
  const registry = makeRegistry();
  const response = await runQuery(null, registry, ctx);
  console.assert(
    Object.keys(response.data).length === 0,
    "TEST 6 FAILED: data should be empty on validation failure"
  );
  console.assert(
    response.errors[0]?.path === "__validation",
    "TEST 6 FAILED: expected __validation error path"
  );
  console.log("TEST 6 passed: validation failure structured correctly");
})();
