/**
 * KPI Card Component
 * Displays a key performance indicator with value, change indicator, and trend
 */

import { ArrowDown, ArrowUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  format: 'currency' | 'number' | 'percentage';
  isLoading?: boolean;
}

export function KPICard({ title, value, change, format, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6" data-testid="kpi-card-skeleton">
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="mb-2 h-8 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>
    );
  }

  const formattedValue =
    format === 'currency'
      ? `$${typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}`
      : format === 'percentage'
        ? `${typeof value === 'number' ? value.toFixed(1) : value}%`
        : typeof value === 'number'
          ? value.toLocaleString()
          : value;

  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <div className="bg-card @container rounded-lg border p-6" data-testid="kpi-card">
      <h3 className="text-muted-foreground mb-2 text-sm font-medium">{title}</h3>
      <div className="@kpi1:text-3xl mb-1 text-2xl font-bold" data-testid="kpi-value">
        {formattedValue}
      </div>
      <div
        className="@kpi1:text-sm flex items-center gap-1 text-xs whitespace-nowrap"
        data-testid="kpi-change-container"
      >
        <Icon className={`h-4 w-4 ${changeColor}`} />
        <span className={`${changeColor}`} data-testid="kpi-change">
          {Math.abs(change).toFixed(1)}%
        </span>
        <span className="text-muted-foreground">vs previous period</span>
      </div>
    </div>
  );
}
