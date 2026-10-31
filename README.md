# Typed Event Sourcing Engine with Projection & Snapshot

**Difficulty:** Hard

## Scenario

You're building the core of an event-sourced order management system. Domain events are appended to an immutable ledger, typed projections fold them into read models, and periodic snapshots checkpoint state so replays don't have to start from the beginning of time.

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

| TypeScript Skill | Where in Code |
|---|---|
| Discriminated unions (5 variants) | `OrderEvent` type — `type` tag field |
| Branded / nominal types | `OrderId`, `CustomerId`, `EventId` + constructors |
| Generic interface | `Projector<S>` interface |
| Generic class | `SnapshotStore<S>`, `buildEventStream<E>` |
| Exhaustive `switch` + `assertNever` | `OrderProjector.apply` over all `OrderEvent` variants |
| `readonly` arrays and object fields | `OrderReadModel`, `LineItem`, `Snapshot<S>`, store return types |
| `satisfies` / structural conformance | `OrderProjector implements Projector<OrderReadModel>` |
| Conditional type narrowing | `switch (event.type)` narrowing inside `apply` |
| Constrained generics (`extends`) | `buildEventStream<E extends { version: number; orderId: string }>` |
| Union literal type (`OrderStatus`) | `OrderStatus` — `"pending" \| "active" \| "shipped" \| "cancelled"` |
| `never` for exhaustiveness | `assertNever(x: never): never` used in `apply` default branch |
| Optional parameters with defaults | `snapshotInterval = 5` in `OrderAggregate` constructor |

## Bonus

Extend `OrderAggregate` with a generic `project<T>(orderId: string, projector: Projector<T>): T` method so any projector (e.g. a shipping-only read model) can be applied to the same event stream without touching the core class.
