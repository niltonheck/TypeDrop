// =============================================================================
// Typed LRU Cache with TTL and Generational Eviction
// =============================================================================
// REQUIREMENTS
// 1. Define a `CacheSchema` type that maps string keys to arbitrary value types.
// 2. Define a branded `CacheKey<S, K>` type so that raw strings cannot be used
//    as cache keys without first being validated through `makeKey`.
// 3. Implement `makeKey<S, K>`: given a schema and a string literal, return a
//    `CacheKey<S, K>` only when K is a key of S — otherwise the call must not
//    compile.
// 4. Define a discriminated-union `CacheEvent<S>` with three variants:
//    - `{ kind: "hit";     key: keyof S; value: S[keyof S] }`
//    - `{ kind: "miss";    key: keyof S }`
//    - `{ kind: "evict";   key: keyof S; reason: EvictReason }`
//    Each variant's `value` type must be narrowed to the *exact* value type for
//    that specific key (use mapped/conditional types — not a union of all values).
// 5. Define `EvictReason` as a union of `"lru"` | `"ttl"` | `"manual"`.
// 6. Implement `createCache<S extends CacheSchema>(options: CacheOptions<S>)`:
//    returns a `Cache<S>` object (see interface below).
// 7. `Cache<S>` must expose:
//    - `get<K extends keyof S>(key: CacheKey<S, K>): S[K] | undefined`
//      Promotes the entry to MRU. Returns `undefined` and emits a "miss" event
//      if the key is absent or its TTL has expired (emit "evict" with reason
//      "ttl" before the "miss").
//    - `set<K extends keyof S>(key: CacheKey<S, K>, value: S[K], ttlMs?: number): void`
//      Inserts or updates. If inserting would exceed `capacity`, evict the LRU
//      entry first (emit "evict" with reason "lru").
//    - `delete<K extends keyof S>(key: CacheKey<S, K>): boolean`
//      Removes the entry if present; emits "evict" with reason "manual".
//      Returns true if an entry was removed.
//    - `purgeExpired(): number`
//      Scans all entries, evicts every expired one ("ttl"), returns count evicted.
//    - `snapshot(): ReadonlyMap<keyof S, S[keyof S]>`
//      Returns live (non-expired) entries as an immutable map.
//    - `stats(): CacheStats`
//      Returns cumulative hit/miss/eviction counters.
// 8. `CacheOptions<S>` must include:
//    - `capacity: number`         — maximum number of entries
//    - `defaultTtlMs?: number`    — fallback TTL (undefined = immortal)
//    - `onEvent?: (event: CacheEvent<S>) => void`  — audit-log callback
// 9. The `onEvent` callback must receive a *fully narrowed* event — callers
//    can switch on `event.kind` and access `event.value` only on `"hit"`.
// 10. No `any`, no type assertions (`as`), no `@ts-ignore`.
// =============================================================================

// ---------------------------------------------------------------------------
// Core schema + branded key
// ---------------------------------------------------------------------------

/** A record type mapping cache key names to their stored value types. */
export type CacheSchema = Record<string, unknown>;

declare const __brand: unique symbol;

/** A validated cache key carrying both the schema S and the specific key K. */
export type CacheKey<S extends CacheSchema, K extends keyof S> = K & {
  readonly [__brand]: S;
};

/**
 * Converts a plain string literal into a branded CacheKey.
 * The type parameter K must be an explicit key of S — callers that pass an
 * arbitrary `string` must not compile.
 *
 * @example
 *   const k = makeKey<MySchema, "userId">("userId");
 */
export declare function makeKey<S extends CacheSchema, K extends keyof S>(
  key: K
): CacheKey<S, K>;

// ---------------------------------------------------------------------------
// Event system
// ---------------------------------------------------------------------------

export type EvictReason = "lru" | "ttl" | "manual";

/**
 * TODO: Replace this stub with a *mapped* discriminated union so that each
 * variant's `value` (or absence thereof) is tied to the exact key type K.
 *
 * Hint: a mapped type over `keyof S` lets you write `S[K]` per-variant.
 */
export type CacheEvent<S extends CacheSchema> =
  // TODO: define hit / miss / evict variants here
  never;

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
}

// ---------------------------------------------------------------------------
// Options + Cache interface
// ---------------------------------------------------------------------------

export interface CacheOptions<S extends CacheSchema> {
  capacity: number;
  defaultTtlMs?: number;
  onEvent?: (event: CacheEvent<S>) => void;
}

export interface Cache<S extends CacheSchema> {
  get<K extends keyof S>(key: CacheKey<S, K>): S[K] | undefined;
  set<K extends keyof S>(key: CacheKey<S, K>, value: S[K], ttlMs?: number): void;
  delete<K extends keyof S>(key: CacheKey<S, K>): boolean;
  purgeExpired(): number;
  snapshot(): ReadonlyMap<keyof S, S[keyof S]>;
  stats(): CacheStats;
}

/**
 * Factory that creates a new LRU cache bound to the schema S.
 *
 * TODO: implement this function.
 */
export declare function createCache<S extends CacheSchema>(
  options: CacheOptions<S>
): Cache<S>;

// ---------------------------------------------------------------------------
// Usage sketch (must compile — do NOT change these lines)
// ---------------------------------------------------------------------------

interface AppSchema {
  userId: string;
  sessionToken: string;
  requestCount: number;
}

// Branded keys
const _userKey    = makeKey<AppSchema, "userId">("userId");
const _tokenKey   = makeKey<AppSchema, "sessionToken">("sessionToken");
const _countKey   = makeKey<AppSchema, "requestCount">("requestCount");

// @ts-expect-error — "nonExistent" is not a key of AppSchema
const _badKey = makeKey<AppSchema, "nonExistent">("nonExistent");

const _cache = createCache<AppSchema>({
  capacity: 100,
  defaultTtlMs: 60_000,
  onEvent(event) {
    // Requirement 9: narrowing must work here with no `any`
    if (event.kind === "hit") {
      // event.value must be available here
      const _v = event.value;
    }
    if (event.kind === "miss") {
      // event.value must NOT exist here — accessing it should be a type error
    }
  },
});
