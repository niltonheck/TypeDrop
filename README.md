# Typed Multi-Tenant Permission Engine with Role Inheritance & Audit Trail

**Difficulty:** Hard

## Scenario

You're building the authorization core for a SaaS platform where each tenant defines its own role hierarchy, roles inherit permissions from parent roles, and every access decision is recorded in a typed, immutable audit trail. The compiler must enforce every role shape, permission grant, inheritance chain, and audit event — no escape hatches allowed.

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
| Branded primitive types | `TenantId`, `RoleId`, `UserId`, `Resource` type aliases |
| Discriminated union (3+ variants) | `AuditEvent` with `kind` discriminant |
| Discriminated union (2 variants) | `AccessResult` with `outcome` discriminant |
| Union type | `PermissionAction = "read" \| "write" \| "delete" \| "admin"` |
| `ReadonlyMap` / `ReadonlySet` / `ReadonlyArray` | `Tenant.roles`, `Tenant.users`, return types of `resolvePermissions` and `buildAuditTrail` |
| Generic callback typing | `emitEvent: (event: AuditEvent) => void` parameter |
| `Record<K, V>` with branded key | `AuditSummary.perUser: Record<UserId, …>` |
| Exhaustive discriminant matching | `summariseAudit` switch/if over `AuditEvent.kind` |
| Type narrowing via discriminant | `checkAccess` consuming `AccessResult`, event filtering in tests |
| Recursive / iterative graph walk | `resolvePermissions` inheritance chain traversal with cycle guard |


## Bonus

Extend the engine to support multi-role assignment (a user may hold several roles) and update `checkAccess` so that access is granted if *any* of the user's resolved permission sets contains the requested action — all without introducing `any`.
