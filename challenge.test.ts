// challenge.test.ts
import {
  buildValidatorRegistry,
  fetchAllPages,
  parseRawPage,
  type AggregatedResult,
  type PageFetcher,
  type PaginationError,
  type Result,
} from "./challenge";

// ─── Helpers ────────────────────────────────────────────────────────────────

function ok<T, E>(r: Result<T, E>): T {
  if (!r.ok) throw new Error(`Expected ok, got error: ${JSON.stringify(r.error)}`);
  return r.value;
}

function err<T, E>(r: Result<T, E>): E {
  if (r.ok) throw new Error(`Expected error, got ok: ${JSON.stringify(r.value)}`);
  return r.error;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const registry = buildValidatorRegistry();

const rawUserPage = {
  data: [
    { id: "u1", name: "Alice", email: "alice@example.com", role: "admin" },
    { id: "u2", name: "Bob",   email: "bob@example.com",   role: "member" },
  ],
  nextCursor: "cursor-2",
  total: 4,
};

const rawUserPage2 = {
  data: [
    { id: "u3", name: "Carol", email: "carol@example.com", role: "viewer" },
    { id: "u4", name: "Dan",   email: "dan@example.com",   role: "member" },
  ],
  nextCursor: null,
  total: 4,
};

const rawOrderPage = {
  data: [
    { id: "o1", userId: "u1", totalCents: 4999, status: "fulfilled" },
  ],
  nextCursor: null,
  total: 1,
};

const badUserPage = {
  data: [
    { id: "u1", name: "Alice", email: "alice@example.com", role: "SUPERADMIN" }, // invalid role
  ],
  nextCursor: null,
  total: 1,
};

const malformedPage = {
  // missing `data` field
  nextCursor: null,
  total: 1,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

// TEST 1 — parseRawPage succeeds with valid user data
{
  const result = parseRawPage("users", rawUserPage, registry);
  const page = ok(result);
  console.assert(page.kind === "users",           "TEST 1a: kind should be 'users'");
  console.assert(page.records.length === 2,       "TEST 1b: should have 2 records");
  console.assert(page.nextCursor === "cursor-2",  "TEST 1c: nextCursor should be 'cursor-2'");
  console.assert(page.total === 4,                "TEST 1d: total should be 4");
  console.assert(page.records[0].name === "Alice","TEST 1e: first record name should be Alice");
  console.log("TEST 1 passed ✓");
}

// TEST 2 — parseRawPage returns VALIDATION_FAILED for bad role
{
  const result = parseRawPage("users", badUserPage, registry);
  const e = err(result);
  console.assert(e.kind === "VALIDATION_FAILED", "TEST 2a: error kind should be VALIDATION_FAILED");
  console.assert((e as Extract<typeof e, { kind: "VALIDATION_FAILED" }>).index === 0,
    "TEST 2b: failing index should be 0");
  console.log("TEST 2 passed ✓");
}

// TEST 3 — parseRawPage returns INVALID_PAGE for malformed raw response
{
  const result = parseRawPage("users", malformedPage, registry);
  const e = err(result);
  console.assert(e.kind === "INVALID_PAGE", "TEST 3: error kind should be INVALID_PAGE");
  console.log("TEST 3 passed ✓");
}

// TEST 4 — fetchAllPages aggregates multiple pages correctly
{
  const cursors: Array<string | null> = [null, "cursor-2"];
  const pages = [rawUserPage, rawUserPage2];

  const fetcher: PageFetcher = async (cursor) => {
    const idx = cursors.indexOf(cursor);
    if (idx === -1) throw new Error("Unexpected cursor");
    return pages[idx];
  };

  fetchAllPages("users", fetcher, registry, 10).then((result) => {
    const agg: AggregatedResult<"users"> = ok(result);
    console.assert(agg.kind === "users",          "TEST 4a: kind should be 'users'");
    console.assert(agg.records.length === 4,      "TEST 4b: should have 4 total records");
    console.assert(agg.pageCount === 2,           "TEST 4c: should have fetched 2 pages");
    console.assert(agg.totalFetched === 4,        "TEST 4d: totalFetched should be 4");
    console.assert(agg.records[2].name === "Carol","TEST 4e: third record should be Carol");
    console.log("TEST 4 passed ✓");
  });
}

// TEST 5 — fetchAllPages returns FETCH_ERROR when fetcher throws
{
  const fetcher: PageFetcher = async (_cursor) => {
    throw new Error("Network timeout");
  };

  fetchAllPages("orders", fetcher, registry).then((result) => {
    const e = err(result);
    console.assert(e.kind === "FETCH_ERROR",      "TEST 5a: error kind should be FETCH_ERROR");
    console.assert(
      (e as Extract<typeof e, { kind: "FETCH_ERROR" }>).statusCode === 0,
      "TEST 5b: statusCode should be 0"
    );
    console.log("TEST 5 passed ✓");
  });
}
