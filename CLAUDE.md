# CLAUDE.md

Personal portfolio for Benjamin Kuoch (GitHub: `bxnkuoch`), served by GitHub Pages from `main` at https://bxnkuoch.github.io/.

## Architecture

- Plain HTML/CSS/JS. No framework, no build step, no npm. Keep it that way unless asked.
- **All content lives in `config.js`** (`window.PORTFOLIO_CONFIG`). Content changes go there, not in `index.html` or `script.js`.
- `script.js` renders everything from the config. Only the Archive section calls the GitHub API (unauthenticated, cached in localStorage for 1 hour).
- Theme colors are CSS variables at the top of `styles.css`. The site is light by default (warm palette) regardless of OS setting; dark mode only applies via `[data-theme="dark"]` from the toggle.
- `pet.js` draws the pixel cat that roams the page, perching on elements matching `PERCHES` (cards etc.) and doing random actions (`BEHAVIORS`) and reacts to clicks (`REACTIONS`). Skipped under reduced motion. Sprites are 16-char strings in the file.

## Content rules

- Only list projects that are on GitHub. Ignore local-only folders in `~/Documents/2026_Projects`.
- Collaborations (repos owned by others) are listed only if Benjamin has commits there. Check with
  `gh api "repos/OWNER/REPO/commits?author=bxnkuoch"`.
- Base descriptions, "My role" lines and highlights on the repo README and Benjamin's commit messages. Never invent results, metrics or roles. Flag anything written without a source so Benjamin can check it.
- Removed at Benjamin's request: SASE-Drexel `Posting-Schedule-Maker` and `mentorship-2024`. Don't re-add them.
- `exclude` in the config hides duplicates: Benjamin's own `codefest24-25` and `sasehacks-2024` fork, since the team repos are listed instead.

## Checking changes

```sh
python3 -m http.server 8000   # then open http://localhost:8000
node --check script.js && node --check config.js
```

Headless Chrome screenshots (`--window-size=1280,3000 --virtual-time-budget=6000`) work for visual checks. Headless Chrome won't go narrower than about 500px, so check mobile by loading the page in a 375px-wide iframe.

## Social preview image

`assets/og.png` (1200×630) is rendered from `tools/og.html`. If the headline or name changes, update `tools/og.html` and regenerate:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --window-size=1200,630 --virtual-time-budget=5000 --screenshot=assets/og.png "file://$PWD/tools/og.html"
```

## Publishing

Pushing to `main` deploys the site. Don't commit or push unless Benjamin asks.

GitHub Pages lets browsers cache files for 10 minutes, so `index.html` loads `styles.css`, `config.js`, `script.js` and `pet.js` with a `?v=` version. Bump it before every commit that changes any of those files:

```sh
V=$(date +%Y%m%d%H%M) && sed -i '' -E "s#(styles\.css|config\.js|script\.js|pet\.js)\?v=[0-9]+#\1?v=$V#g" index.html
```
