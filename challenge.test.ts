// ============================================================
// challenge.test.ts — Test harness (run with ts-node or vitest)
// ============================================================
import {
  ok,
  err,
  isOk,
  makeCursor,
  fetchAllPages,
  mapFetcher,
  withRetry,
  type Page,
  type PageFetcher,
  type FetchError,
  type Cursor,
  type Result,
} from "./challenge";

// ------------------------------------------------------------------
// Mock helpers
// ------------------------------------------------------------------

type Post = { id: number; title: string };

function makePages(pages: Array<Post[]>): PageFetcher<Post> {
  const cursors = pages.map((_, i) => makeCursor(`cursor-${i}`));
  return async (cursor: Cursor | undefined): Promise<Result<Page<Post>, FetchError>> => {
    const index = cursor === undefined ? 0 : cursors.indexOf(cursor);
    if (index === -1) return err({ kind: "parse", message: "bad cursor", retryable: false });
    const items = pages[index];
    const nextCursor = index + 1 < pages.length ? cursors[index + 1] : null;
    return ok({ items, nextCursor, totalCount: pages.flat().length });
  };
}

// ------------------------------------------------------------------
// Test 1: ok / err / isOk constructors
// ------------------------------------------------------------------
{
  const success = ok(42);
  const failure = err({ kind: "timeout" as const, message: "timed out", retryable: true });

  console.assert(success.status === "ok", "Test 1a FAILED: ok().status should be 'ok'");
  console.assert(success.value === 42, "Test 1b FAILED: ok().value should be 42");
  console.assert(failure.status === "err", "Test 1c FAILED: err().status should be 'err'");
  console.assert(isOk(success) === true, "Test 1d FAILED: isOk(ok(...)) should be true");
  console.assert(isOk(failure) === false, "Test 1e FAILED: isOk(err(...)) should be false");
  console.log("✅ Test 1 passed: Result monad constructors & isOk");
}

// ------------------------------------------------------------------
// Test 2: fetchAllPages — happy path (3 pages)
// ------------------------------------------------------------------
(async () => {
  const fetcher = makePages([
    [{ id: 1, title: "A" }, { id: 2, title: "B" }],
    [{ id: 3, title: "C" }],
    [{ id: 4, title: "D" }, { id: 5, title: "E" }],
  ]);

  const report = await fetchAllPages(fetcher);

  console.assert(report.items.length === 5, `Test 2a FAILED: expected 5 items, got ${report.items.length}`);
  console.assert(report.pagesFetched === 3, `Test 2b FAILED: expected 3 pages, got ${report.pagesFetched}`);
  console.assert(report.totalCount === 5, `Test 2c FAILED: expected totalCount 5, got ${report.totalCount}`);
  console.assert(report.error === undefined, "Test 2d FAILED: expected no error");
  console.log("✅ Test 2 passed: fetchAllPages happy path");
})();

// ------------------------------------------------------------------
// Test 3: fetchAllPages — stops on error, preserves partial items
// ------------------------------------------------------------------
(async () => {
  let callCount = 0;
  const faultyFetcher: PageFetcher<Post> = async (cursor) => {
    callCount++;
    if (callCount === 1) {
      return ok({ items: [{ id: 10, title: "X" }], nextCursor: makeCursor("c2"), totalCount: undefined });
    }
    return err({ kind: "network", message: "connection reset", retryable: true });
  };

  const report = await fetchAllPages(faultyFetcher);

  console.assert(report.items.length === 1, `Test 3a FAILED: expected 1 partial item, got ${report.items.length}`);
  console.assert(report.pagesFetched === 2, `Test 3b FAILED: expected 2 page attempts, got ${report.pagesFetched}`);
  console.assert(report.error !== undefined, "Test 3c FAILED: expected an error to be recorded");
  console.assert(report.error?.kind === "network", `Test 3d FAILED: expected kind 'network', got ${report.error?.kind}`);
  console.log("✅ Test 3 passed: fetchAllPages stops on error, records partial results");
})();

// ------------------------------------------------------------------
// Test 4: mapFetcher — transforms items, preserves errors
// ------------------------------------------------------------------
(async () => {
  const fetcher = makePages([
    [{ id: 1, title: "Hello" }],
    [{ id: 2, title: "World" }],
  ]);

  const titleFetcher = mapFetcher(fetcher, (post) => post.title.toUpperCase());
  const report = await fetchAllPages(titleFetcher);

  console.assert(report.items[0] === "HELLO", `Test 4a FAILED: expected 'HELLO', got '${report.items[0]}'`);
  console.assert(report.items[1] === "WORLD", `Test 4b FAILED: expected 'WORLD', got '${report.items[1]}'`);
  console.assert(report.items.length === 2, `Test 4c FAILED: expected 2 items, got ${report.items.length}`);
  console.log("✅ Test 4 passed: mapFetcher transforms items correctly");
})();

// ------------------------------------------------------------------
// Test 5: withRetry — retries retryable errors, gives up after maxRetries
// ------------------------------------------------------------------
(async () => {
  let attempts = 0;
  const alwaysFails: PageFetcher<Post> = async (_cursor) => {
    attempts++;
    return err({ kind: "timeout", message: "timed out", retryable: true });
  };

  const retriedFetcher = withRetry(alwaysFails, 3);
  const result = await retriedFetcher(undefined);

  // 1 original + 3 retries = 4 total attempts
  console.assert(attempts === 4, `Test 5a FAILED: expected 4 attempts (1 + 3 retries), got ${attempts}`);
  console.assert(!isOk(result), "Test 5b FAILED: expected final result to be Err after exhausting retries");
  console.log("✅ Test 5 passed: withRetry retries the correct number of times");
})();

// ------------------------------------------------------------------
// Test 6: withRetry — non-retryable errors are returned immediately
// ------------------------------------------------------------------
(async () => {
  let attempts = 0;
  const authFails: PageFetcher<Post> = async (_cursor) => {
    attempts++;
    return err({ kind: "auth", message: "unauthorized", retryable: false });
  };

  const retriedFetcher = withRetry(authFails, 5);
  const result = await retriedFetcher(undefined);

  console.assert(attempts === 1, `Test 6a FAILED: non-retryable error should not retry, got ${attempts} attempts`);
  console.assert(!isOk(result), "Test 6b FAILED: expected Err result");
  console.log("✅ Test 6 passed: withRetry skips retries for non-retryable errors");
})();
