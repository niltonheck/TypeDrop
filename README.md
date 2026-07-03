# Typed Job Queue Scheduler with Priority & Retry Policies

**Difficulty:** Medium

## Scenario

You're building the background job scheduling engine for a distributed task platform. Raw job definitions arrive as `unknown` from a message broker; your engine must validate them into strongly-typed `Job` records, schedule them according to priority tiers, apply per-job-type retry policies, and return a fully-typed dispatch plan — with zero `any`.

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
| Discriminated unions | `JobPayload` — each variant narrowed by `kind` |
| Branded types | `JobId = string & { readonly __brand: "JobId" }` |
| `Record<K, V>` utility type | `RetryPolicyMap`, `DispatchPlan.rejected`, `filters` field |
| `satisfies` operator | `retryPolicies satisfies RetryPolicyMap` in test harness; hinted for TODO |
| Conditional types | `PriorityDelayMs<P extends Priority>` — return type of `getInitialDelayMs` |
| Generic type constraints | `isPayloadOfKind<K extends JobKind>`, `filterByKind<K extends JobKind>` |
| `Extract<>` utility type | `Extract<JobPayload, { kind: K }>` in `NarrowedEntry<K>` and type predicate |
| `Omit<>` utility type | `NarrowedEntry<K>` reconstructs `ScheduledEntry` with narrowed payload |
| Result<T, E> pattern | `validateJob` returns `Result<Job, ValidationError[]>` |
| Runtime type narrowing | `validateJob` — `unknown` → `Job` with exhaustive error collection |
| Type predicates | `isPayloadOfKind` returns `value is Extract<JobPayload, { kind: K }>` |
| Sorting with typed comparators | `buildDispatchPlan` sorts by priority DESC, enqueuedAt ASC |

## Bonus

Extend `buildDispatchPlan` to accept an optional `maxConcurrency` number and group `scheduled` entries into typed execution batches of that size, returning `batches: ScheduledEntry[][]` alongside the flat `scheduled` array.
