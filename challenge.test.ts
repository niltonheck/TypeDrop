// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  ok, err,
  aggregatePages,
  formatFetchError,
  type Page,
  type ApiRecord,
  type PageFetcher,
  type FetchError,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data helpers
// ------------------------------------------------------------------
type Item = { name: string; value: number };

function makeRecord(id: string, createdAt: string, payload: Item): ApiRecord<Item> {
  return { id, createdAt, payload };
}

const PAGE_1: Page<Item> = {
  page: 1,
  totalPages: 3,
  items: [
    makeRecord("c", "2024-03-01T10:00:00Z", { name: "Charlie", value: 3 }),
    makeRecord("a", "2024-01-01T08:00:00Z", { name: "Alice",   value: 1 }),
  ],
};

const PAGE_2: Page<Item> = {
  page: 2,
  totalPages: 3,
  items: [
    makeRecord("b", "2024-02-01T09:00:00Z", { name: "Bob",   value: 2 }),
  ],
};

const PAGE_3: Page<Item> = {
  page: 3,
  totalPages: 3,
  items: [
    makeRecord("d", "2024-04-01T11:00:00Z", { name: "Diana", value: 4 }),
  ],
};

// ------------------------------------------------------------------
// Test 1 — happy path: all pages succeed, records sorted by createdAt
// ------------------------------------------------------------------
const happyFetcher: PageFetcher<Item> = async (page) => {
  const pages: Record<number, Page<Item>> = { 1: PAGE_1, 2: PAGE_2, 3: PAGE_3 };
  return ok(pages[page]);
};

(async () => {
  const result = await aggregatePages(happyFetcher, { concurrency: 2, failFast: false });

  console.assert(result.ok === true, "Test 1a FAILED: result should be Ok");

  if (result.ok) {
    console.assert(result.value.records.length === 4,
      `Test 1b FAILED: expected 4 records, got ${result.value.records.length}`);

    console.assert(result.value.records[0].id === "a",
      `Test 1c FAILED: first record should be 'a', got '${result.value.records[0].id}'`);

    console.assert(result.value.records[3].id === "d",
      `Test 1d FAILED: last record should be 'd', got '${result.value.records[3].id}'`);

    console.assert(result.value.failedPages.length === 0,
      `Test 1e FAILED: expected 0 failed pages, got ${result.value.failedPages.length}`);

    console.assert(result.value.totalPagesFetched === 3,
      `Test 1f FAILED: expected totalPagesFetched=3, got ${result.value.totalPagesFetched}`);

    console.log("✅ Test 1 passed — happy path");
  }
})();

// ------------------------------------------------------------------
// Test 2 — failFast: page 2 fails → aggregatePages returns Err
// ------------------------------------------------------------------
const failFastFetcher: PageFetcher<Item> = async (page) => {
  if (page === 2) {
    const e: FetchError = { kind: "network", message: "ECONNREFUSED", page: 2 };
    return err(e);
  }
  const pages: Record<number, Page<Item>> = { 1: PAGE_1, 3: PAGE_3 };
  return ok(pages[page]);
};

(async () => {
  const result = await aggregatePages(failFastFetcher, { concurrency: 1, failFast: true });

  console.assert(result.ok === false, "Test 2a FAILED: result should be Err");

  if (!result.ok) {
    console.assert(result.error.firstError.kind === "network",
      `Test 2b FAILED: expected firstError.kind='network', got '${result.error.firstError.kind}'`);
    console.log("✅ Test 2 passed — failFast abort");
  }
})();

// ------------------------------------------------------------------
// Test 3 — lenient mode: page 2 fails → Ok with failedPages recorded
// ------------------------------------------------------------------
(async () => {
  const result = await aggregatePages(failFastFetcher, { concurrency: 2, failFast: false });

  console.assert(result.ok === true, "Test 3a FAILED: result should be Ok in lenient mode");

  if (result.ok) {
    console.assert(result.value.failedPages.length === 1,
      `Test 3b FAILED: expected 1 failed page, got ${result.value.failedPages.length}`);

    console.assert(result.value.failedPages[0].page === 2,
      `Test 3c FAILED: failed page should be page 2`);

    console.assert(result.value.records.length === 3,
      `Test 3d FAILED: expected 3 records (pages 1+3), got ${result.value.records.length}`);

    console.log("✅ Test 3 passed — lenient mode with partial failure");
  }
})();

// ------------------------------------------------------------------
// Test 4 — formatFetchError covers all kinds
// ------------------------------------------------------------------
const networkErr: FetchError = { kind: "network", message: "timeout", page: 5 };
const timeoutErr: FetchError = { kind: "timeout", page: 3, afterMs: 5000 };
const parseErr:   FetchError = { kind: "parse",   page: 2, raw: "{bad}" };
const unknownErr: FetchError = { kind: "unknown", page: 1, cause: new Error("?") };

console.assert(
  formatFetchError(networkErr) === "Page 5 network error: timeout",
  `Test 4a FAILED: got '${formatFetchError(networkErr)}'`
);
console.assert(
  formatFetchError(timeoutErr) === "Page 3 timed out after 5000ms",
  `Test 4b FAILED: got '${formatFetchError(timeoutErr)}'`
);
console.assert(
  formatFetchError(parseErr) === "Page 2 parse error — raw: {bad}",
  `Test 4c FAILED: got '${formatFetchError(parseErr)}'`
);
console.assert(
  formatFetchError(unknownErr) === "Page 1 unknown error",
  `Test 4d FAILED: got '${formatFetchError(unknownErr)}'`
);
console.log("✅ Test 4 passed — formatFetchError");
