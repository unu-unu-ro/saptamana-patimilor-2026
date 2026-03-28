# Săptămâna Patimilor 2026

> Devoțional zilnic pentru cele opt zile ale Săptămânii Patimilor — de la Duminica Floriilor până la Duminica Învierii. Organizat de **Biserica Unu Unu**.

**Perioada:** 5 Aprilie – 12 Aprilie 2026
**Limbă:** Română

---

## Funcționalități

| Funcționalitate          | Detalii                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| **Conținut zilnic**      | 8 zile, fiecare cu lectură VT, lectură NT și aplicație practică  |
| **Salvare progres**      | Zilele se marchează citite automat; salvat în `localStorage`     |
| **Link-uri zilnice**     | Fiecare zi are un URL propriu: `index.html#/zi/1` … `#/zi/8`     |
| **Distribuire nativă**   | Web Share API cu fallback la clipboard                           |
| **Detectare zi curentă** | Ziua din calendar este evidențiată automat în perioada Patimilor |
| **Fără build**           | Fișiere statice; funcționează pe orice CDN sau GitHub Pages      |

---

## Structura fișierelor

```
sp-2026/
├── index.html     ← Shell HTML + configurare token-uri design Tailwind
├── app.css        ← Stiluri custom (glassmorphism, animații, chip-uri…)
├── app.js         ← Logica SPA: router, state, randare, share API, meta tags
├── data.json      ← Tot conținutul devoțional (editează aici pentru a actualiza textele)
├── favicon.svg    ← Favicon SVG — cruce aurie pe fond #183241
├── og-image.svg   ← Imagine pentru previzualizare socială (1200×630)
└── README.md
```

---

## Sistem de design

Urmează sistemul **Editorial Reverență**:

- **Fonturi** — Newsreader (display/scriptură) + Manrope (corp/UI)
- **Culori** — Paletă Material Design 3 ancorată în Slate Blue `#183241`
- **Fără linii** — separarea secțiunilor se face exclusiv prin schimbări de culoare de fundal
- **Glassmorphism** — header la 85% opacitate + `backdrop-blur: 20px`
- **Vinerea Mare** — gradient întunecat special (`#183241 → #36294a`)
- **Duminica Învierii** — fond auriu cald `secondary-container` (#f7e382)
- **Iconițe** — Material Symbols Outlined, grosime 1pt (niciodată pline)

---

## Editarea conținutului

Tot textul devoțional se află în **`data.json`**. Schema fiecărei zile:

```jsonc
{
  "id": 1, // 1–8, folosit în URL (#/zi/1)
  "slug": "duminica-floriilor", // identificator pentru URL
  "name": "Duminica Floriilor", // nume afișat complet
  "shortName": "Duminica Floriilor", // etichetă în sertar și header
  "subtitle": "Intrarea triumfală", // chip afișat pe card și pagina zilei
  "date": "5 Aprilie 2026",
  "icon": "auto_awesome", // nume Material Symbol
  "cardStyle": "default", // default | offset | wide | goodFriday | easter
  "keyVerse": {
    "text": "Osana! …",
    "reference": "Marcu 11:9",
  },
  "sections": [
    {
      "type": "scripture",
      "title": "Citire Biblică — Vechiul Testament",
      "reference": "…",
      "content": "…",
    },
    {
      "type": "scripture",
      "title": "Citire Biblică — Noul Testament",
      "reference": "…",
      "content": "…",
    },
    { "type": "callToAction", "title": "Aplică astăzi", "content": "…" },
  ],
}
```

### Tipuri de secțiuni

| Tip            | Fundal                        | Font                                    |
| -------------- | ----------------------------- | --------------------------------------- |
| `scripture`    | `surface-container-low`       | Newsreader italic, bordură aurie stânga |
| `callToAction` | `secondary-container` (auriu) | Manrope                                 |

### Stiluri de card

| Valoare      | Folosit pentru             | Fundal                                |
| ------------ | -------------------------- | ------------------------------------- |
| `default`    | Zile standard (impare)     | `surface-container-lowest` (alb)      |
| `offset`     | Zile standard (pare)       | `surface-container-low` (gri deschis) |
| `wide`       | Joi                        | același ca `default`                  |
| `goodFriday` | Ziua 6 — Vineri            | Gradient `#183241 → #36294a`          |
| `easter`     | Ziua 8 — Duminica Învierii | `secondary-container` (#f7e382)       |

---

## Rulare locală

> **Important:** aplicația încarcă `data.json` prin `fetch()`, care este blocat de browsere pe URL-uri `file://`. Ai nevoie de un server web local.

### Opțiunea A — VS Code Live Server

Instalează extensia [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), click dreapta pe `index.html` → **Open with Live Server**.

### Opțiunea B — Python

```bash
cd sp-2026
python -m http.server 8080
# deschide http://localhost:8080
```

### Opțiunea C — Node

```bash
cd sp-2026
npx serve .
# deschide http://localhost:3000
```

---

## Publicare pe GitHub Pages

1. Încarcă folderul pe un repository GitHub.
2. Mergi la **Settings → Pages → Source → Deploy from branch → `main` / `root`**.
3. Site-ul va fi disponibil la `https://<utilizator>.github.io/<repo>/`.

Link-urile directe funcționează fără configurare suplimentară deoarece aplicația folosește **rutare bazată pe hash** (`#/zi/1`).

---

## SEO și previzualizări sociale

Fișierele `favicon.svg` și `og-image.svg` sunt incluse.

**Pentru WhatsApp și Facebook:**

1. Convertește `og-image.svg` → `og-image.png` (1200×630) folosind Figma, Inkscape sau un convertor online.
2. Hostează `og-image.png` la un URL public absolut.
3. Actualizează `og:image` în `<head>`-ul din `index.html` cu URL-ul respectiv.

> **Notă:** WhatsApp ignoră fragmentele hash din URL (`#/zi/6`), deci previzualizările per-zi nu sunt posibile cu rutare client-side pură. Previzualizarea implicită (pagina principală) va fi afișată indiferent de ziua distribuită.

---

## Schema URL-urilor

| URL                  | Pagină                    |
| -------------------- | ------------------------- |
| `index.html#/`       | Acasă — toate cele 8 zile |
| `index.html#/zi/1`   | Duminica Floriilor        |
| `index.html#/zi/2`   | Luni                      |
| `index.html#/zi/3`   | Marți                     |
| `index.html#/zi/4`   | Miercuri                  |
| `index.html#/zi/5`   | Joi                       |
| `index.html#/zi/6`   | Vineri                    |
| `index.html#/zi/7`   | Sâmbătă                   |
| `index.html#/zi/8`   | Duminica Învierii         |
| `index.html#/despre` | Despre proiect            |

---

## Compatibilitate browsere

Toate browserele mobile moderne (Chrome, Safari, Firefox, Samsung Internet).
Web Share API necesită Chrome 61+ / Safari 14+; fallback la clipboard disponibil pentru browsere mai vechi.

---

## Plan de lectură

Recomandările de citire biblică urmează planul din cartea **«Patimile lui Hristos»** de McKinley,
disponibilă gratuit la [magnagratia.org](https://www.magnagratia.org/carti/166-patimile-lui-hristos-mckinley/).

---
