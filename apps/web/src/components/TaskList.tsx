import { useState } from 'react';
import { Task } from '../types';
import { Plus, Check, Trash2, Circle, CheckCircle2 } from 'lucide-react';

interface TaskListProps {
    tasks: Task[];
    onCreateTask: (title: string) => void;
    onToggleTask: (id: string, completed: boolean) => void;
    onDeleteTask: (id: string) => void;
}

export function TaskList({ tasks, onCreateTask, onToggleTask, onDeleteTask }: TaskListProps) {
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            onCreateTask(newTaskTitle.trim());
            setNewTaskTitle('');
        }
    };

    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

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
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="input flex-1"
                />
                <button type="submit" className="btn-primary" disabled={!newTaskTitle.trim()}>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Task</span>
                </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2">
                {tasks.length === 0 ? (
                    <div className="text-center py-12 text-surface-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No tasks yet. Add your first task above!</p>
                    </div>
                ) : (
                    <>
                        {/* Pending Tasks */}
                        {pendingTasks.map((task) => (
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

    return (
        <div
            className={`
        group flex items-center gap-3 p-3 rounded-lg border transition-all duration-150
        ${task.completed
                    ? 'bg-surface-800/50 border-surface-700'
                    : 'bg-surface-800 border-surface-700 hover:border-surface-600 card-hover'
                }
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Checkbox */}
            <button
                onClick={onToggle}
                className={`
          flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
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

            {/* Title */}
            <span className={`
        flex-1 text-sm transition-colors
        ${task.completed ? 'text-surface-500 line-through' : 'text-surface-200'}
      `}>
                {task.title}
            </span>

            {/* Delete button */}
            <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

export default TaskList;
