// ============================================================
// Typed User Permission Checker
// challenge.ts — fill in every TODO, keep strict: true happy
// ============================================================

// ---------------------------------------------------------------------------
// 1. DOMAIN TYPES — complete the definitions
// ---------------------------------------------------------------------------

/** All roles a user may hold in the system. */
export type Role = "admin" | "editor" | "viewer";

/** Every discrete action a user might attempt. */
export type Action =
  | "read:content"
  | "write:content"
  | "delete:content"
  | "manage:users"
  | "view:analytics"
  | "export:data";

/**
 * TODO 1 — Define `PermissionMap` as a mapped type:
 *   • Keys   → every Role
 *   • Values → a ReadonlyArray of Action values allowed for that role
 *
 * Use a mapped type (not a plain object type) so that every Role key
 * is guaranteed to be present.
 */
export type PermissionMap = { readonly [R in Role]: ReadonlyArray<Action> };

// ---------------------------------------------------------------------------
// 2. RUNTIME PERMISSION TABLE — fill in the data
// ---------------------------------------------------------------------------

/**
 * TODO 2 — Declare `PERMISSIONS` satisfying `PermissionMap`.
 *   Rules:
 *   • "admin"  → all six actions
 *   • "editor" → read:content, write:content, view:analytics
 *   • "viewer" → read:content only
 *
 * Use the `satisfies` operator so TypeScript validates the shape but
 * keeps the literal tuple types for each array.
 */
export const PERMISSIONS = {
  admin: [
    "read:content",
    "write:content",
    "delete:content",
    "manage:users",
    "view:analytics",
    "export:data",
  ],
  editor: ["read:content", "write:content", "view:analytics"],
  viewer: ["read:content"],
} satisfies PermissionMap;

// ---------------------------------------------------------------------------
// 3. VALIDATED SESSION — discriminated union result
// ---------------------------------------------------------------------------

/** Shape of a decoded, trusted user session. */
export interface UserSession {
  readonly userId: string;
  readonly role: Role;
  readonly expiresAt: number; // Unix timestamp (ms)
}

/** TODO 3 — Define a discriminated-union Result type:
 *   • Success branch: `{ ok: true;  session: UserSession }`
 *   • Failure branch: `{ ok: false; reason: string }`
 */
export type ParseResult =
  | { ok: true; session: UserSession }
  | { ok: false; reason: string };

// ---------------------------------------------------------------------------
// 4. PARSE / VALIDATE
// ---------------------------------------------------------------------------

/**
 * TODO 4 — Implement `parseSession(raw: unknown): ParseResult`
 *
 * Requirements (numbered so the test harness can target them):
 *   4-a. `raw` must be a non-null object.
 *   4-b. `userId` must be a non-empty string.
 *   4-c. `role` must be one of the valid Role literals.
 *   4-d. `expiresAt` must be a finite number greater than Date.now().
 *        Return `{ ok: false, reason: "session expired" }` if it has
 *        already passed.
 *   4-e. On success return `{ ok: true, session }` with a typed UserSession.
 *   4-f. Never use `any` or type assertions (`as`).
 *
 * Hint: use a type-guard helper `isRole(v: unknown): v is Role` to satisfy
 * the compiler without casting.
 */

const VALID_ROLES: ReadonlyArray<Role> = ["admin", "editor", "viewer"];

function isRole(v: unknown): v is Role {
  // TODO 4-helper — return true iff v is one of the three Role literals
  return typeof v === "string" && (VALID_ROLES as ReadonlyArray<unknown>).includes(v);
}

export function parseSession(raw: unknown): ParseResult {
  // TODO 4 — implement validation following requirements 4-a … 4-f
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, reason: "raw session must be a non-null object" };
  }

  // Use an intermediate record-style access via `in` narrowing
  const rec = raw as Record<string, unknown>;

  if (typeof rec["userId"] !== "string" || rec["userId"].trim() === "") {
    return { ok: false, reason: "userId must be a non-empty string" };
  }

  if (!isRole(rec["role"])) {
    return { ok: false, reason: "role must be admin | editor | viewer" };
  }

  if (typeof rec["expiresAt"] !== "number" || !isFinite(rec["expiresAt"])) {
    return { ok: false, reason: "expiresAt must be a finite number" };
  }

  if (rec["expiresAt"] <= Date.now()) {
    return { ok: false, reason: "session expired" };
  }

  // All checks passed — build the typed session
  // TODO: replace the stub below with the real construction (no `as`)
  const session: UserSession = {
    userId: rec["userId"],
    role: rec["role"],           // narrowed to Role by isRole guard
    expiresAt: rec["expiresAt"], // narrowed to number above
  };

  return { ok: true, session };
}

// ---------------------------------------------------------------------------
// 5. PERMISSION QUERY
// ---------------------------------------------------------------------------

/**
 * TODO 5 — Implement `can(session: UserSession, action: Action): boolean`
 *
 * Requirements:
 *   5-a. Look up the allowed actions for `session.role` in `PERMISSIONS`.
 *   5-b. Return `true` iff `action` is in that list.
 *   5-c. The function must be a pure, single-expression body (one return).
 */
export function can(session: UserSession, action: Action): boolean {
  // TODO 5 — implement
  return PERMISSIONS[session.role].includes(action);
}

// ---------------------------------------------------------------------------
// 6. BATCH QUERY
// ---------------------------------------------------------------------------

/**
 * TODO 6 — Define the return type `PermissionReport` and implement
 *           `checkAll(session: UserSession, actions: ReadonlyArray<Action>)`
 *
 * Requirements:
 *   6-a. `PermissionReport` must be a mapped type over the provided `actions`
 *        array — but since array indices aren't great map keys, use
 *        `Record<Action, boolean>` restricted to only the queried actions.
 *        Concretely: return a `Record<Action, boolean>` (all keys present
 *        because callers pass exactly the actions they care about).
 *   6-b. Each key in the returned object is an Action; its value is the
 *        result of calling `can(session, action)`.
 *   6-c. Use `Object.fromEntries` + `.map` — no manual index loops.
 */
export type PermissionReport = Record<Action, boolean>;

export function checkAll(
  session: UserSession,
  actions: ReadonlyArray<Action>
): Partial<PermissionReport> {
  // TODO 6 — implement using Object.fromEntries
  return Object.fromEntries(
    actions.map((action) => [action, can(session, action)])
  ) as Partial<PermissionReport>;
}
