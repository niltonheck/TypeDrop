# Typed Query Plan Optimizer

**Difficulty:** Hard

## Scenario

You're building the query execution layer for an in-browser analytics engine. Raw query descriptors arrive as unknown JSON; your optimizer must validate them, build a typed expression tree, walk it with a recursive visitor, and return a fully typed execution plan with cost estimates — with zero `any`.

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


| Skill | Where in `challenge.ts` |
|---|---|
| Discriminated union definition (`Expr`) | TODO 1 — `Expr` type alias |
| Discriminated union definition (`QueryNode`) | TODO 2 — `QueryNode` type alias |
| Generic interface (`ExprVisitor<R>`) | TODO 3 — `ExprVisitor` interface |
| Exhaustive `switch` narrowing | TODO 4 — `walkExpr` implementation |
| Recursive function with union narrowing | TODO 5 — `estimateRows` |
| Recursive tree transformation | TODO 6 — `buildPlan` |
| Runtime validation of `unknown` → typed union | TODO 7 — `parseExpr` |
| Runtime validation of `unknown` → typed union | TODO 8 — `parseQueryNode` |
| `Result<T, E>` propagation + aggregation | TODO 9 — `optimize` |
| `Extract` / `satisfies` / const generics (optional) | Anywhere in implementation |


## Bonus

Extend `walkExpr` into a full recursive `foldExpr<R>` that threads the visitor through child nodes automatically, so callers never need to recurse manually.
