# Typed API Rate Limiter with Sliding Window & Policy Registry

**Difficulty:** Medium

## Scenario

You're building the rate-limiting middleware for a multi-tenant REST API gateway. Raw policy configurations arrive as `unknown` from a remote config store; your limiter must validate them, look up the correct typed policy per tenant, track request counts in a sliding-window algorithm, and return a strongly-typed admission decision — with zero `any`.

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
| **Branded types** — `TenantId`, `RequestId`, `EpochMs` prevent primitive confusion | `asTenantId`, `asRequestId`, `asEpochMs`; all method signatures |
| **Discriminated union** — exhaustive narrowing on `RateLimitPolicy.kind` | `registerPolicy` validation branches; `admit` policy dispatch |
| **`unknown` → typed narrowing** — safe field access without `as` or `any` | `registerPolicy` parsing `raw` object |
| **`Result<T, E>` error type** — typed error paths without exceptions | `registerPolicy` return type; callers narrow on `.ok` |
| **`PolicyValidationError` discriminated union** — exhaustive error variants | `registerPolicy` error returns |
| **Mapped / utility types** — `Record<TenantId, …>` in `snapshot` return | `snapshot` method signature and implementation |
| **`Map<K, V>` with branded key** — `Map<TenantId, …>` state & policy stores | `this.state`, `this.policies` |
| **Sliding-window algorithm** — timestamp pruning, `remainingRequests`, `windowResetAt` | `admit` for `"sliding"` and `"tiered"` kinds |
| **Fixed-window algorithm** — boundary alignment, counter reset | `admit` for `"fixed"` kind |
| **Readonly + mutation discipline** — working with `readonly` arrays/fields without `any` | `TenantState` fields, timestamp log updates |

## Bonus

Extend the limiter with a generic `withPolicy<K extends RateLimitPolicy['kind']>` method that accepts a narrowed policy type parameter and returns only the admission fields relevant to that kind.
