# Typed Paginated API Client with Result Handling

**Difficulty:** Medium

## Scenario

You're building the data-access layer for a developer dashboard that fetches issues from a project-management API. Responses arrive as `unknown` from a generic HTTP transport; your client must validate each page, accumulate results across pages, and return a strongly-typed aggregation report — with zero `any`.

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
| Discriminated union (`Result<T,E>`) | `parseIssue`, `parsePage` return types; `FetchError` kind variants |
| Type predicates (`value is T`) | `isIssueStatus`, `isIssuePriority` implementations |
| `unknown` → typed narrowing (no `any`) | `parseIssue`, `parsePage` — must check every field before trusting it |
| Generic types (`PageEnvelope<T>`, `Result<T,E>`) | `parsePage`, `PageFetcher`, `fetchAllIssues` |
| Utility type `Record<K, V>` with union key | `byStatus: Record<IssueStatus, Issue[]>`, `byPriority: Record<IssuePriority, Issue[]>` |
| `Extract<>` for narrowing discriminated union | Test harness (T3c); candidate may use it in `parsePage` |
| `Promise.all` for parallel page fetching | `fetchAllIssues` step b |
| Error hierarchy & exhaustive handling | `FetchError` kind variants; network vs parse vs validation |
| Typed async aggregation | Building `IssueReport` across multiple `Promise.all` results |


## Bonus

Extend `fetchAllIssues` to accept an optional `concurrencyLimit: number` parameter so that remaining pages are fetched in batches of that size rather than all at once.
