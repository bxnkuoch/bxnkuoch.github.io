// A small pixel cat that roams the page: walks on cards, jumps between them, hides behind them. Click it for a reaction.
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // 16×10 sprites facing right. Overlays (z, heart, !) draw in 4 rows above them.
  const COLORS = { f: "#e8a25c", d: "#b8693a", w: "#f6d7b0", e: "#3a2a22", p: "#e88a8a", h: "#e5566b" };
  const HEAD = ["...........f..f.", "..........ffffff", "d.........fffefp", "f.........ffffff"];
  const BODY = ["f..fffffffffffw.", ".ffdfffdffffffw.", "..fffffffffffw..", "..ffffffffffff.."];
  const SIT_HEAD = ["...........f..f.", "..........ffffff", "..........fffefp", "..........ffffff"];
  const SIT_LOW = [".........ffffw..", "........ffffffw.", ".......fffffffw.", "d.....ffffffff..", "f....fffffffff..", ".fffffff.ff.ff.."];
  const SPRITES = {
    walk1: [...HEAD, ...BODY, "..ff.ff....ff.ff", "..ff.ff....ff.ff"],
    walk2: [...HEAD, ...BODY, "...ff.ff..ff.ff.", "...ff.ff..ff.ff."],
    sit: [...SIT_HEAD, ...SIT_LOW],
    sitTail: [
      ...SIT_HEAD, ".........ffffw..", ".....d..ffffffw.", ".....f.fffffffw.",
      "......ffffffff..", ".....fffffffff..", ".....fff.ff.ff..",
    ],
    groom1: ["...........f..f.", "..........ffffff", "..........fffddf", "..........ffffpw", ".........ffffww.", ...SIT_LOW.slice(1)],
    groom2: ["...........f..f.", "..........ffffff", "..........fffddp", "..........ffffff", ".........ffffwww", ...SIT_LOW.slice(1)],
    stretch: [
      "d...............", "f...............", ".ff.............", ".ffff...........", ".ffdfff.........",
      ".ffffdfff..f..f.", ".ff..fffffffffff", ".ff....ffffffefp", ".ff....fffffffff", ".ff..wwwwwwww...",
    ],
    sleep: [
      "................", "................", "................", "................", "...........f..f.",
      "....fffffffffff.", "..fffdfffdfddfp.", ".fffffffffffffw.", "ffffffffffffffw.", "dfffffffffffff..",
    ],
    belly: [
      "................", "................", "................", "................", "..f.f.....f.f...",
      "..f.f.....f.f...", "..fwwwwwwwwf....", "d.fffffffffffff.", ".fffffffffpfef..", "..ffffffffff.f.f",
    ],
  };
  const OVERLAYS = {
    z: { col: 12, rows: ["dddd", "..d.", ".d..", "dddd"] },
    heart: { col: 10, rows: [".h.h.", "hhhhh", ".hhh.", "..h.."] },
    bang: { col: 14, rows: ["d", "d", ".", "d"] },
  };
  const SCALE = 3, W = 16, H = 14, PX = W * SCALE, PY = H * SCALE;
  // Elements the cat can stand on. Anything else on the page is ignored.
  const PERCHES = ".card, .skill-group, .filters, .currently, .links .btn";

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = `position:fixed;left:0;top:0;width:${PX}px;height:${PY}px;` +
    "z-index:5;cursor:pointer;image-rendering:pixelated;";
  const dpr = devicePixelRatio || 1;
  canvas.width = PX * dpr;
  canvas.height = PY * dpr;
  const ctx = canvas.getContext("2d");
  const bubble = document.createElement("div");
  bubble.style.cssText = "position:fixed;left:0;top:0;z-index:5;pointer-events:none;padding:2px 8px;" +
    "border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);" +
    "font:500 0.75rem 'JetBrains Mono',monospace;white-space:nowrap;transition:opacity .2s;opacity:0;";
  document.body.append(canvas, bubble);

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // The cat stands on a perch (an element, or null for the bottom of the screen) at rx pixels from its left edge.
  let perch = null, rx = innerWidth - 80, facing = -1, x = 0, y = 0, action, bubbleTimer, drawn;
  function edge(el) {
    if (!el) return { left: 0, right: innerWidth, top: innerHeight - 4 };
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top };
  }
  function onScreen(el) {
    const r = el.getBoundingClientRect();
    return r.width > 40 && r.top > 70 && r.top < innerHeight - 30;
  }

  // Each action has a duration (dur) or a destination (tx), and a look(a) returning [sprite, overlay, lift].
  // A negative lift sinks the cat below its perch, where it is clipped so it looks hidden behind it.
  const sit = (dur) => ({ dur, look: (a) => [a.t % 2400 < 300 ? "sitTail" : "sit"] });
  const walkTo = (speed, frameMs) => {
    const e = edge(perch);
    return { tx: rand(16, Math.max(16, e.right - e.left - 16)), speed, look: (a) => [Math.floor(a.t / frameMs) % 2 ? "walk1" : "walk2"] };
  };
  const hop = (dx, overlay, then) => ({ dur: 550, dx, then, look: (a) => ["walk1", overlay, Math.sin((Math.PI * a.t) / a.dur) * 24] });
  const sleep = (dur) => ({ dur, look: (a) => ["sleep", a.t % 1800 < 900 && "z"] });
  const hide = () => ({
    dur: 5200, hiding: true,
    look(a) {
      const t = a.t, gone = -30, peek = -18; // fully hidden; only head showing
      if (t > 2700 && !a.turned) { a.turned = true; facing = -facing; } // look the other way
      const lift = t < 400 ? (gone * t) / 400 : t < 1400 ? gone : t < 1700 ? gone + ((peek - gone) * (t - 1400)) / 300 :
        t < 3600 ? peek : t < 4400 ? gone : gone * (1 - (t - 4400) / 800);
      return ["sit", null, lift];
    },
  });
  function jump() {
    const near = [...document.querySelectorAll(PERCHES)].filter((el) => {
      if (el === perch || !onScreen(el)) return false;
      const e = edge(el);
      return Math.hypot(clamp(x, e.left, e.right) - x, e.top - y) < 450;
    });
    if (perch) near.push(null, null); // the floor is always an option once up high
    if (near.length) return leap(pick(near));
    // Nothing in reach: walk under something on screen, then jump up to it.
    const far = [...document.querySelectorAll(PERCHES)].filter((el) => el !== perch && onScreen(el));
    if (!far.length) return walkTo(60, 200);
    const target = pick(far), t = edge(target), e = edge(perch);
    return {
      tx: clamp(rand(t.left, t.right) - e.left, 16, Math.max(16, e.right - e.left - 16)), speed: 90,
      look: (a) => [Math.floor(a.t / 160) % 2 ? "walk1" : "walk2"],
      then: () => (onScreen(target) ? leap(target) : sit(1500)),
    };
  }
  function leap(to) {
    const e = edge(to);
    const toRx = clamp(x - e.left + rand(-60, 60), 16, Math.max(16, e.right - e.left - 16));
    facing = Math.sign(e.left + toRx - x) || facing;
    return { dur: 650, leap: { fx: x, fy: y, to, toRx }, look: () => ["walk1"] };
  }
  const BEHAVIORS = [
    [3, () => walkTo(60, 200)],
    [1, () => walkTo(240, 80)], // zoomies
    [5, jump],
    [2, () => sit(rand(2000, 4500))],
    [1, () => ({ dur: rand(2000, 3500), look: (a) => [a.t % 500 < 250 ? "groom1" : "groom2"] })],
    [1, () => ({ dur: 1800, look: () => ["stretch"] })],
    [1, () => sleep(rand(5000, 10000))],
    [2, hide],
    [1, () => hop(facing * 60)], // pounce
  ];
  const REACTIONS = [
    () => hop(0, "heart", () => sit(1500)),
    () => { say(pick(["meow", "mrrp?", "prrr", "mew!"])); return { dur: 1800, look: () => ["sitTail"] }; },
    () => ({ dur: 2200, look: (a) => ["belly", a.t < 1500 && "heart"] }),
    jump,
  ];

  function randomBehavior() {
    let r = Math.random() * BEHAVIORS.reduce((s, [w]) => s + w, 0);
    for (const [w, make] of BEHAVIORS) if ((r -= w) < 0) return make();
  }
  function start(a) {
    action = { t: 0, ...a };
    const dir = a.tx !== undefined ? a.tx - rx : a.dx;
    if (dir) facing = Math.sign(dir);
  }
  function say(text) {
    bubble.textContent = text;
    bubble.style.opacity = 1;
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => (bubble.style.opacity = 0), 1500);
  }

  canvas.addEventListener("click", () => {
    const startled = action.hiding || action.look(action)[0] === "sleep";
    if (!action.leap) start(startled ? hop(0, "bang", () => sit(2500)) : pick(REACTIONS)());
  });

  function draw(sprite, overlay, flip) {
    const key = sprite + overlay + flip;
    if (key === drawn) return;
    drawn = key;
    const px = SCALE * dpr;
    const plot = (rows, r0, c0) => rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const color = COLORS[row[c]];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(c0(c) * px, (r0 + r) * px, px, px);
      }
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    plot(SPRITES[sprite], 4, (c) => (flip ? W - 1 - c : c));
    const o = OVERLAYS[overlay];
    if (o) {
      const start = flip ? W - o.col - o.rows[0].length : o.col; // keep overlays unmirrored so text reads right
      plot(o.rows, 0, (c) => start + c);
    }
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(now - last, 50);
    last = now;
    action.t += dt;
    let done = action.t >= action.dur;
    if (action.leap) {
      // Aim at the landing spot's live position so scrolling mid-air still lands on it.
      const { fx, fy, to, toRx } = action.leap, e = edge(to), p = Math.min(action.t / action.dur, 1);
      x = fx + (e.left + toRx - fx) * p;
      y = fy + (e.top - fy) * p - Math.sin(Math.PI * p) * 40;
      if (done) { perch = to; rx = toRx; }
    } else {
      if (perch && !onScreen(perch)) { start(leap(null)); return requestAnimationFrame(tick); }
      if (action.tx !== undefined) {
        const step = (action.speed * dt) / 1000, dist = action.tx - rx;
        rx += Math.sign(dist) * Math.min(step, Math.abs(dist));
        done = Math.abs(action.tx - rx) < 1;
      } else if (action.dx) {
        rx += (action.dx * dt) / action.dur;
      }
      const e = edge(perch);
      rx = clamp(rx, 16, Math.max(16, e.right - e.left - 16));
      x = e.left + rx;
      y = e.top;
    }
    const [sprite, overlay, lift = 0] = action.look(action);
    canvas.style.transform = `translate(${Math.round(x - PX / 2)}px, ${Math.round(y - PY - lift)}px)`;
    canvas.style.clipPath = lift < 0 ? `inset(0 0 ${Math.round(-lift)}px 0)` : "";
    bubble.style.transform = `translate(calc(${Math.round(x)}px - 50%), calc(${Math.round(y - PY - lift)}px - 100%))`;
    draw(sprite, overlay, facing < 0);
    if (done) start(action.then ? action.then() : randomBehavior());
    requestAnimationFrame(tick);
  }
  start(sleep(rand(3000, 6000)));
  requestAnimationFrame(tick);
})();
