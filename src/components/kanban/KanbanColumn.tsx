import { Task } from '@/types';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  color: string;
  tasks: Task[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDrop: (e: React.DragEvent) => void;
  onUpdateTask: (task: Task) => void;
}

export function KanbanColumn({
  title,
  color,
  tasks,
  onDragStart,
  onDrop,
  onUpdateTask
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={cn(
        "rounded-lg p-4 min-h-[400px]",
        color
      )}
      onDragOver={handleDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onUpdateTask={onUpdateTask}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Drop tasks here
        </div>
      )}
    </div>
  );
}
