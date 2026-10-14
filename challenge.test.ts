// ============================================================
// challenge.test.ts
// ============================================================
import {
  fetchAllPages,
  paginatedAggregate,
  buildSaleSummaryAggregator,
  type SaleRecord,
  type SaleId,
  type Page,
  type FetchPage,
} from "./challenge";

// ---- helpers ------------------------------------------------
function makeSaleId(raw: string): SaleId {
  return raw as SaleId; // allowed only in test harness
}

// ---- mock data ----------------------------------------------
const page1: Page<SaleRecord> = {
  items: [
    { id: makeSaleId("s1"), region: "NA",   amount: 500,  currency: "USD" },
    { id: makeSaleId("s2"), region: "EU",   amount: 300,  currency: "EUR" },
    { id: makeSaleId("s3"), region: "APAC", amount: 200,  currency: "JPY" },
  ],
  nextCursor: "cursor-page-2",
  totalCount: 5,
};

const page2: Page<SaleRecord> = {
  items: [
    { id: makeSaleId("s4"), region: "NA",   amount: 800,  currency: "USD" },
    { id: makeSaleId("s5"), region: "EU",   amount: 150,  currency: "EUR" },
  ],
  nextCursor: undefined,
  totalCount: 5,
};

// Simulates a two-page API
const mockFetchPage: FetchPage<SaleRecord> = async (cursor) => {
  if (cursor === undefined) return page1;
  if (cursor === "cursor-page-2") return page2;
  throw new Error(`Unexpected cursor: ${cursor}`);
};

// ---- tests --------------------------------------------------
async function runTests(): Promise<void> {
  // Test 1: fetchAllPages returns all 5 items
  const allItems = await fetchAllPages(mockFetchPage);
  console.assert(allItems.length === 5, `[FAIL] Expected 5 items, got ${allItems.length}`);
  console.log(`[PASS] fetchAllPages returns all 5 items`);

  // Test 2: items are in page order
  console.assert(
    allItems[0].id === "s1" && allItems[4].id === "s5",
    `[FAIL] Items are not in page order`
  );
  console.log(`[PASS] items are in page order`);

  // Test 3: paginatedAggregate totalAmount is correct (500+300+200+800+150 = 1950)
  const aggregator = buildSaleSummaryAggregator();
  const summary = await paginatedAggregate(mockFetchPage, aggregator);
  console.assert(
    summary.totalAmount === 1950,
    `[FAIL] Expected totalAmount 1950, got ${summary.totalAmount}`
  );
  console.log(`[PASS] totalAmount === 1950`);

  // Test 4: countByRegion is correct
  console.assert(
    summary.countByRegion.NA === 2 &&
    summary.countByRegion.EU === 2 &&
    summary.countByRegion.APAC === 1,
    `[FAIL] countByRegion mismatch: ${JSON.stringify(summary.countByRegion)}`
  );
  console.log(`[PASS] countByRegion is correct`);

  // Test 5: largestSale is the $800 NA sale
  console.assert(
    summary.largestSale !== null && summary.largestSale.id === "s4",
    `[FAIL] Expected largestSale to be s4, got ${summary.largestSale?.id}`
  );
  console.log(`[PASS] largestSale is s4 (amount 800)`);

  console.log("\n✅ All tests passed!");
}

runTests().catch((err) => {
  console.error("Test run failed:", err);
  process.exit(1);
});
