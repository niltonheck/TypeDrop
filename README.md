# Typed LRU Cache with TTL & Typed Eviction Callbacks

**Difficulty:** Medium

## Scenario

You're building the in-process caching layer for a high-traffic API server. Cached entries must expire after a configurable TTL, the cache must evict the least-recently-used entry when it reaches capacity, and callers need strongly-typed eviction callbacks so downstream systems can react (e.g. flush to disk, emit metrics) without losing the shape of the evicted value.

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
| Discriminated union (`EvictionReason`) | `EvictionReason` type, all three variants with `kind` tag |
| Generic types with constraints (`CacheEntry<V>`, `ILRUCache<K,V>`) | `CacheEntry`, `ILRUCache`, `LRUCacheOptions` |
| Generic factory function `createLRUCache<K, V>` | Function signature & implementation |
| `EvictionCallback<K,V>` — typed function type | Used in `LRUCacheOptions` and fired in set/get/delete |
| Optional properties in typed config object | `ttlMs?`, `onEvict?` in `LRUCacheOptions` |
| `Map` insertion-order trick for LRU ordering | `set()` and `get()` delete-and-reinsert pattern |
| Type narrowing via `kind` discriminant | `onEvict` call sites pass the correct variant |
| Readonly property on interface | `readonly size: number` in `ILRUCache` |
| Strict null checking — returning `V \| undefined` | `get()` return type and TTL/miss paths |


## Bonus

Extend `ILRUCache` with a `getOrSet(key: K, compute: () => V): V` method that atomically returns a cached value or computes, stores, and returns a fresh one — with full type inference on the return value.
