<p align="center">
  <img src="misc/typedrop-logo.png" alt="TypeDrop" width="400">
</p>
<p align="center">A new TypeScript challenge every day. AI-generated, open source, zero setup.</p>

## What is this?

TypeDrop delivers a fresh TypeScript challenge daily — focused on the **type system**, not algorithms. Each challenge drops at 6:00 UTC with:

- A real-world scenario (API clients, data pipelines, state machines...)
- Type stubs and function signatures to implement
- A test harness to validate your solution
- Goals, hints, and links to relevant docs

Click the button, open it in CodeSandbox, and start coding. No login, no setup.

## How it works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Daily cron   │────▶│  Claude API   │────▶│  Git push     │
│  (GH Actions) │     │  (tool_use)   │     │  branch + site │
└──────────────┘     └──────────────┘     └──────────────┘
```

1. A GitHub Actions cron job runs daily at 6:00 UTC
2. It calls the Anthropic API (Claude Sonnet 4.6) with a structured tool schema to generate the challenge
3. Challenge files are pushed to a `challenge/YYYY-MM-DD` branch
4. The site (`index.html`) is updated with today's challenge and deployed to GitHub Pages
5. Users click "Open in CodeSandbox" which loads the branch directly in an online IDE

## Challenge format

Each challenge branch contains:

| File | Purpose |
|------|---------|
| `challenge.ts` | Type stubs, function signatures, TODO markers |
| `challenge.test.ts` | Mock data + `console.assert` checks |
| `README.md` | Scenario, requirements, evaluation checklist |
| `tsconfig.json` | Strict mode config |
| `package.json` | TypeScript + tsx for running tests |

Verify your solution:
```bash
npm install
npm test    # runs tsc --noEmit && tsx challenge.test.ts
```

## Topics covered

Challenges combine 3-5 of these areas, with the focus always on **typing over algorithms**:

- **Type system**: generics, conditional types, mapped types, `infer`, `satisfies`, branded types, template literals
- **Concurrency**: Promise.all/allSettled/race, concurrency limits, AbortController
- **Parsing & Validation**: runtime narrowing, Result types, schema validation patterns
- **Data structures**: trees, LRU caches, queues — with proper generic typing
- **Patterns**: builder, strategy, middleware chains, state machines, event emitters
- **Error handling**: Result/Either monads, typed error hierarchies, exhaustive matching

## Tech stack

- **Site**: Static HTML/CSS, GitHub Pages
- **Fonts**: [0xProto](https://github.com/0xType/0xProto) (body), [Permanent Marker](https://fonts.google.com/specimen/Permanent+Marker) (title)
- **Syntax highlighting**: [Prism.js](https://prismjs.com/)
- **Sandbox**: [CodeSandbox](https://codesandbox.io/) (via URL scheme)
- **AI generation**: [Anthropic Claude API](https://docs.anthropic.com/) with structured tool_use
- **CI/CD**: GitHub Actions

## Running locally

```bash
# Clone the repo
git clone https://github.com/niltonheck/TypeDrop.git
cd TypeDrop

# Install dependencies
npm install

# Set your API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# Generate a challenge
npm run generate

# Inject it into the site
npm run inject

# Open index.html in your browser
```

Requires Node.js >= 20.6.0.

## Project structure

```
├── index.html                          # Main site
├── archive.html                        # Past challenges
├── style.css                           # Dark theme
├── challenges.json                     # Challenge metadata
├── misc/                               # Favicon, assets
├── scripts/
│   ├── generate.ts                     # AI challenge generation
│   └── inject.ts                       # Stamps challenge into HTML
├── .github/workflows/
│   └── generate-challenge.yml          # Daily cron + deploy
├── LICENSE                             # MIT
└── package.json
```

## License

MIT — see [LICENSE](LICENSE).

---

Built with love and [Claude](https://claude.ai) by [@niltonheck](https://github.com/niltonheck)
