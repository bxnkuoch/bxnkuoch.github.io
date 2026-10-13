# bxnkuoch.github.io

Personal portfolio site, served by GitHub Pages at **https://bxnkuoch.github.io/**.

Plain HTML/CSS/JS — no framework, no build step. Projects (including team/hackathon repos owned by others) are curated in `config.js`; any other public repo of mine shows up automatically in the Archive section via the GitHub API.

## Files

| File | Purpose |
| --- | --- |
| `config.js` | **The only file you normally edit.** Name, headline, links, projects (with team/solo, event, your role, highlights), hidden repos. |
| `index.html` | Page skeleton. |
| `styles.css` | Styling (light/dark themes via CSS variables at the top). |
| `script.js` | Fetches repos from GitHub and renders the cards. |
| `assets/` | Screenshots / images for project cards. |

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish

```sh
git add -A && git commit -m "Update portfolio" && git push
```

GitHub Pages rebuilds from `main` within a minute or two.

## Tips for nicer cards

- Add a **description** and **topics** to each repo on GitHub (repo page → ⚙ next to "About"). Topics show as tags.
- Set the repo's **Website** field to a live demo URL; it becomes the "Live demo" link.
- Put a screenshot in `assets/` and reference it via `image:` in `config.js` for featured projects.
