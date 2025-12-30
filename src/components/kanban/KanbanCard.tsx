import { Task } from '@/types';
import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onUpdateTask: (task: Task) => void;
}

export function KanbanCard({ task, onDragStart, onUpdateTask }: KanbanCardProps) {
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const progress = task.subtasks.length > 0 
    ? (completedSubtasks / task.subtasks.length) * 100 
    : 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <h4 className="font-medium text-sm text-foreground mb-2">{task.title}</h4>
      
      {task.subtasks.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>{completedSubtasks}/{task.subtasks.length}</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                progress === 100 ? "bg-success" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {task.deadline && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
        {task.estimatedTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{Math.round(task.estimatedTime / 60)}h</span>
          </div>
        )}
      </div>
    </div>
  );
}
