# Typed CSV Row Parser & Aggregator

**Difficulty:** Easy

## Scenario

You're building the data-import feature for a budgeting app. Raw CSV rows arrive as plain strings; your module must parse and validate each row into a strongly-typed `Transaction` record, collect typed parse errors, and then aggregate the valid rows into a per-category `SpendingSummary` — with zero `any`.

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
| Discriminated union (`ok: true \| false`) | `ParseResult<T>` type definition |
| Generic type parameter `<T>` | `ParseResult<T>` |
| Union type narrowing (`category` guard) | `parseTransactionRow` — category validation |
| Mapped type over a union (`[K in Category]`) | `SpendingSummary` type definition |
| `Array.reduce` / aggregation | `summariseByCategory` implementation |
| Structural typing & interface design | `Transaction`, `ParseAllResult`, `SpendingSummary` |
| Runtime validation of `unknown`-shaped data | `parseTransactionRow` — all five validation rules |
| `Record`-style initialisation | Seeding all Category keys to `{ total: 0, count: 0 }` in `summariseByCategory` |

## Bonus

Extend `parseTransactionRow` to accept an optional second argument `lineNumber: number` and include it in error messages, using a function overload signature so callers without a line number get the simpler call site.
