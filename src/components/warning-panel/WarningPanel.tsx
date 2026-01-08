import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { noctare } from '@/lib/devLogger';
import { autoIgnoreEvent, completeEvent, deleteEvent, updateEventDueDate } from '@/lib/supabaseEvents';
import { cn } from '@/lib/utils';
import { useWarningPanelState } from '@/store/calendar/hooks';
import type { CalendarEvent } from '@/store/calendar/types';
import { WarningTaskRow } from './WarningTaskRow';

interface WarningPanelProps {
  tasks: CalendarEvent[];
  onRefresh: () => Promise<void> | void;
}

const reasonMetadata: Record<string, { label: string; tone: string; description: string }> = {
  overdue: {
    label: 'Past Due',
    tone: 'text-destructive',
    description: 'Task is past its due date',
  },
  'not fit': {
    label: 'No Available Window',
    tone: 'text-light-warning-amber-500 dark:text-dark-warning-amber-500',
    description: 'Task cannot fit inside its scheduling window',
  },
  insufficient_time: {
    label: "Can't Fit Before Deadline",
    tone: 'text-light-warning-orange-500 dark:text-dark-warning-orange-500',
    description: 'Not enough time remains before due date',
  },
  occupied_slots: {
    label: 'No Open Slots',
    tone: 'text-light-warning-yellow-500 dark:text-dark-warning-yellow-500',
    description: 'Calendar is filled during the required windows',
  },
};

export function WarningPanel({ tasks, onRefresh }: WarningPanelProps) {
  const {
    isOpen,
    setOpen,
    selectionMode,
    setSelectionMode,
    selectedIds,
    setSelectedIds,
    bulkLoading,
    setBulkLoading,
    dueDateTaskId,
    setDueDateTaskId,
    dueDateValue,
    setDueDateValue,
  } = useWarningPanelState();

  const groupedTasks = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {};
    tasks.forEach((task) => {
      const key = task.schedulingFailureReason ?? 'other';
      groups[key] = groups[key] ? [...groups[key], task] : [task];
    });
    return groups;
  }, [tasks]);

  const selectionCount = selectedIds.size;

  const toggleSelectionMode = () => {
    setSelectionMode((prev: boolean) => !prev);
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSingleAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      toast.success(successMessage);
      await onRefresh();
    } catch (error) {
      noctare.log('Warning panel action failed', error);
      toast.error('Action failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
      throw error;
    }
  };

  const runBulkAction = async (action: (id: string) => Promise<void>) => {
    if (!selectionCount) {
      toast.error('Select at least one task');
      return;
    }

    setBulkLoading(true);
    try {
      await Promise.all(Array.from(selectedIds).map(action));
      toast.success('Bulk action completed');
      setSelectedIds(new Set());
      setSelectionMode(false);
      await onRefresh();
    } catch (error) {
      noctare.log('Warning panel bulk action failed', error);
      toast.error('Bulk action failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const openDueDateDialog = (task: CalendarEvent) => {
    setDueDateTaskId(task.id);
    setDueDateValue(task.due ? new Date(task.due).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  };

  const handleDueDateSubmit = async () => {
    if (!dueDateTaskId) return;
    const iso = new Date(dueDateValue).toISOString();
    await handleSingleAction(() => updateEventDueDate(dueDateTaskId, iso), 'Due date updated');
    setDueDateTaskId(null);
  };

  const handleDelete = (id: string) => handleSingleAction(() => deleteEvent(id), 'Task deleted');
  const handleComplete = (id: string) => handleSingleAction(() => completeEvent(id), 'Task completed');
  const handleAutoIgnore = (id: string) => handleSingleAction(() => autoIgnoreEvent(id), 'Task ignored');

  const handleExtendDueDates = async (days: number) => {
    if (!selectionCount) {
      toast.error('Select at least one task');
      return;
    }
    await runBulkAction(async (id) => {
      const task = tasks.find((t) => t.id === id);
      const currentDue = task?.due ? new Date(task.due) : new Date();
      currentDue.setDate(currentDue.getDate() + days);
      await updateEventDueDate(id, currentDue.toISOString());
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:w-[420px]">
          <SheetHeader className="border-b px-6 py-4 text-left">
            <SheetTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-light-warning-red-500 dark:text-dark-warning-red-500" />
              Tasks Need Attention
            </SheetTitle>
            <SheetDescription>Review overdue or unschedulable tasks and resolve them quickly.</SheetDescription>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant={selectionMode ? 'default' : 'outline'}
                size="sm"
                onClick={toggleSelectionMode}
                disabled={!tasks.length}
              >
                {selectionMode ? 'Exit select mode' : 'Select tasks'}
              </Button>
              {selectionMode && <Badge variant="secondary">{selectionCount} selected</Badge>}
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            {!tasks.length && (
              <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                No tasks need attention right now.
              </div>
            )}

            {Object.entries(groupedTasks).map(([reason, items]) => {
              if (!items.length) return null;
              const meta = reasonMetadata[reason] ?? {
                label: 'Other issues',
                tone: 'text-muted-foreground',
                description: 'Requires manual review',
              };

              return (
                <div key={reason} className="mb-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{meta.label}</h3>
                    <span className={cn('text-xs', meta.tone)}>{meta.description}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((task) => (
                      <WarningTaskRow
                        key={task.id}
                        task={task}
                        selectionMode={selectionMode}
                        isSelected={selectedIds.has(task.id)}
                        onToggleSelection={() => toggleSelection(task.id)}
                        onComplete={() => handleComplete(task.id)}
                        onDelete={() => handleDelete(task.id)}
                        onAutoIgnore={() => handleAutoIgnore(task.id)}
                        onChangeDueDate={() => openDueDateDialog(task)}
                        dueLabel={
                          task.due
                            ? `Due ${formatDistanceToNow(new Date(task.due), {
                                addSuffix: true,
                              })}`
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </ScrollArea>

          <SheetFooter className="border-t px-6 py-4">
            <div className="flex w-full flex-col gap-3">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                Bulk actions apply to selected tasks.
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selectionCount || bulkLoading}
                  onClick={() => runBulkAction(handleComplete)}
                >
                  Mark complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selectionCount || bulkLoading}
                  onClick={() => handleExtendDueDates(3)}
                >
                  Extend due +3d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selectionCount || bulkLoading}
                  onClick={() => runBulkAction(handleAutoIgnore)}
                >
                  Auto-ignore
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!selectionCount || bulkLoading}
                  onClick={() => runBulkAction(handleDelete)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(dueDateTaskId)} onOpenChange={(open) => !open && setDueDateTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change due date</DialogTitle>
            <DialogDescription>Select a new due date and we&apos;ll clear the alert.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Label htmlFor="due-date">Due date</Label>
            <Input
              id="due-date"
              type="datetime-local"
              value={dueDateValue}
              onChange={(event) => setDueDateValue(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDueDateTaskId(null)}>
              Cancel
            </Button>
            <Button onClick={handleDueDateSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
