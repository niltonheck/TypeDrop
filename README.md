# Typed Event Stream Aggregator

**Difficulty:** Medium

## Scenario

You're building the real-time analytics engine for a live-streaming platform. Raw events arrive as unknown JSON blobs from multiple sources; your engine must validate them, fan out processing concurrently with a limit, and aggregate per-stream statistics into a fully typed report — with zero `any`.

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
| **Branded types** (`Brand<T, B>`) | `EventId`, `StreamId`, `TimestampMs` declarations; used throughout `StreamEvent` and `StreamStats` |
| **Discriminated union** (`Result<T, E>`) | `validateEvent` return type, `lookupStream` return type |
| **Type guards** (user-defined `x is Brand<…>`) | Inside `validateEvent` to safely narrow `unknown` → branded types without `as` |
| **`Record<K, V>` mapped type** | `eventCounts: Record<EventKind, number>` in `StreamStats` |
| **Generics** | `Result<T, E>` declaration; `aggregateEvents` accepting a typed `EventProcessor` |
| **Utility type: `readonly` array** | `EVENT_KINDS: readonly EventKind[]` for runtime membership check |
| **Concurrency with `Promise.all`** | Batched/pool execution inside `aggregateEvents` respecting `concurrencyLimit` |
| **`Map<K, V>` with branded key** | `stats: Map<StreamId, StreamStats>` in `AggregationReport` |
| **`unknown` → typed narrowing** | All fields of `RawEvent` are `unknown`; must narrow without `any` or `as` |
| **`satisfies` / `const` best practices** | `EVENT_KINDS as const`, zero-initialised `eventCounts` record |

## Bonus

Extend `AggregationReport` with a `topStream` field typed as `StreamId | null` that identifies the stream with the highest `totalValue`, computed in a single extra pass with no additional loops.
