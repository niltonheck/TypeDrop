// ============================================================
// challenge.test.ts
// ============================================================
import {
  isProductCategory,
  validateProduct,
  validateRawPage,
  withConcurrencyLimit,
  crawlAllPages,
  type Product,
  type CrawlReport,
  type PageFetcher,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

// ── Mock data ────────────────────────────────────────────────

const VALID_PRODUCT_RAW = {
  id: "p1",
  name: "Laptop",
  category: "electronics",
  priceUsd: 999.99,
  inStock: true,
};

const PAGE_1_RAW = {
  page: 1,
  totalPages: 3,
  items: [
    VALID_PRODUCT_RAW,
    { id: "p2", name: "T-Shirt", category: "clothing", priceUsd: 19.99, inStock: false },
  ],
};

const PAGE_2_RAW = {
  page: 2,
  totalPages: 3,
  items: [
    { id: "p3", name: "Novel", category: "books", priceUsd: 12.5, inStock: true },
    { id: "BAD", name: 42, category: "books", priceUsd: 5, inStock: true }, // bad item — name wrong type
  ],
};

const PAGE_3_RAW = {
  page: 3,
  totalPages: 3,
  items: [
    { id: "p4", name: "Rice", category: "food", priceUsd: 3.0, inStock: true },
    { id: "p5", name: "Headphones", category: "electronics", priceUsd: 149.0, inStock: true },
  ],
};

// ── Test 1: isProductCategory ────────────────────────────────

assert(isProductCategory("electronics"), "isProductCategory accepts 'electronics'");
assert(!isProductCategory("furniture"), "isProductCategory rejects 'furniture'");
assert(!isProductCategory(42), "isProductCategory rejects number");

// ── Test 2: validateProduct ──────────────────────────────────

const productResult = validateProduct(VALID_PRODUCT_RAW);
assert(productResult.ok === true, "validateProduct succeeds for valid raw object");
if (productResult.ok) {
  assert(productResult.value.id === "p1", "validateProduct: id is preserved");
  assert(productResult.value.priceUsd === 999.99, "validateProduct: priceUsd is preserved");
}

const badProduct = validateProduct({ id: "", name: "X", category: "electronics", priceUsd: 10, inStock: true });
assert(badProduct.ok === false, "validateProduct rejects empty id");

// ── Test 3: validateRawPage ──────────────────────────────────

const pageResult = validateRawPage(PAGE_1_RAW);
assert(pageResult.ok === true, "validateRawPage succeeds for valid page");
if (pageResult.ok) {
  assert(pageResult.value.totalPages === 3, "validateRawPage: totalPages preserved");
}

assert(validateRawPage({ page: 0, totalPages: 1, items: [] }).ok === false,
  "validateRawPage rejects page < 1");
assert(validateRawPage({ page: 1, totalPages: 1, items: "nope" }).ok === false,
  "validateRawPage rejects non-array items");

// ── Test 4: withConcurrencyLimit ─────────────────────────────

(async () => {
  const order: number[] = [];
  const tasks = [1, 2, 3, 4, 5].map((n) => async () => {
    await new Promise<void>((res) => setTimeout(res, 10));
    order.push(n);
    return n * 2;
  });
  const results = await withConcurrencyLimit(tasks, 2);
  assert(
    JSON.stringify(results) === JSON.stringify([2, 4, 6, 8, 10]),
    "withConcurrencyLimit preserves order and returns correct values"
  );
  assert(order.length === 5, "withConcurrencyLimit ran all tasks");

  // ── Test 5: crawlAllPages ──────────────────────────────────

  const pages: Record<number, unknown> = { 1: PAGE_1_RAW, 2: PAGE_2_RAW, 3: PAGE_3_RAW };
  const fetcher: PageFetcher = (page) => Promise.resolve(pages[page]);

  const crawlResult = await crawlAllPages(fetcher, 2);
  assert(crawlResult.ok === true, "crawlAllPages returns Ok for valid pages");

  if (crawlResult.ok) {
    const report: CrawlReport = crawlResult.value;

    // 4 valid products: p1, p2, p3, p4, p5  (BAD item skipped)
    assert(report.totalProducts === 5, "crawlAllPages: totalProducts is 5 (bad item skipped)");
    assert(report.totalPages === 3, "crawlAllPages: totalPages is 3");

    // All four categories present
    const categories = Object.keys(report.byCategory);
    assert(
      ["electronics", "clothing", "food", "books"].every((c) => categories.includes(c)),
      "crawlAllPages: byCategory contains all four categories"
    );

    assert(report.byCategory.electronics.count === 2, "crawlAllPages: electronics count = 2");
    assert(
      Math.abs(report.byCategory.electronics.totalValueUsd - (999.99 + 149.0)) < 0.01,
      "crawlAllPages: electronics totalValueUsd correct"
    );
    assert(report.byCategory.clothing.inStockCount === 0, "crawlAllPages: clothing inStockCount = 0");
    assert(report.errors.length === 0, "crawlAllPages: no errors on clean run");
  }

  // ── Test 6: network error handling ────────────────────────

  const brokenFetcher: PageFetcher = (page) =>
    page === 1
      ? Promise.resolve(PAGE_1_RAW)
      : Promise.reject(new Error("Connection refused"));

  const brokenResult = await crawlAllPages(brokenFetcher, 2);
  assert(brokenResult.ok === true, "crawlAllPages still Ok when only remaining pages fail");
  if (brokenResult.ok) {
    const networkErrors = brokenResult.value.errors.filter((e) => e.kind === "network");
    assert(networkErrors.length === 2, "crawlAllPages: records 2 network errors for pages 2 and 3");
  }
})();
