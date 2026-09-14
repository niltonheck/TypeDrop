// ============================================================
// Typed LRU Cache with TTL Eviction & Generational Stats
// ============================================================
// REQUIREMENTS
// 1. Implement a generic LRUCache<K, V> class whose constructor
//    accepts a CacheOptions<K, V> config object.
// 2. get(key): returns V if the entry exists AND has not expired,
//    otherwise returns undefined. A cache hit must promote the
//    entry to "most recently used".
// 3. set(key, value, ttlMs?): inserts or updates an entry.
//    - ttlMs overrides the defaultTtlMs from options (if any).
//    - If the cache is at capacity, evict the least-recently-used
//      entry BEFORE inserting the new one.
// 4. delete(key): removes an entry; returns true if it existed.
// 5. clear(): removes all entries and resets stats.
// 6. peek(key): returns V (if present and not expired) WITHOUT
//    changing the LRU order.
// 7. stats(): returns a readonly CacheStats snapshot.
//    Track: hits, misses, evictions, expirations, currentSize.
// 8. The onEvict callback in CacheOptions must be called with the
//    evicted key and value whenever an entry is removed due to
//    capacity overflow (NOT for TTL expiry or manual delete).
// 9. Use a branded type CacheKey<K> so raw keys can never be
//    passed to internal helpers that expect a normalised key.
// 10. Implement the free-standing function memoize<Args extends
//     readonly unknown[], R>(
//       fn: (...args: Args) => R,
//       cache: LRUCache<string, R>,
//       keyFn: (...args: Args) => string
//     ): (...args: Args) => R
//     which wraps fn so repeated calls with the same keyFn result
//     hit the cache instead of re-executing fn.

// -----------------------------------------------------------
// Branded key type — do NOT remove the brand
// -----------------------------------------------------------
type CacheKey<K> = K & { readonly __brand: "CacheKey" };

// -----------------------------------------------------------
// Per-entry metadata stored internally
// -----------------------------------------------------------
interface CacheEntry<V> {
  value: V;
  /** Absolute expiry timestamp (ms since epoch), or undefined = no expiry */
  expiresAt: number | undefined;
  /** Insertion / last-update wall-clock time */
  insertedAt: number;
}

// -----------------------------------------------------------
// Public configuration
// -----------------------------------------------------------
interface CacheOptions<K, V> {
  /** Maximum number of entries before LRU eviction kicks in */
  capacity: number;
  /** Default TTL in milliseconds applied when set() omits ttlMs */
  defaultTtlMs?: number;
  /** Called with (key, value) whenever an entry is LRU-evicted */
  onEvict?: (key: K, value: V) => void;
}

// -----------------------------------------------------------
// Stats snapshot — all fields are readonly
// -----------------------------------------------------------
interface CacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly evictions: number;
  readonly expirations: number;
  readonly currentSize: number;
}

// -----------------------------------------------------------
// TODO: implement the LRUCache class
// -----------------------------------------------------------
export class LRUCache<K, V> {
  // TODO: declare private fields — choose your internal data
  //       structure carefully (hint: Map preserves insertion order
  //       and gives O(1) move-to-front if you manage order yourself)

  constructor(private readonly options: CacheOptions<K, V>) {
    // TODO
  }

  /**
   * Returns the cached value for key, or undefined if missing/expired.
   * Promotes the entry to MRU on a hit.
   */
  get(key: K): V | undefined {
    // TODO
    throw new Error("Not implemented");
  }

  /**
   * Inserts or updates key → value.
   * Applies ttlMs (or defaultTtlMs) to compute expiresAt.
   * Evicts LRU entry first if at capacity.
   */
  set(key: K, value: V, ttlMs?: number): void {
    // TODO
    throw new Error("Not implemented");
  }

  /**
   * Removes key from the cache.
   * Returns true if the key existed (even if expired), false otherwise.
   * Does NOT trigger onEvict.
   */
  delete(key: K): boolean {
    // TODO
    throw new Error("Not implemented");
  }

  /** Removes all entries and resets all stats counters. */
  clear(): void {
    // TODO
    throw new Error("Not implemented");
  }

  /**
   * Returns the value for key WITHOUT updating LRU order.
   * Returns undefined if missing or expired (counts as a miss in stats).
   */
  peek(key: K): V | undefined {
    // TODO
    throw new Error("Not implemented");
  }

  /** Returns an immutable snapshot of current statistics. */
  stats(): CacheStats {
    // TODO
    throw new Error("Not implemented");
  }

  // -----------------------------------------------------------
  // Private helpers — implement as many as you need
  // -----------------------------------------------------------

  /** Normalises a raw key into a branded CacheKey<K>. */
  private normalise(key: K): CacheKey<K> {
    // TODO
    throw new Error("Not implemented");
  }

  /** Returns true when entry has a defined expiresAt that is in the past. */
  private isExpired(entry: CacheEntry<V>): boolean {
    // TODO
    throw new Error("Not implemented");
  }
}

// -----------------------------------------------------------
// TODO: implement memoize
// -----------------------------------------------------------
export function memoize<Args extends readonly unknown[], R>(
  fn: (...args: Args) => R,
  cache: LRUCache<string, R>,
  keyFn: (...args: Args) => string
): (...args: Args) => R {
  // TODO
  throw new Error("Not implemented");
}
