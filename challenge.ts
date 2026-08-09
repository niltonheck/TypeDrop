// ============================================================
// Typed In-Memory LRU Cache with TTL & Typed Eviction Events
// ============================================================
// REQUIREMENTS
// 1. Implement a generic `LRUCache<K, V>` class that stores at most
//    `capacity` entries, evicting the Least-Recently-Used entry when full.
// 2. Every stored entry must carry an optional TTL (milliseconds). A `get`
//    on an expired entry must return `undefined` and trigger an
//    "expired" eviction event — as if the entry never existed.
// 3. The cache exposes an `on` method to subscribe to typed eviction events.
//    There are exactly three eviction reasons:
//      - "expired"  → entry's TTL elapsed before it was read
//      - "evicted"  → entry was displaced by a newer entry (LRU rule)
//      - "deleted"  → entry was explicitly removed via `delete(key)`
// 4. Implement all public methods listed below; do NOT add `any` or
//    type assertions (`as SomeType`) anywhere.
// 5. The `satisfies` operator must be used at least once (see TODO).
// ============================================================

// ------- Eviction event types --------------------------------

/** The three reasons an entry can leave the cache. */
export type EvictionReason = "expired" | "evicted" | "deleted";

/**
 * A discriminated union describing every possible eviction event.
 * Each variant carries the key, the value that was evicted, and the reason.
 */
export type EvictionEvent<K, V> =
  | { reason: "expired"; key: K; value: V; expiredAt: number }
  | { reason: "evicted"; key: K; value: V }
  | { reason: "deleted"; key: K; value: V };

/** Listener signature — receives the full typed event object. */
export type EvictionListener<K, V> = (event: EvictionEvent<K, V>) => void;

// ------- Cache entry (internal) ------------------------------

/** Internal representation of a stored cache entry. */
interface CacheEntry<V> {
  value: V;
  /** Absolute timestamp (Date.now()) when this entry expires, or null = no expiry. */
  expiresAt: number | null;
}

// ------- Cache options ---------------------------------------

export interface LRUCacheOptions {
  /** Maximum number of entries the cache may hold. Must be >= 1. */
  capacity: number;
  /** Default TTL in milliseconds applied to every `set` call that omits `ttl`. */
  defaultTTL?: number;
}

// TODO: declare a `DEFAULT_OPTIONS` constant using `satisfies LRUCacheOptions`
// that sets capacity = 64 and no defaultTTL.

// ------- Main class ------------------------------------------

export class LRUCache<K, V> {
  // REQUIREMENT 1 — store options and initialise internal data structures.
  // Hint: a Map preserves insertion order and gives O(1) access — use it to
  // track both the entries AND the LRU ordering in a single structure.

  // TODO: declare private fields:
  //   - options: LRUCacheOptions
  //   - store: Map<K, CacheEntry<V>>
  //   - listeners: EvictionListener<K, V>[]

  constructor(options: LRUCacheOptions) {
    // TODO: initialise fields; validate that capacity >= 1
    // (throw a RangeError with message "capacity must be >= 1" if not)
    throw new Error("Not implemented");
  }

  // REQUIREMENT 1 + 2
  /**
   * Retrieve a value by key.
   * - Returns `undefined` if the key is absent.
   * - Returns `undefined` and fires an "expired" event if the entry's TTL
   *   has elapsed; also removes the entry from the store.
   * - On a valid hit, moves the entry to the "most recently used" position.
   */
  get(key: K): V | undefined {
    // TODO
    throw new Error("Not implemented");
  }

  // REQUIREMENT 1 + 2
  /**
   * Insert or update a key-value pair.
   * @param key    - Cache key.
   * @param value  - Value to store.
   * @param ttl    - Optional TTL in ms; falls back to `options.defaultTTL`; 0 = no expiry.
   *
   * When inserting (not updating) and the store is at capacity, evict the
   * least-recently-used entry and fire an "evicted" event before inserting.
   */
  set(key: K, value: V, ttl?: number): this {
    // TODO
    throw new Error("Not implemented");
  }

  // REQUIREMENT 3
  /**
   * Explicitly remove an entry.
   * Fires a "deleted" event if the key existed.
   * Returns `true` if the key was present, `false` otherwise.
   */
  delete(key: K): boolean {
    // TODO
    throw new Error("Not implemented");
  }

  // REQUIREMENT 3
  /**
   * Subscribe to eviction events.
   * Returns an unsubscribe function — calling it removes this listener.
   */
  on(listener: EvictionListener<K, V>): () => void {
    // TODO
    throw new Error("Not implemented");
  }

  // ------- Convenience helpers (also required) ---------------

  /** Returns the current number of entries (including not-yet-expired ones). */
  get size(): number {
    // TODO
    throw new Error("Not implemented");
  }

  /** Returns true if the key exists AND has not expired. */
  has(key: K): boolean {
    // TODO
    throw new Error("Not implemented");
  }

  /** Remove all entries without firing any eviction events. */
  clear(): void {
    // TODO
    throw new Error("Not implemented");
  }

  // ------- Private helpers (implement as needed) -------------

  // TODO: private emit(event: EvictionEvent<K, V>): void
  //   — calls every registered listener with the event.

  // TODO: private refreshEntry(key: K): void
  //   — moves an existing key to the end of the Map (most-recently-used position).
  //   Hint: delete from Map then re-insert preserves order.
}
