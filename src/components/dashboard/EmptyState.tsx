/**
 * Empty State Component
 * Displayed when no data matches the current filters
 */

import { dateRangeAtom, regionAtom, segmentAtom } from '@/store/dashboard/atoms';
import { useSetAtom } from 'jotai';
import { FileX } from 'lucide-react';
import { Button } from '../ui/button';

export function EmptyState() {
  const setDateRange = useSetAtom(dateRangeAtom);
  const setSegment = useSetAtom(segmentAtom);
  const setRegion = useSetAtom(regionAtom);

  const handleReset = () => {
    setDateRange('Last 30 days');
    setSegment('All');
    setRegion('All');
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center" data-testid="empty-state">
      <FileX className="text-muted-foreground mb-4 h-16 w-16" />
      <h3 className="mb-2 text-lg font-semibold">No data found</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        We could not find any orders matching your current filters. Try adjusting your date range or filter criteria.
      </p>
      <Button onClick={handleReset} data-testid="reset-filters">
        Reset filters
      </Button>
    </div>
  );
}
