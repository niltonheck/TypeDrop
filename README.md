# Typed Event Sourcing Engine with Snapshot Compaction & Projection Rebuilding

**Difficulty:** Hard

## Scenario

You're building the event-sourcing core for a collaborative document platform. Domain events arrive as a discriminated union, an append-only event log must be replayed into aggregate state via typed reducers, periodic snapshots compact history for fast rebuilds, and read-model projections subscribe to specific event subsets — all with the compiler enforcing every event shape, reducer signature, and projection contract.

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
| Discriminated union (`kind` discriminant) | `DomainEvent` and all six event member types |
| Template literal type (`EventKind`) | `type EventKind = DomainEvent["kind"]` pattern |
| Conditional type (`EventByKind<K>`) | Narrowing `DomainEvent` to a single member by `kind` |
| `Omit` utility type (`EventPayload<K>`) | Stripping `kind` and `aggregateId` from an event shape |
| Generic type parameter with constraint (`Snapshot<S>`, `Reducer<S,E>`) | `Snapshot<S>`, `Reducer<S, E extends DomainEvent>`, `replayFromSnapshot<S>` |
| Exhaustive discriminated-union handling | `documentReducer` — all six `case` branches + `never` guard |
| `readonly` arrays & immutability | `EventLog.events: readonly DomainEvent[]`, `Projection.eventKinds: readonly K[]` |
| Mapped / intersection types for projection constraint | `Projection<TState, K extends EventKind>` — `handle` receives `EventByKind<K>` |
| Type guard for runtime narrowing | `runProjection` — narrowing `event.kind` against `projection.eventKinds` |
| Tuple return type | `compactLog` returns `[Snapshot<DocumentState>, EventLog]` |
| `satisfies` / `const` projection literal | `collaboratorProjection` typed as `Projection<…, "CollaboratorAdded" \| "CollaboratorRemoved">` |
| `Map` with typed values | `DocumentState.collaborators: Map<string, Role>` |

## Bonus

Extend `runProjection` to accept an optional `snapshot: { version: number; state: TState }` and skip events before `snapshot.version`, mirroring the aggregate-replay optimisation.
