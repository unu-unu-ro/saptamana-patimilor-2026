/* ============================================================
   app.js — Săptămâna Patimilor 2026
   SPA: hash router · progress tracking · Web Share API
   Requires: data.json served from the same origin
   ============================================================ */

"use strict";

// ─────────────────────────────────────────────────────────────
//  State
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "sp2026-progress";

let DATA = null;

const state = {
  view: "home", // 'home' | 'day' | 'loading' | 'error'
  dayId: null,
  drawerOpen: false,
  progress: new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")),
};

// ─────────────────────────────────────────────────────────────
//  Data loading
// ─────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
  } catch (err) {
    console.error("Failed to load data.json:", err);
    renderError(err);
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────
//  Progress
// ─────────────────────────────────────────────────────────────
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.progress]));
}

function markRead(dayId) {
  state.progress.add(dayId);
  saveProgress();
  updateProgressBar();
  renderDrawerNav();
}

function isRead(dayId) {
  return state.progress.has(dayId);
}
function getProgressPercent() {
  return Math.round((state.progress.size / DATA.days.length) * 100);
}

// ─────────────────────────────────────────────────────────────
//  Router
// ─────────────────────────────────────────────────────────────
function navigate(path) {
  window.location.hash = path;
}

function handleRoute() {
  if (!DATA) return;

  const hash = window.location.hash || "#/";

  if (hash === "#/" || hash === "" || hash === "#") {
    state.view = "home";
    state.dayId = null;
  } else if (hash === "#/despre") {
    state.view = "about";
    state.dayId = null;
  } else {
    const match = hash.match(/#\/zi\/(\d+)/);
    if (match) {
      const id = parseInt(match[1], 10);
      const day = DATA.days.find((d) => d.id === id);
      if (day) {
        state.view = "day";
        state.dayId = id;
        if (!isRead(id)) markRead(id);
      } else {
        state.view = "home";
        state.dayId = null;
      }
    }
  }

  render();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", handleRoute);

// ─────────────────────────────────────────────────────────────
//  Drawer
// ─────────────────────────────────────────────────────────────
function toggleDrawer() {
  state.drawerOpen ? closeDrawer() : openDrawer();
}

function openDrawer() {
  state.drawerOpen = true;
  document.getElementById("drawer").classList.add("open");
  const ov = document.getElementById("drawer-overlay");
  ov.classList.remove("opacity-0", "pointer-events-none");
  ov.classList.add("opacity-100");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  state.drawerOpen = false;
  document.getElementById("drawer").classList.remove("open");
  const ov = document.getElementById("drawer-overlay");
  ov.classList.add("opacity-0", "pointer-events-none");
  ov.classList.remove("opacity-100");
  document.body.style.overflow = "";
}

// ─────────────────────────────────────────────────────────────
//  Share
// ─────────────────────────────────────────────────────────────
async function shareCurrentDay() {
  if (state.view !== "day" || !state.dayId || !DATA) return;
  const day = DATA.days.find((d) => d.id === state.dayId);
  if (!day) return;

  const url = `${location.origin}${location.pathname}#/zi/${day.id}`;
  const text = `${day.name} — "${day.keyVerse.text}"\n— ${day.keyVerse.reference}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${day.name} · Săptămâna Patimilor 2026`,
        text,
        url,
      });
      return;
    } catch (e) {
      if (e.name === "AbortError") return; // user dismissed
    }
  }

  // Fallback: copy to clipboard
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    showToast("Link copiat în clipboard!");
  } else {
    showToast("Link: " + url);
  }
}

