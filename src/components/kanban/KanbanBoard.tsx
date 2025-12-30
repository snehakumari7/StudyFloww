import { Task } from '@/types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

export function KanbanBoard({ tasks, onUpdateTask }: KanbanBoardProps) {
  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-blue-500/5' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500/5' },
    { id: 'done', title: 'Done', color: 'bg-green-500/5' },
  ] as const;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== status) {
      onUpdateTask({ ...task, status });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          title={column.title}
          color={column.color}
          tasks={tasks.filter(t => t.status === column.id)}
          onDragStart={handleDragStart}
          onDrop={(e) => handleDrop(e, column.id)}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </div>
  );
}
