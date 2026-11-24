/* =========================================================
   Portfolio Ahmed Layouni — script.js
   Loader (1re visite de la session), particles, reveal, tilt,
   compteur, console KQL typée, onglets, filtres, copie mail,
   horloge, retour haut.
   ========================================================= */
(() => {
"use strict";

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Loader (affiché uniquement à la 1re entrée de la session) ---------- */
const loader = $("#loader");
const LOADER_STORAGE_KEY = "ahmed_portfolio_loader_seen_v1";

let loaderAlreadySeen = false;
try {
  loaderAlreadySeen = sessionStorage.getItem(LOADER_STORAGE_KEY) === "1";
} catch (_) {
  loaderAlreadySeen = false;
}

let heroStarted = false;
let kqlStarted = false;
let heroAndKqlLaunched = false;

function launchHeroAndKqlOnce() {
  if (heroAndKqlLaunched) return;
  heroAndKqlLaunched = true;
  startHeroType();
  startKql();
}

function hideLoaderFast() {
  if (!loader) return;
  loader.classList.add("done");
  loader.style.opacity = "0";
  loader.style.pointerEvents = "none";
  setTimeout(() => {
    loader.style.display = "none";
  }, 180);
}

if (loader) {
  if (loaderAlreadySeen) {
    // Déjà vu durant cette session : masquage immédiat sans rejouer l'écran de démarrage
    hideLoaderFast();
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(launchHeroAndKqlOnce, 50);
    } else {
      window.addEventListener("DOMContentLoaded", () => setTimeout(launchHeroAndKqlOnce, 50), { once: true });
    }
  } else {
    // Première entrée sur le site dans cette session : on enregistre pour la suite de la session
    try {
      sessionStorage.setItem(LOADER_STORAGE_KEY, "1");
    } catch (_) {}

    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.classList.add("done");
        launchHeroAndKqlOnce();
      }, reduced ? 100 : 2300);
    }, { once: true });

    // Sécurité : masquer le loader même si un asset bloque
    setTimeout(() => {
      hideLoaderFast();
      launchHeroAndKqlOnce();
    }, 5000);
  }
} else {
  launchHeroAndKqlOnce();
}

