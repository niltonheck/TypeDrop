// ============================================================
// challenge.test.ts — Test harness (run with ts-node or tsx)
// ============================================================
import {
  ok, err,
  fetchAllPages, mapResult, flatMapResult,
  validateUser, validateAuditLog, validatePage,
  groupById, pipeResults,
  type Page, type ApiError, type User, type AuditLog,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
let passed = 0;
let failed = 0;
function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅ PASS — ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL — ${label}`);
    failed++;
  }
}

// ── Test 1: mapResult ────────────────────────────────────────
console.log("\n[1] mapResult");
{
  const r1 = mapResult(ok(5), (n) => n * 2);
  assert("Ok maps value", r1.kind === "ok" && r1.value === 10);

  const r2 = mapResult(err<string, string>("boom"), (s) => s.toUpperCase());
  assert("Err passes through", r2.kind === "err" && r2.error === "boom");
}

// ── Test 2: flatMapResult ────────────────────────────────────
console.log("\n[2] flatMapResult");
{
  const safeDivide = (n: number): typeof ok<number> extends (v: number) => infer R ? R : never =>
    ok(n / 2);

  const r1 = flatMapResult(ok(10), (n) => (n > 0 ? ok(n / 2) : err("negative")));
  assert("Ok flatMaps to Ok", r1.kind === "ok" && r1.value === 5);

  const r2 = flatMapResult(ok(-1), (n) => (n > 0 ? ok(n / 2) : err("negative")));
  assert("Ok flatMaps to Err", r2.kind === "err" && r2.error === "negative");

  const r3 = flatMapResult(err<number, string>("already bad"), (n) => ok(n + 1));
  assert("Err short-circuits", r3.kind === "err" && r3.error === "already bad");
}

// ── Test 3: validateUser ─────────────────────────────────────
console.log("\n[3] validateUser");
{
  const good = { id: "u1", name: "Alice", email: "alice@example.com", role: "admin" };
  const r1 = validateUser(good);
  assert("Valid user parses", r1.kind === "ok" && r1.value.name === "Alice");

  const bad = { id: 42, name: "Bob", email: "b@b.com", role: "superuser" };
  const r2 = validateUser(bad);
  assert("Invalid role/id fails", r2.kind === "err");

  const r3 = validateUser(null);
  assert("null fails", r3.kind === "err");
}

// ── Test 4: validateAuditLog ─────────────────────────────────
console.log("\n[4] validateAuditLog");
{
  const good = { id: "a1", userId: "u1", action: "login", timestamp: 1741200000000 };
  const r1 = validateAuditLog(good);
  assert("Valid audit log parses", r1.kind === "ok" && r1.value.action === "login");

  const bad = { id: "a2", userId: "u2", action: "logout" }; // missing timestamp
  const r2 = validateAuditLog(bad);
  assert("Missing timestamp fails", r2.kind === "err");
}

// ── Test 5: fetchAllPages ────────────────────────────────────
console.log("\n[5] fetchAllPages");
(async () => {
  // Mock: 3 pages of users
  const pages: Page<User>[] = [
    { items: [{ id: "u1", name: "Alice", email: "a@a.com", role: "admin" }],  nextCursor: "c1", total: 3 },
    { items: [{ id: "u2", name: "Bob",   email: "b@b.com", role: "viewer" }], nextCursor: "c2", total: 3 },
    { items: [{ id: "u3", name: "Carol", email: "c@c.com", role: "editor" }], nextCursor: null,  total: 3 },
  ];
  let call = 0;
  const fetcher = async (_cursor: string | null) => ok(pages[call++]);
  const result = await fetchAllPages(fetcher);
  assert("Accumulates all items", result.kind === "ok" && result.value.length === 3);
  assert("Sequential: correct order", result.kind === "ok" && result.value[1].name === "Bob");

  // Mock: error on second page
  call = 0;
  const errFetcher = async (_cursor: string | null) => {
    if (call++ === 0) return ok(pages[0]);
    return err<Page<User>, ApiError>({ kind: "network", message: "timeout" });
  };
  const errResult = await fetchAllPages(errFetcher);
  assert("Stops on first error", errResult.kind === "err" && errResult.error.kind === "network");
})();

// ── Test 6: validatePage ─────────────────────────────────────
console.log("\n[6] validatePage");
{
  const rawPage = {
    items: [{ id: "u1", name: "Alice", email: "alice@example.com", role: "admin" }],
    nextCursor: null,
    total: 1,
  };
  const r1 = validatePage(rawPage, validateUser);
  assert("Valid page parses", r1.kind === "ok" && r1.value.items.length === 1);

  const badPage = { items: [{ id: 99 }], nextCursor: null, total: 1 };
  const r2 = validatePage(badPage, validateUser);
  assert("Invalid item fails page", r2.kind === "err");
}

// ── Test 7: groupById ────────────────────────────────────────
console.log("\n[7] groupById");
{
  const users: User[] = [
    { id: "u1", name: "Alice", email: "a@a.com", role: "admin" },
    { id: "u2", name: "Bob",   email: "b@b.com", role: "viewer" },
  ];
  const map = groupById(users);
  assert("Lookup by id works", map.get("u1")?.name === "Alice");
  assert("Missing id is undefined", map.get("u99") === undefined);

  const logs: AuditLog[] = [
    { id: "l1", userId: "u1", action: "login", timestamp: 1000 },
  ];
  const logMap = groupById(logs);
  assert("Works with AuditLog too", logMap.get("l1")?.action === "login");
}

// ── Test 8: pipeResults ──────────────────────────────────────
console.log("\n[8] pipeResults");
{
  const all = pipeResults([ok(1), ok(2), ok(3)]);
  assert("All Ok → Ok array", all.kind === "ok" && all.value.join(",") === "1,2,3");

  const mixed = pipeResults([ok(1), err("oops"), ok(3)]);
  assert("First Err returned", mixed.kind === "err" && mixed.error === "oops");
}

// ── Summary ──────────────────────────────────────────────────
setTimeout(() => {
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
}, 200);
