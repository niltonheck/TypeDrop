import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const client = new Anthropic();

const OUTPUT_DIR = "challenge-output";

const CHALLENGE_SYSTEM_PROMPT = `# TypeScript Daily Challenge Generator

Generate a single, self-contained TypeScript coding challenge for daily practice.

## Constraints
- Solvable in 20-30 minutes by a mid-level TypeScript engineer
- Must compile under \`strict: true\` with no \`any\` usage
- Provide only the challenge (types stubs, function signature, requirements) — NOT the solution
- Include mock data or a test harness snippet so I can verify my solution

## Topic Rotation
Pick 3-5 of these aspects to combine in today's challenge (vary the mix each time):

- **Typing**: union types, discriminated unions, mapped types, conditional types, generics,
  utility types (Pick, Omit, Record, Extract, etc.), type narrowing, branded types,
  template literal types, function overloads, \`satisfies\`, \`infer\`
- **Concurrency**: Promise.all / allSettled / race, concurrency limits, retry logic,
  parallel vs sequential execution, AbortController/cancellation
- **Fetching & I/O**: abstracting fetch via typed callbacks, response validation,
  streaming/chunked processing, pagination handling, typed API clients
- **Parsing & Validation**: runtime type validation, safe JSON parsing, unknown → typed
  narrowing, schema validation (zod-style patterns), error result types (Result<T,E>)
- **Iteration & Aggregation**: reduce, groupBy, single-pass aggregation, lazy iterators,
  generators, Map/Set usage, efficient lookups
- **Data Structures**: trees, graphs, queues, LRU caches, indexes, tries — with proper
  generic typing
- **Patterns**: builder pattern, strategy pattern, middleware/plugin chains, event emitters,
  state machines — all with strong typing
- **Error Handling**: Result/Either monads, typed error hierarchies, exhaustive error
  matching, graceful degradation

## Style Rules
- Prefer real-world scenarios over abstract puzzles
- The hardest part should be the TYPING, not the algorithm
- Never use \`any\`, \`as\`, or type assertions in the provided stubs
- Use modern TS (5.x features welcome: satisfies, const type params, etc.)`;

// Tool schema for structured output
const CHALLENGE_TOOL: Anthropic.Tool = {
  name: "submit_challenge",
  description: "Submit the generated TypeScript challenge",
  input_schema: {
    type: "object" as const,
    required: [
      "title",
      "difficulty",
      "scenario",
      "challengeTS",
      "testHarnessTS",
      "evaluationChecklist",
      "snippet",
      "goals",
      "hints",
      "docs",
    ],
    properties: {
      title: {
        type: "string",
        description: "Short descriptive challenge name",
      },
      difficulty: {
        type: "string",
        enum: ["Easy", "Medium", "Hard"],
        description: "Challenge difficulty level",
      },
      scenario: {
        type: "string",
        description: "1-2 sentences of real-world context",
      },
      challengeTS: {
        type: "string",
        description:
          "Full contents of challenge.ts — type stubs, function signatures, TODO comments, requirements as numbered comments. Must compile under strict: true with no any.",
      },
      testHarnessTS: {
        type: "string",
        description:
          "Full contents of challenge.test.ts — imports from './challenge', mock data, 3-5 console.assert checks",
      },
      evaluationChecklist: {
        type: "string",
        description:
          "Markdown table mapping TS skills exercised and where in the code",
      },
      bonus: {
        type: "string",
        description: "One optional stretch goal sentence, or empty string",
      },
      snippet: {
        type: "string",
        description:
          "Self-contained preview (12-20 lines) showing core types AND main function signature. Must be readable without extra context — include the key types/interfaces needed to understand the signature.",
      },
      goals: {
        type: "array",
        items: { type: "string" },
        description:
          "3-4 concise imperative sentences describing what the user must accomplish",
      },
      hints: {
        type: "array",
        items: { type: "string" },
        description:
          "2-3 concise tip strings — nudges toward the right TS feature, not answers",
      },
      docs: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "url"],
          properties: {
            title: {
              type: "string",
              description: "Short label for the link",
            },
            url: {
              type: "string",
              description:
                "URL to official TypeScript handbook, MDN, or relevant reference. Must be a real, accurate URL.",
            },
          },
        },
        description: "2-4 links to relevant documentation",
      },
    },
  },
};

const MAX_RETRIES = 3;

