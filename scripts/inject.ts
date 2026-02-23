import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const REPO_OWNER = "niltonheck";
const REPO_NAME = "typedrop";

const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str: string): string {
  return str.replace(/[^a-z0-9-]/gi, "");
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderList(items: string[], className: string, title: string): string {
  if (!items || items.length === 0) return "";
  const lis = items.map((item) => `          <li>${escapeHTML(item)}</li>`).join("\n");
  return `      <div class="${className}">
        <h3>${title}</h3>
        <ul>
${lis}
        </ul>
      </div>`;
}

function renderDocs(docs: { title: string; url: string }[]): string {
  if (!docs || docs.length === 0) return "";
  const links = docs
    .map((d) => `          <li><a href="${escapeHTML(d.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(d.title)}</a></li>`)
    .join("\n");
  return `      <div class="challenge-docs">
        <h3>Useful resources</h3>
        <ul>
${links}
        </ul>
      </div>`;
}

function buildChallengeCardHTML(challenge: {
  date: string;
  name: string;
  difficulty: string;
  description: string;
  snippet: string;
  goals?: string[];
  hints?: string[];
  docs?: { title: string; url: string }[];
}): string {
  const sandboxURL = `https://codesandbox.io/p/devbox/github/${REPO_OWNER}/${REPO_NAME}/tree/challenge/${escapeAttr(challenge.date)}`;
  const difficultyClass = VALID_DIFFICULTIES.has(challenge.difficulty.toLowerCase())
    ? challenge.difficulty.toLowerCase()
    : "medium";

  const goalsHTML = renderList(challenge.goals ?? [], "challenge-goals", "Goals");
  const hintsHTML = renderList(challenge.hints ?? [], "challenge-hints", "Hints");
  const docsHTML = renderDocs(challenge.docs ?? []);

  const stackblitzURL = `https://stackblitz.com/github/${REPO_OWNER}/${REPO_NAME}/tree/challenge/${escapeAttr(challenge.date)}`;
  const cloneCommand = `git clone -b challenge/${escapeAttr(challenge.date)} https://github.com/${REPO_OWNER}/${REPO_NAME}.git`;

  return `    <section class="challenge-card">
      <div class="challenge-header">
        <span class="challenge-date">${escapeHTML(challenge.date)}</span>
        <span class="badge ${difficultyClass}">${escapeHTML(challenge.difficulty)}</span>
      </div>
      <h2>${escapeHTML(challenge.name)}</h2>
      <p>${escapeHTML(challenge.description)}</p>
${goalsHTML}
      <div class="code-block">
        <div class="code-block-header">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="code-block-title">challenge.ts</span>
        </div>
        <pre><code class="language-typescript">${escapeHTML(challenge.snippet)}</code></pre>
      </div>
      <details class="challenge-hints-details">
        <summary>Hints (click to reveal)</summary>
${hintsHTML}
      </details>
${docsHTML}
      <div class="cta-row">
        <a class="cta-button cta-primary" href="${stackblitzURL}" target="_blank" rel="noopener noreferrer">
          <img class="sb-icon" src="https://cdn.simpleicons.org/stackblitz/e0e0e0" alt=""> StackBlitz
        </a>
        <a class="cta-button" href="${sandboxURL}" target="_blank" rel="noopener noreferrer">
          <img class="csb-icon" src="https://cdn.simpleicons.org/codesandbox/e0e0e0" alt=""> CodeSandbox
        </a>
      </div>
      <div class="clone-section">
        <h3>Or clone locally</h3>
        <div class="clone-box">
          <code id="clone-cmd">${escapeHTML(cloneCommand)}</code>
          <button class="clone-copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('clone-cmd').textContent).then(()=>{this.textContent='Copied!';this.classList.add('copied');setTimeout(()=>{this.textContent='Copy';this.classList.remove('copied')},2000)})">Copy</button>
        </div>
      </div>
    </section>`;
}

function generateChallengePage(challenge: {
  date: string;
  name: string;
  difficulty: string;
  description: string;
  snippet: string;
  goals?: string[];
  hints?: string[];
  docs?: { title: string; url: string }[];
}): void {
  const slug = slugify(challenge.name);
  const dir = join("archive", challenge.date);
  mkdirSync(dir, { recursive: true });

  const cardHTML = buildChallengeCardHTML(challenge);
  const filePath = join(dir, `${slug}.html`);

  const pageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeDrop — ${escapeHTML(challenge.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/fonts/0x-proto@latest/latin-400-normal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/fonts/0x-proto@latest/latin-700-normal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-tomorrow.min.css">
  <link rel="icon" href="../../misc/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../style.css">
</head>
<body>
  <main>
    <header>
      <h1><a href="../../index.html" style="color: inherit; text-decoration: none;">TypeDrop</a></h1>
      <p class="tagline">${escapeHTML(challenge.date)} Challenge</p>
    </header>

${cardHTML}

    <footer>
      <p>
        <a href="../../index.html">&larr; Today's challenge</a>
        &middot;
        <a href="../../archive.html">Archive</a>
      </p>
    </footer>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/prismjs@1/prism.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-typescript.min.js"></script>
  <script data-goatcounter="https://niltonheck.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
</body>
</html>`;

  writeFileSync(filePath, pageHTML);
  console.log(`  Generated page: ${filePath}`);
}

function generateAllChallengePages(challenges: {
  date: string;
  name: string;
  difficulty: string;
  description: string;
  snippet: string;
  goals?: string[];
  hints?: string[];
  docs?: { title: string; url: string }[];
}[]): void {
  for (const challenge of challenges) {
    generateChallengePage(challenge);
  }
}

function inject() {
  const challenges = JSON.parse(readFileSync("challenges.json", "utf-8"));
  const latest = challenges[challenges.length - 1];

  if (!latest) {
    console.error("No challenges found in challenges.json");
    process.exit(1);
  }

  const challengeHTML = buildChallengeCardHTML(latest);

  const html = readFileSync("index.html", "utf-8");
  if (!html.includes("<!-- CHALLENGE_START -->") || !html.includes("<!-- CHALLENGE_END -->")) {
    console.error("ERROR: CHALLENGE_START/CHALLENGE_END markers not found in index.html");
    process.exit(1);
  }
  const replacement = `<!-- CHALLENGE_START -->\n${challengeHTML}\n    <!-- CHALLENGE_END -->`;
  const updated = html.replace(
    /<!-- CHALLENGE_START -->[\s\S]*?<!-- CHALLENGE_END -->/,
    () => replacement
  );

  writeFileSync("index.html", updated);

  // Also update archive.html
  generateArchive(challenges);

  // Generate individual challenge pages
  generateAllChallengePages(challenges);

  console.log(`Injected challenge: ${latest.name} (${latest.date})`);
}

function generateArchive(
  challenges: {
    date: string;
    name: string;
    difficulty: string;
    description: string;
  }[]
) {
  const rows = [...challenges]
    .reverse()
    .map(
      (c) => `        <tr>
          <td>${escapeHTML(c.date)}</td>
          <td><span class="badge ${VALID_DIFFICULTIES.has(c.difficulty.toLowerCase()) ? c.difficulty.toLowerCase() : "medium"}">${escapeHTML(c.difficulty)}</span></td>
          <td>${escapeHTML(c.name)}</td>
          <td>${escapeHTML(c.description)}</td>
          <td><a href="archive/${c.date}/${slugify(c.name)}.html">See</a></td>
        </tr>`
    )
    .join("\n");

  const archiveHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeDrop — Challenge Archive</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/fonts/0x-proto@latest/latin-400-normal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/fontsource/fonts/0x-proto@latest/latin-700-normal.css">
  <link rel="icon" href="misc/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <header>
      <h1><a href="index.html" style="color: inherit; text-decoration: none;">TypeDrop</a></h1>
      <p class="tagline">Challenge Archive</p>
    </header>

    <section class="challenge-card">
      <table class="archive-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Difficulty</th>
            <th>Challenge</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </section>

    <footer>
      <p><a href="index.html">&larr; Back to today's challenge</a></p>
    </footer>
  </main>
</body>
</html>`;

  writeFileSync("archive.html", archiveHTML);
}

inject();
