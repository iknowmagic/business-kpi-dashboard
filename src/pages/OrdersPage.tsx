/**
 * Orders Page
 * Full-page view of orders table with filters
 */

import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DrilldownIndicator } from '@/components/dashboard/DrilldownIndicator';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { OrdersTable } from '@/components/dashboard/OrdersTable';
import { getDashboardData } from '@/lib/mockData';
import { drilldownAtom, filtersAtom } from '@/store/dashboard/atoms';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

export default function OrdersPage() {
  const filters = useAtomValue(filtersAtom);
  const drilldown = useAtomValue(drilldownAtom);
  const dashboardData = useMemo(() => getDashboardData(filters), [filters]);

  const filteredOrders = useMemo(() => {
    let orders = dashboardData.orders;

    if (drilldown.type === 'day' && drilldown.value) {
      orders = orders.filter((order) => order.date.toISOString().split('T')[0] === drilldown.value);
    } else if (drilldown.type === 'category' && drilldown.value) {
      orders = orders.filter((order) => order.category === drilldown.value);
    }

    return orders;
  }, [dashboardData, drilldown]);

  return (
    <div className="bg-background flex min-h-screen flex-col md:flex-row">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader title="Orders" orders={filteredOrders} showFilters={true} showExport={true} />
        <main className="flex-1 space-y-4 overflow-auto p-4 md:space-y-6 md:p-6">
          <DrilldownIndicator />
          {filteredOrders.length === 0 ? <EmptyState /> : <OrdersTable orders={filteredOrders} />}
        </main>
      </div>
    </div>
  );
}
