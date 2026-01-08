/**
 * Dashboard Filters Component
 * Global filters for date range, segment, and region
 */

import type { DashboardFilters } from '@/lib/mockData';
import { dateRangeAtom, regionAtom, segmentAtom } from '@/store/dashboard/atoms';
import { useAtom } from 'jotai';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function DashboardFilters() {
  const [dateRange, setDateRange] = useAtom(dateRangeAtom);
  const [segment, setSegment] = useAtom(segmentAtom);
  const [region, setRegion] = useAtom(regionAtom);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:gap-3" data-testid="dashboard-filters">
      <Select value={dateRange} onValueChange={(value) => setDateRange(value as DashboardFilters['dateRange'])}>
        <SelectTrigger className="w-full md:w-45" data-testid="date-range-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Last 7 days">Last 7 days</SelectItem>
          <SelectItem value="Last 30 days">Last 30 days</SelectItem>
          <SelectItem value="Last 90 days">Last 90 days</SelectItem>
        </SelectContent>
      </Select>

      <Select value={segment} onValueChange={(value) => setSegment(value as DashboardFilters['segment'])}>
        <SelectTrigger className="w-full md:w-45" data-testid="segment-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All customers</SelectItem>
          <SelectItem value="New customers">New customers</SelectItem>
          <SelectItem value="Returning customers">Returning customers</SelectItem>
        </SelectContent>
      </Select>

      <Select value={region} onValueChange={(value) => setRegion(value as DashboardFilters['region'])}>
        <SelectTrigger className="w-full md:w-45" data-testid="region-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All regions</SelectItem>
          <SelectItem value="NA">North America</SelectItem>
          <SelectItem value="EU">Europe</SelectItem>
          <SelectItem value="APAC">Asia Pacific</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
