# Typed Recipe Ingredient Scaler

**Difficulty:** Easy

## Scenario

You're building the recipe management feature for a meal-planning app. Raw recipe data arrives as `unknown` from a user-uploaded JSON file; your engine must validate it, scale each ingredient's quantity to a requested serving size, and return a strongly-typed scaled recipe — with zero `any`.

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
| `as const` + indexed type (`typeof VALID_UNITS[number]`) | `Unit` type derived from `VALID_UNITS` |
| Type alias composition (`&`) | `ScaledRecipe = Recipe & { targetServings: number }` |
| `unknown` → typed narrowing (no `any`) | `parseIngredient`, `parseRecipe` |
| Array element validation with type predicate pattern | Loop inside `parseRecipe` |
| Template literal types | `IngredientLine` and `formatIngredient` return type |
| Mapped/utility thinking (`Omit` / spread for scaling) | `scaleRecipe` ingredient mapping |
| Strict null discipline | All functions return `T \| null` and callers must check |

## Bonus

Add a `formatRecipe` function that returns a `Map<string, IngredientLine>` keyed by ingredient name, using a single `reduce` pass over the ingredients array.
