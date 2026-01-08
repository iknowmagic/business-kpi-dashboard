/**
 * Traffic Sources Chart
 * Pie chart showing order distribution by traffic source
 */

import type { TrafficSourceDataPoint } from '@/lib/mockData';
import { useTheme } from 'next-themes';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '../ui/skeleton';

interface TrafficChartProps {
  data: TrafficSourceDataPoint[];
  isLoading?: boolean;
}

// Pastel colors for traffic sources
const COLORS = {
  Organic: 'hsl(150, 60%, 65%)',
  Paid: 'hsl(210, 70%, 70%)',
  Referral: 'hsl(280, 65%, 75%)',
  Email: 'hsl(30, 80%, 70%)',
};

export function TrafficChart({ data, isLoading }: TrafficChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6" data-testid="traffic-chart-skeleton">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-75 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-6" data-testid="traffic-chart">
      <h3 className="mb-4 text-lg font-semibold">Traffic Sources</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data as unknown as Record<string, unknown>[]}
            dataKey="value"
            nameKey="source"
            cx="50%"
            cy="50%"
            outerRadius={100}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={(entry: any) => `${entry.source}: ${entry.value}`}
          >
            {data.map((entry) => (
              <Cell key={entry.source} fill={COLORS[entry.source]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? 'hsl(222, 47%, 11%)' : 'hsl(0, 0%, 100%)',
              border: `1px solid ${isDark ? 'hsl(215, 20%, 25%)' : 'hsl(215, 20%, 85%)'}`,
              borderRadius: '8px',
              color: isDark ? 'hsl(213, 31%, 91%)' : 'hsl(222, 47%, 11%)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
