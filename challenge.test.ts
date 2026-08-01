// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  toCacheKey,
  createCacheStore,
  getOrFetch,
  type CacheKey,
  type CacheResult,
} from "./challenge";

// ── Domain types ──────────────────────────────────────────────────────────────
type User    = { id: string; name: string };
type Product = { sku: string; price: number };

type AppSchema = {
  user: User;
  product: Product;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL — ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS — ${message}`);
  }
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const alice: User    = { id: "u1", name: "Alice" };
const widget: Product = { sku: "W-42", price: 9.99 };

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1 — toCacheKey produces a branded key
// ─────────────────────────────────────────────────────────────────────────────
const key: CacheKey = toCacheKey("user:u1");
assert(key === "user:u1", "toCacheKey returns the correct string value");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2 — set + get (cache hit) returns the correct typed value
// ─────────────────────────────────────────────────────────────────────────────
const store = createCacheStore<AppSchema>();

store.set("user", "u1", alice, 60_000, ["tenant:acme"]);
const result: CacheResult<User> = store.get("user", "u1");

assert(result.hit === true, "get returns a cache hit for a freshly stored entry");
if (result.hit) {
  assert(result.value.name === "Alice", "hit value carries the correct User shape");
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3 — get on a missing key returns { hit: false, reason: "missing" }
// ─────────────────────────────────────────────────────────────────────────────
const missing = store.get("user", "nonexistent");
assert(missing.hit === false && missing.reason === "missing", "missing key returns reason='missing'");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4 — invalidateTag removes all matching entries and returns count
// ─────────────────────────────────────────────────────────────────────────────
store.set("user",    "u2", { id: "u2", name: "Bob" }, 60_000, ["tenant:acme"]);
store.set("product", "W-42", widget,                  60_000, ["tenant:acme"]);
store.set("user",    "u3", { id: "u3", name: "Carol"}, 60_000, ["tenant:beta"]);

const removed = store.invalidateTag("tenant:acme");
assert(removed === 3, `invalidateTag("tenant:acme") removes 3 entries (got ${removed})`);

const afterInvalidate = store.get("user", "u1");
assert(
  afterInvalidate.hit === false && afterInvalidate.reason === "missing",
  "invalidated entry is no longer retrievable"
);

const carolResult = store.get("user", "u3");
assert(carolResult.hit === true, "entry with different tag survives invalidateTag");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 5 — getOrFetch calls fetcher on miss and caches result
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  const freshStore = createCacheStore<AppSchema>();
  let fetchCount = 0;

  const fetcher = async (): Promise<User> => {
    fetchCount++;
    return { id: "u99", name: "Zara" };
  };

  const first  = await getOrFetch(freshStore, "user", "u99", 60_000, fetcher, ["tenant:demo"]);
  const second = await getOrFetch(freshStore, "user", "u99", 60_000, fetcher, ["tenant:demo"]);

  assert(first.name  === "Zara", "getOrFetch returns fetched value on first call");
  assert(second.name === "Zara", "getOrFetch returns cached value on second call");
  assert(fetchCount  === 1,      `fetcher called only once (called ${fetchCount} times)`);
})().catch((err) => {
  console.error("❌ Async test threw:", err);
  process.exitCode = 1;
});
