// ============================================================
// challenge.test.ts  –  run with:  npx ts-node challenge.test.ts
// ============================================================
import {
  Brand,
  SessionKey, FeatureFlagKey, RateLimitKey,
  sessionKey, featureFlagKey, rateLimitKey,
  LRUCache, LRUCacheOptions, CacheResult, CacheStats,
  createNamespacedCaches,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

function assertThrows(fn: () => unknown, label: string): void {
  try {
    fn();
    console.error(`  ❌  ${label} (expected throw, got none)`);
    failed++;
  } catch {
    console.log(`  ✅  ${label}`);
    passed++;
  }
}

// ── Mock data ─────────────────────────────────────────────────
const sk1 = sessionKey("user:42");
const sk2 = sessionKey("user:99");
const sk3 = sessionKey("user:7");
const fk1 = featureFlagKey("dark-mode");
const rl1 = rateLimitKey("api:/v1/search");

// ── Test suite ────────────────────────────────────────────────
console.log("\n=== 1. Branded key factories ===");
{
  // Branded keys are strings at runtime
  assert(typeof sk1 === "string" && sk1 === "user:42", "sessionKey returns correct string value");
  assert(typeof fk1 === "string" && fk1 === "dark-mode", "featureFlagKey returns correct string value");
  assert(typeof rl1 === "string" && rl1 === "api:/v1/search", "rateLimitKey returns correct string value");

  // TypeScript would reject: sessionCache.set(fk1, …) — verified manually via tsc
}

console.log("\n=== 2. Basic set / get / size ===");
{
  const sessionCache = new LRUCache<SessionKey, { token: string }>({
    capacity: 3,
  });

  sessionCache.set(sk1, { token: "abc" });
  sessionCache.set(sk2, { token: "xyz" });

  const r1 = sessionCache.get(sk1);
  assert(r1.status === "hit" && r1.value.token === "abc", "get() returns hit for existing key");

  const r2 = sessionCache.get(sk3);
  assert(r2.status === "miss", "get() returns miss for unknown key");

  assert(sessionCache.size() === 2, "size() reflects stored entries");
}

console.log("\n=== 3. LRU eviction ===");
{
  const cache = new LRUCache<SessionKey, number>({ capacity: 2 });

  cache.set(sk1, 1);
  cache.set(sk2, 2);
  cache.get(sk1);      // sk1 is now most-recent; sk2 is LRU
  cache.set(sk3, 3);   // capacity exceeded → evict sk2

  assert(cache.get(sk2).status === "miss", "LRU entry (sk2) was evicted");
  assert(cache.get(sk1).status === "hit",  "Recently-used entry (sk1) was retained");
  assert(cache.get(sk3).status === "hit",  "Newly inserted entry (sk3) is present");

  const s = cache.stats();
  assert(s.evictions >= 1, "eviction counter incremented");
}

console.log("\n=== 4. TTL expiry ===");
{
  const cache = new LRUCache<FeatureFlagKey, boolean>({
    capacity: 10,
    defaultTtlMs: 50, // 50 ms default TTL
  });

  cache.set(fk1, true);

  const immediate = cache.get(fk1);
  assert(immediate.status === "hit", "Entry is a hit before TTL elapses");

  // Wait for TTL to elapse
  const start = Date.now();
  while (Date.now() - start < 80) { /* busy wait */ }

  const after = cache.get(fk1);
  assert(after.status === "expired", "Entry reported as expired after TTL");

  assert(cache.size() === 0, "Expired entry removed from cache");

  const s = cache.stats();
  assert(s.expirations >= 1, "expiration counter incremented");
}

console.log("\n=== 5. Per-entry TTL override & peek ===");
{
  const cache = new LRUCache<RateLimitKey, number>({
    capacity: 5,
    defaultTtlMs: 10_000, // 10 s default — won't expire in test
  });

  cache.set(rl1, 42, { ttlMs: 30 }); // short per-entry TTL

  assert(cache.peek(rl1) === 42, "peek() returns value without TTL check");

  const start = Date.now();
  while (Date.now() - start < 60) { /* busy wait */ }

  // peek does NOT check TTL
  assert(cache.peek(rl1) !== undefined, "peek() bypasses TTL (stale value visible)");

  // get() DOES check TTL
  assert(cache.get(rl1).status === "expired", "get() detects per-entry TTL expiry");
}

console.log("\n=== 6. delete & clear ===");
{
  const cache = new LRUCache<SessionKey, string>({ capacity: 5 });
  cache.set(sk1, "a");
  cache.set(sk2, "b");

  assert(cache.delete(sk1) === true,  "delete() returns true for existing key");
  assert(cache.delete(sk3) === false, "delete() returns false for missing key");
  assert(cache.get(sk1).status === "miss", "Deleted entry is no longer accessible");

  cache.clear();
  assert(cache.size() === 0, "clear() empties the cache");
}

console.log("\n=== 7. Stats accuracy ===");
{
  const cache = new LRUCache<SessionKey, number>({ capacity: 3 });
  cache.set(sk1, 1);
  cache.get(sk1); // hit
  cache.get(sk2); // miss
  cache.get(sk3); // miss

  const s = cache.stats();
  assert(s.hits   === 1, "stats().hits   === 1");
  assert(s.misses === 2, "stats().misses === 2");
}

console.log("\n=== 8. createNamespacedCaches ===");
{
  const caches = createNamespacedCaches({
    sessions:     { capacity: 100 } as LRUCacheOptions<SessionKey,     { token: string }>,
    featureFlags: { capacity: 50  } as LRUCacheOptions<FeatureFlagKey, boolean>,
  });

  // Verify instances exist and are LRUCache
  assert(typeof caches.sessions.set     === "function", "sessions cache has .set()");
  assert(typeof caches.featureFlags.get === "function", "featureFlags cache has .get()");

  // Runtime smoke test
  (caches.sessions as LRUCache<SessionKey, { token: string }>)
    .set(sessionKey("u:1"), { token: "tok" });

  const r = (caches.sessions as LRUCache<SessionKey, { token: string }>)
    .get(sessionKey("u:1"));
  assert(r.status === "hit", "namespaced sessions cache stores and retrieves correctly");
}

// ── Summary ───────────────────────────────────────────────────
console.log(`\n${"─".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} assertions`);
if (failed > 0) process.exit(1);
