# Backend-Driven Architecture

This document explains how the Business KPI Dashboard is powered by the backend API, with the frontend acting as a thin presentation layer.

## Architecture Overview

```
Frontend (React/TanStack Query)
    ↓
Filters: Date Range, Segment, Region (Jotai atoms)
    ↓
API Endpoint: GET /api/dashboard?dateRange=...&segment=...&region=...
    ↓
Backend (Vercel Serverless Function)
    ↓
Returns: KPIs, Charts Data, Orders, Metadata
```

## Data Flow

### 1. User Interaction → Frontend State
When a user selects a filter (e.g., "Last 30 days"), the selection is stored in a Jotai atom:
- **File**: `src/store/dashboard/atoms.ts`
- **Atoms**: `dateRangeAtom`, `segmentAtom`, `regionAtom`, `filtersAtom` (derived)

### 2. Frontend Requests Data
The filters are passed to TanStack Query, which sends them to the backend API:
- **File**: `src/lib/dashboardApi.ts`
- **Function**: `fetchDashboardData(filters)` → constructs URL with query parameters
- **TanStack Query**: `dashboardQueryOptions(filters)` → caches and manages the request

### 3. Backend Processes Request
The Vercel serverless function receives filters and returns filtered data:
- **File**: `api/dashboard.ts`
- **Query Parameters**:
  - `dateRange`: "Last 7 days" | "Last 30 days" | "Last 90 days"
  - `segment`: "All" | "New customers" | "Returning customers"
  - `region`: "All" | "NA" | "EU" | "APAC"

### 4. Backend Response
The API returns a complete dataset with:
```typescript
{
  orders: Order[],           // Filtered list of orders
  kpis: {
    revenue: { value, change },
    orders: { value, change },
    conversionRate: { value, change },
    avgOrderValue: { value, change }
  },
  revenueOverTime: Array<{ date, revenue }>,   // For line chart
  ordersByCategory: Array<{ category, orders }>, // For bar chart
  trafficSources: Array<{ source, value }>     // For pie chart
}
```

### 5. Frontend Displays Data
Components receive the backend data and render:
- **KPI Cards** (`KPICard.tsx`): Display KPI values with trend indicators
- **Charts** (`RevenueChart.tsx`, `CategoryChart.tsx`, `TrafficChart.tsx`): Visualize aggregated data
- **Orders Table** (`OrdersTable.tsx`): Display detailed order data
- **CSV Export**: Downloads the filtered orders from backend response

## Backend-Driven Features

### Dropdowns (All Powered by Backend)
1. **Date Range**: `Last 7 days`, `Last 30 days`, `Last 90 days`
   - Backend filters orders by date range
   - Returns appropriate KPIs and charts for that period

2. **Customer Segment**: `All`, `New customers`, `Returning customers`
   - Backend checks `isReturningCustomer` field
   - Returns only matching orders

3. **Region**: `All`, `NA`, `EU`, `APAC`
   - Backend filters by `region` field
   - Returns only matching orders

### Data Features (All from Backend)
- **KPI Metrics**: Revenue, Orders, Conversion Rate, Average Order Value with year-over-year change
- **Revenue Chart**: Daily revenue data for the selected period
- **Category Chart**: Orders breakdown by product category
- **Traffic Chart**: Customer acquisition source distribution
- **Orders Table**: Complete order details with all fields needed for sorting/searching
- **CSV Export**: Downloads filtered orders respecting all active filters

### Three Pages (All Use Same Backend)
1. **Dashboard**: Overview with KPIs, charts, and sample orders
   - File: `src/pages/BusinessDashboard.tsx`
   - Uses: `dashboardQueryOptions(filters)` from backend

2. **Orders**: Full-page table view of all orders
   - File: `src/pages/OrdersPage.tsx`
   - Uses: Same `dashboardQueryOptions(filters)` from backend
   - Supports: Drilldown filtering (click chart → filter table)

3. **Customers**: Derived view from order data
   - File: `src/pages/CustomersPage.tsx`
   - Uses: Same `dashboardQueryOptions(filters)` from backend
   - Derives: Unique customers and their purchase history

## No Client-Side Business Logic

The frontend:
- ✅ Does NOT calculate KPIs
- ✅ Does NOT aggregate order data
- ✅ Does NOT generate charts data
- ✅ Does NOT implement filtering logic
- ✅ Just displays what the backend sends

The backend:
- ✅ Calculates all KPIs with trend analysis
- ✅ Generates all chart data
- ✅ Applies all filters
- ✅ Ensures data consistency
- ✅ Owns the business logic

## Filter Flow Example

### User selects "Last 7 days" + "New customers" + "EU"

1. **Frontend** (React component):
   ```tsx
   const filters = {
     dateRange: 'Last 7 days',
     segment: 'New customers',
     region: 'EU'
   };
   ```

2. **API Request**:
   ```
   GET /api/dashboard?dateRange=Last+7+days&segment=New+customers&region=EU
   ```

3. **Backend Processing** (`api/dashboard.ts`):
   ```typescript
   const filteredOrders = ALL_ORDERS.filter(order => 
     order.date >= lastWeek &&           // dateRange filter
     order.isReturningCustomer === false && // segment filter
     order.region === 'EU'               // region filter
   );
   
   const kpis = calculateKPIs(filteredOrders);
   const charts = generateCharts(filteredOrders);
   
   return { orders: filteredOrders, kpis, charts };
   ```

4. **Frontend Display**:
   - KPI cards show metrics for filtered data only
   - Charts display only EU new-customer data
   - Orders table lists only matching orders
   - CSV export includes only filtered results

## Testing

Comprehensive tests verify that the backend provides all required data:
- **File**: `tests/api/backend-features.test.ts`
- **Tests**: 30+ integration tests against the live API
- **Coverage**: All dropdowns, filters, KPIs, charts, and export functionality

Run tests:
```bash
pnpm test tests/api/backend-features.test.ts
```

## Frontend Simplicity

Because all business logic is in the backend, the frontend:
- Is easier to maintain
- Has fewer dependencies
- Can be replaced without losing functionality
- Is truly "dumb" and just displays data
- Doesn't need to understand business rules

## Scalability

This architecture scales because:
- Backend handles all data processing
- Frontend renders efficiently regardless of data size
- TanStack Query caches results automatically
- Adding new filters only requires backend changes
- Frontend code stays lean and focused
