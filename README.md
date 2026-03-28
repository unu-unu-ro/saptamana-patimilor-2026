# Săptămâna Patimilor 2026

> A Romanian-language daily devotional micro-site for Holy Week — built as a zero-dependency SPA with a premium editorial aesthetic.

**Live dates:** 5 Aprilie – 12 Aprilie 2026
**Language:** Romanian (`ro`)
**Target:** 99% mobile users

---

## Features

| Feature | Details |
|---|---|
| **Daily devotional content** | 8 days, each with intro · scripture · reflection · prayer · call to action |
| **Progress tracking** | Days auto-marked as read; persisted in `localStorage` |
| **Deep links** | Each day has a shareable URL: `index.html#/zi/1` … `#/zi/8` |
| **Native sharing** | Web Share API with clipboard fallback |
| **"Today" detection** | Current day highlighted automatically during Holy Week 2026 |
| **Offline-ready** | Static files; no build step; deployable to any CDN or GitHub Pages |

---

## File structure

```
sp-2026/
├── index.html   ← App shell & Tailwind design-token config
├── app.css      ← Custom styles (glassmorphism, animations, chips…)
├── app.js       ← SPA logic: router, state, rendering, share API
├── data.json    ← All devotional content (edit this to update copy)
└── README.md
```

---

## Design system

Follows the **Editorial Reverence** design system:

- **Fonts** — Newsreader (display/scripture) + Manrope (body/UI)
- **Colors** — Material Design 3 palette anchored in Slate Blue `#183241`
- **No-line rule** — section boundaries via background-color shifts only
- **Glassmorphism** — header at 85% opacity + `backdrop-blur: 20px`
- **Good Friday** — special dark gradient (`#183241 → #36294a`)
- **Easter Sunday** — warm gold `secondary-container` (#f7e382)
- **Icons** — Material Symbols Outlined, 1pt weight (never filled)

---

## Content editing

All copy lives in **`data.json`**. Each day follows this schema:

```jsonc
{
  "id": 1,                       // 1–8, used in URL (#/zi/1)
  "slug": "duminica-floriilor",  // URL-friendly identifier
  "name": "Duminica Floriilor",  // Full display name
  "shortName": "Floriilor",      // Drawer & header label
  "subtitle": "Intrarea triumfală",
  "date": "29 Martie 2026",
  "icon": "auto_awesome",        // Material Symbol name
  "cardStyle": "default",        // default | offset | wide | goodFriday | easter
  "keyVerse": {
    "text": "Osana! …",
    "reference": "Marcu 11:9"
  },
  "sections": [
    { "type": "intro",       "content": "…" },
    { "type": "scripture",   "title": "…", "reference": "…", "content": "…" },
    { "type": "reflection",  "title": "…", "content": "Paragraph 1\n\nParagraph 2" },
    { "type": "prayer",      "title": "…", "content": "…" },
    { "type": "callToAction","title": "…", "content": "…" }
  ]
}
```

### Section types

| Type | Background | Font |
|---|---|---|
| `intro` | `surface` | Manrope, muted |
| `scripture` | `surface-container-low` | Newsreader italic, gold left border |
| `reflection` | `surface` | Manrope, paragraphs split on `\n\n` |
| `prayer` | `primary` tinted | Newsreader italic |
| `callToAction` | `secondary-container` (gold) | Manrope |

### Card styles

| Value | Used for | Background |
|---|---|---|
| `default` | Standard days (odd) | `surface-container-lowest` (white) |
| `offset` | Standard days (even) | `surface-container-low` (light grey) |
| `wide` | Maundy Thursday | same as `default` |
| `goodFriday` | Day 6 only | `#183241 → #36294a` gradient |
| `easter` | Day 8 only | `secondary-container` (#f7e382) |

---

## Running locally

> **Important:** the app fetches `data.json` via `fetch()`, which is blocked by browsers on `file://` URLs (CORS). You need a local web server.

### Option A — VS Code Live Server

Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), right-click `index.html` → **Open with Live Server**.

### Option B — Python

```bash
cd sp-2026
python -m http.server 8080
# open http://localhost:8080
```

### Option C — Node

```bash
cd sp-2026
npx serve .
# open http://localhost:3000
```

---

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages → Source → Deploy from branch → `main` / `root`**.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

Deep links work automatically because the app uses **hash-based routing** (`#/zi/1`), which requires no server-side configuration.

---

## URL scheme

| URL | View |
|---|---|
| `index.html#/` | Home — all 8 days |
| `index.html#/zi/1` | Duminica Floriilor |
| `index.html#/zi/2` | Luni |
| `index.html#/zi/3` | Marți |
| `index.html#/zi/4` | Miercuri |
| `index.html#/zi/5` | Joi |
| `index.html#/zi/6` | Vineri |
| `index.html#/zi/7` | Sâmbătă |
| `index.html#/zi/8` | Duminica Învierii |

---

## Browser support

All modern mobile browsers (Chrome, Safari, Firefox, Samsung Internet).
Web Share API requires Chrome 61+ / Safari 14+; clipboard fallback provided for older browsers.

---

## License

Content is provided for personal devotional use.
Code is MIT licensed.
