import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Sparkles, Loader2, UserPlus, X } from 'lucide-react';
import { Task, AiSuggestion, Collaborator, Friend } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { generateTaskSuggestions } from '@/lib/gemini';
import { AuthRequiredDialog } from '@/components/auth/AuthRequiredDialog';

interface AddTaskDialogProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>, suggestions: AiSuggestion[]) => void;
  task?: Task; // Optional task for editing
  onUpdateTask?: (task: Task) => void; // For editing
  open?: boolean; // Controlled open state for edit mode
  onOpenChange?: (open: boolean) => void; // For controlled mode
  hideTrigger?: boolean;
}

// Mock friends data
const mockFriends: Friend[] = [
  { id: '1', name: 'Sarah Wilson', streak: 45, avatar: 'SW' },
  { id: '2', name: 'Mike Chen', streak: 12, avatar: 'MC' },
  { id: '3', name: 'Emma Davis', streak: 8, avatar: 'ED' },
  { id: '4', name: 'James Rod', streak: 0, avatar: 'JR' },
];

import { useToast } from '@/hooks/use-toast';

export function AddTaskDialog({ onAddTask, task, onUpdateTask, open: controlledOpen, onOpenChange, hideTrigger }: AddTaskDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEditMode = !!task;
  const [open, setOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const dialogOpen = isEditMode ? (controlledOpen ?? false) : open;
  const setDialogOpen = isEditMode ? (onOpenChange || (() => { })) : setOpen;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [deadline, setDeadline] = useState(task?.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'auto'>(task?.priority || 'medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [manualSubtasks, setManualSubtasks] = useState<string[]>(task?.subtasks.map(st => st.title) || []);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<AiSuggestion[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(task?.collaborators || []);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (task && dialogOpen && isEditMode) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
      setPriority(task.priority || 'medium');
      setManualSubtasks(task.subtasks.map(st => st.title));
      setCollaborators(task.collaborators || []);
      setGeneratedSuggestions([]);
    } else if (!dialogOpen && !isEditMode) {
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('medium');
      setManualSubtasks([]);
      setCollaborators([]);
      setGeneratedSuggestions([]);
    }
  }, [task, dialogOpen, isEditMode]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !user) {
      setShowAuthPrompt(true);
      setOpen(false);
    } else {
      setOpen(newOpen);
    }
  };

  const handleAddManualSubtask = () => {
    if (!newSubtask.trim()) return;
    setManualSubtasks([...manualSubtasks, newSubtask.trim()]);
    setNewSubtask('');
  };

  const handleGenerateSuggestions = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    try {
      const suggestions = await generateTaskSuggestions(title, description);
      setGeneratedSuggestions(suggestions);
    } catch (error: any) {
      console.error('Failed to generate suggestions:', error);
      toast({
        title: 'AI Error',
        description: error.message || 'Could not generate suggestions.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSuggestion = (suggestion: AiSuggestion) => {
    setManualSubtasks([...manualSubtasks, suggestion.title]);
    setGeneratedSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // Calculate estimated time from manual subtasks (mock logic: 30m per subtask if not specified)
    // In a real app, we'd sum up the times from the suggestions added
    const totalEstimatedTime = manualSubtasks.length * 30;

    // Determine priority
    let finalPriority: 'low' | 'medium' | 'high' = 'medium';
    if (priority === 'auto') {
      const lowerTitle = title.toLowerCase();

      // Simple keyword-based AI logic
      if (lowerTitle.includes('urgent') || lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('deadline')) {
        finalPriority = 'high';
      } else if (lowerTitle.includes('presentation') || lowerTitle.includes('project') || lowerTitle.includes('meeting')) {
        finalPriority = 'medium';
      } else {
        finalPriority = 'low';
      }

      // Check deadline proximity if available
      if (deadline) {
        const daysUntilDeadline = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysUntilDeadline <= 2) finalPriority = 'high';
        else if (daysUntilDeadline <= 7 && finalPriority !== 'high') finalPriority = 'medium';
      }
    } else {
      finalPriority = priority;
    }

    if (isEditMode && task && onUpdateTask) {
      // Edit mode - preserve subtask IDs and completion status
      const updatedSubtasks = manualSubtasks.map((st) => {
        // Try to find existing subtask by title to preserve ID and completion status
        const existing = task.subtasks.find(t => t.title === st);
        if (existing) {
          return existing; // Keep existing subtask with all its properties
        }
        // New subtask
        return {
          id: crypto.randomUUID(),
          title: st,
          completed: false
        };
      });

      const updatedTask: Task = {
        ...task,
        title,
        description,
        priority: finalPriority,
        deadline: deadline ? new Date(deadline) : undefined,
        estimatedTime: totalEstimatedTime,
        collaborators,
        subtasks: updatedSubtasks,
        lastEditedAt: new Date(),
      };
      onUpdateTask(updatedTask);
    } else {
      // Add mode
      const newTask: Omit<Task, 'id' | 'createdAt'> = {
        title,
        description,
        status: 'todo',
        priority: finalPriority,
        deadline: deadline ? new Date(deadline) : undefined,
        estimatedTime: totalEstimatedTime,
        collaborators,
        subtasks: manualSubtasks.map(st => ({
          id: crypto.randomUUID(),
          title: st,
          completed: false
        })),
      };
      onAddTask(newTask, generatedSuggestions);
    }

    setIsGenerating(false);
    setDialogOpen(false);
    if (!isEditMode) {
      setTitle('');
      setDescription('');
      setDeadline('');
      setManualSubtasks([]);
      setNewSubtask('');
      setPriority('medium');
      setGeneratedSuggestions([]);
      setCollaborators([]);
      setSelectedFriendId('');
    }
  };

  const handleAddCollaborator = () => {
    if (!selectedFriendId) return;
    const friend = mockFriends.find(f => f.id === selectedFriendId);
    if (friend && !collaborators.find(c => c.id === friend.id)) {
      setCollaborators([...collaborators, { ...friend, role: selectedRole }]);
      setSelectedFriendId('');
    }
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        {!hideTrigger && (
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <span>{isEditMode ? 'Edit Task' : 'Create New Task'}</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Write Research Paper on Climate Change"
              />
              <p className="text-xs text-muted-foreground">
                AI will suggest subtasks based on your task type
              </p>
              {generatedSuggestions.length === 0 && !isGenerating && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSuggestions}
                  disabled={!title.trim()}
                  className="mt-2 w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Suggestions
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="auto">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Let AI Decide
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {priority === 'auto' && (
                <p className="text-xs text-muted-foreground">
                  AI will set priority based on keywords and deadline.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Subtasks</Label>
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddManualSubtask();
                    }
                  }}
                />
                <Button type="button" size="icon" variant="outline" onClick={handleAddManualSubtask}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {manualSubtasks.length > 0 && (
                <div className="space-y-1 mt-2">
                  {manualSubtasks.map((st, index) => (
                    <div key={index} className="text-sm bg-muted/50 px-2 py-1 rounded flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {st}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Add subtasks manually or let AI generate them for you.
              </p>

              {/* Generated Suggestions List */}
              {generatedSuggestions.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">AI Suggestions (Click to add)</Label>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {generatedSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center justify-between p-2 rounded-md bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer"
                        onClick={() => handleAddSuggestion(suggestion)}
                      >
                        <span className="text-sm">{suggestion.title}</span>
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Collaborators Section */}
            <div className="space-y-2">
              <Label>Collaborators</Label>
              <div className="flex gap-2">
                <Select value={selectedFriendId} onValueChange={setSelectedFriendId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Add friend..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFriends.filter(f => !collaborators.find(c => c.id === f.id)).map(friend => (
                      <SelectItem key={friend.id} value={friend.id}>
                        {friend.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="button" size="icon" variant="outline" onClick={handleAddCollaborator} disabled={!selectedFriendId}>
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>

              {collaborators.length > 0 && (
                <div className="space-y-2 mt-2">
                  {collaborators.map(collaborator => (
                    <div key={collaborator.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[10px]">{collaborator.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{collaborator.name}</span>
                        <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
                          {collaborator.role}
                        </span>
                      </div>
                      <button onClick={() => removeCollaborator(collaborator.id)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 pt-2 flex justify-end gap-3 border-t mt-auto">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {isEditMode ? 'Update Task' : 'Create Task'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthRequiredDialog
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        message="Please sign in or create an account to add and manage tasks."
      />
    </>
  );
}

