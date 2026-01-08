/**
 * Error State Component
 * Displayed when an error occurs (simulated for demo)
 */

import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

export function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center" data-testid="error-state">
      <AlertCircle className="text-destructive mb-4 h-16 w-16" />
      <h3 className="mb-2 text-lg font-semibold">Something went wrong</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        We encountered an error while loading the dashboard data. Please try again.
      </p>
      <Button onClick={() => window.location.reload()}>Reload page</Button>
    </div>
  );
}
