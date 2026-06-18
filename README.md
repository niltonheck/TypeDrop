# Typed GraphQL-Style Query Planner & Resolver

**Difficulty:** Hard

## Scenario

You're building the query execution layer for an in-house data-graph API. Raw query documents arrive as `unknown` from an HTTP body; your planner must validate them, resolve each field through a registry of strongly-typed resolvers, fan out leaf fetches concurrently with a concurrency cap, and return a deeply-typed response tree — with zero `any`.

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


| Skill Exercised | Where in `challenge.ts` |
|---|---|
| **Branded types** (`unique symbol`) | `ResolverPath` — prevents plain strings being used as registry keys |
| **Discriminated unions** | `FieldOutcome` (`kind: "ok" \| "error"`), `ValidationResult<T>` (`ok: true \| false`) |
| **Recursive types** | `ResponseNode` self-references; `FieldSelection.selections` is recursive; `PlanNode.children` is recursive |
| **Generic functions with type preservation** | `createConcurrencyLimiter` — `schedule<T>` must infer & return `Promise<T>` |
| **`unknown` → typed narrowing (no `any`)** | `validateQueryDocument` — full structural narrowing of raw HTTP body |
| **Mapped / utility types** | `Record<string, ScalarValue>` for args; `{ [field: string]: ResponseNode }` for response data |
| **Concurrency control** | `createConcurrencyLimiter` — queue-based slot management; fan-out in `executeQuery` |
| **Promise.all vs sequential execution** | `executeQuery` — concurrent for `query`, sequential for `mutation` root nodes |
| **Error isolation** | `executeQuery` — per-field try/catch; failures collected into `errors[]` without aborting |
| **Satisfies / const type params** | `makeResolverPath` uses `satisfies`-compatible cast guarded by runtime regex |


## Bonus

Add a `timeout` option to `executeQuery` that cancels any resolver taking longer than N milliseconds and records a `FieldError` with message `"Resolver timed out"`, using `Promise.race` and no external libraries.
