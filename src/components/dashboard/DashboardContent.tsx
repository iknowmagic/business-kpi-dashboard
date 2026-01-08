/**
 * Business KPI Dashboard Page
 * Main dashboard with KPIs, charts, and orders table
 */

import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { DrilldownIndicator } from '@/components/dashboard/DrilldownIndicator';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { KPICard } from '@/components/dashboard/KPICard';
import { OrdersTable } from '@/components/dashboard/OrdersTable';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TrafficChart } from '@/components/dashboard/TrafficChart';
import type { DashboardData } from '@/lib/mockData';
import { getDashboardData } from '@/lib/mockData';
import { drilldownAtom, filtersAtom, simulateErrorAtom } from '@/store/dashboard/atoms';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';

export function DashboardContent() {
  const filters = useAtomValue(filtersAtom);
  const drilldown = useAtomValue(drilldownAtom);
  const simulateError = useAtomValue(simulateErrorAtom);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Fetch data when filters change
  useEffect(() => {
    setIsDataLoading(true);

    // Simulate async loading
    const timer = setTimeout(() => {
      const data = getDashboardData(filters);
      setDashboardData(data);
      setIsDataLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [filters]);

  // Apply drilldown filtering
  const filteredOrders = useMemo(() => {
    if (!dashboardData) return [];

    let orders = dashboardData.orders;

    if (drilldown.type === 'day' && drilldown.value) {
      orders = orders.filter((order) => order.date.toISOString().split('T')[0] === drilldown.value);
    } else if (drilldown.type === 'category' && drilldown.value) {
      orders = orders.filter((order) => order.category === drilldown.value);
    }

    return orders;
  }, [dashboardData, drilldown]);

  if (simulateError) {
    return <ErrorState />;
  }

  const showEmpty = !isDataLoading && dashboardData && dashboardData.orders.length === 0;

  if (showEmpty) {
    return <EmptyState />;
  }

  const kpis = dashboardData?.kpis;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Revenue"
          value={kpis?.revenue.value || 0}
          change={kpis?.revenue.change || 0}
          format="currency"
          isLoading={isDataLoading}
        />
        <KPICard
          title="Orders"
          value={kpis?.orders.value || 0}
          change={kpis?.orders.change || 0}
          format="number"
          isLoading={isDataLoading}
        />
        <KPICard
          title="Conversion Rate"
          value={kpis?.conversionRate.value || 0}
          change={kpis?.conversionRate.change || 0}
          format="percentage"
          isLoading={isDataLoading}
        />
        <KPICard
          title="Avg Order Value"
          value={kpis?.avgOrderValue.value || 0}
          change={kpis?.avgOrderValue.change || 0}
          format="currency"
          isLoading={isDataLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <RevenueChart data={dashboardData?.revenueOverTime || []} isLoading={isDataLoading} />
        </div>
        <CategoryChart data={dashboardData?.ordersByCategory || []} isLoading={isDataLoading} />
        <TrafficChart data={dashboardData?.trafficSources || []} isLoading={isDataLoading} />
      </div>

      {/* Drilldown Indicator */}
      <DrilldownIndicator />

      {/* Orders Table */}
      <OrdersTable orders={filteredOrders} isLoading={isDataLoading} />
    </div>
  );
}
