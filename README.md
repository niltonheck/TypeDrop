# Typed In-Memory LRU Cache with TTL & Typed Eviction Events

**Difficulty:** Medium

## Scenario

You're building a client-side caching layer for a dashboard that fetches expensive computed metrics from a backend. The cache must evict the least-recently-used entries when it hits capacity, expire entries after a configurable TTL, and emit strongly-typed eviction events so callers can react (e.g. log, re-fetch, or update UI) without casting.

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

| Skill Exercised | Where in the Code |
|---|---|
| **Discriminated union** (`EvictionEvent<K,V>` with `reason` discriminant) | `EvictionEvent` type, `emit()` helper, all three eviction paths |
| **Generics on a class** (`LRUCache<K, V>`) | Class declaration, all method signatures, `CacheEntry<V>` |
| **Generic constraints & utility types** (`EvictionListener<K,V>`, `LRUCacheOptions`) | `on()` signature, `listeners` field type |
| **`satisfies` operator** (`DEFAULT_OPTIONS satisfies LRUCacheOptions`) | `DEFAULT_OPTIONS` constant declaration |
| **Type narrowing via discriminant** (switching on `event.reason`) | Inside `emit()` and any consumer narrowing |
| **Map-based LRU ordering** (delete-then-reinsert pattern) | `refreshEntry()`, `set()`, `get()` |
| **`number \| null` union** for optional expiry | `CacheEntry.expiresAt` field |
| **Return type `this`** for fluent chaining | `set()` return type |
| **Unsubscribe closure pattern** | `on()` return value |


## Bonus

Add a `peek(key: K): V | undefined` method that returns a value (respecting TTL) without updating the LRU order, and prove it doesn't promote an entry by writing an assertion that shows the previously-LRU entry is still evicted next.
