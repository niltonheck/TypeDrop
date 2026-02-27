// ============================================================
// challenge.test.ts
// Run with: npx ts-node --strict challenge.test.ts
// ============================================================
import {
  ok, err,
  withRetry, fetchAllPages, fetchWithConcurrencyLimit,
  partitionResults, ingestEndpoints,
  PagedResponse, ApiError, Result, FetchPage, EndpointConfig,
} from "./challenge";

// ─── helpers ────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ─── mock data ──────────────────────────────────────────────
interface Widget { id: number; name: string }

/** Builds a FetchPage<Widget> that serves `pages` and returns null at the end. */
function makeWidgetFetcher(pages: Widget[][]): FetchPage<Widget> {
  return async (page: number): Promise<PagedResponse<Widget>> => {
    if (page >= pages.length) {
      return { items: [], nextPage: null, total: pages.flat().length };
    }
    return {
      items: pages[page],
      nextPage: page + 1 < pages.length ? page + 1 : null,
      total: pages.flat().length,
    };
  };
}

/** Builds a Result-returning fn that fails `failTimes` then succeeds. */
function makeFlaky<T>(
  value: T,
  failTimes: number,
  retryAfterMs = 0
): () => Promise<Result<T, ApiError>> {
  let calls = 0;
  return async () => {
    calls++;
    if (calls <= failTimes) {
      return err<ApiError>({ kind: "transient", message: "flaky", retryAfterMs });
    }
    return ok(value);
  };
}

// ─── TEST 1: withRetry — succeeds after transient failures ──
async function testWithRetry() {
  console.log("\n[1] withRetry");
  const fn = makeFlaky("hello", 2, 0);
  const result = await withRetry(fn, 3);
  assert(result.ok === true, "ok flag is true after 2 transient failures + 1 success");
  assert(result.ok && result.value === "hello", "value is 'hello'");

  // Permanent error should NOT be retried
  let permanentCalls = 0;
  const permanentFn = async (): Promise<Result<string, ApiError>> => {
    permanentCalls++;
    return err<ApiError>({ kind: "permanent", message: "gone", statusCode: 410 });
  };
  const permanentResult = await withRetry(permanentFn, 5);
  assert(permanentResult.ok === false, "permanent error returns Err immediately");
  assert(permanentCalls === 1, "permanent error fn called exactly once (no retries)");
}

// ─── TEST 2: fetchAllPages — collects all items ──────────────
async function testFetchAllPages() {
  console.log("\n[2] fetchAllPages");
  const pages: Widget[][] = [
    [{ id: 1, name: "A" }, { id: 2, name: "B" }],
    [{ id: 3, name: "C" }],
    [{ id: 4, name: "D" }, { id: 5, name: "E" }],
  ];
  const fetcher = makeWidgetFetcher(pages);
  const items = await fetchAllPages(fetcher);
  assert(items.length === 5, "all 5 widgets collected across 3 pages");
  assert(items[0].id === 1 && items[4].id === 5, "order preserved");
}

// ─── TEST 3: fetchWithConcurrencyLimit — order & concurrency ─
async function testConcurrencyLimit() {
  console.log("\n[3] fetchWithConcurrencyLimit");
  const order: number[] = [];
  const tasks = [0, 1, 2, 3, 4].map((i) => async (): Promise<Result<number, ApiError>> => {
    await new Promise<void>((r) => setTimeout(r, 10));
    order.push(i);
    return ok(i * 10);
  });

  const results = await fetchWithConcurrencyLimit(tasks, 2);
  assert(results.length === 5, "all 5 results returned");
  const values = results.map((r) => (r.ok ? r.value : -1));
  assert(
    JSON.stringify(values) === JSON.stringify([0, 10, 20, 30, 40]),
    "output order matches input task order"
  );
}

// ─── TEST 4: partitionResults ────────────────────────────────
async function testPartitionResults() {
  console.log("\n[4] partitionResults");
  const results: Array<Result<number, string>> = [
    ok(1), err("bad"), ok(2), err("worse"), ok(3),
  ];
  const { successes, failures } = partitionResults(results);
  assert(successes.length === 3, "3 successes");
  assert(failures.length === 2, "2 failures");
  assert(successes[2] === 3, "last success is 3");
  assert(failures[0] === "bad", "first failure is 'bad'");
}

// ─── TEST 5: ingestEndpoints — end-to-end ───────────────────
async function testIngestEndpoints() {
  console.log("\n[5] ingestEndpoints");

  const pages1: Widget[][] = [[{ id: 1, name: "X" }], [{ id: 2, name: "Y" }]];
  const pages2: Widget[][] = [[{ id: 3, name: "Z" }]];

  const endpoints: ReadonlyArray<EndpointConfig<Widget>> = [
    { id: "ep-1", fetchPage: makeWidgetFetcher(pages1), maxRetries: 3 },
    { id: "ep-2", fetchPage: makeWidgetFetcher(pages2), maxRetries: 3 },
  ];

  const { successes, failures } = await ingestEndpoints(endpoints, 2);
  assert(successes.length === 2, "both endpoints succeeded");
  assert(failures.length === 0, "no failures");
  const ep1 = successes.find((s) => s.id === "ep-1");
  assert(ep1 !== undefined && ep1.items.length === 2, "ep-1 has 2 items");
}

// ─── RUN ─────────────────────────────────────────────────────
(async () => {
  await testWithRetry();
  await testFetchAllPages();
  await testConcurrencyLimit();
  await testPartitionResults();
  await testIngestEndpoints();
  console.log("\nDone.");
})();
