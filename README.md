# Typed In-Memory Cache with TTL & Tagged Invalidation

**Difficulty:** Medium

## Scenario

You're building the caching layer for a multi-tenant SaaS dashboard. Data from different domains (users, products, reports) is fetched expensively and must be cached with per-entry TTLs, but operations teams also need to bulk-invalidate all entries belonging to a logical tag (e.g. wipe every "tenant:acme" entry at once). The hardest part is keeping the cache fully generic and type-safe across heterogeneous value shapes.

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

| TypeScript Skill | Where It Appears |
|---|---|
| **Branded types** | `CacheKey` intersection brand; `toCacheKey` constructor |
| **Generic interfaces** | `CacheStore<Schema extends Record<string, unknown>>` |
| **Mapped / indexed access types** | `Schema[K]` in `set`, `get`, `getOrFetch` return types |
| **Discriminated unions** | `CacheResult<V>` with `hit: true \| false` discriminant |
| **Generic type constraints** | `K extends keyof Schema` on all store methods |
| **Utility types** | `ReadonlyArray<string>` in `CacheEntry`; `Record<string, unknown>` bound |
| **Generic functions** | `createCacheStore<Schema>`, `getOrFetch<Schema, K>` |
| **Type narrowing** | Narrowing `CacheResult<V>` on `result.hit` in tests & implementation |
| **`satisfies` / explicit return annotations** | `toCacheKey` must avoid `as` while returning a branded type |

## Bonus

Extend `CacheStore` with a `sweep(): number` method that proactively removes all expired entries in a single pass and returns the count purged.
