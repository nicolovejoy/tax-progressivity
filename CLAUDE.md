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

<!-- SHARED-CONVENTIONS:BEGIN v=d5e16e653242 — auto-managed, do not edit here; source: prompt-lab/workflow/claude-md-shared.md (edit + re-sync) -->
## Shared conventions

<!-- These are Nico's cross-repo output rules. They're materialized into each repo's
CLAUDE.md so every agent (local, cloud, third-party) sees them as plain text. Source
of truth: prompt-lab/workflow/claude-md-shared.md — edit there and re-sync, never here. -->

- **Clickable URLs.** When pointing at any web destination (dashboard, repo, PR, deploy, settings, docs, localhost), print the full bare URL — `https://example.com` or `http://localhost:8080` — on its own, never just the page's name and never a markdown `[label](url)` link. Nico's terminal auto-linkifies raw `https://` text, so a bare URL is one-click and stays copyable.

- **Number your questions.** Any time you ask Nico more than one question, present them as a numbered list (1., 2., 3.) so he can answer by number with no ambiguity. A single standalone question needs no number.

- **Self-contained smoke-test instructions.** When you ask Nico to manually test or verify an app or website, assume zero carried-over context — he should never scroll back or recall a URL/path/credential from earlier. Always include: the exact URL (full `https://…` or `http://localhost:…`, restated even if mentioned above), the precise steps in order, and what a pass vs. fail looks like. Repetition here is a feature, not clutter.

- **No marker before a copy-paste command block.** Nico's terminal renders markdown bullets (`-`, `*`, `•`) as `●`, which breaks paste into zsh. The line directly above a fenced command block must be a plain-text label ending in a colon — never a bullet, dash, asterisk, or number. For loud copy targets, lead the label with `📋` + bold `COPY THE BELOW`, then a colon, then the block.
<!-- SHARED-CONVENTIONS:END -->
