# Typed Permission Policy Engine with Conditional Grants

**Difficulty:** Hard

## Scenario

You're building the authorization core for a multi-tenant SaaS platform. Every API request carries a principal (user or service account) whose access is governed by a layered policy system — role-based defaults, resource-scoped overrides, and runtime conditions — and the compiler must enforce every policy shape, decision outcome, and exhaustive condition evaluation with no escape hatches.

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


| TypeScript Skill | Where It's Exercised |
|---|---|
| **Branded / opaque types** | `PrincipalId`, `ResourceId`, `TenantId`, `PolicyId` — prevent accidental mixing of string IDs |
| **Discriminated unions** | `Condition` (7 variants), `Policy` (3 variants), `Decision` (3 variants) — narrowed exhaustively in evaluators |
| **Mapped types** | `ActionSummary` uses `{ [A in Action]: { … } }` to enforce every action key |
| **Exhaustiveness via `assertNever`** | Required in `evaluateCondition` and `evaluatePolicy` to catch unhandled variants at compile time |
| **Recursive types** | `Condition` `"all"` and `"any"` variants contain `Condition[]`, requiring recursive evaluation |
| **`readonly` / immutability** | `Principal`, `Resource`, `AuthRequest`, `AuthResult`, `ActionSummary` all use `readonly` throughout |
| **`satisfies` / strict return shapes** | `ActionSummary` return type must satisfy every `Action` key — compiler rejects partial objects |
| **Concurrency with `Promise.all`** | `batchEvaluate` wraps synchronous logic in microtasks and fans out with `Promise.all` |
| **Role comparison without `any`** | `roleAtLeast` must define a typed ordering over the `Role` union without casting |
| **Union narrowing on `effect`** | Inside `evaluatePolicy`, the `"allow" | "deny"` effect field must be narrowed to produce the correct `Decision` |


## Bonus

Extend the engine with a PolicySet builder that uses the builder pattern to compose policies with a fluent, fully-typed API (e.g. `PolicySet.for(action).withRole("editor").withCondition(...).allow()`).
