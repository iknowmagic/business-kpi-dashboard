/**
 * Orders by Category Chart
 * Bar chart showing order counts by category with drilldown on click
 */

import type { CategoryDataPoint } from '@/lib/mockData';
import { drilldownAtom } from '@/store/dashboard/atoms';
import { useSetAtom } from 'jotai';
import { useTheme } from 'next-themes';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '../ui/skeleton';

// Pastel colors for each category
const CATEGORY_COLORS = {
  Subscriptions: 'hsl(200, 70%, 70%)',
  Services: 'hsl(280, 65%, 75%)',
  'Add-ons': 'hsl(150, 60%, 65%)',
  Other: 'hsl(30, 80%, 70%)',
};

interface CategoryChartProps {
  data: CategoryDataPoint[];
  isLoading?: boolean;
}

export function CategoryChart({ data, isLoading }: CategoryChartProps) {
  const setDrilldown = useSetAtom(drilldownAtom);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
        <BarChart
          data={data}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={(e: any) => e?.activePayload?.[0] && handleClick(e.activePayload[0].payload)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'hsl(215, 20%, 25%)' : 'hsl(215, 20%, 85%)'} />
          <XAxis
            dataKey="category"
            tick={{ fill: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(215, 20%, 45%)' }}
            className="text-xs"
          />
          <YAxis tick={{ fill: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(215, 20%, 45%)' }} className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? 'hsl(222, 47%, 11%)' : 'hsl(0, 0%, 100%)',
              border: `1px solid ${isDark ? 'hsl(215, 20%, 25%)' : 'hsl(215, 20%, 85%)'}`,
              borderRadius: '8px',
              color: isDark ? 'hsl(213, 31%, 91%)' : 'hsl(222, 47%, 11%)',
            }}
          />
          <Bar dataKey="orders" cursor="pointer" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || 'hsl(200, 70%, 70%)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
