# 🥃 LiverLogger

A private, offline, one-tap consumption tracker (alcohol + weed) that installs on your iPhone home screen like a real app — no App Store, no server, no ads. Everything stays on your phone.

## Features

- **One-tap logging, two substances.** Quick-add buttons for your usual drinks (Beer 330/400/500 mL, Wine 100/150 mL, Shots 20/40 mL, Cocktail 250 mL) and for weed (joint, small joint, pipe/bowl, vape, edible) — tap once, it's logged with a timestamp. A substance switch at the top of Log/Stats/Info flips between the two. Add a custom amount for anything else, and optionally save it as a new quick-add button.
- **Accurate math, liters-first.** Every alcohol entry is converted to grams of pure alcohol (`mL × ABV% × 0.789`, the NIAAA formula), then shown as **liters of pure alcohol** (primary) with grams as the secondary/scientific unit, plus US standard drinks (14g), UK units (8g), or German Standardglas (~11g) — your choice. Weed entries convert to mg THC and "Standard THC Units" (5mg, the unit NIH now mandates for its funded research), from either a flower weight + THC% or a directly-labeled mg dose (vapes/edibles).
- **Charts, including monthly & yearly.** Last 7 days, a 10-week trend against published guideline reference lines, a 12-month trend, this-month/this-year/last-year totals, a by-type breakdown, and a 5-week calendar heatmap with your current free-day streak — all substance-aware.
- **Configurable warnings.** A banner appears when today's or this week's alcohol total crosses your own threshold (prefilled from the UK CMO's 112g/week guideline), or when weed's been used on several of the last 7 days (prefilled at 5, per Canada's LRCUG caution against near-daily use). Edit the numbers in Settings — they're starting points, not a diagnosis.
- **Research-backed Info tab, both substances.** Alcohol: WHO's 2023 "no safe level" statement, the US Surgeon General's January 2025 cancer advisory, the 2025–2030 US Dietary Guidelines update, the UK CMO's 14-units guideline, Germany's DHS guidance. Weed: the Standard THC Unit, Canada's Lower-Risk Cannabis Use Guidelines, Germany's 2024 Cannabisgesetz, 2025 cannabis-use-disorder research, and a note on smoked vs. absorbed THC. Every card links its source. Bilingual, English/German.
- **Local multi-profile.** A "who's tracking?" screen lets more than one person use the same install, each with a fully separate log, presets, and thresholds. Optional 4-digit PIN per profile — a soft privacy screen against a curious glance, not real security (it's plain local storage). No accounts, no server, nothing ever leaves the phone.
- **Fully offline & private.** A service worker caches the whole app on first load, so it works with no signal. Export/import as JSON for your own backups.

This is not medical or legal advice. It's a personal tracking tool. If you're concerned about your drinking or drug use, please talk to a doctor. Cannabis laws vary by country/region — know what applies where you are.

## Install on iPhone

1. Open this repo's GitHub Pages URL in **Safari** on your iPhone.
2. Tap the **Share** button (square with an arrow) → **Add to Home Screen** → **Add**.
3. Open it from your home screen from then on — it runs full-screen, no browser bar, and works offline.
4. First launch asks "who's tracking?" — name yourself (and optionally set a PIN), and you're in.

If you're updating from an earlier install that already had a log, your existing entries are carried forward automatically into your first profile — nothing is lost.

Data lives per-profile in that home-screen app's own local storage. If you ever delete the app from your home screen, its data goes with it — export a backup from Settings → Your data every so often.

## Updating an existing install

Since the app is offline-first and cache-first, after you push new code and it's live on Pages, fully close LiverLogger (swipe it away in the app switcher) and reopen it — the service worker fetches the new version and takes over on that next launch. If it still looks like the old version, force-quit and reopen once more.

## Hosting it yourself (GitHub Pages)

```
git remote add origin https://github.com/<you>/LiverLogger.git
git push -u origin main
```

Then in the repo on GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.** GitHub gives you a `https://<you>.github.io/LiverLogger/` URL a minute later. The app's *code* is public at that URL, but that's just the empty app shell — nobody sees your log, because it never leaves your phone's local storage.

## Project structure

```
index.html            single-page app shell: Log / Stats / Info / Settings + modals
styles.css             dark, mobile-first styling
logic.js               pure calculation functions (grams, liters, mg THC, units, streaks,
                        day/week/month/year aggregation) — no DOM, unit-tested
i18n.js                English/German UI strings + Info tab research content (both substances)
app.js                 profiles, storage, presets, logging, charts, warnings — wires it all to the DOM
chart.umd.min.js       Chart.js, bundled locally (no CDN — needed for true offline use)
manifest.webmanifest   PWA metadata (name, icons, standalone display)
service-worker.js      offline cache-first app shell (bump CACHE_NAME on every release)
icons/                 app icons (generated by gen_icons.py, no external assets)
gen_icons.py           regenerates icons/ from scratch with Pillow
logic.test.js          `node logic.test.js` — math correctness (Node, no browser needed)
functional_test.js     `node functional_test.js` — end-to-end UI smoke test via jsdom:
                        profile creation, logging both substances, tab/substance switching,
                        warnings, settings, and the v1→v2 data-migration path
```

## Running the tests

```
npm install jsdom          # only needed once, only for functional_test.js
node logic.test.js         # pure math: grams/liters/mg-THC conversions, date & streak logic
node functional_test.js    # real index.html + app.js wired up in jsdom (no browser required)
```

`logic.test.js` cross-checks gram calculations against NIAAA's published reference drinks (355 mL beer @5%, 148 mL wine @12%, 44 mL spirits @40% ≈ 14g each), the 5mg Standard THC Unit math, and month/year/streak aggregation. `functional_test.js` drives the actual production HTML/JS end-to-end (jsdom, with Chart.js stubbed since there's no canvas backend in a headless test) — it exercises onboarding, one-tap logging for both substances, the custom-entry modal, substance/tab switching, warning-threshold triggering, multi-profile isolation, and upgrading a pre-profile (v1) install without losing data.

## Sources cited in the Info tab

**Alcohol**
- WHO/Europe (4 Jan 2023), [No level of alcohol consumption is safe for our health](https://www.who.int/europe/news/item/04-01-2023-no-level-of-alcohol-consumption-is-safe-for-our-health)
- US Surgeon General advisory, Jan 2025 — reported by [NPR](https://www.npr.org/2025/01/03/nx-s1-5245794/alcohol-cancer-risk-surgeon-general)
- [DietaryGuidelines.gov — Guidance on Alcoholic Beverages](https://www.dietaryguidelines.gov/alcohol/info) (2025–2030 edition)
- UK Chief Medical Officers' low-risk guideline — [Drinkaware](https://www.drinkaware.co.uk/facts/information-about-alcohol/alcohol-and-the-facts/low-risk-drinking-guidelines)
- [NIAAA — Rethinking Drinking, "What is a standard drink"](https://rethinkingdrinking.niaaa.nih.gov/how-much-too-much/whats-standard-drink)
- Deutsche Hauptstelle für Suchtfragen (DHS) — [Neue DHS Empfehlungen zum Umgang mit Alkohol](https://www.dhs.de/service/aktuelles/meldung/neue-dhs-empfehlungen-zum-umgang-mit-alkohol/)

**Weed**
- [Standard THC Unit research](https://www.medrxiv.org/content/10.1101/2025.05.21.25328059.full.pdf) (NIH-mandated 5mg reporting unit)
- CAMH — [Canada's Lower-Risk Cannabis Use Guidelines (LRCUG)](https://www.camh.ca/-/media/files/lrcug_professional-pdf)
- [Cannabis Act (Germany) — Wikipedia summary of the Cannabisgesetz](https://en.wikipedia.org/wiki/Cannabis_Act_(Germany))
- [CDC — Cannabis and Public Health, health effects](https://www.cdc.gov/cannabis/health-effects/index.html)
- [THC smoking bioavailability](https://leafwell.com/blog/how-to-dose-marijuana-for-smoking)

## License

MIT — see [LICENSE](LICENSE).
