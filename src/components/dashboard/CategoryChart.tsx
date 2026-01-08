/**
 * Orders by Category Chart
 * Bar chart showing order counts by category with drilldown on click
 */

import type { CategoryDataPoint } from '@/lib/mockData';
import { drilldownAtom } from '@/store/dashboard/atoms';
import { useSetAtom } from 'jotai';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '../ui/skeleton';

interface CategoryChartProps {
  data: CategoryDataPoint[];
  isLoading?: boolean;
}

export function CategoryChart({ data, isLoading }: CategoryChartProps) {
  const setDrilldown = useSetAtom(drilldownAtom);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6" data-testid="category-chart-skeleton">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-75 w-full" />
      </div>
    );
  }

  const handleClick = (data: CategoryDataPoint) => {
    if (data?.category) {
      setDrilldown({ type: 'category', value: data.category });
    }
  };

  return (
    <div className="bg-card rounded-lg border p-6" data-testid="category-chart">
      <h3 className="mb-4 text-lg font-semibold">Orders by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} onClick={(e) => e?.activePayload?.[0] && handleClick(e.activePayload[0].payload)}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="category" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Bar dataKey="orders" fill="hsl(var(--primary))" cursor="pointer" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
