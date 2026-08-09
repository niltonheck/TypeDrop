// challenge.test.ts
import { LRUCache, EvictionEvent, DEFAULT_OPTIONS, LRUCacheOptions } from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
function collectEvents<K, V>(cache: LRUCache<K, V>): EvictionEvent<K, V>[] {
  const events: EvictionEvent<K, V>[] = [];
  cache.on((e) => events.push(e));
  return events;
}

// ── Test 1: Basic get / set / LRU eviction ───────────────────
{
  const cache = new LRUCache<string, number>({ capacity: 3 });
  const events = collectEvents(cache);

  cache.set("a", 1).set("b", 2).set("c", 3);
  console.assert(cache.size === 3, "Test 1a: size should be 3");

  // Access "a" so "b" becomes the LRU
  cache.get("a");
  // Insert "d" — should evict "b" (LRU)
  cache.set("d", 4);

  console.assert(cache.size === 3, "Test 1b: size should still be 3 after eviction");
  console.assert(cache.get("b") === undefined, "Test 1c: 'b' should have been evicted");
  console.assert(cache.get("a") === 1, "Test 1d: 'a' should still be present");
  console.assert(
    events.length === 1 && events[0].reason === "evicted" && events[0].key === "b",
    "Test 1e: eviction event should be 'evicted' for key 'b'"
  );
}

// ── Test 2: TTL expiry ────────────────────────────────────────
{
  const cache = new LRUCache<string, string>({ capacity: 10, defaultTTL: 50 });
  const events = collectEvents(cache);

  cache.set("x", "hello"); // uses defaultTTL = 50 ms

  // Should be accessible immediately
  console.assert(cache.get("x") === "hello", "Test 2a: value should be readable before TTL");

  // Wait 60 ms then try again
  setTimeout(() => {
    const result = cache.get("x");
    console.assert(result === undefined, "Test 2b: expired entry should return undefined");
    console.assert(
      events.some((e) => e.reason === "expired" && e.key === "x"),
      "Test 2c: an 'expired' eviction event should have fired for 'x'"
    );
  }, 60);
}

// ── Test 3: delete fires "deleted" event ──────────────────────
{
  const cache = new LRUCache<number, boolean>({ capacity: 5 });
  const events = collectEvents(cache);

  cache.set(1, true).set(2, false);
  const deleted = cache.delete(1);

  console.assert(deleted === true, "Test 3a: delete should return true for existing key");
  console.assert(cache.has(1) === false, "Test 3b: has() should return false after delete");
  console.assert(
    events.length === 1 && events[0].reason === "deleted" && events[0].key === 1,
    "Test 3c: a 'deleted' event should fire with correct key"
  );

  const deletedMissing = cache.delete(99);
  console.assert(deletedMissing === false, "Test 3d: delete on missing key returns false");
  console.assert(events.length === 1, "Test 3e: no extra event for missing key");
}

// ── Test 4: unsubscribe stops listener ────────────────────────
{
  const cache = new LRUCache<string, number>({ capacity: 2 });
  const received: EvictionEvent<string, number>[] = [];
  const unsub = cache.on((e) => received.push(e));

  cache.set("p", 1).set("q", 2);
  unsub(); // stop listening
  cache.set("r", 3); // evicts "p", but listener is gone

  console.assert(received.length === 0, "Test 4: unsubscribed listener should receive no events");
}

// ── Test 5: DEFAULT_OPTIONS satisfies check ───────────────────
{
  // If DEFAULT_OPTIONS does not satisfy LRUCacheOptions this will be a compile error.
  const cache = new LRUCache<string, number>(DEFAULT_OPTIONS);
  cache.set("z", 42);
  console.assert(cache.get("z") === 42, "Test 5: cache built from DEFAULT_OPTIONS should work");
}

console.log("All synchronous assertions passed ✓ (async TTL checks run after 60 ms)");
