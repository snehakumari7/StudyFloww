import { useState } from 'react';
import { WebLayout } from '@/components/layout/WebLayout';
import { TaskCard } from '@/components/tasks/TaskCard';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/context/TaskContext';

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, addSubtask, taskSuggestions, setTaskSuggestions } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <WebLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage your tasks with AI-powered breakdowns</p>
          </div>
          <AddTaskDialog onAddTask={addTask} />
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'todo', 'in-progress', 'done'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddSubtask={addSubtask}
                aiSuggestions={taskSuggestions[task.id]}
                onSuggestionsGenerated={(taskId, suggestions) => {
                  setTaskSuggestions(prev => ({ ...prev, [taskId]: suggestions }));
                }}
              />
            ))
          )}
        </div>
      </div>
    </WebLayout>
  );
}
