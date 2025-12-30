import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, SubTask, AiSuggestion } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt'>, suggestions?: AiSuggestion[]) => void;
    updateTask: (task: Task) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addSubtask: (taskId: string, subtask: SubTask) => Promise<void>;
    taskSuggestions: Record<string, AiSuggestion[]>;
    setTaskSuggestions: React.Dispatch<React.SetStateAction<Record<string, AiSuggestion[]>>>;
    loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Initial sample data for demo mode
const initialTasks: Task[] = [
    {
        id: '1',
        title: 'Write Research Paper on Climate Change',
        description: 'A comprehensive analysis of climate change effects on coastal ecosystems',
        status: 'in-progress',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimatedTime: 480,
        subtasks: [
            { id: 's1', title: 'Choose and narrow down research topic', completed: true },
            { id: 's2', title: 'Conduct preliminary research', completed: true, isAiSuggested: true },
            { id: 's3', title: 'Create an outline', completed: false, isAiSuggested: true },
            { id: 's4', title: 'Write introduction', completed: false },
        ],
        createdAt: new Date(),
        lastEditedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        priority: 'high',
    },
    // ... (Keep other samples if needed, or reduce for brevity in rewrite)
];

const sampleSuggestions: Record<string, AiSuggestion[]> = {
    '1': [
        { id: 'a1', title: 'Draft body paragraphs with evidence', estimatedTime: 120 },
    ],
};

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskSuggestions, setTaskSuggestions] = useState<Record<string, AiSuggestion[]>>({});
    const [loading, setLoading] = useState(true);
    const [previousUserId, setPreviousUserId] = useState<string | null>(null);

    // Load tasks from database 
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (authLoading) return;

            if (user) {
                if (previousUserId !== user.id) {
                    setLoading(true);
                    await fetchTasks();
                    if (mounted) setPreviousUserId(user.id);
                    if (mounted) setLoading(false);
                }
            } else {
                // Demo mode or logout
                if (mounted) {
                    setTasks(initialTasks);
                    setTaskSuggestions(sampleSuggestions);
                    setPreviousUserId(null);
                    setLoading(false);
                }
            }
        };

        load();

        return () => { mounted = false; };
    }, [user, authLoading, previousUserId]);

    const fetchTasks = async () => {
        if (!user) return;
        try {
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (tasksError) throw tasksError;

            if (tasksData && tasksData.length > 0) {
                const tasksWithSubtasks = await Promise.all(
                    tasksData.map(async (task) => {
                        const { data: subtasksData } = await supabase
                            .from('subtasks')
                            .select('*')
                            .eq('task_id', task.id)
                            .order('created_at', { ascending: true });

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const taskData = task as any;
                        return {
                            id: task.id,
                            title: task.title,
                            description: task.description || undefined,
                            status: task.status as 'todo' | 'in-progress' | 'done',
                            deadline: task.deadline ? new Date(task.deadline) : undefined,
                            estimatedTime: task.estimated_minutes,
                            priority: taskData.priority as 'low' | 'medium' | 'high' | undefined,
                            subtasks: (subtasksData || []).map(st => ({
                                id: st.id,
                                title: st.title,
                                completed: st.completed,
                                isAiSuggested: st.is_ai_suggested || false,
                                estimatedTime: st.estimated_minutes,
                            })),
                            createdAt: new Date(task.created_at),
                            lastEditedAt: task.updated_at ? new Date(task.updated_at) : undefined,
                            collaborators: [], // Future: Add collaborators
                        } as Task;
                    })
                );
                setTasks(tasksWithSubtasks);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // On error, don't clear tasks if we have them, just show toast
            if (tasks.length === 0) setTasks([]);
            toast({
                title: "Error loading tasks",
                description: "Failed to load your tasks. Please refresh.",
                variant: "destructive",
            });
        }
    };

    const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>, suggestions: AiSuggestion[] = []) => {
        const newTask: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            lastEditedAt: new Date(),
        };

        // Optimistic update
        setTasks(prev => [newTask, ...prev]);
        if (suggestions.length > 0) {
            setTaskSuggestions(prev => ({ ...prev, [newTask.id]: suggestions }));
        }

        if (user) {
            try {
                const { error: taskError } = await supabase
                    .from('tasks')
                    .insert({
                        id: newTask.id,
                        user_id: user.id,
                        title: newTask.title,
                        description: newTask.description || null,
                        status: newTask.status,
                        deadline: newTask.deadline?.toISOString() || null,
                        estimated_minutes: newTask.estimatedTime || null,
                        priority: newTask.priority || null,
                    });

                if (taskError) {
                    // Revert on error
                    setTasks(prev => prev.filter(t => t.id !== newTask.id));
                    throw taskError;
                }

                if (newTask.subtasks.length > 0) {
                    const { error: subtasksError } = await supabase
                        .from('subtasks')
                        .insert(
                            newTask.subtasks.map(st => ({
                                id: st.id,
                                task_id: newTask.id,
                                title: st.title,
                                completed: st.completed,
                                is_ai_suggested: st.isAiSuggested || false,
                                estimated_minutes: st.estimatedTime || null,
                            }))
                        );
                    if (subtasksError) throw subtasksError;
                }
            } catch (error) {
                console.error('Error saving task:', error);
                toast({
                    title: "Error saving task",
                    description: "Your changes were not saved.",
                    variant: "destructive",
                });
            }
        }
    };

    const updateTask = async (updatedTask: Task) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...updatedTask, lastEditedAt: new Date() } : t));

        if (user) {
            try {
                const { error: taskError } = await supabase
                    .from('tasks')
                    .update({
                        title: updatedTask.title,
                        description: updatedTask.description || null,
                        status: updatedTask.status,
                        deadline: updatedTask.deadline?.toISOString() || null,
                        estimated_minutes: updatedTask.estimatedTime || null,
                        priority: updatedTask.priority || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', updatedTask.id)
                    .eq('user_id', user.id);

                if (taskError) throw taskError;

                // Sync subtasks (Naive: Delete all and Insert)
                // This handles adds, removes, and updates of subtasks
                const { error: deleteError } = await supabase
                    .from('subtasks')
                    .delete()
                    .eq('task_id', updatedTask.id);

                if (deleteError) throw deleteError;

                if (updatedTask.subtasks.length > 0) {
                    const { error: insertError } = await supabase
                        .from('subtasks')
                        .insert(
                            updatedTask.subtasks.map(st => ({
                                id: st.id,
                                task_id: updatedTask.id,
                                title: st.title,
                                completed: st.completed,
                                is_ai_suggested: st.isAiSuggested || false,
                                estimated_minutes: st.estimatedTime || null,
                            }))
                        );
                    if (insertError) throw insertError;
                }
            } catch (error) {
                console.error('Error updating task:', error);
                toast({ title: "Update failed", description: "Changes not saved to cloud.", variant: "destructive" });
                // Note: Reverting optimistic update is complex here without previous state, 
                // in a real app we might refetch or use React Query mutations.
            }
        }
    };

    const deleteTask = async (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));

        if (user) {
            try {
                const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', user.id);
                if (error) throw error;
            } catch (error) {
                console.error('Delete failed:', error);
                toast({ title: "Delete failed", variant: "destructive" });
                // Might need to re-fetch to restore
                fetchTasks();
            }
        }
    };

    const addSubtask = async (taskId: string, subtask: SubTask) => {
        // We defer to updateTask to ensure consistency (single source of truth for DB logic)
        // But we DO NOT locally update state twice.
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            // Create a new task object
            const updatedTask = {
                ...task,
                subtasks: [...task.subtasks, subtask]
            };
            // Call updateTask which handles both optimistic UI and DB sync
            await updateTask(updatedTask);

            // Remove from suggestions if present
            setTaskSuggestions(prev => ({
                ...prev,
                [taskId]: prev[taskId]?.filter(s => s.title !== subtask.title) || []
            }));
        }
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, addSubtask, taskSuggestions, setTaskSuggestions, loading }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
