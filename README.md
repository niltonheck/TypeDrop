# Typed Permission Policy Engine with Role Inheritance

**Difficulty:** Hard

## Scenario

You're building the authorization layer for a multi-tenant SaaS platform. Raw policy definitions arrive as `unknown` from a configuration service; your engine must validate them, resolve role inheritance chains, evaluate typed permission checks against a request context, and produce a strongly-typed authorization decision — with zero `any`.

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
| Branded types (`RoleId`, `ResourceId`, `ActionId`) | `toRoleId`, `toResourceId`, `toActionId`, all function signatures |
| Discriminated union (`PolicyError`, `Decision`) | `PolicyError` union with `kind` discriminant; `Decision` with `verdict` |
| `Result<T,E>` / `PolicyResult<T>` monad pattern | All engine functions return `PolicyResult<T>`; no throwing |
| `unknown` → typed narrowing (runtime validation) | `parsePolicy` — full structural validation without `any` |
| Mapped type (`RolePermissionMap`) | TODO 3 — mapped over `string & { __brand }` |
| Conditional + mapped type (`ExtractDenials`) | TODO 4 — filters Permission array by `effect` field |
| Recursive type resolution with cycle detection | `resolveRole` — depth-first inheritance walk with visited set |
| Generic utility type alias (`PolicyResult<T>`) | TODO 2 — shorthand for `Result<T, PolicyError>` |
| `ReadonlyMap`, `ReadonlyArray` immutability | `Policy.roles`, `Role.permissions`, `ResolvedRole` fields |
| Exhaustive error matching | `evaluateRequest` and `authorize` — all `PolicyError` kinds must be handled |


## Bonus

Implement a `buildRolePermissionMap` function that returns a `RolePermissionMap` (your mapped type from TODO 3) by resolving every role in the policy in a single pass, short-circuiting on the first `CYCLE_DETECTED` or `UNKNOWN_ROLE` error.
