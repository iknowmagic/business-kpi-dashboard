/**
 * Dashboard API Service
 * Fetches dashboard data from Vercel serverless function
 */

import { queryOptions } from '@tanstack/react-query';
import type { DashboardData, DashboardFilters } from './mockData';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';

async function fetchDashboardData(filters: DashboardFilters): Promise<DashboardData> {
  const params = new URLSearchParams({
    dateRange: filters.dateRange,
    segment: filters.segment,
    region: filters.region,
  });

  const response = await globalThis.fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Dashboard API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Parse ISO date strings back to Date objects
  data.orders = data.orders.map((order: { date: string }) => ({
    ...order,
    date: new Date(order.date),
  }));

  return data as DashboardData;
}

export function dashboardQueryOptions(filters: DashboardFilters) {
  return queryOptions({
    queryKey: ['dashboard', filters],
    queryFn: () => fetchDashboardData(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
