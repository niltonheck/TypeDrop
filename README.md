# Typed Expense Report Builder

**Difficulty:** Easy

## Scenario

You're building the expense-reporting layer for a travel management app. Raw expense entries arrive as `unknown` from an employee submission form; your engine must validate them, group them by category, and return a strongly-typed report summary — with zero `any`.

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
| Type predicate (`value is T`) | `isExpenseCategory` return type |
| Union type narrowing | `ValidationResult` discriminated union (`kind` field) |
| `Record<K, V>` mapped utility type | `CategorySummary` definition |
| `Set<T>` with generic type parameter | `VALID_CATEGORIES` constant |
| Discriminated union construction | `ValidationSuccess` / `ValidationFailure` interfaces |
| `unknown` → narrowed type validation | `validateExpenseEntry` parameter and body |
| Iterating over `unknown[]` safely | `buildExpenseReport` loop |
| Exhaustive key initialization | All `ExpenseCategory` keys seeded in `categorySummary` |
| Strict null / strict mode compliance | No `any`, no `!`, no `as` anywhere |


## Bonus

After `buildExpenseReport` works, add an overloaded signature so that when called with a second argument `true` the return type is `ExpenseReport & { entriesByEmployee: Record<string, ExpenseEntry[]> }`.
