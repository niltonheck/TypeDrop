# Typed Event Sourcing Engine: Commands, Projections & Snapshot Rebuilding

**Difficulty:** Hard

## Scenario

You're building the core of an event-sourced order management system. Raw commands arrive as `unknown` JSON, are validated into a discriminated-union command type, applied to produce typed domain events, and then replayed (with optional snapshot checkpoints) to rebuild the current aggregate state — the compiler must enforce every command shape, event variant, state transition, and projection result.

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
| Branded types (`Brand<T,B>`) | `OrderId`, `ProductId`, `EventSeq` — used throughout events & state |
| Discriminated unions | `DomainCommand`, `DomainEvent`, `CommandValidationError`, `ApplyError` |
| `Result<T,E>` / typed error handling | All 5 core functions return `Result<…>` |
| `Extract<>` utility type | `EventByType<T>`, `CommandHandlerMap` per-key narrowing |
| Mapped type over union keys | `CommandHandlerMap` maps each `DomainCommand["type"]` to a typed handler |
| Conditional type + `infer` / index access | `EventTypeOf<E>` indexes `E["type"]`; `EventByType<T>` uses `Extract` |
| `unknown` → typed narrowing (no `any`) | `validateCommand` must narrow `unknown` safely field by field |
| Exhaustive matching on discriminated unions | `applyEvent` must handle all 5 `DomainEvent` variants |
| Generics & `ReadonlyArray` | `events: ReadonlyArray<DomainEvent>`, `items: ReadonlyArray<OrderLineItem>` |
| Snapshot / incremental replay logic | `replayEvents` with optional `Snapshot` param filters by `seq` |


## Bonus

Implement a generic `foldEvents<S>` function with the signature `(events: ReadonlyArray<DomainEvent>, initial: S, reducer: (state: S, event: DomainEvent) => S) => S` and use it to power both `replayEvents` and `projectEventLog` internally.
