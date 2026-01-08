import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useDevTools } from '@/store/devTools/hooks';
import type { DevMessageLevel } from '@/store/devTools/atoms';

const levelBadgeStyles: Record<DevMessageLevel, string> = {
  info: 'text-muted-foreground',
  warn: 'text-amber-600',
  error: 'text-destructive',
};

const cardAccentStyles: Record<DevMessageLevel, string> = {
  info: 'border-border',
  warn: 'border-amber-300/70',
  error: 'border-destructive/60',
};

export function DevMessagesPanel() {
  const { messages, clearMessages } = useDevTools();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Redirected console output and debug info</p>
        <Button variant="outline" size="sm" onClick={clearMessages} disabled={messages.length === 0} className="gap-1">
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>
      <ScrollArea className="bg-muted/20 h-full rounded-lg border p-3 pr-5">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">No messages yet.</p>
        ) : (
          <div className="mb-16 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-background/70 rounded-md border p-3 text-sm ${cardAccentStyles[msg.level]}`}
              >
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-2 font-medium capitalize ${levelBadgeStyles[msg.level]}`}>
                    {msg.level}
                  </span>
                  <span>{format(new Date(msg.timestamp), 'MMM d, HH:mm:ss')}</span>
                </div>
                <p className="text-foreground mt-2 font-medium">{msg.message}</p>
                {msg.details ? (
                  <pre className="bg-muted mt-2 overflow-x-auto rounded p-2 text-[11px]">
                    {JSON.stringify(msg.details, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
