import { readFileSync, writeFileSync } from "fs";

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

function inject() {
  const challenges = JSON.parse(readFileSync("challenges.json", "utf-8"));
  const latest = challenges[challenges.length - 1];

  if (!latest) {
    console.error("No challenges found in challenges.json");
    process.exit(1);
  }

  const sandboxURL = `https://codesandbox.io/p/devbox/github/${REPO_OWNER}/${REPO_NAME}/tree/challenge/${escapeAttr(latest.date)}`;
  const difficultyClass = VALID_DIFFICULTIES.has(latest.difficulty.toLowerCase())
    ? latest.difficulty.toLowerCase()
    : "medium";

  const goalsHTML = renderList(latest.goals, "challenge-goals", "Goals");
  const hintsHTML = renderList(latest.hints, "challenge-hints", "Hints");
  const docsHTML = renderDocs(latest.docs);

  const stackblitzURL = `https://stackblitz.com/github/${REPO_OWNER}/${REPO_NAME}/tree/challenge/${escapeAttr(latest.date)}`;
  const cloneCommand = `git clone -b challenge/${escapeAttr(latest.date)} https://github.com/${REPO_OWNER}/${REPO_NAME}.git`;

  const challengeHTML = `    <section class="challenge-card">
      <div class="challenge-header">
        <span class="challenge-date">${escapeHTML(latest.date)}</span>
        <span class="badge ${difficultyClass}">${escapeHTML(latest.difficulty)}</span>
      </div>
      <h2>${escapeHTML(latest.name)}</h2>
      <p>${escapeHTML(latest.description)}</p>
${goalsHTML}
      <div class="code-block">
        <div class="code-block-header">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="code-block-title">challenge.ts</span>
        </div>
        <pre><code class="language-typescript">${escapeHTML(latest.snippet)}</code></pre>
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
          <td><a href="https://codesandbox.io/p/devbox/github/${REPO_OWNER}/${REPO_NAME}/tree/challenge/${escapeAttr(c.date)}" target="_blank" rel="noopener noreferrer">Open</a></td>
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
