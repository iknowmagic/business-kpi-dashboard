/**
 * Dashboard Header
 * Top header with page title, filters, and export button
 */

import type { Order } from '@/lib/mockData';
import { exportOrdersToCSV } from '@/lib/mockData';
import { Download } from 'lucide-react';
import { Button } from '../ui/button';
import { DashboardFilters } from './DashboardFilters';

interface DashboardHeaderProps {
  title: string;
  orders?: Order[];
  showFilters?: boolean;
  showExport?: boolean;
}

export function DashboardHeader({ title, orders = [], showFilters = true, showExport = true }: DashboardHeaderProps) {
  const handleExport = () => {
    exportOrdersToCSV(orders);
  };

  return (
    <div className="bg-card border-b px-4 py-3 md:px-6 md:py-4" data-testid="dashboard-header">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        {showExport && (
          <Button onClick={handleExport} size="sm" className="md:size-base" data-testid="export-csv">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        )}
      </div>
      {showFilters && <DashboardFilters />}
    </div>
  );
}
