/**
 * Revenue Over Time Chart
 * Line chart showing revenue trends with drilldown on click
 */

import type { RevenueDataPoint } from '@/lib/mockData';
import { drilldownAtom } from '@/store/dashboard/atoms';
import { useSetAtom } from 'jotai';
import { useTheme } from 'next-themes';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '../ui/skeleton';

interface RevenueChartProps {
  data: RevenueDataPoint[];
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const setDrilldown = useSetAtom(drilldownAtom);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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

  // Pastel line color (matching CategoryChart blue) and white dots in dark mode
  const lineColor = 'hsl(200, 70%, 70%)';
  const dotColor = isDark ? '#ffffff' : lineColor;

  return (
    <div className="bg-card rounded-lg border p-6" data-testid="revenue-chart">
      <h3 className="mb-4 text-lg font-semibold">Revenue Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={(e: any) => e?.activePayload?.[0] && handleClick(e.activePayload[0].payload)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'hsl(215, 20%, 25%)' : 'hsl(215, 20%, 85%)'} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            tick={{ fill: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(215, 20%, 45%)' }}
            className="text-xs"
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            tick={{ fill: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(215, 20%, 45%)' }}
            className="text-xs"
          />
          <Tooltip
            formatter={(value: number | undefined) => {
              const val = value || 0;
              if (val >= 1000000) return [`$${(val / 1000000).toFixed(2)}M`, 'Revenue'];
              if (val >= 1000) return [`$${(val / 1000).toFixed(1)}K`, 'Revenue'];
              return [`$${val.toFixed(0)}`, 'Revenue'];
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={{
              backgroundColor: isDark ? 'hsl(222, 47%, 11%)' : 'hsl(0, 0%, 100%)',
              border: `1px solid ${isDark ? 'hsl(215, 20%, 25%)' : 'hsl(215, 20%, 85%)'}`,
              borderRadius: '8px',
              color: isDark ? 'hsl(213, 31%, 91%)' : 'hsl(222, 47%, 11%)',
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ fill: dotColor, r: 4 }}
            activeDot={{ r: 6, cursor: 'pointer', fill: dotColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
