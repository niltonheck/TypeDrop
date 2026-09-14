# Typed LRU Cache with TTL Eviction & Generational Stats

**Difficulty:** Hard

## Scenario

You're building the in-process caching layer for a high-throughput API server. The cache must support generic key-value storage with a maximum capacity (LRU eviction), per-entry time-to-live (TTL) expiry, and a typed snapshot of runtime statistics — all enforced by the compiler with zero `any` or unsafe casts.

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
| Generic class with constrained type parameters `<K, V>` | `LRUCache<K, V>` class declaration |
| Branded / nominal types | `CacheKey<K>` brand, `normalise()` helper |
| Readonly interface fields | `CacheStats` — all fields `readonly` |
| Optional interface fields & method overloads | `CacheOptions.defaultTtlMs?`, `set(key, value, ttlMs?)` |
| Generic free-standing function with variadic tuple args | `memoize<Args extends readonly unknown[], R>(...)` |
| `readonly unknown[]` rest-parameter tuple constraint | `Args extends readonly unknown[]` in `memoize` |
| Conditional / union return types | `get` / `peek` returning `V \| undefined` |
| Encapsulated private state with no `any` | Internal `Map`-based LRU bookkeeping |
| Callback typing with inferred key/value generics | `onEvict?: (key: K, value: V) => void` |
| Immutable snapshot pattern | `stats()` returning `Readonly<CacheStats>` shape |

## Bonus

Add a getOrSet(key: K, factory: () => V, ttlMs?: number): V method that atomically returns the cached value or computes, stores, and returns a fresh one — with the return type inferred entirely from factory.
