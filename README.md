# Typed LRU Cache with TTL, Generics & Branded Keys

**Difficulty:** Hard

## Scenario

You're building the in-process caching layer for a multi-tenant SaaS platform. Every service — user sessions, feature flags, rate-limit counters — needs a cache that evicts the least-recently-used entry when full, respects per-entry TTLs, and enforces that keys are branded strings so callers can't accidentally mix cache namespaces at the type level.

## How to solve

1. Open `challenge.ts`
2. Implement the types and functions marked with `TODO`
3. Verify your solution using one of the methods below

### In CodeSandbox (recommended)

1. Click the **Open Devtool** icon in the top-right corner (or press `Ctrl + \``)
2. In the Devtools panel, click **Type Check + Run Tests** to validate your solution
3. For `console.log` output and assertion results, open your **browser DevTools** (`F12` > Console tab)

### Locally

```bash
npm install
npm test    # runs tsc --noEmit && tsx challenge.test.ts
```

## Evaluation Checklist


| Skill | Where in challenge.ts |
|---|---|
| Branded / nominal types (`Brand<Base, Tag>`) | `Brand`, `SessionKey`, `FeatureFlagKey`, `RateLimitKey` |
| Type-safe factory functions returning branded types | `sessionKey()`, `featureFlagKey()`, `rateLimitKey()` |
| Generic interfaces with constrained type parameters | `LRUCacheOptions<K extends string, V>`, `CacheEntry<V>` |
| Discriminated union with exhaustive variants | `CacheResult<V>` (`"hit"` / `"miss"` / `"expired"`) |
| Generic class with branded type parameter constraint | `LRUCache<K extends string, V>` |
| Mapped types in return position | `createNamespacedCaches` return type |
| Conditional / inferred types for per-namespace cache typing | `createNamespacedCaches` mapped return |
| Readonly utility type on returned object | `stats(): Readonly<CacheStats>` |
| O(1) doubly-linked-list LRU implementation | `CacheEntry<V>` `prev`/`next` pointers, `set`/`get` logic |
| TTL / time-based expiry logic | `set` (compute `expiresAt`), `get` (compare `Date.now()`) |


## Bonus

Extend `LRUCache` with a generic `getOrSet(key: K, loader: () => Promise<V>, opts?: SetOptions): Promise<V>` method that atomically fetches and caches a missing or expired value, ensuring only one in-flight loader runs per key (coalescing concurrent calls).
