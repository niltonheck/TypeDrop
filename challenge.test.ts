// ============================================================
// challenge.test.ts
// ============================================================
import { LRUCache, CacheStats, CacheResult, EvictionReason } from "./challenge";

// ── Helper ──────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ── Test 1: Basic LRU eviction (capacity reason) ────────────
console.log("\nTest 1 — Basic LRU eviction");
{
  const evicted: Array<{ key: string; reason: string }> = [];

  const cache = new LRUCache<string, number>({
    capacity: 3,
    onEvict(key, _value, reason) {
      evicted.push({ key, reason: reason.reason });
    },
  });

  cache.set("a", 1);
  cache.set("b", 2);
  cache.set("c", 3);
  // Access "a" so "b" becomes LRU
  cache.get("a");
  // Adding "d" should evict "b" (LRU)
  cache.set("d", 4);

  assert(evicted.length === 1, "exactly one eviction fired");
  assert(evicted[0].key === "b", 'evicted key is "b"');
  assert(evicted[0].reason === "capacity", 'eviction reason is "capacity"');
  assert(cache.get("a") === 1, '"a" still accessible');
  assert(cache.get("b") === undefined, '"b" was evicted');
}

// ── Test 2: TTL expiry ──────────────────────────────────────
console.log("\nTest 2 — TTL expiry");
{
  const evicted: string[] = [];

  const cache = new LRUCache<string, string>({
    capacity: 10,
    defaultTTL: 50, // 50 ms
    onEvict(key, _value, reason) {
      evicted.push(reason.reason);
    },
  });

  cache.set("x", "hello");
  cache.set("y", "world", { ttl: 5000 }); // long TTL, won't expire

  // Immediately accessible
  assert(cache.get("x") === "hello", '"x" accessible before expiry');

  // Wait for TTL to pass
  await new Promise<void>((res) => setTimeout(res, 60));

  const result = cache.get("x");
  assert(result === undefined, '"x" expired and returns undefined');
  assert(evicted.includes("ttl"), 'eviction reason is "ttl"');
  assert(cache.get("y") === "world", '"y" with long TTL still accessible');
}

// ── Test 3: Manual delete ───────────────────────────────────
console.log("\nTest 3 — Manual delete");
{
  const reasons: string[] = [];

  const cache = new LRUCache<number, boolean>({
    capacity: 5,
    onEvict(_key, _value, reason) {
      reasons.push(reason.reason);
    },
  });

  cache.set(1, true);
  cache.set(2, false);

  const deleted = cache.delete(1);
  assert(deleted === true, "delete returns true for existing key");
  assert(cache.get(1) === undefined, "deleted key not found");
  assert(cache.delete(99) === false, "delete returns false for missing key");
  assert(reasons[0] === "manual", 'eviction reason is "manual"');
}

// ── Test 4: lookup() discriminated union ────────────────────
console.log("\nTest 4 — lookup() CacheResult");
{
  const cache = new LRUCache<string, number>({ capacity: 5 });
  cache.set("score", 42);

  const hit: CacheResult<number> = cache.lookup("score");
  assert(hit.found === true, "lookup hit: found is true");
  if (hit.found) {
    assert(hit.value === 42, "lookup hit: value is 42");
  }

  const miss: CacheResult<number> = cache.lookup("nope");
  assert(miss.found === false, "lookup miss: found is false");
}

// ── Test 5: stats() accuracy ────────────────────────────────
console.log("\nTest 5 — stats()");
{
  const cache = new LRUCache<string, number>({ capacity: 2 });
  cache.set("p", 10);
  cache.set("q", 20);
  cache.get("p");   // hit
  cache.get("p");   // hit
  cache.get("z");   // miss
  cache.set("r", 30); // evicts "q"

  const s: CacheStats = cache.stats();
  assert(s.hits === 2, "2 hits recorded");
  assert(s.misses === 1, "1 miss recorded");
  assert(s.evictions === 1, "1 eviction recorded");
  assert(s.capacity === 2, "capacity is 2");
  assert(s.size === 2, "size is 2 (p and r)");
}

// ── Test 6: has() and clear() ───────────────────────────────
console.log("\nTest 6 — has() and clear()");
{
  const cache = new LRUCache<string, string>({
    capacity: 5,
    defaultTTL: 30,
  });

  cache.set("m", "value");
  assert(cache.has("m") === true, 'has("m") is true before expiry');

  await new Promise<void>((res) => setTimeout(res, 40));
  assert(cache.has("m") === false, 'has("m") is false after TTL expiry');

  cache.set("n", "other");
  cache.clear();
  assert(cache.has("n") === false, 'has("n") is false after clear()');
  const s = cache.stats();
  assert(s.size === 0 && s.hits === 0 && s.evictions === 0, "stats reset after clear()");
}

console.log("\nDone.\n");
