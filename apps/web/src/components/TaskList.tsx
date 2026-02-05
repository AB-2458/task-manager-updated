import { useState, useRef } from 'react';
import { Task, Priority } from '../types';
import { Button } from './Button';
import { TasksEmptyState } from './EmptyState';
import {
    Plus,
    Check,
    Trash2,
    Circle,
    Calendar,
    Flag,
    AlertCircle
} from 'lucide-react';

interface TaskListProps {
    tasks: Task[];
    onCreateTask: (title: string, dueDate?: string, priority?: Priority) => void;
    onToggleTask: (id: string, completed: boolean) => void;
    onDeleteTask: (id: string) => void;
}

// Priority configuration
const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
    low: { label: 'Low', color: 'text-surface-400', bgColor: 'bg-surface-700' },
    medium: { label: 'Medium', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    high: { label: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20' },
};

// Check if a task is overdue
function isOverdue(dueDate: string | null, completed: boolean): boolean {
    if (!dueDate || completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
}

// Format due date for display
function formatDueDate(dueDate: string | null): string {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskList({ tasks, onCreateTask, onToggleTask, onDeleteTask }: TaskListProps) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
    const [isCreating, setIsCreating] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            setIsCreating(true);
            await onCreateTask(
                newTaskTitle.trim(),
                newTaskDueDate || undefined,
                newTaskPriority
            );
            setNewTaskTitle('');
            setNewTaskDueDate('');
            setNewTaskPriority('medium');
            setShowOptions(false);
            setIsCreating(false);
            inputRef.current?.focus();
        }
    };

    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    // Sort pending tasks: overdue first, then by due date, then by priority
    const sortedPendingTasks = [...pendingTasks].sort((a, b) => {
        // Overdue tasks first
        const aOverdue = isOverdue(a.due_date, a.completed);
        const bOverdue = isOverdue(b.due_date, b.completed);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Then by due date (earlier dates first, null dates last)
        if (a.due_date && b.due_date) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date && !b.due_date) return -1;
        if (!a.due_date && b.due_date) return 1;

        // Then by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-100">Tasks</h1>
                <p className="text-surface-400 mt-1">
                    {pendingTasks.length} pending, {completedTasks.length} completed
                </p>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onFocus={() => setShowOptions(true)}
                        placeholder="Add a new task..."
                        className="input flex-1"
                        disabled={isCreating}
                    />
                    <Button
                        type="submit"
                        isLoading={isCreating}
                        loadingText="Adding..."
                        disabled={!newTaskTitle.trim()}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        <span className="hidden sm:inline">Add Task</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>

                {/* Optional fields */}
                {showOptions && (
                    <div className="flex flex-wrap gap-3 animate-fade-in">
                        {/* Due Date */}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-surface-500" />
                            <input
                                type="date"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                className="input py-1.5 px-2 text-sm w-auto"
                                disabled={isCreating}
                            />
                        </div>

                        {/* Priority */}
                        <div className="flex items-center gap-1.5">
                            <Flag className="w-4 h-4 text-surface-500" />
                            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setNewTaskPriority(p)}
                                    className={`
                    px-2.5 py-1 text-xs font-medium rounded-md transition-all
                    ${newTaskPriority === p
                                            ? `${priorityConfig[p].bgColor} ${priorityConfig[p].color}`
                                            : 'bg-surface-700 text-surface-400 hover:bg-surface-600'
                                        }
                  `}
                                >
                                    {priorityConfig[p].label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </form>

            {/* Tasks List */}
            <div className="space-y-2">
                {tasks.length === 0 ? (
                    <TasksEmptyState onAddTask={() => inputRef.current?.focus()} />
                ) : (
                    <>
                        {/* Pending Tasks */}
                        {sortedPendingTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={() => onToggleTask(task.id, true)}
                                onDelete={() => onDeleteTask(task.id)}
                            />
                        ))}

                        {/* Completed Tasks */}
                        {completedTasks.length > 0 && (
                            <div className="pt-4">
                                <h3 className="text-sm font-medium text-surface-500 mb-2">
                                    Completed ({completedTasks.length})
                                </h3>
                                {completedTasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={() => onToggleTask(task.id, false)}
                                        onDelete={() => onDeleteTask(task.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

interface TaskItemProps {
    task: Task;
    onToggle: () => void;
    onDelete: () => void;
}

function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete();
    };

    const overdue = isOverdue(task.due_date, task.completed);
    const priorityCfg = priorityConfig[task.priority];

    return (
        <div
            className={`
        group flex items-start gap-3 p-3 rounded-lg border transition-all duration-150
        ${task.completed
                    ? 'bg-surface-800/50 border-surface-700'
                    : overdue
                        ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50'
                        : 'bg-surface-800 border-surface-700 hover:border-surface-600 card-hover'
                }
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Checkbox */}
            <button
                onClick={onToggle}
                className={`
          flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
          transition-all duration-150
          ${task.completed
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-surface-500 hover:border-primary-500'
                    }
        `}
            >
                {task.completed ? (
                    <Check className="w-3 h-3" />
                ) : isHovered ? (
                    <Circle className="w-3 h-3 text-surface-500" />
                ) : null}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Title */}
                <span className={`
          block text-sm transition-colors
          ${task.completed ? 'text-surface-500 line-through' : 'text-surface-200'}
        `}>
                    {task.title}
                </span>

                {/* Meta info (due date + priority) */}
                {!task.completed && (task.due_date || task.priority !== 'medium') && (
                    <div className="flex items-center gap-2 mt-1.5">
                        {/* Due date */}
                        {task.due_date && (
                            <span className={`
                inline-flex items-center gap-1 text-xs
                ${overdue ? 'text-red-400' : 'text-surface-500'}
              `}>
                                {overdue && <AlertCircle className="w-3 h-3" />}
                                <Calendar className="w-3 h-3" />
                                {formatDueDate(task.due_date)}
                                {overdue && <span className="font-medium">Overdue</span>}
                            </span>
                        )}

                        {/* Priority indicator (only show for non-medium) */}
                        {task.priority !== 'medium' && (
                            <span className={`
                inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded
                ${priorityCfg.bgColor} ${priorityCfg.color}
              `}>
                                <Flag className="w-3 h-3" />
                                {priorityCfg.label}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Delete button */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

export default TaskList;
