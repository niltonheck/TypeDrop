// ============================================================
// challenge.ts — Typed LRU Cache with TTL & Eviction Callbacks
// ============================================================
// Rules:
//  - No `any`, no `as`, no type assertions
//  - Must compile under strict: true
//  - Complete every TODO; do not change existing signatures
// ============================================================

// ── 1. Eviction reasons ─────────────────────────────────────

// TODO: Define a discriminated union `EvictionReason` with three
// variants:
//   • { kind: "capacity" }          — cache was full, LRU entry removed
//   • { kind: "ttl"; expiredAt: number }  — entry exceeded its TTL
//   • { kind: "manual" }            — caller explicitly called .delete()
export type EvictionReason = never; // replace with your union

// ── 2. Cache entry (internal) ───────────────────────────────

// TODO: Define an internal type `CacheEntry<V>` that stores:
//   • value: V
//   • insertedAt: number   (Date.now() at insertion time)
//   • lastUsedAt: number   (Date.now() at last get/set)
type CacheEntry<V> = never; // replace with your type

// ── 3. Eviction callback ────────────────────────────────────

// TODO: Define a generic type `EvictionCallback<K, V>` — a function
// that receives the evicted key, the evicted value, and the reason.
// Return type must be void.
export type EvictionCallback<K, V> = never; // replace with your type

// ── 4. Cache options ────────────────────────────────────────

// TODO: Define `LRUCacheOptions<K, V>` with:
//   • capacity: number          — max number of entries (≥ 1)
//   • ttlMs?: number            — optional time-to-live in milliseconds
//   • onEvict?: EvictionCallback<K, V>  — optional callback
export type LRUCacheOptions<K, V> = never; // replace with your type

// ── 5. Cache interface ──────────────────────────────────────

// TODO: Fill in the return types and any missing generics.
// Do NOT change parameter names or add overloads yet.
export interface ILRUCache<K, V> {
  /** Store a value. Evicts LRU entry if over capacity. */
  set(key: K, value: V): void;

  /**
   * Retrieve a value.
   * Returns undefined if the key is missing or the entry has expired (TTL).
   * A TTL miss must fire onEvict with reason { kind: "ttl", expiredAt: number }.
   * A hit must update lastUsedAt.
   */
  get(key: K): V | undefined;

  /** Returns true only if the key exists AND has not expired. */
  has(key: K): boolean;

  /**
   * Remove a key explicitly.
   * Must fire onEvict with reason { kind: "manual" } if the key existed.
   * Returns true if the key existed, false otherwise.
   */
  delete(key: K): boolean;

  /** Remove all entries without firing onEvict. */
  clear(): void;

  /** Number of entries currently in the cache (including potentially expired ones). */
  readonly size: number;

  /** Returns all non-expired keys in most-recently-used → least-recently-used order. */
  keys(): K[];
}

// ── 6. Factory function ─────────────────────────────────────

// TODO: Implement `createLRUCache`. Use a Map<K, CacheEntry<V>> as
// your backing store. Keep entries ordered by recency by deleting and
// re-inserting on every access (Map preserves insertion order).
// Requirements:
//   R1. set()  — if key exists, update value & lastUsedAt (move to MRU end).
//               If new and at capacity, evict the LRU entry (first Map entry)
//               with reason { kind: "capacity" }.
//   R2. get()  — check TTL first; if expired call onEvict({kind:"ttl",...}),
//               delete from map, return undefined.
//               On hit: delete + re-insert to move to MRU end, update lastUsedAt.
//   R3. has()  — must NOT update lastUsedAt (peek only).
//   R4. delete() — fires onEvict with { kind: "manual" } when key found.
//   R5. keys() — filter out expired entries, return MRU-first order (reverse
//               insertion order of the Map).
//   R6. size   — reflects raw Map size (may include stale entries).
export function createLRUCache<K, V>(
  options: LRUCacheOptions<K, V>
): ILRUCache<K, V> {
  // TODO: implement
  throw new Error("Not implemented");
}
