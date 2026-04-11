# Typed Event Sourcing Ledger

**Difficulty:** Hard

## Scenario

You're building the audit-log replay engine for a fintech platform. Raw domain events arrive as unknown JSON streams; your engine must validate them, fold them into a strongly-typed account ledger via a discriminated-union event bus, and expose a typed projection API — with zero `any`.

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
| Branded types (intersection pattern) | `EventId`, `AccountId` — TODOs 1 |
| Discriminated unions (event bus) | `DomainEvent`, `ValidationError` — TODOs 2, 3, 7 |
| Generic `Result<T,E>` monad | TODO 6, used throughout validation & fold |
| `unknown` → typed narrowing (no `as`) | `parseDomainEvent`, `parseEventId`, `parseAccountId` — TODOs 8-10 |
| Exhaustive discriminated-union matching | `applyEvent` switch over `DomainEvent["type"]` — TODO 11 |
| `Map<K, V>` with branded key type | `LedgerReport.accounts: Map<AccountId, AccountProjection>` — TODO 12 |
| Mapped / index-access types | `ProjectionQuery<K>` uses `AccountProjection[K]` — TODO 14 |
| Generic function with `keyof` constraint | `queryAccounts<K extends keyof AccountProjection>` — TODO 15 |
| Single-pass `reduce` over iterator | `summariseLedger` over `Map.values()` — TODO 17 |
| `satisfies` / strict null checks | `closedAt: string \| null`, `mostActiveAccountId: AccountId \| null` |

## Bonus

Extend `buildLedger` to accept an optional `AbortSignal` and stop processing new events once the signal fires, returning a partial `LedgerReport` with an added `aborted: boolean` flag.
