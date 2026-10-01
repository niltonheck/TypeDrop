# Typed Recipe Ingredient Scaler

**Difficulty:** Easy

## Scenario

You're building the core logic for a recipe app that lets users scale ingredient quantities up or down. Given a recipe with strongly-typed ingredients and units, the app must produce a scaled version with correctly adjusted amounts and a human-readable shopping list — all verified by the compiler.

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
| Utility type (`Readonly` / mapped type) to derive `ScaledIngredient` from `Ingredient` | `ScaledIngredient` type definition |
| Interface completion with correct field types | `ScaleResult` interface |
| Discriminated union construction & narrowing | `ShoppingListEntry`, `toShoppingList` implementation |
| `Exclude<Unit, "whole">` utility type usage | `ShoppingListEntry["measured"].unit` field |
| Type narrowing without casts (`unit === "whole"` guard) | `toShoppingList` function body |
| `readonly` arrays and immutability hygiene | `Recipe.ingredients`, `ScaleResult.ingredients` |
| `Map` usage for O(n) keyed aggregation | `mergeShoppingLists` implementation |
| `RangeError` throwing with guard condition | `scaleRecipe` validation |


## Bonus

Extend `mergeShoppingLists` to accept a rest parameter (`...lists: ShoppingListEntry[][]`) so it can merge any number of shopping lists in a single call.
