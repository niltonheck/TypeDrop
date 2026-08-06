// challenge.test.ts
import { fetchPages, collectAll } from "./challenge";
import type {
  Result,
  FetchError,
  Page,
  PageFetcher,
  PageOutcome,
  PaginatedClientConfig,
  ExtractOk,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────────────────────

function ok<T, E>(value: T): Result<T, E> {
  return { tag: "ok", value } as Result<T, E>;
}
function err<T, E>(error: E): Result<T, E> {
  return { tag: "err", error } as Result<T, E>;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
}

// Three pages: cursors "c1" → "c2" → null
const PAGE_DATA: Page<User>[] = [
  { items: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }], nextCursor: "c1", total: 6 },
  { items: [{ id: 3, name: "Carol" }, { id: 4, name: "Dave" }], nextCursor: "c2", total: 6 },
  { items: [{ id: 5, name: "Eve" }, { id: 6, name: "Frank" }], nextCursor: null, total: 6 },
];

function makeFetcher(pages: Page<User>[]): PageFetcher<User> {
  const cursorMap = new Map<string | null, Page<User>>([
    [null, pages[0]],
    ["c1", pages[1]],
    ["c2", pages[2]],
  ]);
  return async (cursor) => {
    const page = cursorMap.get(cursor);
    if (!page) return err({ kind: "http", status: 404, body: "Not found" } as FetchError);
    return ok(page);
  };
}

function makeErrorFetcher(): PageFetcher<User> {
  return async (_cursor) =>
    err<Page<User>, FetchError>({ kind: "network", message: "Connection refused" });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function runTests() {
  // Test 1: collectAll returns all items across all pages
  {
    const config: PaginatedClientConfig<User> = { fetcher: makeFetcher(PAGE_DATA) };
    const { items, errors, pagesConsumed } = await collectAll(config);
    console.assert(items.length === 6, `Test 1a failed: expected 6 items, got ${items.length}`);
    console.assert(errors.length === 0, `Test 1b failed: expected 0 errors, got ${errors.length}`);
    console.assert(pagesConsumed === 3, `Test 1c failed: expected 3 pages, got ${pagesConsumed}`);
    console.log("✅ Test 1 passed: collectAll accumulates all items from 3 pages");
  }

  // Test 2: maxPages cap limits the number of pages fetched
  {
    const config: PaginatedClientConfig<User> = {
      fetcher: makeFetcher(PAGE_DATA),
      maxPages: 2,
    };
    const { items, pagesConsumed } = await collectAll(config);
    console.assert(items.length === 4, `Test 2a failed: expected 4 items, got ${items.length}`);
    console.assert(pagesConsumed === 2, `Test 2b failed: expected 2 pages, got ${pagesConsumed}`);
    console.log("✅ Test 2 passed: maxPages cap respected");
  }

  // Test 3: Network error is captured in errors array, not thrown
  {
    const config: PaginatedClientConfig<User> = { fetcher: makeErrorFetcher() };
    const { items, errors, pagesConsumed } = await collectAll(config);
    console.assert(items.length === 0, `Test 3a failed: expected 0 items, got ${items.length}`);
    console.assert(errors.length === 1, `Test 3b failed: expected 1 error, got ${errors.length}`);
    console.assert(
      errors[0].kind === "network",
      `Test 3c failed: expected kind "network", got "${errors[0].kind}"`
    );
    console.assert(pagesConsumed === 1, `Test 3d failed: expected 1 page consumed, got ${pagesConsumed}`);
    console.log("✅ Test 3 passed: fetch error captured as typed Err, not thrown");
  }

  // Test 4: AbortSignal stops iteration and yields a network Err
  {
    const controller = new AbortController();
    controller.abort(); // pre-aborted
    const config: PaginatedClientConfig<User> = {
      fetcher: makeFetcher(PAGE_DATA),
      signal: controller.signal,
    };
    const outcomes: PageOutcome<User>[] = [];
    for await (const outcome of fetchPages(config)) {
      outcomes.push(outcome);
    }
    console.assert(outcomes.length === 1, `Test 4a failed: expected 1 outcome, got ${outcomes.length}`);
    const result = outcomes[0].result;
    console.assert(result.tag === "err", `Test 4b failed: expected tag "err", got "${result.tag}"`);
    if (result.tag === "err") {
      console.assert(
        result.error.kind === "network",
        `Test 4c failed: expected kind "network", got "${result.error.kind}"`
      );
    }
    console.log("✅ Test 4 passed: AbortSignal yields network Err and stops");
  }

  // Test 5: ExtractOk resolves the value type correctly (compile-time check)
  {
    type UserResult = Result<User, FetchError>;
    type Extracted = ExtractOk<UserResult>;
    // If this compiles, the conditional type is correct.
    const _check: Extracted = { id: 99, name: "Test" };
    console.assert(_check.id === 99, "Test 5 failed: ExtractOk type check");
    console.log("✅ Test 5 passed: ExtractOk<Result<User, FetchError>> resolves to User");
  }

  console.log("\n🎉 All tests complete.");
}

runTests().catch(console.error);
