import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { noctare } from '@/lib/devLogger';
import { Copy, Play, Square, Trash2, X } from 'lucide-react';
import { useCallback } from 'react';
import { useNetworkMonitor } from '@/store/networkMonitor/hooks';

const formatCallForCopy = (call: {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  payload?: string | null;
  response?: string | null;
  error?: string | null;
}) => {
  const parts = [
    `Timestamp: ${call.timestamp}`,
    `Method: ${call.method}`,
    `URL: ${call.url}`,
    `Status: ${call.status ?? 'N/A'}`,
  ];
  if (call.payload) parts.push(`Payload: ${call.payload}`);
  if (call.response) parts.push(`Response: ${call.response}`);
  if (call.error) parts.push(`Error: ${call.error}`);
  return parts.join('\n');
};

export function NetworkCallsPanel() {
  const { capturing, calls, startCapture, stopCapture, clearCalls, removeCall } = useNetworkMonitor();
  const orderedCalls = [...calls].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const handleCopyAll = useCallback(async () => {
    if (!orderedCalls.length) return;
    const text = orderedCalls.map((call) => formatCallForCopy(call)).join('\n\n---\n\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      noctare.log('Network calls copy failed', error);
    }
  }, [orderedCalls]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={capturing ? 'secondary' : 'default'}
          className="gap-1"
          onClick={capturing ? stopCapture : startCapture}
        >
          {capturing ? (
            <>
              <Square className="h-4 w-4" />
              Stop capture
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start capture
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" className="gap-1" disabled={!calls.length} onClick={handleCopyAll}>
          <Copy className="h-4 w-4" />
          Copy all
        </Button>
        <Button variant="outline" size="sm" className="gap-1" disabled={!calls.length} onClick={clearCalls}>
          <Trash2 className="h-4 w-4" />
          Delete all
        </Button>
      </div>
      <ScrollArea className="bg-muted/20 h-full rounded-lg border p-3 pr-5">
        {orderedCalls.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {capturing ? 'Capturing network calls...' : 'No network calls yet. Click “Start capture” to begin logging.'}
          </p>
        ) : (
          <div className="mb-[50px] w-[350px] space-y-3">
            {orderedCalls.map((call) => (
              <div key={call.id} className="bg-background/70 relative rounded-md border p-3 text-sm">
                <button
                  type="button"
                  onClick={() => removeCall(call.id)}
                  className="text-muted-foreground hover:text-foreground absolute top-2 right-2 rounded p-1 transition"
                  aria-label="Delete call"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                  <span>{new Date(call.timestamp).toLocaleString()}</span>
                  <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] tracking-wide uppercase">
                    {call.method}
                  </span>
                  {call.status != null && <span>Status: {call.status}</span>}
                </div>
                <p className="mt-2 font-medium break-all">{call.url}</p>
                {call.payload && (
                  <div className="mt-2 text-xs">
                    <p className="text-muted-foreground font-semibold">Payload</p>
                    <pre className="bg-muted mt-1 max-h-40 overflow-auto rounded p-2 text-[11px]">{call.payload}</pre>
                  </div>
                )}
                {call.response && (
                  <div className="mt-2 text-xs">
                    <p className="text-muted-foreground font-semibold">Response</p>
                    <pre className="bg-muted mt-1 max-h-40 w-[320px] overflow-auto rounded p-2 text-[11px]">
                      {call.response}
                    </pre>
                  </div>
                )}
                {call.error && <p className="text-destructive mt-2 text-xs">Error: {call.error}</p>}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
