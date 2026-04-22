# Typed API Response Cache

**Difficulty:** Medium

## Scenario

You're building the caching layer for a typed REST API client used across a large frontend monorepo. Raw responses arrive as `unknown` from fetch; your cache must validate them, store them with TTL-aware entries, and serve requests through a stale-while-revalidate strategy — with zero `any`.

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

| Skill | Where in the code |
|---|---|
| Discriminated union (`CacheStatus`) | `CacheStatus<T>` type with `status` literal field; narrowed in `get()` |
| Discriminated union (`RevalidationResult`) | `RevalidationResult<T>` with `revalidated` boolean literal; narrowed in `revalidate()` |
| Generic `Result<T, E>` type | Used as return type of `set`, `getOrFetch`, and `buildValidator` output |
| Generic classes (`TypedCache<T>`) | `TypedCache<T>` with `Map<string, CacheEntry<T>>` internal store |
| Mapped type in `buildValidator` | `shape: { [K in keyof T]: (v: unknown) => boolean }` |
| `Validator<T>` function type | Defined and threaded through `TypedCache` constructor and `buildValidator` |
| `unknown` → narrowed type (no `any`) | `buildValidator` narrows `unknown` raw input to `T` safely |
| TTL / timestamp arithmetic | `storedAt + ttl` comparison in `get()` and `purgeExpired()` |
| Async / Promise handling | `revalidate` and `getOrFetch` are async; errors caught and typed |
| Type narrowing via `ok` / `status` / `revalidated` | Discriminant checks throughout test harness and implementation |

## Bonus

Extend `TypedCache` with a `revalidateAll` method that concurrently revalidates every stale entry using `Promise.allSettled`, returning a `RevalidationResult<T>[]` with one entry per key.
