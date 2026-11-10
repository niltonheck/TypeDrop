# Typed Recipe Ingredient Scaler & Unit Converter

**Difficulty:** Medium

## Scenario

You're building the recipe engine for a meal-planning app. Recipes list ingredients with typed quantities and units, and your job is to scale them to a target serving count, convert between unit systems (metric ↔ imperial), and produce a normalized shopping list — with the compiler enforcing every unit family, conversion path, ingredient shape, and aggregated result type.

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

| Skill | Where in code |
|---|---|
| Branded types (`ServingCount`, `Quantity`) | `toServingCount`, `toQuantity`, all function signatures |
| Discriminated unions (`Measurement`) | `Measurement` type, `convertMeasurement` overloads & narrowing |
| Function overloads with `Extract<>` | `convertMeasurement` — three typed overloads |
| `satisfies` operator | `UNIT_TO_BASE satisfies Record<Unit, ...>`, `FAMILY_BASE_UNIT satisfies FamilyBaseUnit` |
| Mapped types | `FamilyBaseUnit` definition |
| `Record<K, V>` utility type | `UNIT_TO_BASE` completeness constraint |
| `ReadonlyArray<T>` | `Recipe.ingredients`, `buildShoppingList` parameter |
| Type narrowing via discriminant | `convertMeasurement` implementation, `buildShoppingList` aggregation |
| Conditional/exhaustive logic | Unit-family mismatch error in `convertMeasurement`, family suffix in `buildShoppingList` |
| Generic `Extract<>` utility | `convertMeasurement` overload signatures |

## Bonus

Extend `buildShoppingList` to accept an optional `preferredUnits: Partial<Record<Unit, Unit>>` map and re-express each final entry in the caller's preferred unit (if supplied and in the same family) instead of the raw base unit.
