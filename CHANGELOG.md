# Changelog

## 2026-01-08
- Feature: Dark-theme friendly charts with pastel colors
  - CategoryChart: Each category now has its own pastel color (blue, purple, green, orange) instead of all black bars
  - RevenueChart: White dots in dark mode for better visibility, pastel purple line
  - All charts: Improved axis text contrast (readable gray instead of washed out)
  - All charts: Dark-theme friendly tooltips (dark background in dark mode, not white squares)
  - All charts: Proper grid colors that adapt to theme
- Feature: Theme toggle button
  - Created ThemeToggle component with Sun/Moon icons from lucide-react
  - Leverages existing next-themes infrastructure (ThemeProvider already set up)
  - Positioned at far right of DashboardHeader (after "Export CSV" button)
  - Rounded button showing current theme state with icon only
  - Supports light/dark mode switching with accessible labels
  - Prevents hydration mismatch with mounted state check
- Fix: API query decoding for filters
  - Decode `+` to space and apply `decodeURIComponent` for `dateRange`, `segment`, and `region` in api/dashboard.ts
  - Validate incoming values against allowed sets with safe fallbacks
  - Result: "New customers" filter now returns data (was empty due to string mismatch)
- Tests: Added failing-first assertion
  - backend-features.test.ts: assert at least one order exists for "New customers" within "Last 30 days"
  - This test failed before the fix and passes after

## 2026-01-07
- Added Business KPI Dashboard as a portfolio piece
  - Created mock data generator with deterministic seeding (500 orders over 90 days)
  - Implemented dashboard components: KPI cards, revenue/category/traffic charts, orders table
  - Added dashboard state management with Jotai atoms (filters, drilldown, search, sorting)
  - Created 3 routes: /dashboard (main), /orders (full table), /customers (derived data)
  - Added interactive features: chart drilldown, CSV export, global filters
  - Implemented UX states: loading skeletons, empty state, error state (simulated)
  - Added responsive layout with sidebar navigation and mobile support
  - Updated routes to redirect / to /dashboard
  - Added Recharts dependency for data visualization
  - Created shadcn/ui table component
  - Updated README.md and APP_FILE_INDEX.md with dashboard documentation

## 2026-01-06
- Added GENERAL_GUIDELINES.md as the reusable playbook for setup, workflow, testing, and theming.
- Rewrote README.md to describe the starter stack and demo pages.
- Condensed APP_FILE_INDEX.md, DB_STRUCTURE.md, TESTING_INSTRUCTIONS.md, and THEMING.md into slim stubs.
- Removed legacy/domain-specific docs (ONBOARDING, FUNCTIONALITY, CLI, API_CALLS, JOTAI_MIGRATION, SHADCN_AUDIT_RESULTS, MOCKUPS, BRAIN_DUMP, docs/).
