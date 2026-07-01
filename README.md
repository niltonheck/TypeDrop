# Typed API Rate Limiter with Sliding Window & Per-Client Policies

**Difficulty:** Medium

## Scenario

You're building the rate-limiting middleware for a multi-tenant REST API gateway. Raw inbound requests arrive as `unknown` from an HTTP adapter; your module must validate them into strongly-typed request descriptors, look up per-client policies from a typed registry, apply a sliding-window algorithm to track usage, and return a fully-typed allow/deny decision — with zero `any`.

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
| Discriminated union narrowing | `RateLimitDecision`, `ValidationError` — switching on `.status` / `.kind` |
| Generic `Result<T, E>` type | Return type of all four functions; callers must narrow `.ok` before accessing `.value` / `.error` |
| Union type literal constraints | `HttpMethod`, `ClientTier` — validated at runtime in `validateRequest` |
| `Map` mutation in-place | `WindowStore` (Map<string, number[]>) mutated inside `evaluateRateLimit` |
| User-defined type guard | `isAllowed(decision): decision is AllowedDecision` — [R15] |
| `Readonly<Record<…>>` utility type | `PolicyRegistry` — prevents accidental mutation of the registry |
| Runtime unknown → typed narrowing | `validateRequest(raw: unknown)` — [R1–R5] |
| Exhaustive error propagation | `processRequest` chains validation + lookup errors through the same Result type |
| Interface design with timestamps | `AllowedDecision.resetAt`, `DeniedDecision.retryAfterMs` — computed from window state |


## Bonus

Extend `RateLimitPolicy` with an optional `burstAllowance: number` field and update `evaluateRateLimit` so that a client may momentarily exceed `maxRequests` by up to `burstAllowance` extra requests, reflected in a new `"burst"` status variant on the decision union.
