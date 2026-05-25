// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parseSession,
  can,
  checkAll,
  type UserSession,
  type Action,
} from "./challenge";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const FUTURE = Date.now() + 60_000;   // 1 minute from now
const PAST   = Date.now() - 1;        // already expired

// ---------------------------------------------------------------------------
// Test 1 — parseSession rejects obviously bad input
// ---------------------------------------------------------------------------
const t1a = parseSession(null);
console.assert(!t1a.ok, "T1a: null should fail");

const t1b = parseSession({ userId: "", role: "admin", expiresAt: FUTURE });
console.assert(!t1b.ok, "T1b: empty userId should fail");

const t1c = parseSession({ userId: "u1", role: "superuser", expiresAt: FUTURE });
console.assert(!t1c.ok, "T1c: unknown role should fail");

// ---------------------------------------------------------------------------
// Test 2 — parseSession rejects expired sessions
// ---------------------------------------------------------------------------
const t2 = parseSession({ userId: "u2", role: "viewer", expiresAt: PAST });
console.assert(!t2.ok, "T2: expired session should fail");
if (!t2.ok) {
  console.assert(
    t2.reason === "session expired",
    `T2 reason: expected "session expired", got "${t2.reason}"`
  );
}

// ---------------------------------------------------------------------------
// Test 3 — parseSession accepts a valid session
// ---------------------------------------------------------------------------
const t3 = parseSession({ userId: "u3", role: "editor", expiresAt: FUTURE });
console.assert(t3.ok, "T3: valid session should succeed");
if (t3.ok) {
  console.assert(t3.session.userId === "u3",  "T3 userId");
  console.assert(t3.session.role   === "editor", "T3 role");
}

// ---------------------------------------------------------------------------
// Test 4 — can() respects role permissions
// ---------------------------------------------------------------------------
const adminSession: UserSession = { userId: "a1", role: "admin",  expiresAt: FUTURE };
const editorSession: UserSession = { userId: "e1", role: "editor", expiresAt: FUTURE };
const viewerSession: UserSession = { userId: "v1", role: "viewer", expiresAt: FUTURE };

console.assert(can(adminSession,  "manage:users"),   "T4a: admin can manage:users");
console.assert(can(editorSession, "write:content"),  "T4b: editor can write:content");
console.assert(!can(viewerSession, "write:content"), "T4c: viewer cannot write:content");
console.assert(!can(editorSession, "delete:content"),"T4d: editor cannot delete:content");
console.assert(!can(viewerSession, "export:data"),   "T4e: viewer cannot export:data");

// ---------------------------------------------------------------------------
// Test 5 — checkAll() returns correct batch report
// ---------------------------------------------------------------------------
const actions: ReadonlyArray<Action> = ["read:content", "write:content", "delete:content"];
const report = checkAll(viewerSession, actions);

console.assert(report["read:content"]    === true,  "T5a: viewer read:content → true");
console.assert(report["write:content"]   === false, "T5b: viewer write:content → false");
console.assert(report["delete:content"]  === false, "T5c: viewer delete:content → false");

console.log("✅ All assertions passed!");
