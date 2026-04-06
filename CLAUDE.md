# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Dev server at localhost:4321
yarn build        # Production build
yarn preview      # Preview production build
yarn test         # Run tests (Vitest)
yarn test:ui      # Tests with interactive UI

# Updating job data
yarn fetch-csv    # Download latest CSV from Google Sheets → slt-jobs.csv
yarn import-csv   # Parse slt-jobs.csv → jobboard.json
```

To run a single test file: `yarn test src/components/JobBoard.test.tsx`

## Architecture

**Data pipeline:** Job data lives in a [Google Spreadsheet](https://docs.google.com/spreadsheets/d/16sDYemc_Sn6gRM-cRiT1sEL1U-GJdhqcqmy_k5Z1M3Y/edit) and flows through:

```
Google Sheets → slt-jobs.csv → jobboard.json → src/lib/db.ts → components
```

`scripts/import-csv.ts` parses the CSV (9 columns, no header row — columns are hardcoded), validates required fields, converts MM/DD/YYYY dates to ISO 8601, and writes `jobboard.json`. Unknown/missing dates use `1970-01-01T00:00:00.000Z` as a sentinel value — `isUnknownDate()` in `db.ts` detects these and sorts them to the end.

**Rendering:** `src/pages/index.astro` calls `getAllJobs()` server-side and passes the full job list as a prop to `<JobBoard client:load>`. All search/filter logic runs client-side in React — no server queries after initial load.

**Key files:**
- `src/lib/db.ts` — `Job` interface, `getAllJobs()`, `getJobById()`, `searchJobs()`
- `src/components/JobBoard.tsx` — stateful root React component; owns `searchQuery`, `jobTypeFilter`, `selectedJob`
- `jobboard.json` — generated file, source of truth for job data at runtime
- `slt-jobs.csv` — fetched from Google Sheets, input to import script

## Deployment

Deployed to GitHub Pages at `https://slt-mutual-aid.github.io/` (configured in `astro.config.mjs`).
