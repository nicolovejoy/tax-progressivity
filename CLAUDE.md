# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

Single-file repo: `tax-progressivity.jsx` is a standalone React component (default-exported `TaxProgressivity`) with no surrounding project scaffolding — no `package.json`, bundler config, tests, or README. It's an artifact-style component meant to be dropped into a host React app (e.g., a Claude Artifacts runtime or a Next.js/Vite project that already provides React + recharts).

There is nothing to build, lint, or test in-tree. If the user wants to preview it, they'll need to paste it into a host with `react` and `recharts` available; don't invent a dev script.

## Component architecture

The whole UI is driven by one static data object, `DATA` (lines 30–103), keyed by three tax regimes listed in `KEYS` (line 105):

- `federal_income` — CBO, progressive
- `all_federal` — CBO, moderately progressive
- `all_taxes` — ITEP, nearly flat

Each regime has the same shape: `quintiles[]` (5 entries with `rate` and `share`), a `top1` object, plus descriptive/verdict copy. Two local state values (`regime`, `view`) in `TaxProgressivity` select which slice of `DATA` renders and whether `TaxRateChart` (rates) or `TaxShareChart` (share) is shown. Tooltips (`RateTooltip`, `ShareTooltip`) and the color palette `C` (line 17) are defined at module scope.

Adding a regime = add a key to `DATA` with the same shape + append to `KEYS`. Adding a view = add another chart component and extend the view-tabs array (lines 446–449) and the ternary at line 479.

Styling is entirely inline style objects keyed off `C` and the two font constants (`FONT`, `SERIF`) — no CSS modules, no Tailwind. Google Fonts are imported via a `<style>` tag inside the component (line 320).

## Data provenance

Numbers are hand-curated from CBO 2023 (2020 tax year) and ITEP *Who Pays?* 2024. When editing figures, update the matching `source` string and the insight/rateNote/shareNote copy so the narrative stays consistent with the chart.
