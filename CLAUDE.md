# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

Vite + React SPA wrapping a single component. `tax-progressivity.jsx` at repo root holds the whole UI; `src/main.jsx` mounts it into `index.html`. Deployed on Vercel with GitHub CI — pushes to `main` auto-deploy to production (https://tax-progressivity.vercel.app, also aliased for a custom domain via `npx vercel domains add`).

Commands: `npm run dev` (localhost:5173), `npm run build`, `npm run preview`. No tests, no linter configured.

Repo: https://github.com/nicolovejoy/tax-progressivity (public).

## Component architecture

The whole UI is driven by one static data object, `DATA` (lines 30–103), keyed by three tax regimes listed in `KEYS` (line 105):

- `federal_income` — CBO, progressive
- `all_federal` — CBO, moderately progressive
- `all_taxes` — ITEP, nearly flat

Each regime has the same shape: `quintiles[]` (5 entries with `rate` and `share`), a `top1` object, plus descriptive/verdict copy. Three local state values in `TaxProgressivity` — `regime`, `view` (rates vs. share), and `page` (main vs. about) — select what renders. Tooltips (`RateTooltip`, `ShareTooltip`), the `About` page component, and the color palette `C` are all at module scope.

Adding a regime = add a key to `DATA` with the same shape + append to `KEYS`. Adding a view = add another chart component and extend the view-tabs array and the ternary at the chart-area render site.

Adding a time dimension (year) has been discussed but not built — would nest `years: {...}` inside each regime and add a year selector; ITEP data only updates every ~3 years so the state+local series will be sparser than federal.

Styling is entirely inline style objects keyed off `C` and the two font constants (`FONT`, `SERIF`) — no CSS modules, no Tailwind. Google Fonts are imported via a `<style>` tag inside the component.

## Data provenance

Numbers are hand-curated from CBO 2023 (2020 tax year) and ITEP *Who Pays?* 2024. When editing figures, update the matching `source` string and the insight/rateNote/shareNote copy so the narrative stays consistent with the chart. The About page also has its own copy of the sources — keep both in sync.

## Next steps (discussed, not built)

- Add a year dimension. Proposed shape: `DATA[regime].years[yearKey] = { quintiles, top1, rateNote, shareNote, insight, source }`, plus a year selector. Question still open: simple year-toggle vs. a multi-year trend/line-chart view.
- Custom domain `tax-progressivity.pianohouseproject.org` — not yet wired up. `npx vercel domains add <host>` + a CNAME to `cname.vercel-dns.com`.
