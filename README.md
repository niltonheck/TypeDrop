# Typed GraphQL-Style Query Planner & Result Assembler

**Difficulty:** Hard

## Scenario

You're building the query engine for a lightweight data-fetching layer that mimics GraphQL's selection-set model. Clients declare a typed selection tree over a known schema, the planner resolves which fields to fetch from which data sources, and the assembler stitches resolved fragments into a final result whose shape is entirely derived from the selection — all enforced by the compiler with no escape hatches.

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
| Mapped types with conditional branches | `SelectionSet<E>` — maps scalar/object/list fields to different value types |
| Deep conditional types + `infer` | `ResolvedResult<E, S>` — infers nested schemas and scalar TS types per field |
| Recursive generic types | `ResolvedResult`, `QueryPlan`, `buildPlan` — all recurse through nested entity schemas |
| `satisfies` operator | Test harness schema/selection declarations; optional use in `executePlan` body |
| Utility type helpers (mapped extract) | `NestedKeys<E>` — filters entity keys to only object/list fields |
| Generic function constraints | `buildPlan<E,S>`, `executePlan<E,S>`, `getField<E,S,K>` with multi-level bounds |
| Indexed access types | `ResolvedResult<E,S>[K]` as the return type of `getField` |
| Promise.all for parallel async | `executePlan` requirement #6 — parallel nested fetches per record |
| Discriminated union narrowing | `FieldDescriptor` (`kind: "scalar" | "object" | "list"`) narrowed in resolvers and executor |
| `ScalarToTS` conditional type | Maps `"string" | "number" | "boolean" | "date"` tags to runtime TS types |


## Bonus

Extend `SelectionSet` to support field aliases — e.g. `{ titleAlias: { field: "title", select: true } }` — and propagate the alias keys through `ResolvedResult`.
