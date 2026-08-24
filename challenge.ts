// ============================================================
// Typed LRU Cache with Generic Constraints & Branded Keys
// ============================================================
// GOAL: Implement a generic, strictly-typed Least-Recently-Used
// (LRU) cache that uses branded string keys and preserves the
// value type across all operations.
//
// REQUIREMENTS:
// 1. Define a `Brand<K, T>` utility that creates a branded type
//    (a string tagged with a phantom type T) so keys for different
//    caches cannot be mixed up.
//
// 2. Define the `CacheKey<T>` branded string type using Brand.
//    e.g. CacheKey<"recipe"> and CacheKey<"profile"> must be
//    mutually incompatible even though both are strings at runtime.
//
// 3. Implement `makeCacheKey<T extends string>(namespace: T, raw: string)`
//    that returns a CacheKey<T>. No `any`, no unsafe casts allowed —
//    use a type assertion ONLY in this one factory function (this is the
//    single permitted boundary between runtime strings and branded types).
//
// 4. Implement the `LRUCache<TKey extends string, TValue>` class with:
//    - constructor(capacity: number)
//    - get(key: CacheKey<TKey>): TValue | undefined
//       • Returns the cached value and marks it most-recently-used.
//       • Returns undefined on a cache miss.
//    - set(key: CacheKey<TKey>, value: TValue): void
//       • Inserts or updates the entry.
//       • If at capacity, evicts the least-recently-used entry first.
//    - delete(key: CacheKey<TKey>): boolean
//       • Removes the entry; returns true if it existed.
//    - get size(): number
//       • Returns the current number of cached entries.
//    - clear(): void
//       • Empties the cache.
//
// 5. Implement `memoize<TKey extends string, TValue>(
//       cache: LRUCache<TKey, TValue>,
//       namespace: TKey,
//       fn: (raw: string) => TValue
//    ): (raw: string) => TValue`
//    • Returns a wrapper that checks the cache before calling fn.
//    • On a miss, calls fn, stores the result, and returns it.
//    • Uses makeCacheKey internally — callers only pass plain strings.
//
// ============================================================

// TODO 1 — Define Brand<K, T>
// A branded type is a base type K intersected with a phantom object
// that carries the brand tag T (but never exists at runtime).
type Brand<K, T> = /* TODO */ never;

// TODO 2 — Define CacheKey<T extends string>
// A branded string whose phantom tag is T.
type CacheKey<T extends string> = /* TODO */ never;

// TODO 3 — Implement makeCacheKey
// HINT: The only permitted type assertion lives here.
export function makeCacheKey<T extends string>(
  namespace: T,
  raw: string
): CacheKey<T> {
  // TODO
  throw new Error("Not implemented");
}

// TODO 4 — Implement LRUCache
// HINT: A Map preserves insertion order; you can move entries to the
// "end" of a Map by deleting and re-inserting them, making the first
// entry always the least-recently-used one.
export class LRUCache<TKey extends string, TValue> {
  // TODO: add private fields

  constructor(capacity: number) {
    // TODO
    throw new Error("Not implemented");
  }

  get(key: CacheKey<TKey>): TValue | undefined {
    // TODO
    throw new Error("Not implemented");
  }

  set(key: CacheKey<TKey>, value: TValue): void {
    // TODO
    throw new Error("Not implemented");
  }

  delete(key: CacheKey<TKey>): boolean {
    // TODO
    throw new Error("Not implemented");
  }

  get size(): number {
    // TODO
    throw new Error("Not implemented");
  }

  clear(): void {
    // TODO
    throw new Error("Not implemented");
  }
}

// TODO 5 — Implement memoize
export function memoize<TKey extends string, TValue>(
  cache: LRUCache<TKey, TValue>,
  namespace: TKey,
  fn: (raw: string) => TValue
): (raw: string) => TValue {
  // TODO
  throw new Error("Not implemented");
}
