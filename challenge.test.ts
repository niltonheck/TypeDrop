// challenge.test.ts
import { makeCacheKey, LRUCache, memoize } from "./challenge";

// ── Helpers ────────────────────────────────────────────────

type Recipe = { id: string; title: string };
type Profile = { userId: string; name: string };

// ── 1. Basic get / set / eviction ─────────────────────────

const recipeCache = new LRUCache<"recipe", Recipe>(3);

const k1 = makeCacheKey("recipe", "r1");
const k2 = makeCacheKey("recipe", "r2");
const k3 = makeCacheKey("recipe", "r3");
const k4 = makeCacheKey("recipe", "r4");

recipeCache.set(k1, { id: "r1", title: "Pasta" });
recipeCache.set(k2, { id: "r2", title: "Pizza" });
recipeCache.set(k3, { id: "r3", title: "Salad" });

// Cache is at capacity (3 entries)
console.assert(recipeCache.size === 3, "size should be 3 after 3 inserts");

// Access k1 so it becomes most-recently-used
recipeCache.get(k1);

// Insert k4 — should evict k2 (now the LRU), NOT k1
recipeCache.set(k4, { id: "r4", title: "Soup" });

console.assert(recipeCache.size === 3, "size should still be 3 after eviction");
console.assert(
  recipeCache.get(k2) === undefined,
  "k2 should have been evicted (LRU)"
);
console.assert(
  recipeCache.get(k1)?.title === "Pasta",
  "k1 should still be cached"
);
console.assert(
  recipeCache.get(k4)?.title === "Soup",
  "k4 should be cached"
);

// ── 2. delete & clear ─────────────────────────────────────

const deleted = recipeCache.delete(k3);
console.assert(deleted === true, "delete should return true for existing key");
console.assert(recipeCache.size === 2, "size should be 2 after delete");

recipeCache.clear();
console.assert(recipeCache.size === 0, "size should be 0 after clear");

// ── 3. memoize ────────────────────────────────────────────

let callCount = 0;
const profileCache = new LRUCache<"profile", Profile>(2);

const fetchProfile = (raw: string): Profile => {
  callCount++;
  return { userId: raw, name: `User-${raw}` };
};

const cachedFetch = memoize(profileCache, "profile", fetchProfile);

const p1 = cachedFetch("u1");
const p1Again = cachedFetch("u1"); // should hit cache

console.assert(callCount === 1, "fn should only be called once for the same key");
console.assert(p1.name === p1Again.name, "cached result should equal original");

cachedFetch("u2");
cachedFetch("u3"); // evicts u1 (capacity = 2)

const p1Evicted = cachedFetch("u1"); // cache miss → fn called again
console.assert(callCount === 4, "fn should be called again after eviction (total 4 calls)");
console.assert(p1Evicted.name === "User-u1", "re-fetched profile should be correct");

// ── 4. Type safety (compile-time checks) ──────────────────
// These lines must NOT compile — uncomment to verify:
// const profileKey = makeCacheKey("profile", "p1");
// recipeCache.get(profileKey); // ❌ CacheKey<"profile"> ≠ CacheKey<"recipe">

console.log("All assertions passed ✅");