async function callWithRetry(): Promise<Anthropic.ToolUseBlock> {
  const today = new Date().toISOString().split("T")[0];

  const challengesPath = "challenges.json";
  const existing = JSON.parse(readFileSync(challengesPath, "utf-8"));

  // Send last 5 challenges for better variety
  const recentChallenges = existing.slice(-5);
  const previousContext =
    recentChallenges.length > 0
      ? recentChallenges
          .map(
            (c: { name: string; description: string; difficulty: string }) =>
              `- ${c.name} (${c.difficulty}): ${c.description}`
          )
          .join("\n")
      : "(none — this is the first challenge)";

  // Pick a difficulty that differs from the last challenge
  const difficulties = ["Easy", "Medium", "Hard"] as const;
  const lastDifficulty = existing.length > 0
    ? (existing[existing.length - 1] as { difficulty: string }).difficulty
    : null;
  const available = difficulties.filter((d) => d !== lastDifficulty);
  const difficulty = available[Math.floor(Math.random() * available.length)];

  console.log(`Target difficulty: ${difficulty} (last was: ${lastDifficulty ?? "none"})`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_RETRIES}...`);

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        temperature: 0.8,
        system: CHALLENGE_SYSTEM_PROMPT,
        tools: [CHALLENGE_TOOL],
        tool_choice: { type: "tool", name: "submit_challenge" },
        messages: [
          {
            role: "user",
            content: `Generate today's TypeScript challenge (${today}).\n\nDifficulty: **${difficulty}** (this is mandatory, do not pick a different level).\n\nRecent challenges (avoid repeating these themes):\n${previousContext}`,
          },
        ],
      });

      const toolBlock = message.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      if (!toolBlock) {
        throw new Error("No tool_use block in response");
      }

      return toolBlock;
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err);
      if (attempt === MAX_RETRIES) throw err;
      // Wait before retrying (exponential backoff)
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }

  throw new Error("Unreachable");
}

async function generate() {
  const today = new Date().toISOString().split("T")[0];

  const toolBlock = await callWithRetry();
  const challenge = toolBlock.input as Record<string, unknown>;

  // --- Write challenge branch files to output directory ---

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  writeFileSync(
    join(OUTPUT_DIR, "challenge.ts"),
    challenge.challengeTS as string
  );
  writeFileSync(
    join(OUTPUT_DIR, "challenge.test.ts"),
    challenge.testHarnessTS as string
  );

  const readme = [
    `# ${challenge.title}`,
    "",
    `**Difficulty:** ${challenge.difficulty}`,
    "",
    `## Scenario`,
    "",
    challenge.scenario as string,
    "",
    `## How to solve`,
    "",
    "1. Open `challenge.ts`",
    "2. Implement the types and functions marked with `TODO`",
    "3. Verify your solution using one of the methods below",
    "",
    "### In CodeSandbox (recommended)",
    "",
    "1. Click the **Open Devtool** icon in the top-right corner (or press `Ctrl + \\``)",
    "2. In the Devtools panel, click **Type Check + Run Tests** to validate your solution",
    "3. For `console.log` output and assertion results, open your **browser DevTools** (`F12` > Console tab)",
    "",
    "### Locally",
    "",
    "```bash",
    "npm install",
    "npm test    # runs tsc --noEmit && tsx challenge.test.ts",
    "```",
    "",
    `## Evaluation Checklist`,
    "",
    challenge.evaluationChecklist as string,
    ...((challenge.bonus as string)
      ? ["", `## Bonus`, "", challenge.bonus as string]
      : []),
    "",
  ].join("\n");

  writeFileSync(join(OUTPUT_DIR, "README.md"), readme);

  writeFileSync(
    join(OUTPUT_DIR, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "bundler",
          noEmit: true,
          skipLibCheck: true,
        },
        include: ["*.ts"],
      },
      null,
      2
    ) + "\n"
  );

  writeFileSync(
    join(OUTPUT_DIR, "package.json"),
    JSON.stringify(
      {
        name: `ts-challenge-${today}`,
        private: true,
        type: "module",
        devDependencies: {
          typescript: "^5.7.0",
          tsx: "^4.19.0",
        },
        scripts: {
          test: "tsc --noEmit && tsx challenge.test.ts",
        },
      },
      null,
      2
    ) + "\n"
  );

  // CodeSandbox configuration
  mkdirSync(join(OUTPUT_DIR, ".codesandbox"), { recursive: true });

  writeFileSync(
    join(OUTPUT_DIR, ".codesandbox", "tasks.json"),
    JSON.stringify(
      {
        setupTasks: [
          { name: "Install Dependencies", command: "npm install" },
        ],
        tasks: {
          "type-check": {
            name: "Type Check",
            command: "npx tsc --noEmit",
            runAtStart: false,
          },
          "run-tests": {
            name: "Run Tests",
            command: "npx tsx challenge.test.ts",
            runAtStart: false,
          },
          test: {
            name: "Type Check + Run Tests",
            command: "npm test",
            runAtStart: false,
          },
        },
      },
      null,
      2
    ) + "\n"
  );

  // --- Update challenges.json (stays in repo root for main branch) ---

  const challengesPath = "challenges.json";
  const existing = JSON.parse(readFileSync(challengesPath, "utf-8"));

  existing.push({
    date: today,
    name: challenge.title,
    difficulty: challenge.difficulty,
    description: challenge.scenario,
    snippet: challenge.snippet,
    goals: challenge.goals,
    hints: challenge.hints,
    docs: challenge.docs,
  });

  writeFileSync(challengesPath, JSON.stringify(existing, null, 2) + "\n");

  console.log(
    `Challenge generated: ${challenge.title} (${challenge.difficulty})`
  );
  console.log(`Files written to ${OUTPUT_DIR}/`);
}

generate().catch((err) => {
  console.error("Failed to generate challenge:", err);
  process.exit(1);
});
