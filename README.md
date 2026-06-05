# Typed Recipe Ingredient Scaler

**Difficulty:** Easy

## Scenario

You're building the recipe engine for a meal-planning app. Raw recipe data arrives as `unknown` from a third-party nutrition API; your engine must validate it, scale each ingredient's quantity to a requested serving size, and return a strongly-typed scaled recipe — with zero `any`.

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
| Union types (`Unit`) | `type Unit = "g" \| "kg" \| ...` |
| Type guards (`value is Unit`) | `isUnit()` function |
| Discriminated union errors | `ValidationError`, `ScalingError`, `PipelineError` |
| Generic `Result<T, E>` type | All return types across all functions |
| `readonly` arrays | `UNITS: readonly Unit[]` |
| `interface` extension (`extends`) | `ScaledRecipe extends Recipe` |
| `unknown` narrowing (no `any`) | `parseIngredient`, `parseRecipe` |
| Conditional type-safe field checking | `parseRecipe` object shape validation |
| Mapped/tagged error union (`stage`) | `PipelineError` and `parseAndScale` |
| Strict null / strict mode compliance | All stubs compile under `strict: true` |


## Bonus

Add a `scaleIngredient` helper with a function overload: one overload that accepts a `Unit` and returns a full `Ingredient`, and another that accepts no unit and returns just the scaled `number`.
