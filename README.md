# Typed Permission Policy Evaluator

**Difficulty:** Hard

## Scenario

You're building the authorization engine for a multi-tenant SaaS platform. Raw policy documents arrive as `unknown` JSON from an admin dashboard; your engine must validate them, compile each rule into a strongly-typed decision graph, evaluate access requests against matching policies using precedence logic, and emit a discriminated-union verdict per request — with zero `any`.

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
| **Branded types** with `unique symbol` | `§1` — `TenantId`, `SubjectId`, `ResourceId`, `PolicyId` |
| **Generic brand factory** (no `any`, no `as`) | `TODO (1)` — `makeTenantId` / `makeSubjectId` etc. |
| **Discriminated unions** — `Condition`, `Verdict`, `ConditionFailure`, `ValidationError` | `§2`, `§5`, `§3` |
| **Result<T, E> monad** with fail-fast validation | `TODO (2)` — `parsePolicy` |
| **Exhaustive `switch`** with `never` guard | `TODO (3)` — `evaluateCondition`; `TODO (8)` — `formatVerdict` |
| **Type narrowing** (`unknown` → typed) | `TODO (2)` — `parsePolicy` body |
| **Mapped / utility types** (`ReadonlyArray`, `Readonly<Record<…>>`) | `§4` — `RequestContext`; `§8` — `IPolicyStore` |
| **Generic typed data structure** (`Map<TenantId, Policy[]>`) | `TODO (5)` — `PolicyStore` |
| **Template literal types** (implicit in `Action` union) | `§2` — `Action` |
| **Explicit named return type** (`BatchResult`) | `TODO (7)` — `evaluateBatch` |
| **Priority-based rule selection** logic | `TODO (6)` — `evaluate` |
| **`satisfies` / strict interface implementation** | `TODO (5)` — `PolicyStore implements IPolicyStore` |


## Bonus

Extend `evaluate` to implement a full rule-waterfall: if the highest-priority rule's conditions all fail, fall through to the next matching rule by priority, and so on, until a rule's conditions pass or all rules are exhausted.
