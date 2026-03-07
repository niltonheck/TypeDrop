# Typed Job Queue with Retry Logic & Concurrency Limits

**Difficulty:** Medium

## Scenario

You're building the background job runner for a SaaS platform. Jobs arrive with different payloads and priorities, each handler is typed to its payload, and the runner must enforce a concurrency cap, retry failed jobs with exponential back-off, and report a typed summary when the queue drains.

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

| Skill | Where in the code |
|---|---|
| Discriminated union types | `Job<T>`, `EmailJob`/`ReportJob`/`WebhookJob`, `AnyJob` |
| Generic types | `Job<T>`, `JobHandler<T>` |
| Mapped types | `JobRegistry` mapped over `JobKind` |
| Conditional types | `PayloadFor<K>` resolving payload per kind |
| Utility type (`Extract`) | Test harness: narrowing `JobOutcome` variants |
| Typed async functions | `JobHandler<T>` signature, `run()` return type |
| Concurrency limiting | Promise-slot pool in `createJobRunner` |
| Retry with exponential back-off | Retry loop in `createJobRunner` |
| `satisfies` / registry dispatch | Type-safe handler lookup without casting |
| Strict-mode compliance | No `any`, no type assertions throughout |

## Bonus

Extend `JobRunner` with a `drain(timeoutMs: number): Promise<RunSummary>` overload that rejects with a typed `QueueTimeoutError` if the queue hasn't fully drained within the given window.
