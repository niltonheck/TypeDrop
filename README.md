# Typed Recipe Book: Ingredient Scaling & Shopping List Builder

**Difficulty:** Easy

## Scenario

You're building the core logic for a recipe app. Users save recipes with typed ingredients and serving sizes, scale them up or down for a dinner party, and merge multiple scaled recipes into a single de-duplicated shopping list — with the compiler enforcing every ingredient shape, unit, scaling result, and list entry.

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
| Union of string literal types (`Unit`) | `type Unit = "g" \| "kg" \| ...` definition |
| `readonly` modifier on interfaces and arrays | `Recipe.ingredients`, `ShoppingList`, `Ingredient` fields |
| Utility type awareness (`readonly` arrays as params) | `mergeShoppingList(recipes: readonly Recipe[])` |
| Type narrowing / discriminated lookup | Checking `unit` membership in `formatShoppingList` to decide spacing |
| Generics / built-in collection types (`Map`) | Using `Map<string, ShoppingListEntry>` as a merge accumulator |
| Strict null safety | `?.quantity` optional chain in tests; no `!` assertions allowed in impl |
| Runtime validation + typed errors | `RangeError` throw in `scaleRecipe` for invalid `targetServings` |
| `satisfies` or `const` assertions (optional stretch) | Can use `satisfies Unit` when constructing entries |

## Bonus

As a stretch goal, add a `convertUnit` function with overloads that converts between compatible units (e.g. `g` → `kg`, `ml` → `l`) and integrate it into `mergeShoppingList` so that `500g` and `0.5kg` of the same ingredient are merged into one entry.
