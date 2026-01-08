/**
 * Traffic Sources Chart
 * Pie chart showing order distribution by traffic source
 */

import type { TrafficSourceDataPoint } from '@/lib/mockData';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '../ui/skeleton';

interface TrafficChartProps {
  data: TrafficSourceDataPoint[];
  isLoading?: boolean;
}

const COLORS = {
  Organic: 'hsl(142, 76%, 36%)',
  Paid: 'hsl(221, 83%, 53%)',
  Referral: 'hsl(262, 83%, 58%)',
  Email: 'hsl(32, 98%, 56%)',
};

export function TrafficChart({ data, isLoading }: TrafficChartProps) {
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
            data={data}
            dataKey="value"
            nameKey="source"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => `${entry.source}: ${entry.value}`}
          >
            {data.map((entry) => (
              <Cell key={entry.source} fill={COLORS[entry.source]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
