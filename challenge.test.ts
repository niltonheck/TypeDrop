// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import { createLRUCache } from "./challenge";
import type { EvictionReason, EvictionCallback } from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ── Test 1: Basic set / get / has ────────────────────────────
console.log("\nTest 1: Basic set / get / has");
{
  const cache = createLRUCache<string, number>({ capacity: 3 });

  cache.set("a", 1);
  cache.set("b", 2);
  cache.set("c", 3);

  assert(cache.get("a") === 1, 'get("a") === 1');
  assert(cache.get("b") === 2, 'get("b") === 2');
  assert(cache.has("c") === true, 'has("c") === true');
  assert(cache.has("z") === false, 'has("z") === false');
  assert(cache.size === 3, "size === 3");
}

// ── Test 2: LRU eviction on capacity overflow ─────────────────
console.log("\nTest 2: LRU eviction on capacity");
{
  const evicted: Array<{ key: string; value: number; reason: EvictionReason }> = [];

  const onEvict: EvictionCallback<string, number> = (key, value, reason) => {
    evicted.push({ key, value, reason });
  };

  const cache = createLRUCache<string, number>({ capacity: 2, onEvict });

  cache.set("a", 1);
  cache.set("b", 2);
  cache.get("a");       // "a" is now MRU; "b" is LRU
  cache.set("c", 3);    // capacity exceeded → evict LRU = "b"

  assert(evicted.length === 1, "one eviction fired");
  assert(evicted[0].key === "b", 'evicted key is "b"');
  assert(evicted[0].reason.kind === "capacity", 'reason.kind === "capacity"');
  assert(cache.get("a") === 1, '"a" still in cache');
  assert(cache.get("b") === undefined, '"b" evicted');
  assert(cache.get("c") === 3, '"c" in cache');
}

// ── Test 3: TTL expiry ────────────────────────────────────────
console.log("\nTest 3: TTL expiry");
{
  const evicted: Array<{ key: string; reason: EvictionReason }> = [];

  const cache = createLRUCache<string, string>({
    capacity: 5,
    ttlMs: 50,
    onEvict: (key, _value, reason) => evicted.push({ key, reason }),
  });

  cache.set("x", "hello");

  // Immediate get should succeed
  assert(cache.get("x") === "hello", "immediate get returns value");

  // Wait for TTL to expire
  const start = Date.now();
  while (Date.now() - start < 80) { /* busy wait for test simplicity */ }

  assert(cache.get("x") === undefined, "expired entry returns undefined");
  assert(evicted.length === 1, "TTL eviction callback fired once");
  assert(evicted[0].key === "x", 'TTL-evicted key is "x"');
  assert(evicted[0].reason.kind === "ttl", 'reason.kind === "ttl"');
}

// ── Test 4: Manual delete ─────────────────────────────────────
console.log("\nTest 4: Manual delete");
{
  const evicted: Array<{ key: string; reason: EvictionReason }> = [];

  const cache = createLRUCache<string, boolean>({
    capacity: 3,
    onEvict: (key, _value, reason) => evicted.push({ key, reason }),
  });

  cache.set("flag", true);
  const deleted = cache.delete("flag");
  const deletedAgain = cache.delete("flag");

  assert(deleted === true, "delete returns true for existing key");
  assert(deletedAgain === false, "delete returns false for missing key");
  assert(evicted.length === 1, "onEvict fired exactly once");
  assert(evicted[0].reason.kind === "manual", 'reason.kind === "manual"');
  assert(cache.get("flag") === undefined, "deleted key returns undefined");
}

// ── Test 5: keys() ordering & clear() ────────────────────────
console.log("\nTest 5: keys() ordering & clear()");
{
  const cache = createLRUCache<string, number>({ capacity: 4 });

  cache.set("a", 1);
  cache.set("b", 2);
  cache.set("c", 3);
  cache.get("a");        // "a" becomes MRU → order: c, b, a → MRU-first: a, c, b

  const k = cache.keys();
  assert(k[0] === "a", 'keys()[0] is MRU "a"');
  assert(k[k.length - 1] === "b", 'keys()[last] is LRU "b"');

  cache.clear();
  assert(cache.size === 0, "size === 0 after clear()");
  assert(cache.keys().length === 0, "keys() is empty after clear()");
}

console.log("\nDone.\n");
