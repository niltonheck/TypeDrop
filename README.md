# Typed Retry-with-Fallback Async Executor

**Difficulty:** Medium

## Scenario

You're building the resilience layer for a microservice that calls unreliable third-party APIs. Each operation declares its own retry policy, a typed fallback strategy, and a structured error taxonomy — the compiler must enforce that fallback return types are compatible with the primary operation, that error kinds are exhaustively handled, and that the final resolved value is correctly narrowed.

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
| Discriminated union definition | `OpError` (3 variants with distinct `kind` literals) |
| Generic `Result<T, E>` type | `Result`, `Ok()`, `Err()` constructors |
| Discriminated union for strategies | `FallbackStrategy<T>` (`static` / `compute` / `rethrow`) |
| `ReadonlyArray` in type definitions | `RetryPolicy.retryOn`, `summariseResults` parameter |
| Exhaustive `never` narrowing | `classifyError` switch/if-else must cover all `OpError["kind"]` values |
| `Record<K, V>` with literal key union | `errorBreakdown: Record<OpError["kind"], number>` |
| Generic async function | `runWithRetry<T>` |
| Conditional branching on discriminated union | Fallback strategy dispatch inside `runWithRetry` |
| Type narrowing after `result.ok` check | Inside `summariseResults` and test harness |
| `interface` with generic typed members | `Operation<T>` |


## Bonus

Extend `RetryPolicy` with an optional `backoff: "fixed" | "exponential"` field and update `runWithRetry` to double the delay on each attempt when exponential backoff is selected.
