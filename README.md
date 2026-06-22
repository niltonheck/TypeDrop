# Typed Workflow Orchestrator with Dependency Resolution & Typed Step Registry

**Difficulty:** Hard

## Scenario

You're building the execution engine for a low-code automation platform. Raw workflow definitions arrive as `unknown` from a user-uploaded JSON file; your orchestrator must validate them, topologically sort steps by their declared dependencies, execute each step through a registry of strongly-typed handlers, propagate outputs between steps, and return a fully-typed execution report — with zero `any`.

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

| Skill | Where in Code |
|---|---|
| **Branded types** | `StepId`, `HandlerKind`; `toStepId` / `toHandlerKind` constructors |
| **Generics with `infer`-style inference** | `HandlerDescriptor<C, O>` — C and O flow from `validate` return → `execute` parameter |
| **Mapped types** | `HandlerRegistry` index signature over `HandlerKind` keys |
| **Discriminated unions** | `StepResult = StepSuccess \| StepFailure` narrowed via `status` field |
| **Conditional / computed `overallStatus`** | `runWorkflow` — derives `"completed" \| "partial" \| "failed"` from result array |
| **`unknown` → typed narrowing (no `any`)** | `validateWorkflow` — full structural guard before casting |
| **Result\<T,E\> pattern** | `StepSuccess<O>` / `StepFailure` / `WorkflowReport` |
| **`Promise.allSettled` for concurrent waves** | `runWorkflow` R12 — intra-wave steps run concurrently |
| **Topological sort with cycle detection** | `topologicalSort` — Kahn's algorithm, throws on cycle |
| **`satisfies` operator** | Test harness — registry object `satisfies HandlerRegistry` |

## Bonus

Extend `WorkflowReport` with a `durationMs` field per step by recording `performance.now()` timestamps around each `execute` call, using a mapped type `StepTiming` so the field is only present on `StepSuccess` results.
