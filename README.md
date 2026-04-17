# Typed Query Plan Builder

**Difficulty:** Hard

## Scenario

You're building the query planning layer for an in-memory analytics engine. Raw query descriptors arrive as unknown JSON from a REST API; your planner must validate them, compile them into a strongly-typed execution plan through a composable operator pipeline, execute each operator with typed intermediate results, and surface a discriminated-union outcome per stage — with zero `any`.

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


| Skill | Where in Code |
|---|---|
| Branded types (`FieldName`, `TableName`) | `validateQuery` — casting validated strings with `as` forbidden; must use type predicates or helper functions | 
| Discriminated unions (`PlanOperator`, `QueryError`) | `buildPlan`, `executePlan` — exhaustive `switch` over `operator.kind` |
| Generic `Result<T, E>` monad | All five core functions return `Result<…, QueryError>` |
| `OperatorExecutor<O extends PlanOperator>` generic function type | Type stub §8 — constrained generic over union member |
| Mapped type `ExecutorRegistry` over `OperatorKind` | Type stub §9 — `{ [K in OperatorKind]: OperatorExecutor<Extract<PlanOperator, { kind: K }>> }` |
| `Extract<PlanOperator, { kind: K }>` conditional narrowing | Inside `ExecutorRegistry` mapped type |
| Runtime `unknown` → branded type narrowing | `validateQuery` — all fields validated before branding |
| Operator pipeline composition | `executePlan` — linear fold over `plan.operators` with short-circuit |
| `ReadonlyMap` / `ReadonlyArray` immutability | `TableRegistry`, `ExecutionPlan`, `QueryReport` |
| `satisfies` operator (optional stretch) | `buildExecutorRegistry` — registry literal can use `satisfies ExecutorRegistry` |


## Bonus

Use the `satisfies` operator when constructing the executor object literal inside `buildExecutorRegistry` to get per-key type-checking without widening the inferred return type.
