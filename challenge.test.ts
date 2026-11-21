// ============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parseUserPage,
  fetchPageWithRetry,
  fetchAllUsers,
  groupUsersByRole,
  summariseUsers,
  validateUser,
  ok,
  err,
  DEFAULT_RETRY_POLICY,
  type User,
  type Page,
  type ApiError,
  type Fetcher,
  type Delay,
  type Result,
} from "./challenge";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

function assertOk<T, E>(label: string, result: Result<T, E>): T | undefined {
  assert(label + " — is Ok", result.ok === true);
  return result.ok ? result.value : undefined;
}

function assertErr<T, E>(label: string, result: Result<T, E>): E | undefined {
  assert(label + " — is Err", result.ok === false);
  return result.ok ? undefined : result.error;
}

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------
const RAW_USER_ALICE: unknown = {
  id: "u1",
  name: "Alice",
  email: "alice@example.com",
  role: "admin",
  createdAt: "2024-01-15T10:00:00Z",
};

const RAW_USER_BOB: unknown = {
  id: "u2",
  name: "Bob",
  email: "bob@example.com",
  role: "editor",
  createdAt: "2024-03-22T08:30:00Z",
};

const RAW_USER_CAROL: unknown = {
  id: "u3",
  name: "Carol",
  email: "carol@example.com",
  role: "viewer",
  createdAt: "2024-06-01T14:00:00Z",
};

const VALID_PAGE_RAW: unknown = {
  data: [RAW_USER_ALICE, RAW_USER_BOB],
  page: 1,
  pageSize: 2,
  totalPages: 2,
  totalItems: 4,
};

const INVALID_PAGE_RAW: unknown = {
  data: [RAW_USER_ALICE, { id: 99, name: 123 }], // item 1 is bad
  page: 1,
  pageSize: 2,
  totalPages: 1,
  totalItems: 2,
};

// ------------------------------------------------------------------
// TEST SUITE 1 — parseUserPage
// ------------------------------------------------------------------
console.log("\n── parseUserPage ──────────────────────────────────────");

const page1 = assertOk("valid page parses", parseUserPage(VALID_PAGE_RAW));
if (page1) {
  assert("page.page === 1", page1.page === 1);
  assert("page.totalPages === 2", page1.totalPages === 2);
  assert("page.data has 2 users", page1.data.length === 2);
  assert("first user name is Alice", page1.data[0]?.name === "Alice");
}

const badPage = assertErr("invalid item returns Err", parseUserPage(INVALID_PAGE_RAW));
if (badPage) {
  assert("error kind is validation", badPage.kind === "validation");
  if (badPage.kind === "validation") {
    assert(
      "fields contains index '1' for the bad item",
      badPage.fields.includes("1")
    );
  }
}

assertErr("non-object raw returns Err", parseUserPage("not an object"));

// ------------------------------------------------------------------
// TEST SUITE 2 — fetchPageWithRetry
// ------------------------------------------------------------------
console.log("\n── fetchPageWithRetry ─────────────────────────────────");

const noDelay: Delay = (_ms) => Promise.resolve();

// Fetcher that succeeds immediately
const successFetcher: Fetcher = (_url, _req) =>
  Promise.resolve(ok(VALID_PAGE_RAW));

// Fetcher that always returns a network error
const networkErrFetcher: Fetcher = (_url, _req) =>
  Promise.resolve(
    err<ApiError>({ kind: "network", message: "connection refused" })
  );

// Fetcher that fails twice then succeeds
let callCount = 0;
const flakyFetcher: Fetcher = (_url, _req) => {
  callCount++;
  if (callCount < 3) {
    return Promise.resolve(
      err<ApiError>({ kind: "network", message: "flaky" })
    );
  }
  return Promise.resolve(ok(VALID_PAGE_RAW));
};

// Fetcher that returns a non-retryable HTTP error
const httpErrFetcher: Fetcher = (_url, _req) =>
  Promise.resolve(err<ApiError>({ kind: "http", status: 403, message: "Forbidden" }));

