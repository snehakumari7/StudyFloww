import { useState } from 'react';
import { Task } from '@/types';
import { Play, Clock, Calendar, ChevronRight, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthRequiredDialog } from '@/components/auth/AuthRequiredDialog';

interface CurrentTaskProps {
  task: Task | null;
  onStartTimer: () => void;
  onUpdateTask?: (task: Task) => void;
}

export function CurrentTask({ task, onStartTimer, onUpdateTask }: CurrentTaskProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const checkAuth = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return false;
    }
    return true;
  };

  if (!task) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 min-h-[400px] flex flex-col">
        <h3 className="font-semibold text-foreground mb-4">Current Task</h3>
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <p className="text-lg font-medium text-foreground mb-2">"Rest is not idleness."</p>
          <p className="text-muted-foreground mb-4">Take a break, you've earned it!</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
            Pick a task to start
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const progress = task.subtasks.length > 0
    ? (completedSubtasks / task.subtasks.length) * 100
    : 0;

  const handleToggleSubtask = (subtaskId: string) => {
    if (!onUpdateTask) return;

    // Optional: Enforce auth for completing subtasks?
    // if (!checkAuth()) return; 
    // Allowing it in demo mode seems friendlier.

    const updatedSubtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    // Calculate new status
    const completedCount = updatedSubtasks.filter(s => s.completed).length;
    let newStatus = task.status;

    if (updatedSubtasks.length > 0) {
      if (completedCount === updatedSubtasks.length) {
        newStatus = 'done';
      } else if (completedCount > 0) {
        newStatus = 'in-progress';
      } else {
        newStatus = 'todo';
      }
    }

    onUpdateTask({ ...task, subtasks: updatedSubtasks, status: newStatus });
  };

  const handleAddSubtask = () => {
    if (!onUpdateTask) return;
    // Enforce auth for adding new content
    if (!checkAuth()) return;

    if (newSubtaskTitle.trim()) {
      const newSubtask = {
        id: crypto.randomUUID(),
        title: newSubtaskTitle.trim(),
        completed: false
      };
      const updatedSubtasks = [...task.subtasks, newSubtask];
      onUpdateTask({ ...task, subtasks: updatedSubtasks, lastEditedAt: new Date() });
      setNewSubtaskTitle('');
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-6 min-h-[400px] flex flex-col">
        <h3 className="font-semibold text-foreground mb-4">Current Task</h3>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex-1 flex flex-col">
          <h4 className="font-medium text-foreground mb-2">{task.title}</h4>

          {task.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            {task.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            )}
            {task.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{Math.round(task.estimatedTime / 60)}h remaining</span>
              </div>
            )}
          </div>

          {task.subtasks.length > 0 && (
            <div className="mt-auto space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Subtasks</span>
                  <span className="text-foreground font-medium">{completedSubtasks}/{task.subtasks.length}</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>

              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-start gap-3 py-1"
                  >
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleToggleSubtask(subtask.id)}
                      className="mt-0.5 rounded-sm"
                      disabled={!onUpdateTask}
                    />
                    <span className={cn(
                      "text-sm leading-tight",
                      subtask.completed ? "line-through text-muted-foreground" : "text-foreground/90"
                    )}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Subtask Input */}
              {onUpdateTask && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a subtask..."
                    className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSubtask();
                      }
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleAddSubtask}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AuthRequiredDialog
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        message="Please sign in to add new subtasks."
      />
    </>
  );
}

