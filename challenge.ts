// ============================================================
// challenge.ts — Typed LRU Cache with TTL & Eviction Events
// ============================================================
// Rules:
//   • No `any`, no `as`, no non-null assertion (`!`) outside of
//     places explicitly marked "allowed".
//   • Compile under strict: true.
//   • Complete every TODO below.
// ============================================================

// ------------------------------------------------------------------
// 1. EVICTION REASONS — discriminated union
// ------------------------------------------------------------------

/**
 * TODO: Define `EvictionReason` as a discriminated union with three
 * members, each carrying a `reason` literal tag:
 *
 *   - "capacity"  — evicted because the cache was full (LRU slot).
 *                   Extra field: `evictedKey: K`
 *   - "ttl"       — evicted because the entry's TTL expired.
 *                   Extra field: `expiredAt: number` (the timestamp it expired)
 *   - "manual"    — evicted because the caller called `delete(key)`.
 *                   No extra fields beyond the tag.
 *
 * The union must be generic over the key type K.
 */
export type EvictionReason<K> = never; // TODO

// ------------------------------------------------------------------
// 2. CACHE ENTRY — internal node for the doubly-linked list
// ------------------------------------------------------------------

/**
 * TODO: Define `CacheEntry<K, V>` — an internal doubly-linked list
 * node that stores:
 *   - key: K
 *   - value: V
 *   - expiresAt: number | null   (null = no TTL)
 *   - prev: CacheEntry<K, V> | null
 *   - next: CacheEntry<K, V> | null
 */
export type CacheEntry<K, V> = never; // TODO

// ------------------------------------------------------------------
// 3. CACHE OPTIONS
// ------------------------------------------------------------------

/**
 * TODO: Define `LRUCacheOptions<K, V>` with the following fields:
 *   - capacity: number               — max number of entries
 *   - defaultTTL?: number            — default TTL in ms (optional)
 *   - onEvict?: (                    — optional eviction listener
 *       key: K,
 *       value: V,
 *       reason: EvictionReason<K>
 *     ) => void
 */
export type LRUCacheOptions<K, V> = never; // TODO

// ------------------------------------------------------------------
// 4. SET OPTIONS — per-entry overrides
// ------------------------------------------------------------------

/**
 * TODO: Define `SetOptions` with one optional field:
 *   - ttl?: number   — per-entry TTL in ms; overrides defaultTTL
 */
export type SetOptions = never; // TODO

// ------------------------------------------------------------------
// 5. CACHE STATS — snapshot of current cache state
// ------------------------------------------------------------------

/**
 * TODO: Define `CacheStats` with:
 *   - size: number          — current number of live (non-expired) entries
 *   - capacity: number
 *   - hits: number          — lifetime get() calls that returned a value
 *   - misses: number        — lifetime get() calls that returned undefined
 *   - evictions: number     — total eviction events fired
 */
export type CacheStats = never; // TODO

// ------------------------------------------------------------------
// 6. RESULT TYPE — for safe lookups
// ------------------------------------------------------------------

/**
 * TODO: Define a generic `CacheResult<V>` as a discriminated union:
 *   - { found: true;  value: V }
 *   - { found: false }
 */
export type CacheResult<V> = never; // TODO

// ------------------------------------------------------------------
// 7. THE LRU CACHE CLASS
// ------------------------------------------------------------------

export class LRUCache<K, V> {
  // TODO: declare private fields:
  //   _capacity, _defaultTTL, _onEvict, _map, _head, _tail,
  //   _hits, _misses, _evictions
  // Hint: _map should be Map<K, CacheEntry<K, V>>
  // Hint: _head and _tail are sentinel nodes (always present, never evicted)

  constructor(options: LRUCacheOptions<K, V>) {
    // TODO: initialise all fields.
    // Create two sentinel nodes (head & tail) linked to each other.
    // Sentinels use a dummy key/value — you may cast ONLY here with
    // `as unknown as K` / `as unknown as V` (the one allowed cast).
  }

