# Typed Playlist Builder: Track Filtering, Sorting & Duration Rollup

**Difficulty:** Easy

## Scenario

You're building the core logic for a music streaming app. Users create playlists from a typed track catalogue, filter tracks by genre or mood tag, sort them by various criteria, and compute a typed duration summary — with the compiler enforcing every track shape, filter predicate, sort key, and rollup result.

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

| Skill exercised | Where in the code |
|---|---|
| Union types (`Genre`, `MoodTag`, `SortKey`, `SortOrder`) | Type definitions §1–2 |
| Interface design with optional fields | `FilterCriteria`, `DurationSummary` §3–4 |
| `satisfies` operator for type-safe literals in tests | Test harness `satisfies FilterCriteria` |
| Typed array methods (`filter`, `sort`, `reduce`) | `filterTracks`, `sortTracks`, `computeDurationSummary` |
| Null-safe field types (`longestTrack: Track \| null`) | `DurationSummary.longestTrack/shortestTrack` |
| Immutability discipline (no mutation of inputs) | All six functions |
| Template/string formatting logic under strict types | `computeDurationSummary` → `formatted` field |
| Strict-mode compatibility (no `any`, no assertions) | Entire file |

## Bonus

Extend `FilterCriteria` with an optional `artistSearch: string` field and update `filterTracks` to perform a case-insensitive substring match against `track.artist`.
