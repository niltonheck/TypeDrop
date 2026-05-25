# Typed User Permission Checker

**Difficulty:** Easy

## Scenario

You're building the access-control layer for a SaaS dashboard. Raw user session data arrives as `unknown` from a JWT-decode utility; your engine must validate it, derive a typed permission set from the user's role, and answer permission queries — with zero `any`.

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
| Mapped type (`[K in Union]`) | `PermissionMap` — TODO 1 |
| `satisfies` operator | `PERMISSIONS` declaration — TODO 2 |
| Discriminated union (`ok: true \| false`) | `ParseResult` — TODO 3 |
| `unknown` → typed narrowing (no `any`) | `parseSession` — TODO 4 |
| Custom type-guard (`v is Role`) | `isRole` helper — TODO 4-helper |
| Union literal membership check | `isRole` + `VALID_ROLES` |
| `Record<K, V>` utility type | `PermissionReport` — TODO 6 |
| `Object.fromEntries` + array `.map` | `checkAll` — TODO 6 |
| `Partial<T>` utility type | `checkAll` return type — TODO 6 |
| Pure function / single-expression body | `can` — TODO 5 |

## Bonus

Extend `checkAll` to also return the user's `role` and a derived `isExpired` boolean, keeping the return type fully inferred via `satisfies` rather than an explicit annotation.