  // ----------------------------------------------------------------
  // set(key, value, options?)
  // ----------------------------------------------------------------
  /**
   * TODO: Insert or update an entry.
   * Requirements:
   *   R1. If the key already exists, update its value, reset its TTL,
   *       and move it to the MRU (most-recently-used) position.
   *   R2. If the key is new AND the cache is at capacity, evict the
   *       LRU entry (the node just before _tail sentinel) with
   *       reason "capacity".
   *   R3. Compute expiresAt from options.ttl ?? defaultTTL ?? null.
   *       null means "never expires".
   *   R4. Insert the new node at the MRU position (just after _head).
   */
  set(key: K, value: V, options?: SetOptions): void {
    // TODO
  }

  // ----------------------------------------------------------------
  // get(key) → V | undefined
  // ----------------------------------------------------------------
  /**
   * TODO: Retrieve an entry.
   * Requirements:
   *   R5. If the key does not exist → increment misses, return undefined.
   *   R6. If the entry has expired (expiresAt !== null && Date.now() >= expiresAt):
   *         - evict it with reason "ttl" (expiredAt = entry.expiresAt)
   *         - increment misses, return undefined.
   *   R7. Otherwise move the entry to MRU position, increment hits,
   *       return the value.
   */
  get(key: K): V | undefined {
    // TODO
    return undefined;
  }

  // ----------------------------------------------------------------
  // lookup(key) → CacheResult<V>
  // ----------------------------------------------------------------
  /**
   * TODO: Like get() but returns a CacheResult<V> discriminated union
   * instead of V | undefined, so callers can distinguish "miss" from
   * "value is undefined" (useful when V includes undefined).
   * Reuse the same hit/miss/eviction logic as get().
   */
  lookup(key: K): CacheResult<V> {
    // TODO
    return { found: false };
  }

  // ----------------------------------------------------------------
  // delete(key) → boolean
  // ----------------------------------------------------------------
  /**
   * TODO: Manually remove an entry.
   * Requirements:
   *   R8. If the key does not exist, return false.
   *   R9. Evict it with reason "manual", return true.
   */
  delete(key: K): boolean {
    // TODO
    return false;
  }

  // ----------------------------------------------------------------
  // has(key) → boolean
  // ----------------------------------------------------------------
  /**
   * TODO: Return true iff the key exists AND has not expired.
   * Do NOT count this call in hits/misses.
   * Expired entries should be evicted (reason "ttl") and return false.
   */
  has(key: K): boolean {
    // TODO
    return false;
  }

  // ----------------------------------------------------------------
  // stats() → CacheStats
  // ----------------------------------------------------------------
  /**
   * TODO: Return a snapshot of current cache statistics.
   * `size` must reflect only live (non-expired) entries —
   * you do NOT need to scan for expired entries here; just return
   * _map.size (expired entries are lazily evicted on access).
   */
  stats(): CacheStats {
    // TODO
    return { size: 0, capacity: 0, hits: 0, misses: 0, evictions: 0 };
  }

  // ----------------------------------------------------------------
  // clear() → void
  // ----------------------------------------------------------------
  /**
   * TODO: Remove all entries WITHOUT firing eviction events.
   * Reset hits, misses, evictions to 0.
   * Re-link head ↔ tail sentinels.
   */
  clear(): void {
    // TODO
  }

  // ----------------------------------------------------------------
  // PRIVATE HELPERS — implement these to keep the class clean
  // ----------------------------------------------------------------

  /**
   * TODO: _detach(node) — unlink a node from the doubly-linked list.
   */
  private _detach(node: CacheEntry<K, V>): void {
    // TODO
  }

  /**
   * TODO: _insertAfterHead(node) — insert a node immediately after
   * the head sentinel (MRU position).
   */
  private _insertAfterHead(node: CacheEntry<K, V>): void {
    // TODO
  }

  /**
   * TODO: _evict(node, reason) — remove from map + list, fire onEvict,
   * increment _evictions.
   */
  private _evict(node: CacheEntry<K, V>, reason: EvictionReason<K>): void {
    // TODO
  }
}
