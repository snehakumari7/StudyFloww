import { useState } from 'react';
import { WebLayout } from '@/components/layout/WebLayout';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import { Progress } from '@/components/ui/progress';
import { useTasks } from '@/context/TaskContext';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { LayoutGrid, ListTodo } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';

export default function KanbanPage() {
  const { tasks, addTask, updateTask, deleteTask, addSubtask, taskSuggestions, setTaskSuggestions } = useTasks();
  const [viewMode, setViewMode] = useState<'kanban' | 'matrix'>('kanban');

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <WebLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Task Overview</h1>
            <p className="text-muted-foreground mt-1">Manage your tasks with Kanban or Eisenhower Matrix</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="gap-2"
              >
                <ListTodo className="w-4 h-4" />
                Board
              </Button>
              <Button
                variant={viewMode === 'matrix' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('matrix')}
                className="gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Matrix
              </Button>
            </div>
            <AddTaskDialog onAddTask={addTask} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedTasks}/{totalTasks} tasks completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        {viewMode === 'kanban' ? (
          <KanbanBoard tasks={tasks} onUpdateTask={updateTask} />
        ) : (
          <EisenhowerMatrix
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onAddSubtask={addSubtask}
            taskSuggestions={taskSuggestions}
            onSuggestionsGenerated={(taskId, suggestions) => {
              setTaskSuggestions(prev => ({ ...prev, [taskId]: suggestions }));
            }}
          />
        )}
      </div>
    </WebLayout>
  );
}

function EisenhowerMatrix({ tasks, onUpdateTask, onDeleteTask, onAddSubtask, taskSuggestions, onSuggestionsGenerated }: {
  tasks: Task[],
  onUpdateTask: (t: Task) => void,
  onDeleteTask: (id: string) => void,
  onAddSubtask: (id: string, s: any) => void,
  taskSuggestions: Record<string, any[]>,
  onSuggestionsGenerated?: (taskId: string, suggestions: any[]) => void
}) {
  // Helper to categorize tasks
  const getQuadrant = (task: Task) => {
    if (task.status === 'done') return null; // Don't show completed tasks in matrix? Or maybe in a separate list?

    const isUrgent = task.deadline && new Date(task.deadline).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000; // < 48 hours
    const isImportant = task.priority === 'high';

    if (isUrgent && isImportant) return 'do-first';
    if (!isUrgent && isImportant) return 'schedule';
    if (isUrgent && !isImportant) return 'delegate';
    return 'delete';
  };

  const quadrants = {
    'do-first': { title: 'Do First', color: 'bg-red-500/10 text-red-600', desc: 'Urgent & Important' },
    'schedule': { title: 'Schedule', color: 'bg-blue-500/10 text-blue-600', desc: 'Not Urgent & Important' },
    'delegate': { title: 'Delegate', color: 'bg-yellow-500/10 text-yellow-600', desc: 'Urgent & Not Important' },
    'delete': { title: 'Don\'t Do', color: 'bg-gray-500/10 text-gray-600', desc: 'Not Urgent & Not Important' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
      {(Object.keys(quadrants) as Array<keyof typeof quadrants>).map(key => (
        <div key={key} className="bg-card border border-border rounded-xl p-4 flex flex-col">
          <div className={`flex items-center justify-between mb-4 p-3 rounded-lg ${quadrants[key].color}`}>
            <div>
              <h3 className="font-semibold">{quadrants[key].title}</h3>
              <p className="text-xs opacity-80">{quadrants[key].desc}</p>
            </div>
            <span className="text-lg font-bold">
              {tasks.filter(t => getQuadrant(t) === key).length}
            </span>
          </div>

          <div className="space-y-3">
            {tasks.filter(t => getQuadrant(t) === key).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onAddSubtask={onAddSubtask}
                aiSuggestions={taskSuggestions[task.id]}
                onSuggestionsGenerated={onSuggestionsGenerated}
              />
            ))}
            {tasks.filter(t => getQuadrant(t) === key).length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-lg">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
