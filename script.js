(function () {
  const cfg = window.PORTFOLIO_CONFIG;
  const $ = (id) => document.getElementById(id);
  const CACHE_KEY = "gh-repos-" + cfg.githubUsername;
  const CACHE_TTL = 60 * 60 * 1000; // the unauthenticated GitHub API allows 60 req/hr per visitor

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const ext = (href, label) => `<a href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`;

  // --- Header ---------------------------------------------------------------
  $("name").textContent = cfg.name;
  $("role").textContent = cfg.role;
  $("headline").textContent = cfg.headline;
  $("about").textContent = cfg.about;
  $("footer-name").textContent = cfg.name;
  $("year").textContent = new Date().getFullYear();
  $("avatar").src = `https://github.com/${cfg.githubUsername}.png?size=112`;
  $("nav-github").href = cfg.links.github;
  if (cfg.currently) {
    $("currently-text").textContent = cfg.currently;
    $("currently").hidden = false;
  }

  const linkDefs = {
    github: { label: "GitHub", primary: true },
    linkedin: { label: "LinkedIn" },
    email: { label: "Email", href: (v) => `mailto:${v}` },
    resume: { label: "Résumé" },
  };
  $("links").innerHTML = Object.entries(cfg.links)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const d = linkDefs[k] || { label: k };
      const href = d.href ? d.href(v) : v;
      return `<a class="btn${d.primary ? " primary" : ""}" href="${esc(href)}" target="_blank" rel="noopener">${d.label} ↗</a>`;
    })
    .join("");

  const projects = cfg.projects;
  const events = new Set(projects.map((p) => p.event).filter((e) => e && /hack|fest/i.test(e)));
  const stats = [
    [projects.length, "Projects"],
    [projects.filter((p) => p.type === "team").length, "Team builds"],
    [events.size, "Hackathons"],
  ];
  $("stats").innerHTML = stats.map(([n, l]) => `<div><dt>${l}</dt><dd>${n}</dd></div>`).join("");

  // --- Theme / nav ----------------------------------------------------------
  $("theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  });
  const nav = document.querySelector(".nav");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 8), { passive: true });

  // --- Projects -------------------------------------------------------------
  function card(p, i) {
    const num = String(i + 1).padStart(2, "0");
    const badges = [
      `<span class="mono card-num">${num}</span>`,
      `<span class="badge ${p.type === "team" ? "team" : "solo"}">${p.type === "team" ? "Team" : "Solo"}</span>`,
      p.event && `<span class="badge event">${esc(p.event)}</span>`,
      p.date && `<span class="mono card-date">${esc(p.date)}</span>`,
    ].filter(Boolean).join("");
    const links = [
      p.demo && ext(p.demo, "Live site ↗"),
      p.repo && ext(`https://github.com/${p.repo}`, "Code ↗"),
    ].filter(Boolean).join("");
    const main = `
      ${p.featured ? `<div class="featured-label">Featured project</div>` : ""}
      <div class="card-top">${badges}</div>
      ${p.image ? `<img class="shot" src="${esc(p.image)}" alt="Screenshot of ${esc(p.title)}" loading="lazy" />` : ""}
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      ${p.role ? `<div class="role"><strong>My role:</strong> ${esc(p.role)}</div>` : ""}
      <div class="tags">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      ${links ? `<div class="card-links">${links}</div>` : ""}`;

    if (p.featured && p.highlights?.length) {
      return `<article class="card featured reveal" data-type="${p.type}">
        <div class="card-main">${main}</div>
        <ul class="highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
      </article>`;
    }
    return `<article class="card reveal${p.featured ? " featured" : ""}" data-type="${p.type}">${main}</article>`;
  }
  $("projects").innerHTML = projects.map(card).join("");

  const filters = [
    ["all", "All", projects.length],
    ["team", "Team", projects.filter((p) => p.type === "team").length],
    ["solo", "Solo", projects.filter((p) => p.type !== "team").length],
  ];
  $("filters").innerHTML = filters
    .map(([k, l, n], i) => `<button role="tab" data-f="${k}" aria-selected="${i === 0}">${l}<span class="count">${n}</span></button>`)
    .join("");
  $("filters").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    $("filters").querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", b === btn));
    const f = btn.dataset.f;
    $("projects").querySelectorAll(".card").forEach((c) => {
      c.hidden = f !== "all" && (c.dataset.type === "team") !== (f === "team");
    });
  });

  // Cursor-following glow on cards (pointer devices only)
  if (matchMedia("(hover: hover)").matches) {
    $("projects").addEventListener("pointermove", (e) => {
      const c = e.target.closest(".card");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", `${e.clientX - r.left}px`);
      c.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }

  // --- Skills ---------------------------------------------------------------
  const skillGroups = Object.entries(cfg.skills || {});
  if (skillGroups.length) {
    $("skills-grid").innerHTML = skillGroups
      .map(([group, items]) => `<div class="skill-group reveal"><h3>${esc(group)}</h3>
        <div class="chips">${items.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div></div>`)
      .join("");
    $("skills").hidden = false;
  }

  // --- Archive (live from GitHub) -------------------------------------------
  async function loadRepos() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.at < CACHE_TTL) return cached.repos;
    } catch {}
    const res = await fetch(`https://api.github.com/users/${cfg.githubUsername}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const repos = (await res.json()).map((r) => ({
      name: r.name, description: r.description, url: r.html_url, language: r.language,
      pushed: r.pushed_at, fork: r.fork, archived: r.archived,
    }));
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos })); } catch {}
    return repos;
  }

  async function renderArchive() {
    if (!cfg.showArchive) return;
    const listed = new Set(projects.map((p) => (p.repo || "").toLowerCase()));
    const skip = new Set(cfg.exclude.map((s) => s.toLowerCase()));
    let repos;
    try { repos = await loadRepos(); } catch (err) { console.warn(err); return; }
    const rest = repos.filter((r) =>
      !r.fork && !r.archived && !skip.has(r.name.toLowerCase()) &&
      !listed.has(`${cfg.githubUsername}/${r.name}`.toLowerCase()));
    if (!rest.length) return;
    $("archive-list").innerHTML = rest
      .map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">
          <span class="name">${esc(r.name)}</span>
          <span class="desc">${esc(r.description || "")}</span>
          <span class="meta mono">${esc(r.language || "")}${r.language ? " · " : ""}${new Date(r.pushed).getFullYear()}</span>
        </a></li>`)
      .join("");
    $("archive").hidden = false;
  }
  renderArchive();

  // --- Reveal on scroll -----------------------------------------------------
  const io = "IntersectionObserver" in window &&
    new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
    el.addEventListener("transitionend", () => (el.style.transitionDelay = ""), { once: true });
    io ? io.observe(el) : el.classList.add("in");
  });
})();
