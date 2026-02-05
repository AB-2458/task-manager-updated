import { useState } from 'react';
import { Note } from '../types';
import { Button } from './Button';
import { NotesEmptyState } from './EmptyState';
import { Plus, Trash2, Edit3, X, Check, Loader2 } from 'lucide-react';

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-100">Notes</h1>
                    <p className="text-surface-400 mt-1">{notes.length} notes</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)} leftIcon={<Plus className="w-4 h-4" />}>
                        New Note
                    </Button>
                )}
            </div>

            {/* Create Note Form */}
            {isCreating && (
                <form onSubmit={handleSubmit} className="card p-4 animate-scale-in">
                    <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Write your note..."
                        className="input min-h-[120px] resize-none mb-3"
                        autoFocus
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setIsCreating(false);
                                setNewNoteContent('');
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            loadingText="Saving..."
                            disabled={!newNoteContent.trim()}
                            leftIcon={<Check className="w-4 h-4" />}
                        >
                            Save Note
                        </Button>
                    </div>
                </form>
            )}

            {/* Notes Grid */}
            {notes.length === 0 && !isCreating ? (
                <NotesEmptyState onAddNote={() => setIsCreating(true)} />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onUpdate={(content) => onUpdateNote(note.id, content)}
                            onDelete={() => onDeleteNote(note.id)}
                            formatDate={formatDate}
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
}

function NoteCard({ note, onUpdate, onDelete, formatDate }: NoteCardProps) {
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

    if (isEditing) {
        return (
            <div className="card p-4 animate-scale-in">
                <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input min-h-[100px] resize-none mb-3"
                    autoFocus
                    disabled={isSaving}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
                        <X className="w-3 h-3" />
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        isLoading={isSaving}
                        loadingText="Saving..."
                        leftIcon={<Check className="w-3 h-3" />}
                    >
                        Save
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`card card-hover p-4 group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Content */}
            <p className="text-surface-200 text-sm whitespace-pre-wrap line-clamp-6 mb-3">
                {note.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-surface-700">
                <span className="text-xs text-surface-500">
                    {formatDate(note.created_at)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-surface-500" />
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 rounded text-surface-500 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-1.5 rounded text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NoteList;
