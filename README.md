# Typed LRU Cache with TTL and Generational Eviction

**Difficulty:** Hard

## Scenario

You're building the in-process caching layer for a high-throughput data pipeline. Each cache instance is parameterised over a strict key–value schema, enforces per-entry TTL expiry, and reports hits, misses, and evictions through a strongly-typed audit log — all verified by the compiler with zero unsafe casts.

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

| Skill exercised | Where in the code |
|---|---|
| Branded / nominal types | `CacheKey<S, K>` uses `unique symbol` brand; `makeKey` enforces key membership at compile time |
| Mapped conditional types | `CacheEvent<S>` must be built with a mapped type over `keyof S` to narrow `value` per-key |
| Discriminated unions | `CacheEvent<S>` variants discriminated on `kind`; `onEvent` narrowing in the usage sketch |
| Generic constraints (`extends`) | `createCache<S extends CacheSchema>`, `get<K extends keyof S>`, `set<K extends keyof S>` |
| `@ts-expect-error` verification | `_badKey` line proves the brand rejects invalid keys at compile time |
| Utility / lookup types | `S[K]` used as exact return type in `get` and parameter type in `set` |
| `ReadonlyMap` return type | `snapshot()` returns `ReadonlyMap<keyof S, S[keyof S]>` to prevent mutation |
| LRU eviction algorithm | `purgeExpired`, capacity-overflow eviction, MRU promotion in `get` |
| TTL tracking | Per-entry expiry timestamp; lazy eviction on `get`, eager sweep in `purgeExpired` |
| No `any` / no `as` | Entire file must compile under `strict: true` without unsafe casts |

## Bonus

Extend Cache<S> with a `getOrSet<K extends keyof S>(key: CacheKey<S,K>, loader: () => Promise<S[K]>, ttlMs?: number): Promise<S[K]>` method whose return type is inferred without any explicit annotation at the call site.
