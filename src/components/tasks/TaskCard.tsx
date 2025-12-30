import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, SubTask, AiSuggestion } from '@/types';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Sparkles,
  Clock,
  Calendar,
  MoreHorizontal,
  Trash2,
  Pencil,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { AddTaskDialog } from './AddTaskDialog';
import { AuthRequiredDialog } from '@/components/auth/AuthRequiredDialog';
import { generateTaskSuggestions } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddSubtask: (taskId: string, subtask: SubTask) => void;
  aiSuggestions?: AiSuggestion[];
  onSuggestionsGenerated?: (taskId: string, suggestions: AiSuggestion[]) => void;
}

export function TaskCard({ task, onUpdateTask, onDeleteTask, onAddSubtask, aiSuggestions = [], onSuggestionsGenerated }: TaskCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const progress = task.subtasks.length > 0
    ? (completedSubtasks / task.subtasks.length) * 100
    : 0;

  const handleToggleSubtask = (subtaskId: string) => {
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
    if (!newSubtask.trim()) return;
    const subtask: SubTask = {
      id: crypto.randomUUID(),
      title: newSubtask,
      completed: false,
    };
    onAddSubtask(task.id, subtask);
    setNewSubtask('');
  };

  const handleAddSuggestion = (suggestion: AiSuggestion) => {
    const subtask: SubTask = {
      id: crypto.randomUUID(),
      title: suggestion.title,
      completed: false,
      isAiSuggested: true,
      estimatedTime: suggestion.estimatedTime,
    };
    onAddSubtask(task.id, subtask);
  };

  const handleGenerateSuggestions = async () => {
    if (!task.title.trim()) return;
    setIsGeneratingSuggestions(true);
    try {
      const suggestions = await generateTaskSuggestions(task.title, task.description);
      if (onSuggestionsGenerated) {
        onSuggestionsGenerated(task.id, suggestions);
      }
      setShowSuggestions(true);
      toast({
        title: 'AI Suggestions Generated',
        description: `Generated ${suggestions.length} subtask suggestions.`,
      });
    } catch (error: any) {
      console.error('Failed to generate suggestions:', error);
      toast({
        title: 'AI Error',
        description: error.message || 'Could not generate suggestions.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleDeleteClick = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteTask) {
      onDeleteTask(task.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg hover-lift transition-all duration-200">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 p-0.5 rounded hover:bg-surface-hover transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-base text-foreground truncate">{task.title}</h3>
              {/* Compact Progress (visible when collapsed) */}
              {!expanded && task.subtasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {completedSubtasks}/{task.subtasks.length}
                  </span>
                  <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {expanded && task.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2">
              {task.deadline && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
              )}
              {task.estimatedTime && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.round(task.estimatedTime / 60)}h</span>
                </div>
              )}

              {/* Priority Badge */}
              {task.priority && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    task.priority === 'low' && "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
                    task.priority === 'medium' && "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
                    task.priority === 'high' && "bg-red-500/10 text-red-600 hover:bg-red-500/20",
                  )}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
              )}

              {/* Status Badge (if needed, or rely on column/matrix) */}
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 border-transparent bg-secondary/50",
                )}
              >
                {task.status === 'in-progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'To Do'}
              </Badge>

              {/* Collaborators */}
              {task.collaborators && task.collaborators.length > 0 && (
                <div className="flex -space-x-2 ml-auto">
                  {task.collaborators.map((collaborator, i) => (
                    <Avatar key={i} className="w-5 h-5 border-2 border-background">
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                        {collaborator.avatar}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded hover:bg-surface-hover transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  if (!user) {
                    setShowAuthPrompt(true);
                    return;
                  }
                  setShowEditDialog(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Detailed Progress bar - Only show when expanded */}
        {expanded && task.subtasks.length > 0 && (
          <div className="mt-4 ml-7">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span>{completedSubtasks}/{task.subtasks.length} subtasks</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 ml-7">
          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="space-y-2 mb-3">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 py-1.5"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => handleToggleSubtask(subtask.id)}
                    className="rounded-sm"
                  />
                  <span className={cn(
                    "text-sm flex-1",
                    subtask.completed && "line-through text-muted-foreground"
                  )}>
                    {subtask.title}
                  </span>
                  {subtask.isAiSuggested && (
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  )}
                  {subtask.estimatedTime && (
                    <span className="text-xs text-muted-foreground">
                      {subtask.estimatedTime}m
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add subtask input */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Add a subtask..."
              className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
            />

          </div>

          {/* AI Suggestions */}
          <div>
            {aiSuggestions.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showSuggestions ? 'Hide' : 'Show'} AI suggestions</span>
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleGenerateSuggestions}
                    disabled={isGeneratingSuggestions}
                    className="h-6 text-xs"
                  >
                    {isGeneratingSuggestions ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-1" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>

                {showSuggestions && (
                  <div className="mt-2 space-y-1.5 fade-in">
                    {aiSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/10"
                      >
                        <span className="flex-1 text-sm text-foreground/80">
                          {suggestion.title}
                        </span>
                        {suggestion.estimatedTime && (
                          <span className="text-xs text-muted-foreground">
                            ~{suggestion.estimatedTime}m
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddSuggestion(suggestion)}
                          className="h-6 w-6 p-0 hover:bg-primary/10"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateSuggestions}
                disabled={isGeneratingSuggestions}
                className="w-full text-xs"
              >
                {isGeneratingSuggestions ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating AI suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generate AI Suggestions
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Auth Prompt Dialog */}
      <AuthRequiredDialog
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        message="Please sign in to delete tasks."
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 py-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <AddTaskDialog
        task={showEditDialog ? task : undefined}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        hideTrigger={true}
        onUpdateTask={(updatedTask) => {
          onUpdateTask(updatedTask);
          setShowEditDialog(false);
        }}
        onAddTask={() => { }} // Not used in edit mode
      />
    </div>
  );
}