(async () => {
  console.log("\n── fetchPageWithRetry (async) ──────────────────────────");

  const r1 = await fetchPageWithRetry(
    "https://api.example.com/users",
    { page: 1, pageSize: 2 },
    successFetcher,
    DEFAULT_RETRY_POLICY,
    noDelay
  );
  assertOk("success fetcher returns Ok<Page<User>>", r1);

  const r2 = await fetchPageWithRetry(
    "https://api.example.com/users",
    { page: 1, pageSize: 2 },
    networkErrFetcher,
    DEFAULT_RETRY_POLICY,
    noDelay
  );
  const e2 = assertErr("network fetcher exhausts retries → Err", r2);
  if (e2) {
    assert("error kind is exhausted", e2.kind === "exhausted");
    if (e2.kind === "exhausted") {
      assert(
        `attempts === ${DEFAULT_RETRY_POLICY.maxAttempts}`,
        e2.attempts === DEFAULT_RETRY_POLICY.maxAttempts
      );
    }
  }

  callCount = 0;
  const r3 = await fetchPageWithRetry(
    "https://api.example.com/users",
    { page: 1, pageSize: 2 },
    flakyFetcher,
    DEFAULT_RETRY_POLICY,
    noDelay
  );
  assertOk("flaky fetcher succeeds on 3rd attempt", r3);
  assert("flaky fetcher called exactly 3 times", callCount === 3);

  const r4 = await fetchPageWithRetry(
    "https://api.example.com/users",
    { page: 1, pageSize: 2 },
    httpErrFetcher,
    DEFAULT_RETRY_POLICY,
    noDelay
  );
  const e4 = assertErr("http 403 is not retried → Err", r4);
  if (e4) {
    assert("error kind is http (returned immediately)", e4.kind === "http");
  }

  // ------------------------------------------------------------------
  // TEST SUITE 3 — fetchAllUsers
  // ------------------------------------------------------------------
  console.log("\n── fetchAllUsers ───────────────────────────────────────");

  // Two-page mock: page 1 → Alice+Bob, page 2 → Carol
  const PAGE_2_RAW: unknown = {
    data: [RAW_USER_CAROL],
    page: 2,
    pageSize: 2,
    totalPages: 2,
    totalItems: 3,
  };

  const multiPageFetcher: Fetcher = (_url, req) => {
    if (req.page === 1) return Promise.resolve(ok(VALID_PAGE_RAW));
    if (req.page === 2) return Promise.resolve(ok(PAGE_2_RAW));
    return Promise.resolve(err<ApiError>({ kind: "http", status: 404, message: "Not found" }));
  };

  const allResult = await fetchAllUsers("https://api.example.com/users", {
    pageSize: 2,
    fetcher: multiPageFetcher,
    policy: DEFAULT_RETRY_POLICY,
    delay: noDelay,
  });
  const allUsers = assertOk("fetchAllUsers returns Ok<User[]>", allResult);
  if (allUsers) {
    assert("total users = 3 (Alice + Bob + Carol)", allUsers.length === 3);
    assert("first user is Alice", allUsers[0]?.name === "Alice");
    assert("last user is Carol", allUsers[2]?.name === "Carol");
  }

  // ------------------------------------------------------------------
  // TEST SUITE 4 — groupUsersByRole & summariseUsers
  // ------------------------------------------------------------------
  console.log("\n── groupUsersByRole & summariseUsers ──────────────────");

  const alice = (validateUser(RAW_USER_ALICE) as { ok: true; value: User }).value;
  const bob   = (validateUser(RAW_USER_BOB)   as { ok: true; value: User }).value;
  const carol = (validateUser(RAW_USER_CAROL) as { ok: true; value: User }).value;

  const grouped = groupUsersByRole([alice, bob, carol]);
  assert("admin group has Alice", grouped["admin"]?.[0]?.name === "Alice");
  assert("editor group has Bob",  grouped["editor"]?.[0]?.name === "Bob");
  assert("viewer group has Carol", grouped["viewer"]?.[0]?.name === "Carol");
  assert("no empty role keys", !Object.values(grouped).some((g) => g?.length === 0));

  const summary = summariseUsers([alice, bob, carol]);
  assert("summary.total === 3", summary.total === 3);
  assert("summary.byRole.admin === 1", summary.byRole["admin"] === 1);
  assert(
    "summary.newestCreatedAt is Carol's date",
    summary.newestCreatedAt === "2024-06-01T14:00:00Z"
  );

  const emptySummary = summariseUsers([]);
  assert("empty list → newestCreatedAt is null", emptySummary.newestCreatedAt === null);
  assert("empty list → total === 0", emptySummary.total === 0);

  // ------------------------------------------------------------------
  // Final report
  // ------------------------------------------------------------------
  console.log(`\n══════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`══════════════════════════════════════════\n`);
  if (failed > 0) process.exit(1);
})();
