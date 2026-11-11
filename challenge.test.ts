// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  buildPlan,
  executePlan,
  getField,
  type EntitySchema,
  type ScalarField,
  type ObjectField,
  type ListField,
  type SelectionSet,
  type ResolvedResult,
  type DataSource,
  type FieldResolver,
  type RawRecord,
} from "./challenge";

// ---------------------------------------------------------------------------
// Schema definition
// ---------------------------------------------------------------------------

const authorSchema = {
  name:      { kind: "scalar", type: "string",  nullable: false } satisfies ScalarField<"string">,
  birthYear: { kind: "scalar", type: "number",  nullable: true  } satisfies ScalarField<"number">,
} satisfies EntitySchema;

const bookSchema = {
  title:     { kind: "scalar", type: "string",  nullable: false } satisfies ScalarField<"string">,
  published: { kind: "scalar", type: "number",  nullable: false } satisfies ScalarField<"number">,
  inStock:   { kind: "scalar", type: "boolean", nullable: false } satisfies ScalarField<"boolean">,
  author:    { kind: "object", schema: authorSchema, nullable: true } satisfies ObjectField<typeof authorSchema>,
} satisfies EntitySchema;

// ---------------------------------------------------------------------------
// Mock data sources
// ---------------------------------------------------------------------------

const rawAuthors: Record<string, RawRecord> = {
  "a1": { name: "Ursula K. Le Guin", birthYear: 1929 },
  "a2": { name: "Frank Herbert",     birthYear: 1920 },
};

const rawBooks: Record<string, RawRecord> = {
  "b1": { title: "The Left Hand of Darkness", published: 1969, inStock: true,  authorId: "a1" },
  "b2": { title: "Dune",                       published: 1965, inStock: false, authorId: "a2" },
  "b3": { title: "The Dispossessed",           published: 1974, inStock: true,  authorId: "a1" },
};

const authorSource: DataSource<typeof authorSchema> = {
  fetch: async (ids) => {
    const map = new Map<string, RawRecord>();
    for (const id of ids) if (rawAuthors[id]) map.set(id, rawAuthors[id]);
    return map;
  },
};

const bookSource: DataSource<typeof bookSchema> = {
  fetch: async (ids) => {
    const map = new Map<string, RawRecord>();
    for (const id of ids) if (rawBooks[id]) map.set(id, rawBooks[id]);
    return map;
  },
};

// ---------------------------------------------------------------------------
// Resolvers
// ---------------------------------------------------------------------------

const authorResolvers: FieldResolver<typeof authorSchema> = {
  name:      (raw) => String(raw),
  birthYear: (raw) => raw === null || raw === undefined ? null : Number(raw),
};

const bookResolvers: FieldResolver<typeof bookSchema> = {
  title:     (raw) => String(raw),
  published: (raw) => Number(raw),
  inStock:   (raw) => Boolean(raw),
  author:    (parent) => typeof parent["authorId"] === "string" ? parent["authorId"] : null,
};

// ---------------------------------------------------------------------------
// Selection sets
// ---------------------------------------------------------------------------

const authorSelection = {
  name:      true,
  birthYear: true,
} satisfies SelectionSet<typeof authorSchema>;

const bookSelection = {
  title:   true,
  inStock: true,
  author:  authorSelection,
} satisfies SelectionSet<typeof bookSchema>;

// ---------------------------------------------------------------------------
// Build plan
// ---------------------------------------------------------------------------

const bookPlan = buildPlan({
  schema:    bookSchema,
  selection: bookSelection,
  source:    bookSource,
  resolvers: bookResolvers,
  nested: {
    author: {
      schema:    authorSchema,
      selection: authorSelection,
      source:    authorSource,
      resolvers: authorResolvers,
      nested:    {},
    },
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function runTests(): Promise<void> {
  console.log("Running tests…\n");

  // Test 1: executePlan returns entries for every requested ID
  const results = await executePlan(bookPlan, ["b1", "b2", "b3"]);
  console.assert(results.size === 3, `❌ Test 1 FAILED: expected 3 results, got ${results.size}`);
  console.log("✅ Test 1 passed: executePlan returns correct number of entries");

  // Test 2: scalar fields are correctly coerced
  const b1 = results.get("b1");
  console.assert(b1 !== undefined, "❌ Test 2 FAILED: b1 not found");
  console.assert(
    b1 !== undefined && b1.title === "The Left Hand of Darkness",
    `❌ Test 2 FAILED: expected title "The Left Hand of Darkness", got "${b1?.title}"`
  );
  console.assert(
    b1 !== undefined && b1.inStock === true,
    `❌ Test 2 FAILED: expected inStock true, got ${b1?.inStock}`
  );
  console.log("✅ Test 2 passed: scalar fields correctly resolved");

  // Test 3: nested object field is resolved
  console.assert(
    b1 !== undefined && b1.author !== null && b1.author?.name === "Ursula K. Le Guin",
    `❌ Test 3 FAILED: expected author.name "Ursula K. Le Guin", got "${b1?.author?.name}"`
  );
  console.log("✅ Test 3 passed: nested object field resolved correctly");

  // Test 4: un-selected fields are absent from the result
  // `published` was not in bookSelection — accessing it should be a TS error,
  // and at runtime the key should not exist on the object.
  const b2 = results.get("b2");
  console.assert(
    b2 !== undefined && !Object.prototype.hasOwnProperty.call(b2, "published"),
    "❌ Test 4 FAILED: 'published' should not be present in the result"
  );
  console.log("✅ Test 4 passed: un-selected fields absent from result");

  // Test 5: getField extracts a typed value correctly
  const b3 = results.get("b3");
  console.assert(b3 !== undefined, "❌ Test 5 FAILED: b3 not found");
  if (b3 !== undefined) {
    const title = getField(b3, "title");
    console.assert(
      title === "The Dispossessed",
      `❌ Test 5 FAILED: expected "The Dispossessed", got "${title}"`
    );
    console.log("✅ Test 5 passed: getField returns correctly typed value");
  }

  console.log("\nAll tests complete.");
}

runTests().catch(console.error);
