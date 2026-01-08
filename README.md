# Starter Project

Lean starter built with React, Vite, TypeScript, shadcn/ui, TanStack Router/Query, Jotai, and a Supabase-ready client. Includes sample pages (Business Dashboard, Orders, Customers, Components Showcase) to demonstrate theming, charts, data tables, and UI primitives.

## Quick Start

```bash
pnpm install
pnpm dev
```

Navigate to `http://localhost:5173/dashboard` to view the Business KPI Dashboard.

## Business KPI Dashboard (Portfolio Piece)

A realistic business analytics dashboard built as a portfolio demonstration. Features include:

### Features
- **KPI Cards**: Revenue, Orders, Conversion Rate, Average Order Value with trend indicators
- **Interactive Charts**: 
  - Revenue over time (line chart) with daily drilldown
  - Orders by category (bar chart) with category filtering
  - Traffic sources distribution (pie chart)
- **Data Table**: Full orders table with:
  - Search by order ID or customer name
  - Sortable columns (date, total)
  - Pagination
  - Status badges
- **Global Filters**: Date range (7/30/90 days), customer segment, region
- **Drilldown**: Click charts to filter orders table by day or category
- **CSV Export**: Download filtered order data
- **UX States**: Loading skeletons, empty states, error states (simulated)
- **Responsive**: Mobile-friendly layout with stacked cards and scrollable tables

### Routes
- `/dashboard` - Main dashboard with KPIs, charts, and orders
- `/orders` - Full-page orders table view
- `/customers` - Full-page customers table view

### Tech Stack
- React 19 + TypeScript
- Recharts for data visualization
- shadcn/ui components
- TanStack Router for routing
- Jotai for state management
- Deterministic mock data (no backend required)

### Notes
- **Mock Data**: All data is generated client-side using seeded randomization
- **No Backend**: Fully frontend demonstration, suitable for static hosting
- **Portfolio Ready**: Clean code, TypeScript throughout, production-quality UX

## What's Included

- React + Vite + TypeScript
- shadcn/ui component library
- TanStack Router and Query wiring
- Jotai state management with demo atoms
- Supabase client scaffold (no migrations bundled)
- Recharts for data visualization

## Docs to Read

- GENERAL_GUIDELINES.md — shared workflow, testing, and theming expectations
- .github/copilot-instructions.md — repository rules
- TODO.md — current task list
- AGENTS.md, CLAUDE.md, GEMINI.md, QWEN.md — agent-specific notes

## Contribution Notes

- Keep changes small and documented (update CHANGELOG.md for notable work)
- Prefer backend-driven logic; keep the frontend thin
- Add or update tests alongside feature changes; run `pnpm lint` before pushing
