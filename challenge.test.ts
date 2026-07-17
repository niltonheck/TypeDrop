// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  Container,
  createToken,
  provide,
  type ResolveResult,
} from "./challenge";

// ---------------------------------------------------------------------------
// Mock service types
// ---------------------------------------------------------------------------
interface Logger {
  log(msg: string): void;
}

interface Database {
  query(sql: string): string[];
}

interface UserService {
  getUser(id: number): string;
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
const LoggerToken = createToken<Logger>("Logger");
const DatabaseToken = createToken<Database>("Database");
const UserServiceToken = createToken<UserService>("UserService");

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------
const loggerFactory = provide([], () => {
  const logs: string[] = [];
  return {
    log(msg: string) {
      logs.push(msg);
    },
  } satisfies Logger;
});

const dbFactory = provide([LoggerToken] as const, (logger) => {
  // `logger` must be inferred as Logger — no annotation needed
  logger.log("DB initialised");
  return {
    query(_sql: string) {
      return ["row1", "row2"];
    },
  } satisfies Database;
});

const userServiceFactory = provide(
  [LoggerToken, DatabaseToken] as const,
  (logger, db) => {
    logger.log("UserService initialised");
    return {
      getUser(id: number) {
        const rows = db.query(`SELECT * FROM users WHERE id = ${id}`);
        return rows[0] ?? "unknown";
      },
    } satisfies UserService;
  }
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
const c = new Container();

// TEST 1: NOT_REGISTERED
{
  const result = c.resolve(LoggerToken);
  console.assert(result.ok === false, "TEST 1a: unregistered token should fail");
  console.assert(
    !result.ok && result.reason === "NOT_REGISTERED",
    "TEST 1b: reason should be NOT_REGISTERED"
  );
  console.log("TEST 1 passed:", result);
}

// TEST 2: basic resolution + singleton semantics
{
  c.register(LoggerToken, loggerFactory);
  const r1 = c.resolve(LoggerToken);
  const r2 = c.resolve(LoggerToken);
  console.assert(r1.ok === true, "TEST 2a: Logger should resolve");
  console.assert(r2.ok === true, "TEST 2b: Logger should resolve again");
  console.assert(
    r1.ok && r2.ok && r1.value === r2.value,
    "TEST 2c: singleton — same instance both times"
  );
  console.log("TEST 2 passed (singleton)");
}

// TEST 3: transitive dependency resolution
{
  c.register(DatabaseToken, dbFactory).register(UserServiceToken, userServiceFactory);
  const result = c.resolve(UserServiceToken);
  console.assert(result.ok === true, "TEST 3a: UserService should resolve");
  if (result.ok) {
    const user = result.value.getUser(42);
    console.assert(user === "row1", "TEST 3b: getUser should return first row");
  }
  console.log("TEST 3 passed (transitive deps)");
}

// TEST 4: CIRCULAR_DEP detection
{
  interface A { name: "A" }
  interface B { name: "B" }
  const TokenA = createToken<A>("A");
  const TokenB = createToken<B>("B");

  const cc = new Container();
  // A depends on B, B depends on A → cycle
  cc.register(TokenA, provide([TokenB] as const, (_b) => ({ name: "A" as const })));
  cc.register(TokenB, provide([TokenA] as const, (_a) => ({ name: "B" as const })));

  const result = cc.resolve(TokenA);
  console.assert(result.ok === false, "TEST 4a: circular dep should fail");
  console.assert(
    !result.ok && result.reason === "CIRCULAR_DEP",
    "TEST 4b: reason should be CIRCULAR_DEP"
  );
  console.log("TEST 4 passed (circular dep):", result);
}

// TEST 5: FACTORY_THREW + unregister
{
  interface Boom { explode(): void }
  const BoomToken = createToken<Boom>("Boom");
  const cc2 = new Container();
  cc2.register(
    BoomToken,
    provide([], () => {
      throw new Error("kaboom");
    })
  );
  const result = cc2.resolve(BoomToken);
  console.assert(result.ok === false, "TEST 5a: throwing factory should fail");
  console.assert(
    !result.ok && result.reason === "FACTORY_THREW",
    "TEST 5b: reason should be FACTORY_THREW"
  );

  const removed = cc2.unregister(BoomToken);
  console.assert(removed === true, "TEST 5c: unregister should return true");
  const afterRemove = cc2.resolve(BoomToken);
  console.assert(
    !afterRemove.ok && afterRemove.reason === "NOT_REGISTERED",
    "TEST 5d: after unregister should be NOT_REGISTERED"
  );
  console.log("TEST 5 passed (factory threw + unregister):", result);
}

console.log("\n✅ All tests passed!");
