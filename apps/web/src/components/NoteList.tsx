import { useState } from 'react';
import { Note } from '../types';
import { NotesEmptyState } from './EmptyState';
import {
    Plus,
    Trash2,
    Edit3,
    X,
    Check,
    Loader2,
    FileText
} from 'lucide-react';

interface NoteListProps {
    notes: Note[];
    onCreateNote: (content: string) => void;
    onUpdateNote: (id: string, content: string) => void;
    onDeleteNote: (id: string) => void;
}

export function NoteList({ notes, onCreateNote, onUpdateNote, onDeleteNote }: NoteListProps) {
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newNoteContent.trim()) {
            setIsSubmitting(true);
            await onCreateNote(newNoteContent.trim());
            setNewNoteContent('');
            setIsCreating(false);
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Notes
                        <span className="ml-3 text-lg font-normal text-slate-500">
                            {notes.length} total
                        </span>
                    </h1>
                    <p className="text-slate-400">Capture your thoughts and ideas</p>
                </div>

                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-gradient"
                    >
                        <Plus className="w-5 h-5" />
                        New Note
                    </button>
                )}
            </div>

            {/* Create Note Form */}
            {isCreating && (
                <div className="glass-card rounded-2xl p-5 animate-scale-in">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-white">New Note</span>
                        </div>

                        <textarea
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            placeholder="Start writing your note..."
                            className="input-modern min-h-[140px] resize-none"
                            autoFocus
                            disabled={isSubmitting}
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setIsCreating(false); setNewNoteContent(''); }}
                                disabled={isSubmitting}
                                className="btn-ghost"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!newNoteContent.trim() || isSubmitting}
                                className="btn-gradient"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Save Note
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notes Grid */}
            {notes.length === 0 && !isCreating ? (
                <NotesEmptyState onAddNote={() => setIsCreating(true)} />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {notes.map((note, index) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onUpdate={(content) => onUpdateNote(note.id, content)}
                            onDelete={() => onDeleteNote(note.id)}
                            formatDate={formatDate}
                            style={{ animationDelay: `${index * 50}ms` }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface NoteCardProps {
    note: Note;
    onUpdate: (content: string) => void;
    onDelete: () => void;
    formatDate: (date: string) => string;
    style?: React.CSSProperties;
}

function NoteCard({ note, onUpdate, onDelete, formatDate, style }: NoteCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(note.content);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = async () => {
        if (editContent.trim() && editContent !== note.content) {
            setIsSaving(true);
            await onUpdate(editContent.trim());
            setIsSaving(false);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(note.content);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete();
    };

    // Get a subtle gradient based on note id
    const gradients = [
        'from-violet-500/10 to-purple-500/5',
        'from-blue-500/10 to-cyan-500/5',
        'from-emerald-500/10 to-teal-500/5',
        'from-amber-500/10 to-orange-500/5',
        'from-pink-500/10 to-rose-500/5',
    ];
    const gradientIndex = note.id.charCodeAt(0) % gradients.length;

    if (isEditing) {
        return (
            <div className="glass-card rounded-2xl p-5 animate-scale-in" style={style}>
                <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input-modern min-h-[120px] resize-none mb-4"
                    autoFocus
                    disabled={isSaving}
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="btn-ghost text-sm"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-gradient text-sm"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`
        group card-modern p-5 animate-slide-up bg-gradient-to-br ${gradients[gradientIndex]}
        ${isDeleting ? 'opacity-50 pointer-events-none scale-95' : ''}
      `}
            style={style}
        >
            {/* Content */}
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap line-clamp-6 mb-4">
                {note.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <span className="text-xs text-slate-500">
                    {formatDate(note.created_at)}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NoteList;
