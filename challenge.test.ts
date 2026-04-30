// challenge.test.ts
import {
  validatePageResponse,
  fetchPage,
  fetchAllPages,
  type FetchResult,
  type PageResponse,
} from "./challenge";

// ─── helpers ─────────────────────────────────────────────────────────────────

function isString(x: unknown): x is string {
  return typeof x === "string";
}

interface User {
  id: number;
  name: string;
}

function isUser(x: unknown): x is User {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Record<string, unknown>).id === "number" &&
    typeof (x as Record<string, unknown>).name === "string"
  );
}

// ─── mock data ────────────────────────────────────────────────────────────────

const validPage1: PageResponse<User> = {
  items: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ],
  page: 1,
  pageSize: 2,
  total: 5,
};

const validPage2: PageResponse<User> = {
  items: [
    { id: 3, name: "Carol" },
    { id: 4, name: "Dave" },
  ],
  page: 2,
  pageSize: 2,
  total: 5,
};

const validPage3: PageResponse<User> = {
  items: [{ id: 5, name: "Eve" }],
  page: 3,
  pageSize: 2,
  total: 5,
};

// ─── Test 1: validatePageResponse — valid payload ─────────────────────────────
const r1 = validatePageResponse<User>(validPage1, 1, isUser);
console.assert(
  r1.status === "ok",
  `[Test 1] Expected status "ok", got "${r1.status}"`
);
if (r1.status === "ok") {
  console.assert(
    r1.items.length === 2,
    `[Test 1] Expected 2 items, got ${r1.items.length}`
  );
  console.assert(
    r1.items[0].name === "Alice",
    `[Test 1] Expected first item name "Alice", got "${r1.items[0].name}"`
  );
}

// ─── Test 2: validatePageResponse — page mismatch ────────────────────────────
const r2 = validatePageResponse<User>(validPage1, 99, isUser);
console.assert(
  r2.status === "invalid",
  `[Test 2] Expected status "invalid" on page mismatch, got "${r2.status}"`
);

// ─── Test 3: validatePageResponse — bad item fails validator ─────────────────
const badItemPayload = {
  items: [{ id: 1, name: "Alice" }, { id: 2, name: 42 }], // name is a number → invalid
  page: 1,
  pageSize: 2,
  total: 2,
};
const r3 = validatePageResponse<User>(badItemPayload, 1, isUser);
console.assert(
  r3.status === "invalid",
  `[Test 3] Expected status "invalid" for bad item, got "${r3.status}"`
);
if (r3.status === "invalid") {
  console.assert(
    r3.error.includes("1"), // index 1 should appear in error message
    `[Test 3] Expected error to mention item index 1, got: "${r3.error}"`
  );
}

// ─── Test 4: fetchPage — fetcher rejects ─────────────────────────────────────
async function runTest4() {
  const failingFetcher = (_page: number): Promise<unknown> =>
    Promise.reject(new Error("Network timeout"));

  const r4 = await fetchPage<User>(failingFetcher, isUser, 1);
  console.assert(
    r4.status === "failed",
    `[Test 4] Expected status "failed", got "${r4.status}"`
  );
  if (r4.status === "failed") {
    console.assert(
      r4.error.includes("Network timeout"),
      `[Test 4] Expected error to contain "Network timeout", got: "${r4.error}"`
    );
  }
}

// ─── Test 5: fetchAllPages — full happy path ──────────────────────────────────
async function runTest5() {
  const pages: PageResponse<User>[] = [validPage1, validPage2, validPage3];

  const fetcher = (page: number): Promise<unknown> =>
    Promise.resolve(pages[page - 1]);

  const summary = await fetchAllPages<User>(fetcher, isUser, { concurrency: 2 });

  console.assert(
    summary.successCount === 3,
    `[Test 5] Expected successCount 3, got ${summary.successCount}`
  );
  console.assert(
    summary.failureCount === 0,
    `[Test 5] Expected failureCount 0, got ${summary.failureCount}`
  );
  console.assert(
    summary.items.length === 5,
    `[Test 5] Expected 5 total items, got ${summary.items.length}`
  );
  console.assert(
    summary.items[4].name === "Eve",
    `[Test 5] Expected last item "Eve", got "${summary.items[4].name}"`
  );
  console.assert(
    summary.results.length === 3,
    `[Test 5] Expected 3 results, got ${summary.results.length}`
  );
}

// ─── run async tests ──────────────────────────────────────────────────────────
(async () => {
  await runTest4();
  await runTest5();
  console.log("All tests complete.");
})();
