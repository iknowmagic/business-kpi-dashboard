import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateEvent, useDeleteAllEvents } from '@/hooks/useEventMutations';
import { useEventsQuery } from '@/hooks/useEventsQuery';
import { PRIORITY_COLORS } from '@/lib/constants';
import { generateEventId } from '@/lib/utils';
import type { CalendarEvent } from '@/store/calendar/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TasksPanelProps {
  onClose: () => void;
}

export function TasksPanel({ onClose }: TasksPanelProps) {
  const { data: events = [] } = useEventsQuery();
  const createEventMutation = useCreateEvent();
  const deleteAllEventsMutation = useDeleteAllEvents();
  const [isWorking, setIsWorking] = useState(false);

  const getCurrentWindow = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 4);
    return { start: today, end: endDate };
  };

  const formatDateTime = (date: Date, hour: number, minute = 0) => {
    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const handleAddSampleTasks = async () => {
    if (isWorking) return;
    setIsWorking(true);
    try {
      const { start } = getCurrentWindow();
      const tomorrow = new Date(start);
      tomorrow.setDate(start.getDate() + 1);
      const dayAfter = new Date(start);
      dayAfter.setDate(start.getDate() + 2);

      const sampleTasks: CalendarEvent[] = [
        {
          id: generateEventId(),
          title: 'Team Meeting',
          start: formatDateTime(start, 9, 0),
          end: formatDateTime(start, 10, 0),
          backgroundColor: 'rgb(96, 165, 250)',
          autoSchedule: false,
        },
        {
          id: generateEventId(),
          title: 'Code Review',
          start: formatDateTime(start, 14, 0),
          end: formatDateTime(start, 15, 30),
          duration: 90,
          backgroundColor: PRIORITY_COLORS.high,
          borderColor: '#dc2626',
          priority: 'high',
          autoSchedule: true,
        },
        {
          id: generateEventId(),
          title: 'Feature Development',
          start: formatDateTime(tomorrow, 10, 0),
          end: formatDateTime(tomorrow, 13, 0),
          duration: 180,
          backgroundColor: PRIORITY_COLORS.normal,
          borderColor: '#2563eb',
          priority: 'normal',
          autoSchedule: true,
          isSplittable: true,
          splitMinDuration: 60,
        },
        {
          id: generateEventId(),
          title: 'Client Call',
          start: formatDateTime(tomorrow, 14, 0),
          end: formatDateTime(tomorrow, 15, 0),
          backgroundColor: PRIORITY_COLORS.asap,
          borderColor: '#dc2626',
          priority: 'asap',
          autoSchedule: false,
        },
        {
          id: generateEventId(),
          title: 'Documentation Update',
          start: formatDateTime(dayAfter, 11, 0),
          end: formatDateTime(dayAfter, 12, 30),
          duration: 90,
          backgroundColor: PRIORITY_COLORS.low,
          borderColor: '#9ca3af',
          priority: 'low',
          autoSchedule: true,
        },
        {
          id: generateEventId(),
          title: 'Lunch Break',
          start: formatDateTime(dayAfter, 12, 0),
          end: formatDateTime(dayAfter, 13, 0),
          backgroundColor: '#10b981',
          autoSchedule: false,
        },
      ];

      await Promise.all(
        sampleTasks.map(
          (task) =>
            new Promise((resolve, reject) => {
              createEventMutation.mutate(task, {
                onSuccess: resolve,
                onError: reject,
              });
            })
        )
      );

      toast.success('Added sample tasks', {
        description: `Created ${sampleTasks.length} tasks`,
      });
      onClose();
    } catch {
      toast.error('Failed to add sample tasks');
    } finally {
      setIsWorking(false);
    }
  };

  const handleClearAllTasks = () => {
    if (isWorking) return;
    setIsWorking(true);
    deleteAllEventsMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Cleared all tasks');
        onClose();
      },
      onError: () => {
        toast.error('Failed to clear tasks');
      },
      onSettled: () => setIsWorking(false),
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sample Data</CardTitle>
          <CardDescription>Quickly populate or reset tasks for testing (affects Supabase).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button size="sm" onClick={handleAddSampleTasks} disabled={isWorking}>
            {isWorking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add sample tasks
          </Button>
          <Button size="sm" variant="secondary" onClick={handleClearAllTasks} disabled={isWorking}>
            Clear all tasks
          </Button>
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Current Data</CardTitle>
          <CardDescription>
            {events.length} task{events.length === 1 ? '' : 's'} in Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Actions above modify the shared Supabase dev instance. Remember to reset after testing if needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
