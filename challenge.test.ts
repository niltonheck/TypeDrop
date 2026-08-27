// ============================================================
// challenge.test.ts — Typed GraphQL-Style Query Builder
// ============================================================
import {
  buildQuery,
  buildQuerySync,
  type SelectionSet,
  type Selected,
  type User,
  type Address,
  type Repository,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────

const mockUser: User = {
  id: "u-001",
  username: "ada_lovelace",
  email: "ada@example.com",
  age: 36,
  address: {
    street: "123 Analytical Engine Way",
    city: "London",
    country: "GB",
    postalCode: "EC1A 1BB",
  },
  repositories: [
    { id: "r-001", name: "difference-engine", isPrivate: false, starCount: 42 },
    { id: "r-002", name: "notes-on-babbage", isPrivate: true, starCount: 7 },
  ],
};

// ── Test 1: Flat scalar selection ─────────────────────────────
// Only id and username should survive.
const flatSelection = {
  id: true,
  username: true,
} satisfies SelectionSet<User>;

const flatResult = buildQuerySync(mockUser, flatSelection);

// Type-level check: these accesses must compile
const _uid: string = flatResult.id;
const _uname: string = flatResult.username;

// Runtime check: only selected keys present
console.assert(flatResult.id === "u-001", "Test 1a: id should be u-001");
console.assert(
  flatResult.username === "ada_lovelace",
  "Test 1b: username should be ada_lovelace"
);
console.assert(
  !Object.prototype.hasOwnProperty.call(flatResult, "email"),
  "Test 1c: email must NOT be present"
);
console.assert(
  !Object.prototype.hasOwnProperty.call(flatResult, "age"),
  "Test 1d: age must NOT be present"
);

// ── Test 2: Nested object selection ──────────────────────────
// Select id + address.city + address.country only.
const nestedSelection = {
  id: true,
  address: {
    city: true,
    country: true,
  },
} satisfies SelectionSet<User>;

const nestedResult = buildQuerySync(mockUser, nestedSelection);

// Type-level checks
const _nid: string = nestedResult.id;
const _city: string = nestedResult.address.city;
const _country: string = nestedResult.address.country;

console.assert(nestedResult.id === "u-001", "Test 2a: id should be u-001");
console.assert(nestedResult.address.city === "London", "Test 2b: city should be London");
console.assert(nestedResult.address.country === "GB", "Test 2c: country should be GB");
console.assert(
  !Object.prototype.hasOwnProperty.call(nestedResult.address, "street"),
  "Test 2d: street must NOT be present in address"
);
console.assert(
  !Object.prototype.hasOwnProperty.call(nestedResult.address, "postalCode"),
  "Test 2e: postalCode must NOT be present in address"
);

// ── Test 3: Array of objects selection ───────────────────────
// Select username + repositories (only name + starCount per repo).
const arraySelection = {
  username: true,
  repositories: {
    name: true,
    starCount: true,
  },
} satisfies SelectionSet<User>;

const arrayResult = buildQuerySync(mockUser, arraySelection);

// Type-level checks
const _repos: Array<{ name: string; starCount: number }> = arrayResult.repositories;

console.assert(
  arrayResult.repositories.length === 2,
  "Test 3a: should have 2 repositories"
);
console.assert(
  arrayResult.repositories[0].name === "difference-engine",
  "Test 3b: first repo name correct"
);
console.assert(
  arrayResult.repositories[0].starCount === 42,
  "Test 3c: first repo starCount correct"
);
console.assert(
  !Object.prototype.hasOwnProperty.call(arrayResult.repositories[0], "isPrivate"),
  "Test 3d: isPrivate must NOT be present in repo"
);
console.assert(
  !Object.prototype.hasOwnProperty.call(arrayResult.repositories[0], "id"),
  "Test 3e: id must NOT be present in repo"
);

// ── Test 4: Async buildQuery ──────────────────────────────────
const asyncSelection = {
  id: true,
  email: true,
  address: {
    city: true,
  },
} satisfies SelectionSet<User>;

async function runAsyncTest(): Promise<void> {
  const asyncResult = await buildQuery(
    async () => mockUser,
    asyncSelection
  );

  // Type-level checks
  const _aid: string = asyncResult.id;
  const _email: string = asyncResult.email;
  const _acity: string = asyncResult.address.city;

  console.assert(asyncResult.id === "u-001", "Test 4a: async id correct");
  console.assert(
    asyncResult.email === "ada@example.com",
    "Test 4b: async email correct"
  );
  console.assert(
    asyncResult.address.city === "London",
    "Test 4c: async address.city correct"
  );
  console.assert(
    !Object.prototype.hasOwnProperty.call(asyncResult, "username"),
    "Test 4d: username must NOT be present in async result"
  );

  console.log("✅ All tests passed!");
}

runAsyncTest().catch(console.error);
