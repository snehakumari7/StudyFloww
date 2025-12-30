import { Task } from "@/types";

/**
 * Determines the next task to focus on based on status, deadline, and priority.
 * 
 * Logic:
 * 1. If there's an in-progress task, return the most recently edited one.
 * 2. If no in-progress task, return the next 'todo' task with nearest deadline and highest priority.
 * 3. If no tasks, return null.
 */
export function getNextFocusTask(tasks: Task[]): Task | null {
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');

    if (inProgressTasks.length > 0) {
        return [...inProgressTasks].sort((a, b) => {
            const dateA = new Date(a.lastEditedAt || a.createdAt);
            const dateB = new Date(b.lastEditedAt || b.createdAt);
            return dateB.getTime() - dateA.getTime();
        })[0];
    } else {
        const todoTasks = tasks.filter(t => t.status === 'todo');
        if (todoTasks.length > 0) {
            return [...todoTasks].sort((a, b) => {
                // Sort by deadline (asc)
                const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_VALUE;
                const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_VALUE;

                if (deadlineA !== deadlineB) {
                    return deadlineA - deadlineB;
                }

                // Then by priority (desc: high > medium > low)
                const priorityMap = { high: 3, medium: 2, low: 1, undefined: 0 };
                const priorityA = priorityMap[a.priority || 'undefined'] || 0;
                const priorityB = priorityMap[b.priority || 'undefined'] || 0;

                return priorityB - priorityA;
            })[0];
        }
    }

    return null;
}
