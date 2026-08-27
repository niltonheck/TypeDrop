# Typed GraphQL-Style Query Builder with Conditional Field Selection & Recursive Inference

**Difficulty:** Hard

## Scenario

You're building the typed query layer for an internal developer portal that fetches data from a REST API mirroring a GraphQL-like selection model. Consumers describe *exactly* which fields they want at compile time — including nested relations — and the return type must reflect only those selected fields, nothing more and nothing less.

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
| Mapped types with key remapping | `SelectionSet<T>` — maps every key to `true` or nested selection |
| Conditional types branching on scalar vs object | `SelectionSet<T>` — `NonNullable<T[K]> extends object` branch |
| Recursive conditional/mapped types | `Selected<T, S>` — recurses into nested objects and array elements |
| `infer` inside conditional types | `UnwrapArray<T>` — `T extends ReadonlyArray<infer E>` |
| Generic constraints (`S extends SelectionSet<T>`) | `stripToSelection`, `buildQuerySync`, `buildQuery` signatures |
| `satisfies` operator for type-safe literals | Test harness — `flatSelection satisfies SelectionSet<User>` |
| Recursive runtime logic matching recursive types | `stripToSelection` — mirrors the type-level recursion at runtime |
| `Promise`-based async with full type preservation | `buildQuery` — async fetcher + pruning pipeline |
| Strict mode compliance (no `any`, no `as`) | Entire file — enforced by constraint |
| Array type narrowing through selection | `Selected<T, S>` — array branch wraps element in `Array<Selected<…>>` |

## Bonus

Extend `SelectionSet` and `Selected` to support aliased fields — e.g. `{ myCity: { __field: 'city' } }` — so the result object uses the alias as the key name while still being fully type-safe.
