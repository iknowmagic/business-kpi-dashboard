import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';

interface StoreNode {
  name: string;
  state: unknown;
}

interface JotaiViewerProps {
  stores: StoreNode[];
}

const sanitizeValue = (value: unknown, seen: WeakMap<object, unknown>): unknown => {
  if (typeof value === 'function') {
    return '[Function]';
  }
  if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
    return `[HTMLElement:${value.tagName}]`;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Map) {
    return {
      type: 'Map',
      entries: Array.from(value.entries()).map(([key, val]) => [sanitizeValue(key, seen), sanitizeValue(val, seen)]),
    };
  }
  if (value instanceof Set) {
    return {
      type: 'Set',
      values: Array.from(value.values()).map((val) => sanitizeValue(val, seen)),
    };
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen));
  }
  if (value && typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }
    const clone: Record<string, unknown> = {};
    seen.set(value, clone);
    Object.keys(value as Record<string, unknown>).forEach((key) => {
      clone[key] = sanitizeValue((value as Record<string, unknown>)[key], seen);
    });
    return clone;
  }
  if (typeof value === 'number' && Number.isNaN(value)) {
    return 'NaN';
  }
  if (value === Infinity || value === -Infinity) {
    return String(value);
  }
  return value ?? null;
};

const sanitizeState = (state: unknown) => sanitizeValue(state, new WeakMap());

const colorizeValue = (value: unknown) => {
  if (typeof value === 'string') {
    return <span className="text-blue-600">"{value}"</span>;
  }
  if (typeof value === 'number') {
    return <span className="text-amber-600">{value}</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-purple-600">{String(value)}</span>;
  }
  if (value === null) {
    return <span className="text-slate-500">null</span>;
  }
  if (value === 'NaN' || value === 'Infinity' || value === '-Infinity') {
    return <span className="text-rose-500">{value}</span>;
  }
  return <span>{String(value)}</span>;
};

const formatObject = (value: Record<string, unknown>, depth: number): React.ReactNode => {
  const entries = Object.entries(value);
  return (
    <div className="pl-4">
      {entries.map(([key, entryValue]) => (
        <div key={key} className="py-1">
          <span className="text-slate-600">{key}</span>
          <span className="text-slate-400">: </span>
          {typeof entryValue === 'object' && entryValue !== null ? (
            <details className="ml-2 border-l border-dashed border-slate-300 pl-3" open={depth < 1}>
              <summary className="cursor-pointer text-sm text-slate-800">
                {Array.isArray(entryValue) ? 'Array' : 'Object'}
              </summary>
              {Array.isArray(entryValue) ? (
                <div className="space-y-1">
                  {entryValue.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-400">[{idx}]</span>
                      <div className="flex-1">
                        {typeof item === 'object' && item !== null
                          ? formatObject(item as Record<string, unknown>, depth + 1)
                          : colorizeValue(item)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                formatObject(entryValue as Record<string, unknown>, depth + 1)
              )}
            </details>
          ) : (
            colorizeValue(entryValue)
          )}
        </div>
      ))}
    </div>
  );
};

export function JotaiViewer({ stores }: JotaiViewerProps) {
  const sanitizedStores = useMemo(
    () =>
      stores.map((store) => ({
        name: store.name,
        state: sanitizeState(store.state),
      })),
    [stores]
  );

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-3">
        {sanitizedStores.map((store, index) => (
          <details key={store.name} className="bg-muted/40 rounded-lg border p-3" open={index === 0}>
            <summary className="cursor-pointer text-sm font-semibold">{store.name}</summary>
            <div className="mt-2 text-xs text-slate-800">
              {typeof store.state === 'object' && store.state !== null
                ? formatObject(store.state as Record<string, unknown>, 0)
                : colorizeValue(store.state)}
            </div>
          </details>
        ))}
      </div>
    </ScrollArea>
  );
}
