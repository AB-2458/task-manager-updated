/**
 * Empty State Components
 * 
 * Friendly empty states for tasks and notes
 */

import { CheckCircle2, FileText, Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
            {icon && (
                <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-surface-200 mb-1">{title}</h3>
            <p className="text-surface-500 max-w-sm mb-4">{description}</p>
            {action && (
                <Button onClick={action.onClick} leftIcon={<Plus className="w-4 h-4" />}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}

export function TasksEmptyState({ onAddTask }: { onAddTask?: () => void }) {
    return (
        <EmptyState
            icon={<CheckCircle2 className="w-8 h-8 text-surface-500" />}
            title="No tasks yet"
            description="Create your first task to get started organizing your work."
            action={onAddTask ? { label: 'Add Task', onClick: onAddTask } : undefined}
        />
    );
}

export function NotesEmptyState({ onAddNote }: { onAddNote?: () => void }) {
    return (
        <EmptyState
            icon={<FileText className="w-8 h-8 text-surface-500" />}
            title="No notes yet"
            description="Start writing notes to capture your ideas and thoughts."
            action={onAddNote ? { label: 'New Note', onClick: onAddNote } : undefined}
        />
    );
}

export function CompletedTasksEmptyState() {
    return (
        <div className="text-center py-6 text-surface-500 text-sm">
            <p>No completed tasks yet. Keep going! 💪</p>
        </div>
    );
}

export default EmptyState;
