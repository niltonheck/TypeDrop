# Typed LRU Cache with TTL & Typed Eviction Policy

**Difficulty:** Hard

## Scenario

You're building the in-memory caching layer for a high-traffic API gateway. Each cache can hold at most N entries; when full it evicts the Least-Recently-Used entry. Entries also carry an optional time-to-live (TTL), and the cache must report *why* a value was evicted through a strongly-typed eviction event system — all without a single `any` or unsafe cast.

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

| Skill Exercised | Where in Code |
|---|---|
| Discriminated union with generic type parameter | `EvictionReason<K>` — three members tagged by `reason` literal |
| Recursive generic type (self-referential struct) | `CacheEntry<K, V>` — `prev`/`next` fields reference the same type |
| Generic class with multiple type parameters | `LRUCache<K, V>` class and all its methods |
| Utility / mapped types (`never` replaced by real definitions) | All five `type` stubs must be filled in correctly |
| Conditional / optional fields | `expiresAt: number \| null`, `defaultTTL?`, `ttl?`, `onEvict?` |
| Discriminated union consumption (type narrowing) | `lookup()` returns `CacheResult<V>`; test narrows on `found` |
| Generic `Map<K, V>` usage without `any` | `_map: Map<K, CacheEntry<K, V>>` |
| Private method decomposition with typed parameters | `_detach`, `_insertAfterHead`, `_evict` all typed precisely |
| `satisfies` / `const` correctness (no unsafe casts except sentinel) | Only sentinel init is allowed to cast; everything else must type-check cleanly |
| Real-world data-structure implementation (doubly-linked list + hash map) | Full LRU doubly-linked list with sentinel head/tail pattern |


## Bonus

Extend the cache with a typed `entries(): IterableIterator<[K, V]>` method (using a generator) that yields only non-expired entries in MRU → LRU order, lazily evicting any expired nodes it encounters during iteration.
