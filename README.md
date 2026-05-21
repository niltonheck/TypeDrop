# Typed Recipe Ingredient Scaler

**Difficulty:** Easy

## Scenario

You're building the recipe engine for a meal-planning app. Raw recipe data arrives as `unknown` from a third-party nutrition API; your engine must validate it, scale ingredient quantities to a target serving count, and return a strongly-typed scaled recipe summary — with zero `any`.

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
| Branded types (`PositiveNumber`) | `PositiveNumber` type + `toPositiveNumber` helper |
| Union types (`Unit`) | `Unit` type definition |
| Readonly non-empty tuple typing | `Recipe.ingredients: readonly [Ingredient, ...Ingredient[]]` |
| Utility types (`Pick`, `Omit`, or intersection) | `ScaledIngredient` extending `Ingredient` shape |
| Discriminated union (errors) | `ValidationError` with `kind` discriminant |
| Generic discriminated union (`Result<T,E>`) | `Result` type used as return type throughout |
| `unknown` narrowing / runtime validation | `parseRecipe` — field presence and type checks |
| Type narrowing via `ok` discriminant | Callers narrow `Result` before accessing `.value` / `.error` |
| Function composition | `parseAndScale` composing `parseRecipe` + `scaleRecipe` |
| `satisfies` or `const` assertions (optional stretch) | Bonus: typed KNOWN_UNITS set for O(1) lookup |

## Bonus

Add a `formatScaledRecipe(scaled: ScaledRecipe): string` function that returns a human-readable string like `"Pancakes (×2 for 8 servings): 400g Flour, 600ml Milk, …"` — fully typed, no `any`.
