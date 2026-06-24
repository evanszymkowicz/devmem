/* ============================================================
   DevMemory — Homepage interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Current year in footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Navbar opacity on scroll ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Pricing billing toggle ---------- */
  var sw = document.getElementById("billingSwitch");
  var labels = document.querySelectorAll("[data-billing-label]");
  var proAmount = document.getElementById("proAmount");
  var proPeriod = document.getElementById("proPeriod");
  var proNote = document.getElementById("proNote");

  function setBilling(annual) {
    sw.setAttribute("aria-checked", annual ? "true" : "false");
    labels.forEach(function (l) {
      var match = l.getAttribute("data-billing-label") === (annual ? "annual" : "monthly");
      l.classList.toggle("is-active", match);
    });
    if (proAmount) proAmount.textContent = annual ? "$6" : "$8";
    if (proPeriod) proPeriod.textContent = annual ? "/mo" : "/mo";
    if (proNote) proNote.textContent = annual ? "$72 billed annually" : "Billed monthly";
  }
  if (sw) {
    sw.addEventListener("click", function () {
      setBilling(sw.getAttribute("aria-checked") !== "true");
    });
    setBilling(false);
  }

  /* ---------- Chaos icons animation ---------- */
  var field = document.getElementById("chaosField");
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!field) return;

  // Icon set: where developer knowledge scatters today.
  var ICONS = [
    // Notion
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8v8l8-8v8"/></svg>',
    // GitHub
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/></svg>',
    // Slack
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="2" width="3" height="8" rx="1.5"/><path d="M19 8.5A1.5 1.5 0 1 0 20.5 10H19z"/><rect x="8" y="14" width="3" height="8" rx="1.5"/><path d="M5 15.5A1.5 1.5 0 1 1 3.5 14H5z"/><rect x="14" y="13" width="8" height="3" rx="1.5"/><path d="M15.5 19A1.5 1.5 0 1 0 14 20.5V19z"/><rect x="2" y="8" width="8" height="3" rx="1.5"/><path d="M8.5 5A1.5 1.5 0 1 1 10 3.5V5z"/></svg>',
    // VS Code
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 5 2.5v13L16 21 4 11l3-2 9 7V5z"/></svg>',
    // Browser tabs
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M8 6V4h8v2"/></svg>',
    // Terminal
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    // Text file
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
    // Bookmark
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'
  ];

  var ICON_TINTS = [
    "#e7eaf3", "#e7eaf3", "#ec4899", "#3b82f6",
    "#6366f1", "#06b6d4", "#9aa3b8", "#f59e0b"
  ];

  var SIZE = 48;
  var items = [];
  var rect = field.getBoundingClientRect();
  var W = rect.width;
  var H = rect.height;

  ICONS.forEach(function (svg, i) {
    var el = document.createElement("div");
    el.className = "chaos__icon";
    el.innerHTML = svg;
    el.style.color = ICON_TINTS[i] || "#e7eaf3";
    field.appendChild(el);
    items.push({
      el: el,
      x: Math.random() * Math.max(1, W - SIZE),
      y: Math.random() * Math.max(1, H - SIZE),
      vx: (Math.random() - 0.5) * 1.1,
      vy: (Math.random() - 0.5) * 1.1,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2
    });
  });

  // Track mouse within the field for repulsion.
  var mouse = { x: -999, y: -999, active: false };
  field.addEventListener("mousemove", function (e) {
    var r = field.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  field.addEventListener("mouseleave", function () { mouse.active = false; });

  window.addEventListener("resize", function () {
    var r = field.getBoundingClientRect();
    W = r.width; H = r.height;
  });

  var REPEL_RADIUS = 90;
  var t = 0;

  function tick() {
    t += 0.016;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];

      // Mouse repulsion (move away from cursor).
      if (mouse.active) {
        var cx = it.x + SIZE / 2;
        var cy = it.y + SIZE / 2;
        var dx = cx - mouse.x;
        var dy = cy - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < REPEL_RADIUS) {
          var force = (1 - dist / REPEL_RADIUS) * 0.9;
          it.vx += (dx / dist) * force;
          it.vy += (dy / dist) * force;
        }
      }

      // Drift + gentle damping toward a cruising speed.
      it.x += it.vx;
      it.y += it.vy;
      it.vx *= 0.985;
      it.vy *= 0.985;

      // Keep a little life so they never fully stop.
      var speed = Math.sqrt(it.vx * it.vx + it.vy * it.vy);
      if (speed < 0.25) {
        it.vx += (Math.random() - 0.5) * 0.4;
        it.vy += (Math.random() - 0.5) * 0.4;
      }

      // Bounce off walls.
      if (it.x <= 0) { it.x = 0; it.vx = Math.abs(it.vx); }
      else if (it.x >= W - SIZE) { it.x = W - SIZE; it.vx = -Math.abs(it.vx); }
      if (it.y <= 0) { it.y = 0; it.vy = Math.abs(it.vy); }
      else if (it.y >= H - SIZE) { it.y = H - SIZE; it.vy = -Math.abs(it.vy); }

      it.rot += it.vr;
      var pulse = 1 + Math.sin(t * 1.6 + it.phase) * 0.06;

      it.el.style.transform =
        "translate(" + it.x.toFixed(2) + "px," + it.y.toFixed(2) + "px) " +
        "rotate(" + it.rot.toFixed(2) + "deg) scale(" + pulse.toFixed(3) + ")";
    }
    rafId = requestAnimationFrame(tick);
  }

  var rafId;
  if (prefersReduced) {
    // Static, evenly placed layout — no animation loop.
    items.forEach(function (it, i) {
      var col = i % 4;
      var row = Math.floor(i / 4);
      it.x = 12 + col * ((W - SIZE - 24) / 3);
      it.y = 40 + row * ((H - SIZE - 80));
      it.el.style.transform = "translate(" + it.x + "px," + it.y + "px)";
    });
  } else {
    rafId = requestAnimationFrame(tick);
  }
})();
