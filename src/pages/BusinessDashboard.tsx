/**
 * Business Dashboard Page (replaces old Dashboard)
 * Main entry point with layout shell
 */

import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { getDashboardData } from '@/lib/mockData';
import { filtersAtom } from '@/store/dashboard/atoms';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

export default function BusinessDashboard() {
  const filters = useAtomValue(filtersAtom);
  const dashboardData = useMemo(() => getDashboardData(filters), [filters]);

  return (
    <div className="bg-background flex min-h-screen flex-col md:flex-row">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader title="Dashboard" orders={dashboardData.orders} showFilters={true} showExport={true} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <DashboardContent />
        </main>
      </div>
    </div>
  );
}
