# Typed Distributed Circuit Breaker

**Difficulty:** Hard

## Scenario

You're building the resilience layer for a microservices gateway. Each downstream service is protected by a typed circuit breaker that transitions through states based on failure thresholds; your engine must validate raw service configs arriving as `unknown`, manage per-service breaker state machines, execute calls with retry + timeout logic, and return a strongly-typed health report — with zero `any`.

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
| **Branded types** (`ServiceId`, `Ms`) | `serviceId()` / `ms()` constructors; used in `ServiceConfig`, `BreakerRegistry` |
| **Discriminated union** narrowing | `BreakerState` (`closed` / `open` / `half-open`); `CallOutcome<T>` (`ok: true/false`) |
| **Mapped type** (`Record` with branded key) | `BreakerRegistry` — must map `ServiceId` keys to `BreakerState` |
| **Generics + inferred return type** | `call<T>(id, fn: () => Promise<T>): Promise<CallOutcome<T>>` |
| **Conditional type alias** | `ValidatedOrError<T>` used inside `initGateway` |
| **`unknown` → typed narrowing** (no `any`) | `validateServiceConfig(raw: unknown)` — every field narrowed explicitly |
| **State machine logic** | Breaker transitions in `call<T>`: closed → open → half-open → closed |
| **Concurrency / timeout** | `Promise.race` between `fn()` and a timeout promise inside `call<T>` |
| **Non-short-circuit batch validation** | `initGateway` collects all errors before building engine |
| **`satisfies` / `ReadonlyArray`** | `GatewayHealthReport.services: ReadonlyArray<ServiceHealthSnapshot>` |


## Bonus

Extend `BreakerEngine` with a `subscribe(id, listener)` method that accepts a typed listener `(event: BreakerEvent) => void` where `BreakerEvent` is a discriminated union of all state transitions, and fires it synchronously whenever a breaker changes state.
