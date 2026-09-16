# Typed Job Queue with Priority Scheduling & Status Tracking

**Difficulty:** Medium

## Scenario

You're building the background job processing core for a SaaS platform. Jobs of different types (email delivery, report generation, data export) are enqueued with a priority level, processed by typed handlers, and their lifecycle — pending → running → succeeded / failed — must be tracked in a strongly-typed status ledger that the compiler fully understands.

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
| Generic types over a union constraint (`K extends JobKind`) | `Job<K>`, `JobStatus<K>`, `HandlerFn<K>`, all queue methods |
| Indexed access types (`JobPayloadMap[K]`) | `Job<K>.payload`, `enqueue` parameter |
| Discriminated union design | `JobStatus<K>` — four variants on `status` field |
| Mapped type over a union | `HandlerRegistry` mapped over `JobKind` |
| Type narrowing without unsafe casts | `processNext` — narrowing `job.kind` to call correct handler |
| `satisfies` operator | Test harness — `handlers satisfies HandlerRegistry` |
| Utility type: `Record` | `summary()` return type `Record<JobStatus<JobKind>["status"], number>` |
| Indexed access on discriminated union (`["status"]`) | `summary()` return type |
| Promise-based async flow | `processNext`, `drain` |
| Generic return narrowing | `getStatus<K>` returning `JobStatus<K> \| undefined` |

## Bonus

Extend `JobQueue` with a `retryFailed(maxAttempts: number): Promise<void>` method that re-enqueues every failed job (preserving its original kind, payload, and priority) up to `maxAttempts` times, tracked via a typed `attempts` counter on the ledger entry.
