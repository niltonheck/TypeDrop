# Typed Contact Directory Merger

**Difficulty:** Easy

## Scenario

You're building the import tool for a small-business CRM. Contacts arrive from two sources — an internal database and a CSV export — and you need to merge them, resolve duplicates by email, normalize phone formats, and produce a typed directory summary the compiler fully enforces.

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

| Skill | Where in Code |
|---|---|
| Template literal branded type (`NormalizedPhone`) | Return type of `normalizePhone`; field type in `MergedContact` |
| Union types (`ContactSource`, `CompletenessLevel`) | All domain interfaces; completeness logic in `mergeContacts` / `liftContact` |
| `Record<K, V>` utility type | `bySource` and `byCompleteness` fields in `DirectorySummary` |
| `ReadonlyArray<T>` | `sources` in `MergedContact`; `mergedEmails` in `DirectorySummary`; `buildDirectory` parameter |
| Discriminated narrowing without `as` | Selecting internal vs csv fields in `mergeContacts` |
| `Map<K, V>` with proper typing | `directory` return value in `buildDirectory` |
| Null handling without non-null assertion | `phone`, `accountId`, `company` fields defaulting to `null` |
| `satisfies` / type-safe object construction | Building `DirectorySummary` with all required keys populated |

## Bonus

Extend `DirectorySummary` with a `topCompany` field (the company name appearing most often across merged contacts, or `null` if no contacts have a company) — enforced entirely at the type level.
