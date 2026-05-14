# Typed Blog Post Tag Index

**Difficulty:** Easy

## Scenario

You're building the content-discovery layer for a blogging platform. Raw post entries arrive as `unknown` from a CMS API; your engine must validate them, build a typed reverse index from tags to posts, and return a strongly-typed tag summary report — with zero `any`.

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
| Discriminated union (`ValidationResult<T>`) | `type ValidationResult<T>` — two variants keyed on `ok: true/false` |
| Generic type parameter | `ValidationResult<T>` and its use in `validatePost` return type |
| Tuple type with rest (`[string, ...string[]]`) | `BlogPost.tags` — enforces at least one element at the type level |
| `Pick<T, K>` utility type | `TagSummary.longestPost` — selects only `id`, `title`, `wordCount` |
| `Record<K, V>` utility type | `TagIndexReport.index` — typed map from tag string to `TagSummary` |
| Type narrowing / runtime validation | `validatePost` — narrows `unknown` → `BlogPost` through guards |
| Iteration & aggregation | `buildTagIndex` — single-pass accumulation of counts, sums, and max |
| `satisfies` / strict return types | Entire pipeline — no `any`, no type assertions |


## Bonus

Extend `TagIndexReport` with a `topTags: TagSummary[]` field that lists the top 3 tags by `postCount`, breaking ties by `avgWordCount` descending.
