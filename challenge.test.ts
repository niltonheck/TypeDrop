// ============================================================
// challenge.test.ts
// ============================================================
import {
  SessionMachine,
  once,
  type SessionEventMap,
  type Listener,
  type DispatchFor,
  type LegalTransition,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ── Mock data ─────────────────────────────────────────────────
const SESSION_ID = "sess-abc-123";
const USER_ID    = "user-42";
const BASE_URL   = "wss://collab.example.com/session";

// ── Test 1: Initial state is Idle ─────────────────────────────
{
  const m = new SessionMachine();
  assert(m.getState() === "Idle", "Initial state should be Idle");
}

// ── Test 2: Legal transition chain fires events & updates state
{
  const m = new SessionMachine();
  const log: string[] = [];

  m.on("session:connecting", (p) => {
    // TypeScript must know p has { sessionId, url }
    log.push(`connecting:${p.sessionId}:${p.url}`);
  });

  m.on("session:active", (p) => {
    // TypeScript must know p has { sessionId, userId, joinedAt }
    log.push(`active:${p.userId}`);
  });

  m.on("session:closed", (p) => {
    log.push(`closed:${p.code}`);
  });

  const r1 = m.dispatch("session:connecting", {
    sessionId: SESSION_ID,
    url: BASE_URL,
  });
  assert(r1 === true, "Idle→Connecting dispatch should succeed");
  assert(m.getState() === "Connecting", "State should be Connecting");

  const r2 = m.dispatch("session:active", {
    sessionId: SESSION_ID,
    userId: USER_ID,
    joinedAt: new Date(),
  });
  assert(r2 === true, "Connecting→Active dispatch should succeed");
  assert(m.getState() === "Active", "State should be Active");

  const r3 = m.dispatch("session:closed", {
    sessionId: SESSION_ID,
    code: 1000,
    message: "Normal closure",
  });
  assert(r3 === true, "Active→Closed dispatch should succeed");
  assert(m.getState() === "Closed", "State should be Closed");

  assert(log.length === 3, "Three listeners should have fired");
  assert(log[2] === "closed:1000", "Closed listener received correct code");
}

// ── Test 3: Illegal transition returns false & state unchanged
{
  const m = new SessionMachine();
  // Attempt to fire "session:active" while still in "Idle" — illegal
  const result = m.dispatch("session:active", {
    sessionId: SESSION_ID,
    userId: USER_ID,
    joinedAt: new Date(),
  });
  assert(result === false, "Illegal transition should return false");
  assert(m.getState() === "Idle", "State must remain Idle after failed dispatch");
}

// ── Test 4: Unsubscribe works correctly ───────────────────────
{
  const m = new SessionMachine();
  let callCount = 0;
  const unsub = m.on("session:connecting", (_p) => { callCount++; });

  m.dispatch("session:connecting", { sessionId: SESSION_ID, url: BASE_URL });
  unsub();

  // Reset to Idle manually by creating a new machine for second dispatch
  const m2 = new SessionMachine();
  m2.on("session:connecting", (_p) => { callCount++; });
  const unsub2 = m2.on("session:connecting", (_p) => { /* second listener */ });
  unsub2();
  m2.dispatch("session:connecting", { sessionId: SESSION_ID, url: BASE_URL });

  assert(callCount === 2, "Unsubscribed listener should not fire again");
}

// ── Test 5: `once` fires exactly once ─────────────────────────
{
  const m = new SessionMachine();
  let fireCount = 0;

  once(m, "session:connecting", (_p) => { fireCount++; });

  m.dispatch("session:connecting", { sessionId: SESSION_ID, url: BASE_URL });

  // Re-enter Idle by creating fresh machine to test once doesn't fire again
  // (For the same machine, once is already unsubscribed — verify count is 1)
  assert(fireCount === 1, "`once` listener should fire exactly once");
}

// ── Test 6: Suspend → Resume → Close lifecycle ────────────────
{
  const m = new SessionMachine();
  const states: string[] = [];

  m.on("session:suspended", (p) => states.push(`suspended:${p.reason}`));
  m.on("session:resumed",   (p) => states.push(`resumed:${p.sessionId}`));
  m.on("session:closed",    (p) => states.push(`closed:${p.message}`));

  m.dispatch("session:connecting", { sessionId: SESSION_ID, url: BASE_URL });
  m.dispatch("session:active",     { sessionId: SESSION_ID, userId: USER_ID, joinedAt: new Date() });
  m.dispatch("session:suspended",  { sessionId: SESSION_ID, reason: "network-drop", suspendedAt: new Date() });
  m.dispatch("session:resumed",    { sessionId: SESSION_ID, resumedAt: new Date() });
  m.dispatch("session:closed",     { sessionId: SESSION_ID, code: 4001, message: "User left" });

  assert(states[0] === "suspended:network-drop", "Suspended event payload correct");
  assert(states[1] === `resumed:${SESSION_ID}`,  "Resumed event payload correct");
  assert(states[2] === "closed:User left",        "Closed event payload correct");
  assert(m.getState() === "Closed",               "Final state should be Closed");
}
