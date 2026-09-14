// challenge.test.ts
import { LRUCache, memoize } from "./challenge";

// ─── Helper ────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Test 1: basic get / set / LRU eviction ────────────────
{
  const cache = new LRUCache<string, number>({ capacity: 3 });

  cache.set("a", 1);
  cache.set("b", 2);
  cache.set("c", 3);

  // Access "a" so "b" becomes LRU
  cache.get("a");

  // Adding "d" should evict "b" (LRU)
  cache.set("d", 4);

  console.assert(cache.get("a") === 1, "Test 1a: 'a' should still be present");
  console.assert(cache.get("b") === undefined, "Test 1b: 'b' should have been evicted");
  console.assert(cache.get("c") === 3, "Test 1c: 'c' should still be present");
  console.assert(cache.get("d") === 4, "Test 1d: 'd' should be present");

  const s = cache.stats();
  console.assert(s.evictions === 1, "Test 1e: eviction count should be 1");
  console.assert(s.hits >= 3, "Test 1f: at least 3 hits (a, c, d)");
}

// ─── Test 2: TTL expiry ─────────────────────────────────────
async function testTTL() {
  const cache = new LRUCache<string, string>({ capacity: 10, defaultTtlMs: 50 });

  cache.set("x", "hello");
  cache.set("y", "world", 200); // override TTL

  console.assert(cache.get("x") === "hello", "Test 2a: 'x' should be present immediately");

  await sleep(80);

  console.assert(cache.get("x") === undefined, "Test 2b: 'x' should have expired after 80ms");
  console.assert(cache.get("y") === "world", "Test 2c: 'y' (200ms TTL) should still be present at 80ms");

  const s = cache.stats();
  console.assert(s.expirations >= 1, "Test 2d: at least one expiration recorded");
}

// ─── Test 3: onEvict callback & peek ───────────────────────
{
  const evicted: Array<[string, number]> = [];
  const cache = new LRUCache<string, number>({
    capacity: 2,
    onEvict: (k, v) => evicted.push([k, v]),
  });

  cache.set("p", 10);
  cache.set("q", 20);
  cache.set("r", 30); // evicts "p"

  console.assert(evicted.length === 1, "Test 3a: one eviction callback fired");
  console.assert(evicted[0][0] === "p" && evicted[0][1] === 10, "Test 3b: evicted entry is ('p', 10)");

  // peek should not promote "q" — inserting "s" should still evict "q"
  cache.peek("q");
  cache.set("s", 40); // evicts "q" (still LRU after peek)

  console.assert(evicted.length === 2, "Test 3c: second eviction callback fired");
  console.assert(evicted[1][0] === "q", "Test 3d: evicted entry is 'q'");
}

// ─── Test 4: delete & clear ────────────────────────────────
{
  const cache = new LRUCache<string, boolean>({ capacity: 5 });
  cache.set("flag", true);

  console.assert(cache.delete("flag") === true, "Test 4a: delete returns true for existing key");
  console.assert(cache.delete("flag") === false, "Test 4b: delete returns false for missing key");
  console.assert(cache.get("flag") === undefined, "Test 4c: deleted key returns undefined");

  cache.set("a", true);
  cache.set("b", false);
  cache.clear();

  console.assert(cache.stats().currentSize === 0, "Test 4d: clear resets currentSize to 0");
  console.assert(cache.stats().hits === 0, "Test 4e: clear resets hits to 0");
}

// ─── Test 5: memoize ───────────────────────────────────────
{
  let callCount = 0;
  function expensiveAdd(a: number, b: number): number {
    callCount++;
    return a + b;
  }

  const cache = new LRUCache<string, number>({ capacity: 10 });
  const memoAdd = memoize(
    expensiveAdd,
    cache,
    (a, b) => `${a}:${b}`
  );

  console.assert(memoAdd(2, 3) === 5, "Test 5a: memoized result is correct");
  console.assert(memoAdd(2, 3) === 5, "Test 5b: second call returns same result");
  console.assert(callCount === 1, "Test 5c: underlying fn called only once for same args");
  console.assert(memoAdd(1, 1) === 2, "Test 5d: different args compute fresh result");
  console.assert(callCount === 2, "Test 5e: underlying fn called twice total");
}

// Run async tests
testTTL().then(() => console.log("All async tests complete."));
console.log("All sync tests complete.");
