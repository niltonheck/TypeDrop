# Typed Job Queue with Priority Scheduling & Retry Budgets

**Difficulty:** Medium

## Scenario

You're building the background-job engine for a SaaS platform. Jobs arrive with different priorities and payload shapes, each worker declares which job kinds it handles, and failed jobs must be retried up to a per-kind budget — all with the compiler catching mismatches before they reach production.

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
| Discriminated union (`Job`) | `EmailJob \| ResizeJob \| ReportJob`, narrowed via `kind` |
| Exhaustive `Record` mapped type (`RetryBudget`) | `Record<Job["kind"], number>` — compiler errors if a kind is missing |
| Generic interface with constrained type param | `Worker<K extends Job["kind"]>` |
| `Extract<>` utility type | `execute(job: Extract<Job, { kind: K }>)` in `Worker` |
| Generic function with bounded type parameter | `registerWorker<K extends Job["kind"]>(worker: Worker<K>)` |
| Type narrowing at runtime | Dispatching the correct `Extract`-ed job to the right worker |
| `Promise`-based async control flow | `runAll()` with sequential retry loop using `await` |
| No `any` / no type assertions | Enforced throughout stubs and test harness |


## Bonus

After `runAll` completes, expose a typed `history(): Array<{ job: Job; status: "succeeded" | "failed" | "skipped"; attempts: number }>` method on the queue object.
