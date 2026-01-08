import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CalendarClock, Check, CheckSquare, MoreVertical, Trash2 } from 'lucide-react';
import type { CalendarEvent } from '@/store/calendar/types';

interface WarningTaskRowProps {
  task: CalendarEvent;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onAutoIgnore: () => void;
  onChangeDueDate: () => void;
  dueLabel?: string;
}

export function WarningTaskRow({
  task,
  selectionMode,
  isSelected,
  onToggleSelection,
  onComplete,
  onDelete,
  onAutoIgnore,
  onChangeDueDate,
  dueLabel,
}: WarningTaskRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      {selectionMode && <Checkbox checked={isSelected} onCheckedChange={onToggleSelection} />}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate font-medium">{task.title || 'Untitled task'}</div>
          <Badge variant="outline">
            {task.duration ?? Math.round((new Date(task.end).getTime() - new Date(task.start).getTime()) / 60000)} min
          </Badge>
        </div>
        {dueLabel && <div className="text-muted-foreground text-xs">{dueLabel}</div>}
      </div>

      {!selectionMode && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onComplete}>
              <Check className="mr-2 h-4 w-4" />
              Mark complete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onChangeDueDate}>
              <CalendarClock className="mr-2 h-4 w-4" />
              Change due date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAutoIgnore}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Auto-ignore
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
