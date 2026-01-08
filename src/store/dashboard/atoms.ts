/**
 * Dashboard state management using Jotai
 */

import type { DashboardFilters, Order } from '@/lib/mockData';
import { atom } from 'jotai';

// Filter state
export const dateRangeAtom = atom<DashboardFilters['dateRange']>('Last 30 days');
export const segmentAtom = atom<DashboardFilters['segment']>('All');
export const regionAtom = atom<DashboardFilters['region']>('All');

// Derived filters object
export const filtersAtom = atom<DashboardFilters>((get) => ({
  dateRange: get(dateRangeAtom),
  segment: get(segmentAtom),
  region: get(regionAtom),
}));

// Drilldown state
export interface DrilldownState {
  type: 'day' | 'category' | null;
  value: string | null;
}

export const drilldownAtom = atom<DrilldownState>({
  type: null,
  value: null,
});

// Loading state
export const isLoadingAtom = atom<boolean>(false);

// Simulate error toggle (dev-only)
export const simulateErrorAtom = atom<boolean>(false);

// Search/filter state for orders table
export const searchQueryAtom = atom<string>('');
export const sortFieldAtom = atom<'id' | 'customerName' | 'date' | 'status' | 'category' | 'total' | 'region'>('date');
export const sortDirectionAtom = atom<'asc' | 'desc'>('desc');
export const currentPageAtom = atom<number>(1);

// Derived filtered orders for table
export const filteredOrdersAtom = atom<Order[]>((_get) => {
  // This will be populated from getDashboardData in the component
  // and further filtered by drilldown/search
  return [];
});
