import { CheckCircle2, FileText, Plus } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
            {icon && (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center mb-6 border border-slate-600/30">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-400 max-w-sm mb-6">{description}</p>
            {action && (
                <button onClick={action.onClick} className="btn-gradient">
                    <Plus className="w-5 h-5" />
                    {action.label}
                </button>
            )}
        </div>
    );
}

export function TasksEmptyState({ onAddTask }: { onAddTask?: () => void }) {
    return (
        <EmptyState
            icon={<CheckCircle2 className="w-10 h-10 text-indigo-400" />}
            title="No tasks yet"
            description="Create your first task to start organizing your work and boost your productivity."
            action={onAddTask ? { label: 'Add Task', onClick: onAddTask } : undefined}
        />
    );
}

export function NotesEmptyState({ onAddNote }: { onAddNote?: () => void }) {
    return (
        <EmptyState
            icon={<FileText className="w-10 h-10 text-purple-400" />}
            title="No notes yet"
            description="Start capturing your ideas, thoughts, and important information."
            action={onAddNote ? { label: 'New Note', onClick: onAddNote } : undefined}
        />
    );
}

export default EmptyState;
