# Typed Job Queue with Priority Scheduling & Retry Policies

**Difficulty:** Medium

## Scenario

You're building the background job processing engine for a SaaS platform. Raw job submissions arrive as `unknown` from an HTTP API; your queue must validate them into strongly-typed job descriptors, schedule them by priority, execute them through a typed handler registry, apply per-job-kind retry policies, and return a fully-typed execution receipt — with zero `any`.

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
| Discriminated union (`Job`) | `Job`, `SendEmailJob`, `ResizeImageJob`, `GenerateReportJob` types |
| Conditional / mapped types (`PayloadOf<K>`, `HandlerRegistry`, `RetryPolicyRegistry`) | Lines defining `PayloadOf`, `HandlerRegistry`, `RetryPolicyRegistry` |
| Generic type aliases (`HandlerFn<K>`, `JobBase<K,P>`) | `HandlerFn<K>`, `JobBase<K,P>` definitions |
| `Extract` utility type | `PayloadOf<K>` — `Extract<Job, { kind: K }>["payload"]` |
| Type narrowing / type predicates | `validateJobDescriptor` — narrowing `unknown` to `JobDescriptor` per kind |
| `ReadonlyArray` + non-mutation constraint | `scheduleJobs` parameter type |
| Async/await + sequential execution | `executeJob` retry loop, `runQueue` sequential loop |
| Exhaustive dispatch without `any` | `executeJob` — kind-safe handler lookup |
| `satisfies` or `const` registry objects | Mock `handlers` and `policies` in test harness |
| Result type pattern (discriminated union) | `SuccessResult | FailureResult = ExecutionResult` |


## Bonus

Add a `runQueueConcurrent(maxConcurrent: number, ...)` overload that processes up to `maxConcurrent` jobs in parallel using `Promise.allSettled`, preserving execution-start order in the results.
