# Typed LRU Cache with Generic Constraints & Branded Keys

**Difficulty:** Easy

## Scenario

You're building a client-side cache for a recipe discovery app. Frequently-fetched recipes, user profiles, and search results all need to be memoized with an eviction policy — and each cache instance must be strongly typed to its value shape and use branded string keys to prevent accidental cross-cache lookups.

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

| Skill | Where in Code |
|---|---|
| Branded / phantom types (`Brand<K,T>`) | `Brand`, `CacheKey` type definitions |
| Generic type constraints (`TKey extends string`) | `LRUCache<TKey,TValue>`, `memoize`, `makeCacheKey` |
| Utility / mapped type composition | `Brand<K,T>` intersection pattern |
| Type narrowing & return types (`TValue \| undefined`) | `LRUCache.get` signature |
| Class with generic type parameters | `LRUCache<TKey, TValue>` class |
| Higher-order function with generics | `memoize` function signature |
| Controlled type assertion boundary | `makeCacheKey` factory (sole permitted cast) |
| Data structure usage (Map insertion-order trick) | LRU eviction logic in `set` / `get` |

## Bonus

Extend `LRUCache` with an optional `ttlMs` constructor parameter that automatically evicts entries older than the given duration on the next `get` call.
