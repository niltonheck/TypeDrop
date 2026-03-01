// ============================================================
// Typed Distributed Cache with TTL & Eviction Policies
// challenge.ts
// ============================================================
// Requirements:
//   1. Define a `CacheSchema` generic that maps namespace keys to their
//      value types. All namespace keys must be string literals.
//   2. Define discriminated-union `EvictionPolicy` types:
//      - "lru"  → { kind: "lru"; maxSize: number }
//      - "ttl"  → { kind: "ttl"; defaultTtlMs: number }
//      - "none" → { kind: "none" }
//   3. Define a `NamespaceConfig<V>` that carries the eviction policy
//      and an optional `serialize` / `deserialize` pair typed to V.
//   4. Implement `createCacheOrchestrator<S extends CacheSchema>(
//        configs: NamespaceConfigs<S>
//      ): CacheOrchestrator<S>`
//      The returned orchestrator must expose:
//        - `set<K extends keyof S>(ns: K, key: string, value: S[K], ttlMs?: number): void`
//        - `get<K extends keyof S>(ns: K, key: string): S[K] | undefined`
//        - `delete<K extends keyof S>(ns: K, key: string): boolean`
//        - `invalidateNamespace<K extends keyof S>(ns: K): void`
//        - `stats<K extends keyof S>(ns: K): NamespaceStats`
//   5. `get` must honour TTL expiry: expired entries must return `undefined`
//      and be lazily removed from the store.
//   6. For "lru" policy, `get` and `set` must maintain LRU order; when
//      `maxSize` is exceeded on `set`, evict the least-recently-used entry.
//   7. For "ttl" policy, if no per-entry `ttlMs` is passed to `set`, fall
//      back to `defaultTtlMs` from the policy config.
//   8. `NamespaceStats` must be a readonly type with:
//        - `size: number`          — current live (non-expired) entry count
//        - `hits: number`          — lifetime cache hits
//        - `misses: number`        — lifetime cache misses
//        - `evictions: number`     — lifetime eviction count
//   9. `NamespaceConfigs<S>` must be a mapped type over `S` so that each
//      namespace key maps to a `NamespaceConfig` typed to the correct value.
//  10. Use a branded type `CacheKey` (string & { readonly __brand: "CacheKey" })
//      and expose a helper `cacheKey(raw: string): CacheKey` so callers can
//      construct validated keys (min 1 char, max 128 chars — throw otherwise).
// ============================================================

// --------------- Branded type --------------------------------

export type CacheKey = string & { readonly __brand: "CacheKey" };

/** Validates length (1–128) and returns a branded CacheKey. Throws on violation. */
export function cacheKey(raw: string): CacheKey {
  // TODO: validate length, then return raw as CacheKey
  throw new Error("Not implemented");
}

// --------------- Eviction policies --------------------------

export type EvictionPolicy =
  // TODO: define the three discriminated-union members (lru / ttl / none)
  never;

// --------------- Schema & config types ----------------------

/**
 * A schema is a plain object type whose keys are namespace names
 * and whose values are the cached value types for that namespace.
 * Example: { users: User; sessions: Session }
 */
export type CacheSchema = Record<string, unknown>;

/**
 * Per-namespace configuration, parameterised on the value type V.
 * Must include:
 *   - policy: EvictionPolicy
 *   - serialize?:   (value: V) => string
 *   - deserialize?: (raw: string) => V
 */
export type NamespaceConfig<V> = {
  // TODO
};

/**
 * Mapped type: for every key K in schema S, produce a NamespaceConfig<S[K]>.
 */
export type NamespaceConfigs<S extends CacheSchema> = {
  // TODO
};

// --------------- Stats --------------------------------------

export type NamespaceStats = {
  // TODO: readonly fields — size, hits, misses, evictions
};

// --------------- Orchestrator interface ---------------------

export interface CacheOrchestrator<S extends CacheSchema> {
  set<K extends keyof S>(ns: K, key: string, value: S[K], ttlMs?: number): void;
  get<K extends keyof S>(ns: K, key: string): S[K] | undefined;
  delete<K extends keyof S>(ns: K, key: string): boolean;
  invalidateNamespace<K extends keyof S>(ns: K): void;
  stats<K extends keyof S>(ns: K): NamespaceStats;
}

// --------------- Implementation -----------------------------

/**
 * Creates a fully typed cache orchestrator for the given schema.
 *
 * @param configs - A NamespaceConfigs<S> mapping each namespace to its config.
 * @returns A CacheOrchestrator<S> managing all namespaces.
 */
export function createCacheOrchestrator<S extends CacheSchema>(
  configs: NamespaceConfigs<S>
): CacheOrchestrator<S> {
  // TODO: implement internal per-namespace stores, LRU tracking, TTL expiry,
  //       eviction on maxSize exceeded, and stats counters.
  //
  // Hint: you'll likely want an internal `Entry<V>` type tracking:
  //   { value: V; expiresAt: number | null; lastUsed: number }
  //
  // Hint: for LRU ordering a Map<string, Entry<V>> preserves insertion order —
  //   delete + re-insert on access to move an entry to the "most recent" end.
  throw new Error("Not implemented");
}
