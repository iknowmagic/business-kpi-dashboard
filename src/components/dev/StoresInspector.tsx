import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCalendar } from '@/store/calendar/hooks';
import { useSidebar } from '@/store/sidebar/hooks';
import { useUserPreferences } from '@/store/userPreferences/hooks';

export function StoresInspector() {
  const calendarState = useCalendar();
  const sidebarState = useSidebar();
  const preferencesState = useUserPreferences();

  const stores = useMemo(
    () => [
      {
        id: 'calendarStore',
        label: 'Calendar store',
        description: 'Modal state, timer, and calendar view controls.',
        state: calendarState,
      },
      {
        id: 'sidebarStore',
        label: 'Sidebar store',
        description: 'Desktop sidebar open/close persistence.',
        state: sidebarState,
      },
      {
        id: 'userPreferencesStore',
        label: 'User preferences store',
        description: 'User defaults synced with Supabase.',
        state: preferencesState,
      },
    ],
    [calendarState, sidebarState, preferencesState]
  );

  return (
    <div className="space-y-4">
      {stores.map((store) => (
        <Card key={store.id}>
          <CardHeader>
            <CardTitle>{store.label}</CardTitle>
            <CardDescription>{store.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-xl border">
              <ScrollArea className="h-[240px] w-full rounded-xl">
                <div className="p-3">
                  <StoreTreeNode label={store.id} value={store.state} />
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type StoreTreeNodeProps = {
  label: string;
  value: unknown;
  depth?: number;
};

function StoreTreeNode({ label, value, depth = 0 }: StoreTreeNodeProps) {
  const isArray = Array.isArray(value);
  const isObject = isPlainObject(value);
  const isExpandable = isArray || isObject;
  const [isExpanded, setIsExpanded] = useState(depth < 1);
  const arrayLength = isArray ? (value as unknown[]).length : 0;

  return (
    <div className="font-mono text-xs">
      <div className="flex items-start gap-1" style={{ marginLeft: depth * 16 }}>
        {isExpandable ? (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="inline-block h-3.5 w-3.5" />
        )}
        <div className="flex-1">
          <span className="text-foreground">{label}</span>
          {!isExpandable && <span className="text-muted-foreground">: {formatValue(value)}</span>}
          {isExpandable && (
            <span className="text-muted-foreground">{isArray ? ` · Array(${arrayLength})` : ' · Object'}</span>
          )}
        </div>
      </div>

      {isExpandable && isExpanded && (
        <div className="space-y-0.5">
          {isArray &&
            (value as unknown[]).map((child, index) => (
              <StoreTreeNode key={`${label}-${index}`} label={`[${index}]`} value={child} depth={depth + 1} />
            ))}

          {isObject &&
            Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => (
              <StoreTreeNode key={`${label}-${childKey}`} label={childKey} value={childValue} depth={depth + 1} />
            ))}

          {isArray && arrayLength === 0 && (
            <div className="text-muted-foreground text-[11px]" style={{ marginLeft: (depth + 1) * 16 + 16 }}>
              (empty)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const formatValue = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'function') return 'ƒ function';
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Map) return `Map(${value.size})`;
  if (value instanceof Set) return `Set(${value.size})`;
  if (value instanceof Promise) return 'Promise';
  return Object.prototype.toString.call(value);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};
