# Typed Permission-Based Access Control Engine

**Difficulty:** Medium

## Scenario

You're building the authorization layer for a multi-tenant SaaS platform. Unknown user session tokens arrive from an authentication provider; your engine must validate them, resolve role-based permissions via a typed policy registry, and produce a strongly-typed access decision report — with zero `any`.

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
| **Template literal types** | `TODO 1` — `Permission` = `` `${Resource}:${Action}` `` |
| **Branded/nominal types** | `TODO 1` — unique symbol brand on `Permission` |
| **`Record` mapped type** | `TODO 3` — `PolicyRegistry` maps every `RoleId` to permissions |
| **`satisfies` operator** | `TODO 4` — literal registry validated without widening |
| **Runtime `unknown` narrowing** | `TODO 5` — `validateSessionToken` narrows `unknown → SessionToken` |
| **Discriminated union** | `AccessDecision` — three outcome variants used in `TODO 7` |
| **Generic mapped type** | `TODO 6` — `AccessReport<T>` maps over keys of `T` |
| **Generics + type inference** | `TODO 7` — `checkAccess<T>` preserves key names in return type |
| **`ReadonlySet` / `ReadonlyArray`** | `VALID_ROLE_IDS` constant, `PolicyRegistry` values |
| **Typed error hierarchy** | `ValidationError extends Error` with typed fields |
| **Set operations** | `TODO 8` — `diffPermissions` intersection/difference on `Permission[]` |

## Bonus

Extend `checkAccess` to accept an optional `auditLog` callback typed as `(key: keyof T, decision: AccessDecision) => void` and invoke it for every decision, preserving the narrowed key type.
