// challenge.test.ts
import {
  cacheKey,
  createCacheOrchestrator,
  type CacheSchema,
  type NamespaceConfigs,
} from "./challenge";

// ---------- Schema under test --------------------------------

type AppSchema = {
  users: { id: number; name: string };
  tokens: string;
  counters: number;
};

// ---------- Configs ------------------------------------------

const configs: NamespaceConfigs<AppSchema> = {
  users: {
    policy: { kind: "lru", maxSize: 3 },
  },
  tokens: {
    policy: { kind: "ttl", defaultTtlMs: 200 },
    serialize: (v) => v,
    deserialize: (r) => r,
  },
  counters: {
    policy: { kind: "none" },
  },
};

const cache = createCacheOrchestrator<AppSchema>(configs);

// ---------- 1. Basic set / get --------------------------------
cache.set("users", "u1", { id: 1, name: "Alice" });
cache.set("users", "u2", { id: 2, name: "Bob" });
cache.set("users", "u3", { id: 3, name: "Carol" });

console.assert(
  cache.get("users", "u1")?.name === "Alice",
  "FAIL 1a: should retrieve Alice"
);
console.assert(
  cache.get("users", "u99") === undefined,
  "FAIL 1b: missing key should return undefined"
);

// ---------- 2. LRU eviction -----------------------------------
// Access u1 and u2 so u3 becomes LRU, then add u4 to trigger eviction
cache.get("users", "u1"); // u1 → recently used
cache.get("users", "u2"); // u2 → recently used
// u3 is now LRU
cache.set("users", "u4", { id: 4, name: "Dave" }); // should evict u3

console.assert(
  cache.get("users", "u3") === undefined,
  "FAIL 2a: u3 should have been evicted (LRU)"
);
console.assert(
  cache.get("users", "u4")?.name === "Dave",
  "FAIL 2b: u4 should be present after insertion"
);

// ---------- 3. TTL expiry ------------------------------------
cache.set("tokens", "tok1", "secret-abc"); // uses defaultTtlMs = 200

console.assert(
  cache.get("tokens", "tok1") === "secret-abc",
  "FAIL 3a: token should be alive immediately after set"
);

await new Promise((r) => setTimeout(r, 250));

console.assert(
  cache.get("tokens", "tok1") === undefined,
  "FAIL 3b: token should have expired after 250 ms"
);

// ---------- 4. delete & invalidateNamespace ------------------
cache.set("counters", "c1", 10);
cache.set("counters", "c2", 20);

console.assert(cache.delete("counters", "c1") === true, "FAIL 4a: delete should return true");
console.assert(cache.get("counters", "c1") === undefined, "FAIL 4b: deleted key should be gone");

cache.invalidateNamespace("counters");
console.assert(
  cache.get("counters", "c2") === undefined,
  "FAIL 4c: invalidated namespace should be empty"
);

// ---------- 5. Stats -----------------------------------------
// Fresh namespace state after invalidation
cache.set("counters", "x", 1);
cache.get("counters", "x");   // hit
cache.get("counters", "x");   // hit
cache.get("counters", "nope"); // miss

const s = cache.stats("counters");
console.assert(s.size === 1, `FAIL 5a: size should be 1, got ${s.size}`);
console.assert(s.hits >= 2, `FAIL 5b: hits should be >= 2, got ${s.hits}`);
console.assert(s.misses >= 1, `FAIL 5c: misses should be >= 1, got ${s.misses}`);

// ---------- 6. cacheKey branded type -------------------------
const k = cacheKey("valid-key");
console.assert(typeof k === "string", "FAIL 6a: cacheKey should return a string");

let threw = false;
try { cacheKey(""); } catch { threw = true; }
console.assert(threw, "FAIL 6b: empty string should throw");

threw = false;
try { cacheKey("x".repeat(129)); } catch { threw = true; }
console.assert(threw, "FAIL 6c: 129-char string should throw");

console.log("All assertions passed ✓");
