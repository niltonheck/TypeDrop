// challenge.test.ts
import {
  ok,
  err,
  paginateAll,
  filterItems,
  toValidPageNumber,
  type ApiPage,
  type PageFetchError,
  type PageFetcher,
  type PaginationSummary,
  type Result,
  type ValidPageNumber,
} from "./challenge";

// ─── Mock data ───────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  inStock: boolean;
}

interface DigitalProduct extends Product {
  downloadUrl: string;
}

function isDigitalProduct(p: Product): p is DigitalProduct {
  return "downloadUrl" in p && typeof (p as DigitalProduct).downloadUrl === "string";
}

const PAGE_1_ITEMS: Product[] = [
  { id: 1, name: "Widget A", inStock: true },
  { id: 2, name: "Widget B", inStock: false },
];
const PAGE_2_ITEMS: Product[] = [
  { id: 3, name: "Gadget X", inStock: true, downloadUrl: "https://cdn.example.com/gadget-x" } as DigitalProduct,
  { id: 4, name: "Gadget Y", inStock: false },
];
const PAGE_3_ITEMS: Product[] = [
  { id: 5, name: "Doohickey", inStock: true },
];

// ─── Fetcher factories ────────────────────────────────────────────────────────

/** All 3 pages succeed. */
function makeAllSucceedFetcher(): PageFetcher<Product> {
  const pages: Record<number, Product[]> = {
    1: PAGE_1_ITEMS,
    2: PAGE_2_ITEMS,
    3: PAGE_3_ITEMS,
  };
  return async (page) => {
    const items = pages[page];
    if (!items) return err({ page, reason: "Not found" });
    return ok<ApiPage<Product>>({ page, totalPages: 3, items });
  };
}

/** Page 2 always fails. */
function makePage2FailFetcher(): PageFetcher<Product> {
  const pages: Record<number, Product[]> = {
    1: PAGE_1_ITEMS,
    3: PAGE_3_ITEMS,
  };
  return async (page) => {
    if (page === 2) return err<PageFetchError>({ page: 2, reason: "Server error" });
    const items = pages[page];
    if (!items) return err({ page, reason: "Not found" });
    return ok<ApiPage<Product>>({ page, totalPages: 3, items });
  };
}

/** Page 1 fails immediately. */
function makePage1FailFetcher(): PageFetcher<Product> {
  return async (_page) => err<PageFetchError>({ page: 1, reason: "Unauthorized" });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function runTests() {
  // Test 1: ok() and err() constructors
  const okResult: Result<number, string> = ok(42);
  const errResult: Result<number, string> = err("oops");
  console.assert(okResult.status === "ok", "FAIL T1a: ok() status should be 'ok'");
  console.assert(okResult.status === "ok" && okResult.value === 42, "FAIL T1b: ok() value should be 42");
  console.assert(errResult.status === "err", "FAIL T1c: err() status should be 'err'");
  console.assert(errResult.status === "err" && errResult.error === "oops", "FAIL T1d: err() error should be 'oops'");
  console.log("T1 passed: ok() and err() constructors");

  // Test 2: paginateAll — full success
  const fullSummary: PaginationSummary<Product> = await paginateAll(makeAllSucceedFetcher());
  console.assert(fullSummary.outcome === "full", `FAIL T2a: expected outcome 'full', got '${fullSummary.outcome}'`);
  console.assert(fullSummary.items.length === 5, `FAIL T2b: expected 5 items, got ${fullSummary.items.length}`);
  console.assert(fullSummary.failures.length === 0, `FAIL T2c: expected 0 failures, got ${fullSummary.failures.length}`);
  console.assert(fullSummary.totalPagesAttempted === 3, `FAIL T2d: expected 3 pages attempted, got ${fullSummary.totalPagesAttempted}`);
  console.log("T2 passed: paginateAll full success");

  // Test 3: paginateAll — partial failure (page 2 fails)
  const partialSummary: PaginationSummary<Product> = await paginateAll(makePage2FailFetcher());
  console.assert(partialSummary.outcome === "partial", `FAIL T3a: expected outcome 'partial', got '${partialSummary.outcome}'`);
  console.assert(partialSummary.items.length === 3, `FAIL T3b: expected 3 items (pages 1+3), got ${partialSummary.items.length}`);
  console.assert(partialSummary.failures.length === 1, `FAIL T3c: expected 1 failure, got ${partialSummary.failures.length}`);
  console.assert(partialSummary.failures[0]?.page === 2, `FAIL T3d: expected failure on page 2`);
  console.log("T3 passed: paginateAll partial failure");

  // Test 4: paginateAll — page 1 fails → empty outcome
  const emptySummary: PaginationSummary<Product> = await paginateAll(makePage1FailFetcher());
  console.assert(emptySummary.outcome === "empty", `FAIL T4a: expected outcome 'empty', got '${emptySummary.outcome}'`);
  console.assert(emptySummary.items.length === 0, `FAIL T4b: expected 0 items`);
  console.assert(emptySummary.failures.length === 1, `FAIL T4c: expected 1 failure`);
  console.log("T4 passed: paginateAll empty (page 1 fails)");

  // Test 5: filterItems with type guard
  const digitalItems = filterItems(fullSummary, isDigitalProduct);
  console.assert(digitalItems.length === 1, `FAIL T5a: expected 1 digital product, got ${digitalItems.length}`);
  console.assert(digitalItems[0]?.downloadUrl === "https://cdn.example.com/gadget-x", "FAIL T5b: wrong downloadUrl");
  console.log("T5 passed: filterItems narrows type correctly");

  // Test 6: toValidPageNumber branded type
  const validResult = toValidPageNumber(5);
  const invalidResult = toValidPageNumber(0);
  const negativeResult = toValidPageNumber(-3);
  console.assert(validResult.status === "ok", "FAIL T6a: 5 should be a valid page number");
  console.assert(invalidResult.status === "err", "FAIL T6b: 0 should be invalid");
  console.assert(negativeResult.status === "err", "FAIL T6c: -3 should be invalid");
  // Branded type check: the value should equal 5
  console.assert(validResult.status === "ok" && (validResult.value as number) === 5, "FAIL T6d: valid page value should be 5");
  console.log("T6 passed: toValidPageNumber branded type");

  console.log("\n✅ All tests passed!");
}

runTests().catch((e) => {
  console.error("Test runner threw unexpectedly:", e);
  process.exit(1);
});
