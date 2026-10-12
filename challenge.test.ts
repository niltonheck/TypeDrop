// =============================================================================
// challenge.test.ts
// =============================================================================
import { createCache, makeKey } from "./challenge";

// ── Schema ──────────────────────────────────────────────────────────────────

interface TestSchema {
  name: string;
  age: number;
  active: boolean;
}

// ── Branded keys ─────────────────────────────────────────────────────────────

const nameKey   = makeKey<TestSchema, "name">("name");
const ageKey    = makeKey<TestSchema, "age">("age");
const activeKey = makeKey<TestSchema, "active">("active");

// ── Helper ───────────────────────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ── Test 1: Basic get / set ───────────────────────────────────────────────────

console.log("\nTest 1 — Basic get/set");
{
  const cache = createCache<TestSchema>({ capacity: 10 });

  cache.set(nameKey, "Alice");
  cache.set(ageKey, 30);

  assert(cache.get(nameKey) === "Alice", 'get("name") returns "Alice"');
  assert(cache.get(ageKey) === 30,       'get("age") returns 30');
  assert(cache.get(activeKey) === undefined, 'get("active") returns undefined for missing key');
}

// ── Test 2: LRU eviction on capacity overflow ────────────────────────────────

console.log("\nTest 2 — LRU eviction");
{
  const evicted: string[] = [];
  const cache = createCache<TestSchema>({
    capacity: 2,
    onEvent(event) {
      if (event.kind === "evict" && event.reason === "lru") {
        evicted.push(String(event.key));
      }
    },
  });

  cache.set(nameKey,   "Bob");    // order: [name]
  cache.set(ageKey,    25);       // order: [name, age]
  cache.get(nameKey);             // promotes name → order: [age, name]
  cache.set(activeKey, true);     // capacity exceeded → evict LRU = "age"

  assert(evicted.length === 1,        "exactly one LRU eviction fired");
  assert(evicted[0] === "age",        '"age" was the LRU entry evicted');
  assert(cache.get(nameKey) === "Bob", '"name" still present after eviction');
  assert(cache.get(ageKey) === undefined, '"age" is gone after eviction');
}

// ── Test 3: TTL expiry ────────────────────────────────────────────────────────

console.log("\nTest 3 — TTL expiry");
{
  const evictReasons: string[] = [];
  const cache = createCache<TestSchema>({
    capacity: 10,
    onEvent(event) {
      if (event.kind === "evict") evictReasons.push(event.reason);
    },
  });

  cache.set(nameKey, "Carol", 1); // TTL = 1 ms

  // Spin until at least 5 ms have elapsed so the TTL definitely expires
  const deadline = Date.now() + 5;
  while (Date.now() < deadline) { /* busy-wait */ }

  const val = cache.get(nameKey);
  assert(val === undefined, "expired entry returns undefined");
  assert(evictReasons.includes("ttl"), '"ttl" eviction reason emitted on expired get');
}

// ── Test 4: manual delete + stats ────────────────────────────────────────────

console.log("\nTest 4 — delete and stats");
{
  const cache = createCache<TestSchema>({ capacity: 10 });

  cache.set(nameKey, "Dave");
  cache.set(ageKey, 40);

  cache.get(nameKey);    // hit
  cache.get(nameKey);    // hit
  cache.get(activeKey);  // miss

  const deleted = cache.delete(ageKey);
  assert(deleted === true, "delete returns true for existing key");

  const deletedAgain = cache.delete(ageKey);
  assert(deletedAgain === false, "delete returns false for already-removed key");

  const s = cache.stats();
  assert(s.hits === 2,      "stats: 2 hits recorded");
  assert(s.misses === 1,    "stats: 1 miss recorded");
  assert(s.evictions === 1, "stats: 1 manual eviction recorded");
}

// ── Test 5: purgeExpired + snapshot ──────────────────────────────────────────

console.log("\nTest 5 — purgeExpired and snapshot");
{
  const cache = createCache<TestSchema>({ capacity: 10 });

  cache.set(nameKey,   "Eve",  1);  // expires immediately
  cache.set(ageKey,    22,     1);  // expires immediately
  cache.set(activeKey, false);      // immortal (no TTL)

  const deadline = Date.now() + 5;
  while (Date.now() < deadline) { /* busy-wait */ }

  const purged = cache.purgeExpired();
  assert(purged === 2, "purgeExpired removes 2 expired entries");

  const snap = cache.snapshot();
  assert(snap.size === 1,              "snapshot contains 1 live entry");
  assert(snap.get("active") === false, 'snapshot["active"] is false');
  assert(!snap.has("name"),            '"name" absent from snapshot');
}

console.log("\nAll tests complete.\n");
