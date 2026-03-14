# Typed Recipe Ingredient Scaler

**Difficulty:** Easy

## Scenario

You're building the recipe feature for a meal-planning app. Users can scale any recipe up or down by a multiplier, and your job is to parse raw unknown ingredient data, convert quantities to a common unit system, and return a fully typed scaled ingredient list — with zero `any`.

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
| Union types (`VolumeUnit`, `WeightUnit`, `CountUnit`) | `type VolumeUnit`, `type WeightUnit`, `type CountUnit` |
| Discriminated union with `kind` discriminant (`Unit`) | `type Unit` |
| Generic `Result<T, E>` discriminated union | `type Result<T, E>` |
| Discriminated union for typed errors (`ValidationError`) | `type ValidationError` |
| `Record<K, V>` utility type for conversion tables | `VOLUME_TO_ML`, `WEIGHT_TO_G` |
| Runtime type narrowing (`unknown` → typed) | `parseIngredient` implementation |
| Type narrowing on discriminated union (`unit.kind`) | `scaleRecipe` switch/if on `unit.kind` |
| Exhaustive handling of union members | `scaleRecipe` — all three `Unit` kinds handled |
| Optional property typing (`note?: string`) | `Ingredient`, `ScaledIngredient` interfaces |
| Strict-mode compliance (no `any`, no `as`) | Entire file |


## Bonus

Add a `formatIngredient(si: ScaledIngredient): string` function that returns a human-readable string like `"480 ml Milk"` or `"6 whole Eggs (large)"`, using template literal types to enforce the `canonicalUnit` values.
