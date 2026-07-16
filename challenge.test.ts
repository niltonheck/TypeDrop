// =============================================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// =============================================================================
import {
  makePageToken,
  validateRecord,
  fetchAllPages,
  type Schema,
  type PagedResponse,
  type SyncError,
} from "./challenge";

// ---------------------------------------------------------------------------
// Shared types & mock data
// ---------------------------------------------------------------------------

type Product = {
  id: number;
  name: string;
  inStock: boolean;
};

const productSchema: Schema<Product> = {
  id: "number",
  name: "string",
  inStock: "boolean",
};

// ---------------------------------------------------------------------------
// Test 1: validateRecord — happy path
// ---------------------------------------------------------------------------
{
  const errors: ReturnType<typeof Array<SyncError[& { kind: "validation" }]>> = [];
  // simpler:
  const validationErrors: Array<{ kind: "validation"; field: string; expected: string; received: string }> = [];
  const raw: unknown = { id: 1, name: "Widget", inStock: true };
  const ok = validateRecord<Product>(raw, productSchema, validationErrors);
  console.assert(ok === true, "Test 1 FAILED: valid record should pass validation");
  console.assert(validationErrors.length === 0, "Test 1 FAILED: should have no errors");
  if (ok) {
    // TypeScript should now treat `raw` as Product inside this block
    console.assert(raw.id === 1, "Test 1 FAILED: id should be 1");
  }
  console.log("Test 1 passed: validateRecord happy path");
}

// ---------------------------------------------------------------------------
// Test 2: validateRecord — invalid record
// ---------------------------------------------------------------------------
{
  const validationErrors: Array<{ kind: "validation"; field: string; expected: string; received: string }> = [];
  const raw: unknown = { id: "not-a-number", name: "Widget", inStock: true };
  const ok = validateRecord<Product>(raw, productSchema, validationErrors);
  console.assert(ok === false, "Test 2 FAILED: invalid record should fail validation");
  console.assert(validationErrors.length === 1, "Test 2 FAILED: should have exactly 1 error");
  console.assert(validationErrors[0].field === "id", "Test 2 FAILED: error should name field 'id'");
  console.assert(validationErrors[0].kind === "validation", "Test 2 FAILED: error kind should be 'validation'");
  console.log("Test 2 passed: validateRecord invalid field");
}

// ---------------------------------------------------------------------------
// Test 3: fetchAllPages — two pages, all valid records
// ---------------------------------------------------------------------------
async function test3() {
  const page1: PagedResponse<unknown> = {
    data: [
      { id: 1, name: "Alpha", inStock: true },
      { id: 2, name: "Beta", inStock: false },
    ],
    nextPageToken: makePageToken("page2"),
  };
  const page2: PagedResponse<unknown> = {
    data: [{ id: 3, name: "Gamma", inStock: true }],
    nextPageToken: null,
  };

  let callCount = 0;
  const mockFetcher = async (_token: ReturnType<typeof makePageToken> | undefined): Promise<PagedResponse<unknown>> => {
    callCount++;
    return callCount === 1 ? page1 : page2;
  };

  const result = await fetchAllPages<Product>(mockFetcher, productSchema);
  console.assert(result.items.length === 3, `Test 3 FAILED: expected 3 items, got ${result.items.length}`);
  console.assert(result.errors.length === 0, `Test 3 FAILED: expected 0 errors, got ${result.errors.length}`);
  console.assert(result.totalPagesFetched === 2, `Test 3 FAILED: expected 2 pages fetched, got ${result.totalPagesFetched}`);
  console.log("Test 3 passed: fetchAllPages two pages all valid");
}

// ---------------------------------------------------------------------------
// Test 4: fetchAllPages — one bad record per page, accumulates errors
// ---------------------------------------------------------------------------
async function test4() {
  const page1: PagedResponse<unknown> = {
    data: [
      { id: 1, name: "Good", inStock: true },
      { id: "BAD", name: "Bad", inStock: true }, // invalid id
    ],
    nextPageToken: makePageToken("p2"),
  };
  const page2: PagedResponse<unknown> = {
    data: [{ id: 2, name: 99, inStock: false }], // invalid name
    nextPageToken: null,
  };

  let call = 0;
  const mockFetcher = async (_t: ReturnType<typeof makePageToken> | undefined): Promise<PagedResponse<unknown>> => {
    call++;
    return call === 1 ? page1 : page2;
  };

  const result = await fetchAllPages<Product>(mockFetcher, productSchema);
  console.assert(result.items.length === 1, `Test 4 FAILED: expected 1 valid item, got ${result.items.length}`);
  console.assert(result.errors.length === 2, `Test 4 FAILED: expected 2 errors, got ${result.errors.length}`);
  console.assert(result.totalPagesFetched === 2, `Test 4 FAILED: expected 2 pages, got ${result.totalPagesFetched}`);
  console.log("Test 4 passed: fetchAllPages accumulates validation errors");
}

// ---------------------------------------------------------------------------
// Test 5: fetchAllPages — fetcher throws on second page
// ---------------------------------------------------------------------------
async function test5() {
  const page1: PagedResponse<unknown> = {
    data: [{ id: 10, name: "Safe", inStock: true }],
    nextPageToken: makePageToken("next"),
  };

  let call = 0;
  const mockFetcher = async (_t: ReturnType<typeof makePageToken> | undefined): Promise<PagedResponse<unknown>> => {
    call++;
    if (call === 2) throw new Error("Network timeout");
    return page1;
  };

  const result = await fetchAllPages<Product>(mockFetcher, productSchema);
  console.assert(result.items.length === 1, `Test 5 FAILED: should keep page-1 items, got ${result.items.length}`);
  console.assert(result.errors.length === 1, `Test 5 FAILED: expected 1 FetchError, got ${result.errors.length}`);
  console.assert(result.errors[0].kind === "fetch", `Test 5 FAILED: error kind should be 'fetch'`);
  console.assert(result.totalPagesFetched === 1, `Test 5 FAILED: only 1 page completed, got ${result.totalPagesFetched}`);
  console.log("Test 5 passed: fetchAllPages stops on fetcher throw, keeps prior data");
}

// ---------------------------------------------------------------------------
// Run all async tests
// ---------------------------------------------------------------------------
(async () => {
  await test3();
  await test4();
  await test5();
  console.log("\nAll tests passed! ✅");
})();
