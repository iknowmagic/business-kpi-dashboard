/**
 * Drilldown Indicator Component
 * Shows active drilldown filters and allows clearing them
 */

import { drilldownAtom } from '@/store/dashboard/atoms';
import { useAtom } from 'jotai';
import { X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function DrilldownIndicator() {
  const [drilldown, setDrilldown] = useAtom(drilldownAtom);

  if (!drilldown.type || !drilldown.value) {
    return null;
  }

  const label =
    drilldown.type === 'day'
      ? `Filtered to ${new Date(drilldown.value).toLocaleDateString()}`
      : `Category: ${drilldown.value}`;

  return (
    <div className="bg-muted flex items-center gap-2 rounded-lg p-3" data-testid="drilldown-indicator">
      <Badge variant="secondary">{label}</Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDrilldown({ type: null, value: null })}
        data-testid="clear-drilldown"
      >
        <X className="mr-1 h-4 w-4" />
        Clear filter
      </Button>
    </div>
  );
}