/* ---------- 2. Barre de progression + header + retour haut ---------- */
const progress = $(".scroll-progress");
const bar = $("#bar");
const backTop = $("#back-top");
function onScroll() {
  const h = document.documentElement;
  const maxScroll = h.scrollHeight - h.clientHeight;
  const pct = maxScroll > 0 ? (h.scrollTop / maxScroll) * 100 : 0;
  if (progress) progress.style.width = pct + "%";
  if (bar) bar.classList.toggle("scrolled", h.scrollTop > 30);
  if (backTop) {
    backTop.hidden = false;
    backTop.classList.toggle("show", h.scrollTop > 600);
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
if (backTop) {
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- 3. Halo curseur ---------- */
const glow = $(".cursor-glow");
if (glow) {
  let gx = innerWidth / 2, gy = innerHeight / 3, tx = gx, ty = gy;
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function moveGlow() {
    gx += (tx - gx) * 0.08;
    gy += (ty - gy) * 0.08;
    glow.style.left = gx + "px";
    glow.style.top  = gy + "px";
    requestAnimationFrame(moveGlow);
  })();
}

/* ---------- 4. Particules canvas ---------- */
const canvas = $("#particles");
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, parts = [];
  const COLORS = ["0,229,160", "77,124,255", "185,107,255"];

  function spawn() {
    parts = Array.from({ length: Math.min(70, Math.floor(innerWidth / 18)) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.6,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: Math.random() * 0.5 + 0.15
    }));
  }

  function resize() {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    spawn();
  }

  resize();
  addEventListener("resize", resize);

  (function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.fill();
    }
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i], b = parts[j];
        const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d < 12000) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(77,124,255,${(1 - d / 12000) * 0.12})`;
          ctx.stroke();
        }
      }
    }
    if (!reduced) requestAnimationFrame(drawParticles);
  })();
}

/* ---------- 5. Reveal au scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => io.observe(el));

/* ---------- 6. Effet tilt 3D sur les cartes ---------- */
if (matchMedia("(pointer:fine)").matches && !reduced) {
  $$(".tilt-card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- 7. Compteurs animés ---------- */
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    counterIO.unobserve(el);
    const target = +el.dataset.target;
    const dur = 1600, t0 = performance.now();
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("fr-FR");
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}, { threshold: 0.6 });
$$(".metric-val").forEach(el => counterIO.observe(el));

/* ---------- 8. Titres tapés (hero) ---------- */
const PHRASES = ["alertes utiles.", "détections MITRE.", "playbooks SOAR.", "chasses aux menaces."];
const typeTarget = $("#type-hero");
function startHeroType() {
  if (heroStarted || !typeTarget) return;
  heroStarted = true;
  if (reduced) {
    typeTarget.textContent = PHRASES[0];
    return;
  }
  let pi = 0, ci = 0, deleting = false;
  (function loop() {
    const word = PHRASES[pi];
    if (!deleting) {
      ci++;
      typeTarget.textContent = word.slice(0, ci);
      if (ci === word.length) {
        deleting = true;
        return setTimeout(loop, 1800);
      }
      return setTimeout(loop, 70);
    }
    ci--;
    typeTarget.textContent = word.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      pi = (pi + 1) % PHRASES.length;
      return setTimeout(loop, 350);
    }
    setTimeout(loop, 35);
  })();
}

/* ---------- 9. Console KQL animée ---------- */
const KQL_LINES = [
  [["f", "CommonSecurityLog"]],
  [["p", "| "], ["k", "where"], ["t", " DeviceVendor == "], ["s", '"Fortinet"']],
  [["p", "| "], ["k", "where"], ["t", " Activity "], ["k", "contains"], ["t", " "], ["s", '"login failed"']],
  [["p", "| "], ["k", "summarize"], ["t", " echecs = "], ["f", "count()"], ["t", " "], ["k", "by"], ["t", " SourceIP, "], ["f", "bin(TimeGenerated, 5m)"]],
  [["p", "| "], ["k", "where"], ["t", " echecs > 10"]]
];
const kqlEl = $("#typed-kql");
const alertEl = $("#kql-alert");

function renderKql(lines) {
  if (!kqlEl) return;
  kqlEl.innerHTML = lines.map(l =>
    l.map(([cls, txt]) => `<span class="${cls}">${txt}</span>`).join("")
  ).join("\n");
}

function startKql() {
  if (kqlStarted || !kqlEl) return;
  kqlStarted = true;
  if (alertEl) alertEl.classList.remove("show");
  if (reduced) {
    renderKql(KQL_LINES);
    if (alertEl) alertEl.classList.add("show");
    return;
  }
  kqlEl.innerHTML = "";
  let li = 0;
  (function typeLine() {
    if (li >= KQL_LINES.length) {
      if (alertEl) alertEl.classList.add("show");
      return;
    }
    const parts = KQL_LINES[li];
    const span = document.createElement("span");
    kqlEl.appendChild(span);
    kqlEl.appendChild(document.createTextNode("\n"));
    let pi = 0, ci = 0;
    const cur = document.createElement("span");
    cur.className = "caret-block";
    (function typeChar() {
      if (pi >= parts.length) {
        li++;
        return setTimeout(typeLine, 140);
      }
      const [cls, txt] = parts[pi];
      if (ci === 0) {
        const s = document.createElement("span");
        s.className = cls;
        span.appendChild(s);
        span.appendChild(cur);
      }
      ci++;
      const target = span.children[span.children.length - 2] || span;
      target.textContent = txt.slice(0, ci);
      if (ci === txt.length) {
        pi++;
        ci = 0;
      }
      setTimeout(typeChar, 16 + Math.random() * 22);
    })();
  })();
}

const replayKqlBtn = $("#replay-kql");
if (replayKqlBtn) {
  replayKqlBtn.addEventListener("click", () => {
    kqlStarted = false;
    startKql();
  });
}

/* ---------- 10. Onglets compétences ---------- */
$$(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    $$(".tab-panel").forEach(p => p.classList.remove("active"));
    const panel = $("#panel-" + tab.dataset.tab);
    if (panel) panel.classList.add("active");
  });
});

/* ---------- 11. Filtres projets ---------- */
$$(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    $$(".project-card").forEach(card => {
      const show = f === "all" || card.dataset.category === f;
      card.classList.toggle("hidden-card", !show);
      card.classList.remove("pop");
      if (show) {
        void card.offsetWidth;
        card.classList.add("pop");
      }
    });
  });
});

/* ---------- 12. Menu mobile ---------- */
const burger = $("#burger");
const menu = $("#menu");
if (burger && menu) {
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#menu a").forEach(a => {
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- 13. Copier l'e-mail ---------- */
const copyMailBtn = $("#copy-mail");
if (copyMailBtn) {
  copyMailBtn.addEventListener("click", async () => {
    const mail = "ahmedlayouni.17@gmail.com";
    try {
      await navigator.clipboard.writeText(mail);
    } catch (_) {
      const tmp = document.createElement("textarea");
      tmp.value = mail;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    const msg = $("#copied-msg");
    if (msg) {
      msg.hidden = false;
      clearTimeout(msg._t);
      msg._t = setTimeout(() => (msg.hidden = true), 2200);
    }
  });
}

/* ---------- 14. Horloge footer ---------- */
const clock = $("#clock");
if (clock) {
  function tickClock() {
    clock.textContent = "uptime " + new Date().toLocaleTimeString("fr-FR", { hour12: false });
  }
  tickClock();
  setInterval(tickClock, 1000);
}

})();
