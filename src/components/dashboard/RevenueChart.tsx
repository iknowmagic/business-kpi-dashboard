/**
 * Revenue Over Time Chart
 * Line chart showing revenue trends with drilldown on click
 */

import type { RevenueDataPoint } from '@/lib/mockData';
import { drilldownAtom } from '@/store/dashboard/atoms';
import { useSetAtom } from 'jotai';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '../ui/skeleton';

interface RevenueChartProps {
  data: RevenueDataPoint[];
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const setDrilldown = useSetAtom(drilldownAtom);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6" data-testid="revenue-chart-skeleton">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-75 w-full" />
      </div>
    );
  }

  const handleClick = (data: RevenueDataPoint) => {
    if (data?.date) {
      setDrilldown({ type: 'day', value: data.date });
    }
  };

  return (
    <div className="bg-card rounded-lg border p-6" data-testid="revenue-chart">
      <h3 className="mb-4 text-lg font-semibold">Revenue Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={(e: any) => e?.activePayload?.[0] && handleClick(e.activePayload[0].payload)}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            className="text-xs"
          />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} className="text-xs" />
          <Tooltip
            formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, 'Revenue']}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6, cursor: 'pointer' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
