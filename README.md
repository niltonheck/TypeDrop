# Typed Contact Book Aggregator

**Difficulty:** Easy

## Scenario

You're building the data layer for a personal contact book app. Contacts arrive from multiple sources (manual entry, email import, phone sync), and you need to group, search, and summarize them — with the compiler enforcing every field name, group key, and summary shape.

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

| TypeScript Skill | Where in the Code |
|---|---|
| Mapped + conditional type (`extends` check → key or `never`) | `ContactSortField` definition |
| Utility types (`Omit`, intersection `&`) | `ContactSummary` definition |
| `Record<K, V>` with a union key | `GroupedContacts` definition |
| Non-empty tuple type `[T, ...T[]]` | `searchContacts` `fields` parameter |
| Discriminated union narrowing (`ContactSource`) | `groupBySource` accumulator seeding |
| No `any`, no type assertions | Entire file |

## Bonus

Extend `searchContacts` to accept an optional `ContactSortField` parameter and return results already sorted, keeping the return type `Contact[]` and the compiler happy with no overloads.
