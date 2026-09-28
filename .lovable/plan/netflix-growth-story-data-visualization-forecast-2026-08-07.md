# Netflix Growth Story — Data Visualization & Forecast

A single-page interactive dashboard telling Netflix's story from 1997 (DVD-by-mail startup) to today, with a client-side trend forecast projecting growth 5 years ahead.

## Sections

1. **Hero** — "1997 → 2030" headline, key stat counters (subscribers today, revenue today, titles in catalog, years since founding).
2. **Timeline of eras** — milestone markers (1997 DVD rental, 2007 streaming launch, 2013 first original *House of Cards*, 2016 global launch in 190 countries, 2020 pandemic surge, 2022 first subscriber loss, 2023 password-sharing crackdown, 2024+ ad tier).
3. **Subscribers over time** — area chart of global paid memberships by year, with era shading and milestone annotations.
4. **Revenue & ARPU** — combined bar (annual revenue) + line (average revenue per member) chart.
5. **Regional breakdown** — stacked chart of members by region (US/Canada, EMEA, LatAm, APAC) plus a share-of-total donut for the latest year.
6. **Content library analysis** — titles added per year, movies vs TV split, top genres, top producing countries, maturity-rating distribution.
7. **Future prediction** — forecast panel projecting subscribers and revenue to 2030 with a confidence band, a model selector (linear / logistic S-curve / CAGR), and a horizon slider (1–10 years). Shows the fitted equation, R², and a plain-language read of what the trend implies.
8. **Footer** — data notes and source disclosure.

## Interaction

- Year-range brush/slider that filters the historical charts.
- Toggle between absolute values and year-over-year growth %.
- Hover tooltips on every chart; milestone dots reveal the event.
- Forecast controls recompute instantly in the browser.

## Data

All figures are embedded as typed TypeScript modules under `src/data/` — no backend, no uploads, no API keys:

- `subscribers.ts` — annual global and regional paid memberships, 1999–2025.
- `financials.ts` — annual revenue, operating income, ARPU.
- `content.ts` — catalog aggregates: titles added per year, type split, genre counts, country counts, rating distribution.
- `milestones.ts` — dated company events for annotations and the timeline.

Values are curated from Netflix's public annual reports/shareholder letters and the widely used public Netflix titles catalog. A footer note states the sources and that recent years are approximate.

## Forecasting (client-side math)

`src/lib/forecast.ts` — pure functions, no dependencies:

- Least-squares linear regression, exponential/CAGR fit, and logistic (S-curve, saturating) fit.
- Returns fitted params, R², and per-year projections.
- Confidence band derived from residual standard error (±1.96·SE widening with horizon).
- Logistic is the default for subscribers (growth is clearly saturating); CAGR default for revenue.

## Design direction

Cinematic dark theme — near-black background, a single hot-red accent for the primary series, warm amber/soft-white for secondary series. Large condensed display type for numbers, clean sans for body. Charts render on dark surfaces with thin grid lines and glow-tinted area fills. Chart color/typography values are defined as semantic tokens in `src/styles.css` rather than hardcoded in components.

## Technical notes

- Built as the index route (`src/routes/index.tsx`) with section components under `src/components/netflix/`.
- Charts via Recharts (installed if not already present); responsive containers, mobile-friendly stacking.
- Everything is static/derived data — no Cloud backend, no auth, no network calls.
- Route `head()` gets a Netflix-specific title, description, and og/twitter tags.
