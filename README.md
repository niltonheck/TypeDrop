# Typed API Rate Limiter: Token Buckets, Throttled Fetch & Retry Orchestration

**Difficulty:** Hard

## Scenario

You're building the HTTP client layer for a SaaS dashboard that talks to multiple third-party APIs, each with its own rate-limit policy. Requests must be throttled through per-endpoint token buckets, failed requests retried with typed back-off strategies, and every outcome recorded in a strongly-typed audit log — the compiler must enforce every policy shape, request variant, retry strategy, and call result.

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
| Branded / opaque types | `EndpointId`, `RequestId`, `Milliseconds`, `Tokens` used throughout |
| Discriminated unions | `RateLimitPolicy`, `RetryStrategy`, `CallOutcome` — narrowed in every task |
| Exhaustive narrowing (never trick) | Required in `createRegistry`, `computeBackoffMs`, `tryConsume`, `buildAuditSummary` |
| Generics | `EndpointConfig<TBody, TResponse>`, `CallOutcome<TResponse>`, `dispatchWithRetry<TBody, TResponse>` |
| Utility / mapped types | `ReadonlyMap`, `ReadonlyArray` for immutable data structures |
| Dependency injection / typed callbacks | `Fetcher` and `Sleeper` function types injected into `dispatchWithRetry` |
| Async / Promise orchestration | `dispatchWithRetry` — retry loop with `await sleep(...)` |
| Single-pass aggregation | `buildAuditSummary` — one iteration over audit log entries |
| Runtime narrowing of `unknown` | `validate` callback; `tryConsume` unknown-endpoint guard |
| Exported named types | `EndpointSummary` must be explicitly defined and exported |

