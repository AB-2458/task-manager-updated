import { useState, useRef } from 'react';
import { Task, Priority } from '../types';
import { TasksEmptyState } from './EmptyState';
import {
    Plus,
    Check,
    Trash2,
    Calendar,
    Flag,
    AlertTriangle,
    Loader2,
    ChevronDown
} from 'lucide-react';

interface TaskListProps {
    tasks: Task[];
    onCreateTask: (title: string, dueDate?: string, priority?: Priority) => void;
    onToggleTask: (id: string, completed: boolean) => void;
    onDeleteTask: (id: string) => void;
}

// Priority configuration with new color scheme
const priorityConfig: Record<Priority, {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    btnClass: string;
}> = {
    low: {
        label: 'Low',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/15',
        borderColor: 'border-blue-500/30',
        btnClass: 'priority-btn-low'
    },
    medium: {
        label: 'Medium',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/15',
        borderColor: 'border-amber-500/30',
        btnClass: 'priority-btn-medium'
    },
    high: {
        label: 'High',
        color: 'text-red-400',
        bgColor: 'bg-red-500/15',
        borderColor: 'border-red-500/30',
        btnClass: 'priority-btn-high'
    },
};

function isOverdue(dueDate: string | null, completed: boolean): boolean {
    if (!dueDate || completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
}

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
            await onCreateTask(newTaskTitle.trim(), newTaskDueDate || undefined, newTaskPriority);
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

    // Sort: overdue first, then by due date, then priority
    const sortedPendingTasks = [...pendingTasks].sort((a, b) => {
        const aOverdue = isOverdue(a.due_date, a.completed);
        const bOverdue = isOverdue(b.due_date, b.completed);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        if (a.due_date && b.due_date) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date && !b.due_date) return -1;
        if (!a.due_date && b.due_date) return 1;

        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                    Tasks
                    <span className="ml-3 text-lg font-normal text-slate-500">
                        {pendingTasks.length} pending
                    </span>
                </h1>
                <p className="text-slate-400">Manage and organize your tasks</p>
            </div>

            {/* Add Task Form */}
            <div className="glass-card rounded-2xl p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onFocus={() => setShowOptions(true)}
                            placeholder="What needs to be done?"
                            className="input-modern flex-1"
                            disabled={isCreating}
                        />
                        <button
                            type="submit"
                            disabled={!newTaskTitle.trim() || isCreating}
                            className="btn-gradient px-6"
                        >
                            {isCreating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    <span className="hidden sm:inline">Add Task</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Options */}
                    {showOptions && (
                        <div className="flex flex-wrap items-center gap-4 pt-2 animate-slide-down">
                            {/* Due Date */}
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <input
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                    className="input-modern py-2 px-3 text-sm w-auto"
                                    disabled={isCreating}
                                />
                            </div>

                            {/* Priority */}
                            <div className="flex items-center gap-2">
                                <Flag className="w-4 h-4 text-slate-500" />
                                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setNewTaskPriority(p)}
                                        className={`priority-btn ${priorityConfig[p].btnClass} ${newTaskPriority === p ? 'active' : ''}`}
                                    >
                                        {priorityConfig[p].label}
                                    </button>
                                ))}
                            </div>

                            {/* Collapse */}
                            <button
                                type="button"
                                onClick={() => setShowOptions(false)}
                                className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Task List */}
            {tasks.length === 0 ? (
                <TasksEmptyState onAddTask={() => inputRef.current?.focus()} />
            ) : (
                <div className="space-y-3">
                    {/* Pending Tasks */}
                    {sortedPendingTasks.map((task, index) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onToggle={() => onToggleTask(task.id, true)}
                            onDelete={() => onDeleteTask(task.id)}
                            style={{ animationDelay: `${index * 50}ms` }}
                        />
                    ))}

                    {/* Completed Section */}
                    {completedTasks.length > 0 && (
                        <div className="pt-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Completed ({completedTasks.length})
                            </h3>
                            <div className="space-y-2">
                                {completedTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onToggle={() => onToggleTask(task.id, false)}
                                        onDelete={() => onDeleteTask(task.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface TaskCardProps {
    task: Task;
    onToggle: () => void;
    onDelete: () => void;
    style?: React.CSSProperties;
}

function TaskCard({ task, onToggle, onDelete, style }: TaskCardProps) {
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
        group card-modern p-4 animate-slide-up
        ${task.completed ? 'opacity-60' : ''}
        ${overdue ? 'border-red-500/30 bg-red-500/5' : ''}
        ${isDeleting ? 'opacity-50 pointer-events-none scale-95' : ''}
      `}
            style={style}
        >
            <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                    onClick={onToggle}
                    className={`
            checkbox-modern mt-0.5
            ${task.completed ? 'checked' : ''}
          `}
                >
                    {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className={`
            text-base font-medium transition-colors
            ${task.completed ? 'text-slate-500 line-through' : 'text-white'}
          `}>
                        {task.title}
                    </p>

                    {/* Meta */}
                    {!task.completed && (task.due_date || task.priority !== 'medium') && (
                        <div className="flex items-center gap-3 mt-2">
                            {/* Due Date */}
                            {task.due_date && (
                                <span className={`
                  inline-flex items-center gap-1.5 text-xs font-medium
                  ${overdue ? 'text-red-400' : 'text-slate-400'}
                `}>
                                    {overdue ? (
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                    ) : (
                                        <Calendar className="w-3.5 h-3.5" />
                                    )}
                                    {formatDueDate(task.due_date)}
                                    {overdue && <span className="text-red-400">• Overdue</span>}
                                </span>
                            )}

                            {/* Priority Badge */}
                            {task.priority !== 'medium' && (
                                <span className={`
                  inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md
                  ${priorityCfg.bgColor} ${priorityCfg.color} border ${priorityCfg.borderColor}
                `}>
                                    <Flag className="w-3 h-3" />
                                    {priorityCfg.label}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Delete */}
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
}

export default TaskList;
