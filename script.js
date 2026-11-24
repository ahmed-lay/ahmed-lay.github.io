document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Menu mobile burger
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("menu");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Barre de progression du scroll & lueur curseur
  const progressBar = document.querySelector(".scroll-progress");
  const cursorGlow = document.querySelector(".cursor-glow");

  window.addEventListener(
    "scroll",
    () => {
      if (!progressBar) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      progressBar.style.width = `${pct}%`;
    },
    { passive: true }
  );

  if (cursorGlow && !prefersReducedMotion) {
    window.addEventListener(
      "pointermove",
      (e) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
      },
      { passive: true }
    );
  }

  // Apparition au scroll (IntersectionObserver)
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  // Compteurs animés des métriques
  const counters = document.querySelectorAll(".metric-val[data-target]");
  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString("fr-FR");
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("fr-FR");
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (counters.length > 0) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      const counterObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      counters.forEach((c) => counterObs.observe(c));
    }
  }

  // Animation ligne par ligne de la requête KQL + alerte SOC
  const lines = Array.from(document.querySelectorAll("#kql-code .ln"));
  const alertBox = document.getElementById("kql-alert");
  const replayBtn = document.getElementById("replay-kql");
  let kqlTimerIds = [];

  const clearKqlTimers = () => {
    kqlTimerIds.forEach((id) => clearTimeout(id));
    kqlTimerIds = [];
  };

  const playKqlAnimation = () => {
    clearKqlTimers();
    if (prefersReducedMotion) {
      lines.forEach((l) => l.classList.remove("hidden-line"));
      if (alertBox) alertBox.classList.add("visible");
      return;
    }
    lines.forEach((l) => l.classList.add("hidden-line"));
    if (alertBox) alertBox.classList.remove("visible");

    lines.forEach((line, idx) => {
      const t = setTimeout(() => {
        line.classList.remove("hidden-line");
      }, 220 + idx * 240);
      kqlTimerIds.push(t);
    });

    const alertTimer = setTimeout(() => {
      if (alertBox) alertBox.classList.add("visible");
    }, 220 + lines.length * 240 + 250);
    kqlTimerIds.push(alertTimer);
  };

  playKqlAnimation();
  if (replayBtn) {
    replayBtn.addEventListener("click", playKqlAnimation);
  }

  // Filtrage des projets
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  // Inclinaison 3D douce au survol des cartes
  if (!prefersReducedMotion) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }
});
