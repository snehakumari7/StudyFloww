import { WebLayout } from '@/components/layout/WebLayout';
import { ProgressOverview } from '@/components/dashboard/ProgressOverview';
import { CurrentTask } from '@/components/dashboard/CurrentTask';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import { TaskCard } from '@/components/tasks/TaskCard';
import { WeeklyStreak } from '@/components/dashboard/WeeklyStreak';
import { useNavigate } from 'react-router-dom';

import { useTasks } from '@/context/TaskContext';
import { useSessions } from '@/context/SessionContext';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { FocusTimer } from '@/components/timer/FocusTimer';
import { getNextFocusTask } from '@/lib/task-utils';

export default function Dashboard() {
  const { tasks, addTask, updateTask, deleteTask, addSubtask, taskSuggestions, setTaskSuggestions } = useTasks();
  const { sessions, totalMinutes, addSession } = useSessions();
  const { profileSettings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get user's display name
  const userName = profileSettings.full_name || user?.email?.split('@')[0] || 'User';

  // Logic: 
  // 1. If there's an in-progress task, show the most recently edited one.
  // 2. If no in-progress task, show the next 'todo' task with nearest deadline and highest priority.
  // 3. If no tasks, show null (will display quote).

  // Logic: 
  // 1. If there's an in-progress task, show the most recently edited one.
  // 2. If no in-progress task, show the next 'todo' task with nearest deadline and highest priority.
  // 3. If no tasks, show null (will display quote).
  const currentTask = getNextFocusTask(tasks);

  // Logic: Recent tasks should only show in-progress tasks (excluding the current one if desired, but user said "recent task should contain all tasks that are in progress")
  // User said: "recent task should contain all tasks that are in progress"
  // User also said: "only show the in progress tasks in the recent tasks section otherwise 'All Done !'"
  const recentTasks = tasks.filter(t => t.status === 'in-progress');

  return (
    <WebLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back <span className="font-bold text-foreground">{userName}</span>! Here's your study overview.
            </p>
          </div>
          <AddTaskDialog onAddTask={addTask} />
        </div>

        {/* Weekly Streak */}
        <div className="mb-6">
          <WeeklyStreak focusSessions={sessions} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Row - Bento Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-full">
              <CurrentTask task={currentTask} onStartTimer={() => navigate('/timer')} onUpdateTask={updateTask} />
            </div>
            <div className="h-full">
              <ProgressOverview tasks={tasks} totalStudyMinutes={totalMinutes} />
            </div>
            <div className="h-full">
              <FocusTimer onSessionComplete={(duration) => addSession(duration / 60)} />
            </div>
          </div>

          {/* Bottom Row: Recent Tasks */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Recent Tasks</h2>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all
              </button>
            </div>

            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map(task => (
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
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <p className="text-lg font-medium text-foreground">All Done !</p>
                <p className="text-muted-foreground">No tasks in progress.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </WebLayout>
  );
}
