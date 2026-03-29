# Typed Recipe Ingredient Scaler

**Difficulty:** Easy

## Scenario

You're building the recipe customization feature for a cooking app. Users can scale any recipe up or down by a multiplier, and your engine must validate raw ingredient inputs, convert between units, and return a fully typed scaled recipe — with zero `any`.

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
| Discriminated union (`UnitGroup`) | `UnitGroup` type definition — `kind` discriminant separates `VolumeUnit` from `WeightUnit` |
| Branded primitive types | `Multiplier` and `IngredientName` — prevent raw numbers/strings from being passed without validation |
| Generic `Result<T, E>` type | `parseIngredient` return type; used throughout for safe error propagation |
| Type narrowing with `Set` membership | `VOLUME_UNITS.has()` / `WEIGHT_UNITS.has()` in `parseIngredient` to narrow `unknown → UnitGroup` |
| `unknown` input narrowing | `RawIngredient` fields are all `unknown`; must narrow to `string`/`number` before use |
| `interface` extension (`ScaledIngredient extends Ingredient`) | `scaleIngredient` return type adds `scaledBy` to the base `Ingredient` shape |
| Utility pattern — index-tagged failures | `ScaledRecipeResult.failures` array preserves original index alongside the typed error |
| Strict null discipline | `makeMultiplier` / `makeIngredientName` return `T \| null`; callers must handle the null branch |

## Bonus

Extend `scaleRecipe` to also accept a `targetUnit` option that converts the scaled quantity into a different unit within the same `UnitGroup` (e.g. cups → ml), using a typed conversion table with no `any`.