// ─────────────────────────────────────────────────────────────
//  Toast
// ─────────────────────────────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  document.getElementById("toast")?.remove();
  const el = document.createElement("div");
  el.id = "toast";
  el.className =
    "fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-full text-sm font-body shadow-lg";
  el.style.cssText = "background:#1b1c19;color:#f2f1ec;white-space:nowrap;";
  el.textContent = msg;
  document.body.appendChild(el);
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.remove(), 2600);
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function getTodayDayId() {
  if (!DATA) return null;
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-indexed
  const d = today.getDate();

  // Map each day entry to its calendar date (Orthodox Easter 2026 = 12 Apr)
  const calDates = [
    [2026, 3, 5], // day 1  April  5  — Duminica Floriilor
    [2026, 3, 6], // day 2  April  6  — Luni
    [2026, 3, 7], // day 3  April  7  — Marți
    [2026, 3, 8], // day 4  April  8  — Miercuri
    [2026, 3, 9], // day 5  April  9  — Joi
    [2026, 3, 10], // day 6  April 10  — Vineri
    [2026, 3, 11], // day 7  April 11  — Sâmbătă
    [2026, 3, 12], // day 8  April 12  — Duminica Învierii
  ];

  for (let i = 0; i < calDates.length; i++) {
    const [cy, cm, cd] = calDates[i];
    if (y === cy && m === cm && d === cd) return i + 1;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
//  Card style map
// ─────────────────────────────────────────────────────────────
const CARD_STYLES = {
  default: {
    bg: "bg-surface-container-lowest",
    text: "text-primary",
    sub: "text-on-surface-variant",
    icon: "text-outline",
    line: "bg-secondary",
    num: "text-outline-variant/40",
    verse: "text-on-surface-variant",
  },
  offset: {
    bg: "bg-surface-container-low",
    text: "text-primary",
    sub: "text-on-surface-variant",
    icon: "text-outline",
    line: "bg-secondary",
    num: "text-outline-variant/40",
    verse: "text-on-surface-variant",
  },
  wide: {
    bg: "bg-surface-container-lowest",
    text: "text-primary",
    sub: "text-on-surface-variant",
    icon: "text-outline",
    line: "bg-secondary",
    num: "text-outline-variant/40",
    verse: "text-on-surface-variant",
  },
  goodFriday: {
    bg: "good-friday-gradient",
    text: "text-on-primary",
    sub: "text-primary-fixed-dim",
    icon: "text-on-primary-container",
    line: "bg-primary-fixed-dim",
    num: "text-on-primary/20",
    verse: "text-primary-fixed-dim",
  },
  easter: {
    bg: "bg-secondary-container",
    text: "text-on-secondary-container font-bold",
    sub: "text-on-secondary-container/70",
    icon: "text-on-secondary-container",
    line: "bg-on-secondary-container",
    num: "text-on-secondary-container/30",
    verse: "text-on-secondary-container/80",
  },
};

function getStyle(day) {
  return CARD_STYLES[day.cardStyle] || CARD_STYLES.default;
}

// ─────────────────────────────────────────────────────────────
//  Render: progress bar
// ─────────────────────────────────────────────────────────────
function updateProgressBar() {
  const el = document.getElementById("progress-bar-fill");
  if (el && DATA) el.style.width = getProgressPercent() + "%";
}

// ─────────────────────────────────────────────────────────────
//  Render: drawer nav
// ─────────────────────────────────────────────────────────────
function renderDrawerNav() {
  const nav = document.getElementById("drawer-nav");
  const txt = document.getElementById("drawer-progress-text");
  if (!nav || !DATA) return;

  const activeAbout = state.view === "about";
  nav.innerHTML =
    DATA.days
      .map((day) => {
        const read = isRead(day.id);
        const active = state.view === "day" && state.dayId === day.id;
        return `
        <a href="#/zi/${day.id}" onclick="closeDrawer()"
           class="flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${active ? "bg-primary-fixed/30" : "hover:bg-surface-container"}">
          <span class="material-symbols-outlined icon-md ${active ? "text-secondary" : read ? "text-secondary/60" : "text-outline"}">${day.icon}</span>
          <div class="flex-1 min-w-0">
            <div class="font-body text-xs font-semibold uppercase tracking-widest ${active ? "text-primary" : "text-on-surface-variant"} truncate">${day.shortName}</div>
            <div class="font-body text-xs text-outline">${day.date}</div>
          </div>
          ${read ? `<span class="material-symbols-outlined icon-sm text-secondary" style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 20">check_circle</span>` : ""}
        </a>`;
      })
      .join("") +
    `<div class="mt-4 pt-4 border-t border-outline-variant/10">
       <a href="#/despre" onclick="closeDrawer()"
          class="flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${activeAbout ? "bg-primary-fixed/30" : "hover:bg-surface-container"}">
         <span class="material-symbols-outlined icon-md ${activeAbout ? "text-secondary" : "text-outline"}">info</span>
         <span class="font-body text-xs font-semibold uppercase tracking-widest ${activeAbout ? "text-primary" : "text-on-surface-variant"}">Despre</span>
       </a>
     </div>`;

  if (txt) {
    const n = state.progress.size;
    txt.textContent =
      n === 0
        ? "Nicio zi citită încă"
        : `${n} din ${DATA.days.length} zile citite`;
  }
}

// ─────────────────────────────────────────────────────────────
//  Render: home view
// ─────────────────────────────────────────────────────────────
function renderHome() {
  const todayId = getTodayDayId();
  const readCnt = state.progress.size;
  const total = DATA.days.length;

  document.getElementById("header-title").textContent = "Săptămâna Patimilor";
  document.getElementById("header-share-btn").classList.add("hidden");
  document.getElementById("header-spacer").classList.remove("hidden");
  updateMeta({ title: null, description: null, url: location.origin + location.pathname + "#/" });

  return /* html */ `
    <div class="view-enter">

      <!-- Hero -->
      <section class="px-5 pt-8 pb-10">
        <div class="flex items-end justify-between mb-2">
          <div>
            <p class="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-3">
              Devoțional zilnic · ${DATA.meta.year}
            </p>
            <h1 class="font-headline text-4xl font-light tracking-tight leading-none text-primary">
              Săptămâna<br><em>Patimilor</em>
            </h1>
          </div>
          <div class="text-right">
            <p class="font-headline text-5xl text-primary/10 italic font-light leading-none">
              ${readCnt > 0 ? readCnt : "∞"}
            </p>
            <p class="font-body text-xs text-outline mt-1">
              ${readCnt > 0 ? `din ${total} zile` : "zile te așteaptă"}
            </p>
          </div>
        </div>

        <p class="font-body text-sm text-on-surface-variant leading-relaxed mt-4 opacity-80">
          O călătorie prin ultimele zile ale lui Isus — de la Ierusalim la Golgota și la mormântul gol.
        </p>

        ${
          readCnt > 0
            ? /* html */ `
        <div class="mt-5 flex items-center gap-3">
          <div class="flex-1 h-1 bg-outline-variant/20 rounded-full overflow-hidden">
            <div class="h-full bg-secondary rounded-full progress-fill" style="width:${getProgressPercent()}%"></div>
          </div>
          <span class="font-body text-xs text-outline whitespace-nowrap">${getProgressPercent()}% parcurs</span>
        </div>`
            : ""
        }
      </section>

      <!-- Day cards -->
      <section class="px-4 pb-24">
        <div class="grid grid-cols-1 gap-4">
          ${DATA.days.map((day) => renderDayCard(day, todayId)).join("")}
        </div>
      </section>

      <!-- Footer -->
      <footer class="px-5 pb-16 text-center">
        <p class="font-headline italic text-base text-primary/50 mb-4">Solace în Cuvânt.</p>
        <div class="inline-flex flex-col items-center gap-1">
          <a href="http://unu-unu.ro/" target="_blank" rel="noopener"
             class="font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 active:opacity-60">
            Biserica Unu Unu
          </a>
          <div class="w-4 h-px bg-secondary/40"></div>
          <p class="font-body text-xs text-outline uppercase tracking-widest">${DATA.meta.dates} ${DATA.meta.year}</p>
        </div>
      </footer>
    </div>`;
}

function renderDayCard(day, todayId) {
  const s = getStyle(day);
  const read = isRead(day.id);
  const isToday = day.id === todayId;

  return /* html */ `
    <a href="#/zi/${day.id}"
       class="day-card relative flex flex-col ${s.bg} p-6 min-h-[160px] justify-between rounded-sm overflow-hidden no-underline">

      <!-- Top row -->
      <div class="flex justify-between items-start">
        <span class="font-headline text-3xl ${s.num} italic leading-none">${String(day.id).padStart(2, "0")}</span>
        <div class="flex items-center gap-2">
          ${isToday ? `<span class="chip active">Azi</span>` : ""}
          ${
            read
              ? `<span class="material-symbols-outlined icon-sm text-secondary read-badge"
                         style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 20">check_circle</span>`
              : ""
          }
          <span class="material-symbols-outlined icon-md ${s.icon}">${day.icon}</span>
        </div>
      </div>

      <!-- Bottom content -->
      <div>
        <p class="font-body text-xs uppercase tracking-[0.15em] ${s.sub} mb-1 opacity-70">${day.date}</p>
        <h3 class="font-headline text-xl ${s.text} mb-1 leading-tight">${day.name}</h3>
        <p class="font-body text-xs ${s.verse} italic leading-relaxed mb-3 line-clamp-2 opacity-80">
          &ldquo;${day.keyVerse.text}&rdquo;
        </p>
        <div class="w-8 h-px ${s.line} expand-line opacity-60"></div>
      </div>

      <!-- Hover scrim (desktop) -->
      <div class="absolute inset-0 bg-on-surface/0 hover:bg-on-surface/5 transition-colors duration-300 pointer-events-none"></div>
    </a>`;
}

// ─────────────────────────────────────────────────────────────
//  Render: day view
// ─────────────────────────────────────────────────────────────
function renderDay(dayId) {
  const day = DATA.days.find((d) => d.id === dayId);
  if (!day) return renderHome();

  const prevDay = DATA.days.find((d) => d.id === dayId - 1);
  const nextDay = DATA.days.find((d) => d.id === dayId + 1);
  const s = getStyle(day);
  const isGF = day.cardStyle === "goodFriday";
  const isEast = day.cardStyle === "easter";

  // Header + meta
  document.getElementById("header-title").textContent = day.shortName;
  document.getElementById("header-share-btn").classList.remove("hidden");
  document.getElementById("header-spacer").classList.add("hidden");
  updateMeta({
    title:       `${day.name} · ${day.date}`,
    description: `${day.keyVerse.text} — ${day.keyVerse.reference}. ${day.subtitle}. Devoțional zilnic organizat de Biserica Unu Unu.`,
    url:         `${location.origin}${location.pathname}#/zi/${day.id}`,
  });

  const backColor = isGF
    ? "text-primary-fixed-dim"
    : isEast
      ? "text-on-secondary-container/60"
      : "text-outline";
  const heroNumColor = isGF
    ? "text-on-primary/10"
    : isEast
      ? "text-on-secondary-container/10"
      : "text-primary/10";

  return /* html */ `
    <div class="view-enter">

      <!-- Hero header -->
      <div class="${s.bg} px-5 pt-6 pb-10 relative overflow-hidden">

        <a href="#/" class="inline-flex items-center gap-1 font-body text-xs uppercase tracking-widest ${backColor} mb-6 active:opacity-70">
          <span class="material-symbols-outlined icon-sm">arrow_back</span>
          <span>Toate zilele</span>
        </a>

        <div class="flex items-start justify-between mb-2">
          <span class="font-headline text-7xl ${heroNumColor} italic leading-none font-light">
            ${String(day.id).padStart(2, "0")}
          </span>
          <span class="chip ${isGF ? "tertiary" : isEast ? "active" : ""} mt-2">${day.subtitle}</span>
        </div>

        <h1 class="font-headline text-4xl ${s.text} leading-tight font-light -mt-4">${day.name}</h1>
        <p class="font-body text-sm ${s.sub} mt-2 opacity-80">${day.date}</p>

        <blockquote class="mt-6 border-l-2 border-secondary pl-4">
          <p class="font-headline italic text-lg ${s.text} leading-relaxed">&ldquo;${day.keyVerse.text}&rdquo;</p>
          <cite class="font-body text-xs ${s.sub} mt-1 block not-italic uppercase tracking-widest opacity-70">
            — ${day.keyVerse.reference}
          </cite>
        </blockquote>

        ${isGF ? `<div class="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-tertiary to-primary"></div>` : ""}
      </div>

      <!-- Reading plan -->
      ${day.readingPlan ? renderReadingPlan(day.readingPlan) : ""}

      <!-- Sections -->
      <div class="bg-surface">
        ${day.sections.map((sec) => renderSection(sec)).join("")}
      </div>

      <!-- Prev / Next navigation -->
      <div class="bg-surface-container-low border-t border-outline-variant/10 px-5 py-6 grid grid-cols-2 gap-4">
        ${
          prevDay
            ? `<a href="#/zi/${prevDay.id}" class="flex flex-col gap-1 active:opacity-70">
               <span class="font-body text-xs uppercase tracking-widest text-outline flex items-center gap-1">
                 <span class="material-symbols-outlined icon-sm">arrow_back</span> Ziua anterioară
               </span>
               <span class="font-headline text-sm text-primary">${prevDay.name}</span>
             </a>`
            : "<div></div>"
        }
        ${
          nextDay
            ? `<a href="#/zi/${nextDay.id}" class="flex flex-col gap-1 items-end text-right active:opacity-70">
               <span class="font-body text-xs uppercase tracking-widest text-outline flex items-center gap-1">
                 Ziua următoare <span class="material-symbols-outlined icon-sm">arrow_forward</span>
               </span>
               <span class="font-headline text-sm text-primary">${nextDay.name}</span>
             </a>`
            : "<div></div>"
        }
      </div>

      <!-- Spacer for floating bar -->
      <div class="h-24"></div>

      <!-- Floating action bar -->
      <div class="fixed bottom-0 left-0 right-0 flex justify-center"
           style="padding-bottom: max(env(safe-area-inset-bottom), 1.25rem);">
        <div class="bg-surface/90 backdrop-blur-md px-6 py-3 flex items-center gap-3 shadow-lg rounded-full">
          <button onclick="navigate('#/')"
                  class="flex items-center gap-2 font-body text-xs uppercase tracking-widest text-outline px-3 py-2 rounded-full active:bg-surface-container transition-colors">
            <span class="material-symbols-outlined icon-sm">grid_view</span>
            Toate zilele
          </button>
          <div class="w-px h-6 bg-outline-variant/30"></div>
          <button onclick="shareCurrentDay()"
                  class="flex items-center gap-2 font-body text-xs uppercase tracking-widest text-secondary share-pulse px-3 py-2 rounded-full active:bg-secondary-container transition-colors">
            <span class="material-symbols-outlined icon-sm">share</span>
            Distribuie
          </button>
        </div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  Render: reading plan block
// ─────────────────────────────────────────────────────────────
function renderReadingPlan(plan) {
  const src = DATA.meta.readingSource;
  return /* html */ `
    <div class="bg-surface-container-lowest border-b border-outline-variant/10">

      <!-- Header row -->
      <div class="flex items-center justify-between px-5 pt-6 pb-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined icon-sm text-secondary">book_2</span>
          <p class="font-body text-xs uppercase tracking-widest text-secondary font-semibold">Plan de citire</p>
        </div>
        <a href="${src.url}" target="_blank" rel="noopener"
           class="font-body text-xs text-outline italic hover:text-primary transition-colors active:opacity-60 truncate max-w-[160px]">
          ${src.title} · ${src.author}
        </a>
      </div>

      <!-- Two reading columns -->
      <div class="grid grid-cols-2 gap-px bg-outline-variant/10 mx-5 mb-6 rounded-sm overflow-hidden">

        <!-- Old Testament -->
        <div class="bg-surface-container-low px-4 py-4">
          <p class="font-body text-xs uppercase tracking-widest text-outline mb-2">Vechiul Testament</p>
          <p class="font-headline italic text-sm text-primary leading-snug">${plan.ot}</p>
          ${
            plan.otCrossRef
              ? `
          <p class="font-body text-xs text-secondary mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined icon-sm" style="font-size:0.8rem">link</span>
            v. ${plan.otCrossRef}
          </p>`
              : ""
          }
        </div>

        <!-- Gospel -->
        <div class="bg-surface-container-low px-4 py-4 border-l border-outline-variant/10">
          <p class="font-body text-xs uppercase tracking-widest text-outline mb-2">Evanghelie</p>
          <p class="font-headline italic text-sm text-primary leading-snug">${plan.gospel}</p>
        </div>

      </div>
    </div>`;
}

function renderSection(sec) {
  switch (sec.type) {
    case "intro":
      return /* html */ `
        <div class="px-5 py-8 bg-surface border-b border-outline-variant/10">
          <p class="font-body text-base text-on-surface-variant leading-relaxed">${sec.content}</p>
        </div>`;

    case "scripture":
      return /* html */ `
        <div class="px-5 py-8 bg-surface-container-low border-b border-outline-variant/10">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined icon-sm text-secondary">menu_book</span>
            <p class="font-body text-xs uppercase tracking-widest text-secondary font-semibold">${sec.title}</p>
          </div>
          <span class="chip mb-4">${sec.reference}</span>
          <div class="scripture-block mt-4">
            <p class="font-headline text-base text-on-surface leading-[1.8] whitespace-pre-line">${sec.content}</p>
          </div>
        </div>`;

    case "reflection":
      return /* html */ `
        <div class="px-5 py-8 bg-surface border-b border-outline-variant/10">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined icon-sm text-outline">lightbulb</span>
            <p class="font-body text-xs uppercase tracking-widest text-outline font-semibold">${sec.title}</p>
          </div>
          <div class="space-y-4">
            ${sec.content
              .split("\n\n")
              .map(
                (p) =>
                  `<p class="font-body text-sm text-on-surface leading-relaxed">${p}</p>`,
              )
              .join("")}
          </div>
        </div>`;

    case "prayer":
      return /* html */ `
        <div class="px-5 py-8 bg-primary/5 border-b border-outline-variant/10">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined icon-sm text-primary">volunteer_activism</span>
            <p class="font-body text-xs uppercase tracking-widest text-primary font-semibold">${sec.title}</p>
          </div>
          <p class="font-headline italic text-base text-primary leading-relaxed">${sec.content}</p>
        </div>`;

    case "callToAction":
      return /* html */ `
        <div class="px-5 py-8 bg-secondary-container border-b border-outline-variant/10">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined icon-sm text-on-secondary-container">directions_run</span>
            <p class="font-body text-xs uppercase tracking-widest text-on-secondary-container font-semibold">${sec.title}</p>
          </div>
          <p class="font-body text-sm text-on-secondary-container leading-relaxed">${sec.content}</p>
        </div>`;

    default:
      return "";
  }
}

// ─────────────────────────────────────────────────────────────
//  Render: loading skeleton
// ─────────────────────────────────────────────────────────────
function renderLoading() {
  const main = document.getElementById("main-content");
  main.innerHTML = /* html */ `
    <div class="px-4 pt-8 space-y-4">
      <div class="skeleton h-8 w-48 mb-6"></div>
      ${[1, 2, 3, 4]
        .map(
          () => `
        <div class="skeleton h-40 w-full rounded-sm"></div>
      `,
        )
        .join("")}
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  Render: error state
// ─────────────────────────────────────────────────────────────
function renderError(err) {
  const main = document.getElementById("main-content");
  main.innerHTML = /* html */ `
    <div class="error-state">
      <span class="material-symbols-outlined text-outline" style="font-size:3rem">error_outline</span>
      <h2 class="font-headline text-xl text-primary">Nu s-a putut încărca conținutul</h2>
      <p class="font-body text-sm text-on-surface-variant max-w-xs">
        Asigurați-vă că fișierul <code>data.json</code> există și că aplicația
        este servită de un server web (nu deschisă direct ca fișier local).
      </p>
      <p class="font-body text-xs text-outline font-mono">${err.message}</p>
      <button onclick="location.reload()"
              class="mt-4 px-6 py-2 bg-primary text-on-primary font-body text-sm rounded-md active:opacity-80">
        Încearcă din nou
      </button>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  Main render
// ─────────────────────────────────────────────────────────────
//  Render: about view
// ─────────────────────────────────────────────────────────────
function renderAbout() {
  const src = DATA.meta.readingSource;

  document.getElementById("header-title").textContent = "Despre";
  document.getElementById("header-share-btn").classList.add("hidden");
  document.getElementById("header-spacer").classList.remove("hidden");
  updateMeta({
    title:       "Despre · Săptămâna Patimilor",
    description: "Devoțional zilnic organizat de Biserica Unu Unu, cu plan de lectură după cartea «Patimile lui Hristos» de McKinley.",
    url:         `${location.origin}${location.pathname}#/despre`,
  });

  return /* html */ `
    <div class="view-enter">

      <!-- Back -->
      <div class="px-5 pt-6 pb-2">
        <a href="#/" class="inline-flex items-center gap-1 font-body text-xs uppercase tracking-widest text-outline active:opacity-70">
          <span class="material-symbols-outlined icon-sm">arrow_back</span>
          <span>Înapoi</span>
        </a>
      </div>

      <!-- Hero -->
      <section class="px-5 pt-4 pb-10">
        <p class="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-3">Despre proiect</p>
        <h1 class="font-headline text-4xl font-light tracking-tight leading-none text-primary mb-6">
          Săptămâna<br><em>Patimilor</em>
        </h1>
        <p class="font-body text-sm text-on-surface-variant leading-relaxed">
          Un devoțional zilnic pentru cele opt zile ale Săptămânii Patimilor — de la Duminica Floriilor până la Duminica Învierii.
        </p>
      </section>

      <!-- Organizator -->
      <div class="bg-surface-container-lowest border-t border-b border-outline-variant/10 px-5 py-8">
        <div class="flex items-start gap-4">
          <span class="material-symbols-outlined text-secondary mt-0.5" style="font-size:1.75rem">church</span>
          <div>
            <p class="font-body text-xs uppercase tracking-widest text-outline mb-1">Organizat de</p>
            <p class="font-headline text-xl text-primary mb-1">Biserica Unu Unu</p>
            <p class="font-body text-sm text-on-surface-variant leading-relaxed mb-3">
              O comunitate de credință din România, dedicată predicii expozitive și uceniciei biblice.
            </p>
            <a href="http://unu-unu.ro/" target="_blank" rel="noopener"
               class="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-widest text-secondary active:opacity-70">
              <span class="material-symbols-outlined icon-sm">open_in_new</span>
              unu-unu.ro
            </a>
          </div>
        </div>
      </div>

      <!-- Plan de lectură -->
      <div class="bg-surface-container-low border-b border-outline-variant/10 px-5 py-8">
        <div class="flex items-start gap-4">
          <span class="material-symbols-outlined text-primary/60 mt-0.5" style="font-size:1.75rem">book_2</span>
          <div>
            <p class="font-body text-xs uppercase tracking-widest text-outline mb-1">Plan de lectură</p>
            <p class="font-headline text-xl text-primary mb-1">${src.title}</p>
            <p class="font-body text-sm text-on-surface-variant leading-relaxed mb-1">de <span class="font-semibold">${src.author}</span></p>
            <p class="font-body text-sm text-on-surface-variant leading-relaxed mb-4">
              Recomandările de citire biblică din fiecare zi urmează planul propus de McKinley în această carte — câte o lectură din Vechiul Testament și una din Evanghelia după Luca, urmărindu-L pe Hristos pas cu pas.
            </p>
            <a href="${src.url}" target="_blank" rel="noopener"
               class="inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-widest text-secondary active:opacity-70">
              <span class="material-symbols-outlined icon-sm">open_in_new</span>
              Citește gratuit pe Magna Gratia
            </a>
          </div>
        </div>
      </div>

      <!-- Spacer -->
      <div class="h-16"></div>

    </div>`;
}

// ─────────────────────────────────────────────────────────────
function render() {
  const main = document.getElementById("main-content");
  if (!main || !DATA) return;

  if (state.view === "day" && state.dayId) {
    main.innerHTML = renderDay(state.dayId);
  } else if (state.view === "about") {
    main.innerHTML = renderAbout();
  } else {
    main.innerHTML = renderHome();
  }

  updateProgressBar();
  renderDrawerNav();
}

// ─────────────────────────────────────────────────────────────
//  Meta tag updater (title · description · og · twitter)
//  Called on every route change.
//  NOTE: WhatsApp's link-preview bot strips URL hash fragments, so
//  it always fetches the base index.html and shows default tags.
//  Per-day previews require server-side rendering or a CDN edge function.
// ─────────────────────────────────────────────────────────────
function updateMeta({ title, description, url }) {
  const siteName  = "Săptămâna Patimilor 2026 · Biserica Unu Unu";
  const fullTitle = title ? `${title} · Săptămâna Patimilor` : siteName;
  const desc      = description || "Un devoțional zilnic pentru Săptămâna Patimilor — 8 zile de lectură biblică, meditație și rugăciune. Organizat de Biserica Unu Unu.";
  const canonical = url || location.href;

  // <title>
  const titleEl = document.getElementById("page-title");
  if (titleEl) titleEl.textContent = fullTitle;
  document.title = fullTitle;

  // <meta name="description">
  setMeta("meta-description", "content", desc);

  // Open Graph
  setMeta("og-title",       "content", fullTitle);
  setMeta("og-description", "content", desc);
  setMeta("og-url",         "content", canonical);

  // Twitter / X
  setMeta("twitter-title",       "content", fullTitle);
  setMeta("twitter-description", "content", desc);
}

function setMeta(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

// ─────────────────────────────────────────────────────────────
//  Bootstrap
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  renderLoading();

  const ok = await loadData();
  if (!ok) return;

  // Patch drawer header dates from data
  const datesEl = document.getElementById("drawer-dates");
  if (datesEl) datesEl.textContent = `${DATA.meta.dates} ${DATA.meta.year}`;

  handleRoute();
});
