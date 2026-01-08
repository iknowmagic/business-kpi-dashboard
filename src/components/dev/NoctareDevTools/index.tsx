import { TasksPanel } from '@/components/dev/NoctareDevTools/TasksPanel';
import { DevMessagesPanel } from '@/components/dev/NoctareDevTools/panels/DevMessagesPanel';
import { NetworkCallsPanel } from '@/components/dev/NoctareDevTools/panels/NetworkCallsPanel';
import { StoresPanel } from '@/components/dev/NoctareDevTools/panels/StoresPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DevToolsTab } from '@/store/devTools/atoms';
import { useDevTools } from '@/store/devTools/hooks';
import { Wrench } from 'lucide-react';
import { useEffect } from 'react';

const TAB_KEYS = {
  tasks: 'tasks',
  stores: 'stores',
  messages: 'messages',
  network: 'network',
} as const;

const tabTriggerClasses =
  'relative flex-1 items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition data-[state=active]:text-foreground after:absolute after:left-1/2 after:top-full after:h-1 after:w-10 after:-translate-x-1/2 after:bg-gradient-to-r after:from-orange-300 after:to-orange-500 after:opacity-0 data-[state=active]:after:opacity-100';

export function NoctareDevTools() {
  const { unreadCount, markAllRead, open, setOpen, activeTab, setActiveTab } = useDevTools();
  const isDev = import.meta.env.DEV;
  const enabled = import.meta.env.VITE_NOCTARE_DEV_TOOLS === 'true';
  useEffect(() => {
    if (open && activeTab === TAB_KEYS.messages) {
      markAllRead();
    }
  }, [activeTab, open, markAllRead]);

  const handleTabChange = (value: DevToolsTab) => {
    setActiveTab(value);
  };

  if (!isDev || !enabled) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 left-4 z-50 rounded-full border shadow-md transition hover:shadow-lg"
        >
          <span className="relative flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span>MetricHub Dev Tools</span>
            {unreadCount > 0 ? (
              <span className="bg-destructive absolute -top-3 -right-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.65rem] font-semibold text-white">
                {unreadCount}
              </span>
            ) : null}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-full w-full flex-col overflow-hidden p-0 sm:max-w-110">
        <div className="shrink-0 border-b px-6 py-4">
          <SheetHeader className="space-y-1">
            <SheetTitle>MetricHub Dev Tools</SheetTitle>
            <SheetDescription>Developer-only controls. Changes persist to Supabase.</SheetDescription>
          </SheetHeader>
        </div>
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(value) => handleTabChange(value as DevToolsTab)}
            className="flex h-full flex-col rounded-none"
          >
            <div className="shrink-0 rounded-none border-b px-6 py-3">
              <div className="space-y-2">
                <TabsList className="bg-muted/70 flex w-full flex-col gap-2 rounded-none p-0 sm:flex-row">
                  <TabsTrigger value={TAB_KEYS.tasks} className={`${tabTriggerClasses} h-full rounded-none`}>
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger value={TAB_KEYS.stores} className={`${tabTriggerClasses} h-full rounded-none`}>
                    Jotai
                  </TabsTrigger>
                  <TabsTrigger value={TAB_KEYS.messages} className={`${tabTriggerClasses} h-full rounded-none`}>
                    <span className="flex items-center gap-2">
                      Dev Messages
                      {unreadCount > 0 ? (
                        <Badge variant="secondary" className="h-4 min-w-5 justify-center rounded-full px-1 text-[10px]">
                          {unreadCount}
                        </Badge>
                      ) : null}
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="bg-muted/70 rounded-none p-0">
                  <TabsTrigger
                    value={TAB_KEYS.network}
                    className={`${tabTriggerClasses} h-full justify-center rounded-none`}
                  >
                    Network Calls
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <div className="flex-1 overflow-hidden px-6 pb-6">
              <TabsContent
                value={TAB_KEYS.tasks}
                className="h-full data-[state=active]:flex data-[state=active]:flex-col"
              >
                <TasksPanel onClose={() => setOpen(false)} />
              </TabsContent>
              <TabsContent
                value={TAB_KEYS.stores}
                className="h-full data-[state=active]:flex data-[state=active]:flex-col"
              >
                <StoresPanel />
              </TabsContent>
              <TabsContent
                value={TAB_KEYS.messages}
                className="h-full data-[state=active]:flex data-[state=active]:flex-col"
              >
                <DevMessagesPanel />
              </TabsContent>
              <TabsContent
                value={TAB_KEYS.network}
                className="h-full data-[state=active]:flex data-[state=active]:flex-col"
              >
                <NetworkCallsPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
