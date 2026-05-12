# Typed Product Inventory Filter

**Difficulty:** Easy

## Scenario

You're building the catalog layer for an e-commerce platform. Raw product entries arrive as `unknown` from a third-party supplier feed; your engine must validate them, apply typed filter criteria, and return a strongly-typed filtered inventory report — with zero `any`.

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
| Discriminated union (`ValidationResult`) | `validateProduct` return type & narrowing in callers |
| Union type narrowing (`ok: true / false`) | `validateProduct` implementation + test harness |
| `satisfies` / `type Category` union | `category` field validation in `validateProduct` (R4) |
| Interface design (`Product`, `FilterCriteria`, `InventoryReport`) | All three exported interfaces |
| Optional fields (`FilterCriteria`) | `matchesFilter` — each criterion only applied when present |
| `unknown` → typed narrowing (no `as`) | `validateProduct` — raw input guarded with `typeof` / `Array.isArray` |
| Generic utility type `Extract<>` | Test harness — narrowing `ValidationResult` to the `ok: true` branch |
| Single-pass aggregation | `buildInventoryReport` — one loop collects valid/invalid + applies filter |
| Strict null & type checks | R1 null check, R6 `Number.isInteger`, R7 bounds check |


## Bonus

Extend `FilterCriteria` with a `priceRange?: { min: number; max: number }` field and update `matchesFilter` to support it, ensuring the new field is fully type-safe with no optional chaining shortcuts.
