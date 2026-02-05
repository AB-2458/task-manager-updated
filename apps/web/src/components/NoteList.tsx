import { useState } from 'react';
import { Note } from '../types';
import { Plus, Trash2, FileText, Edit3, X, Check } from 'lucide-react';

interface NoteListProps {
    notes: Note[];
    onCreateNote: (content: string) => void;
    onUpdateNote: (id: string, content: string) => void;
    onDeleteNote: (id: string) => void;
}

export function NoteList({ notes, onCreateNote, onUpdateNote, onDeleteNote }: NoteListProps) {
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNoteContent.trim()) {
            onCreateNote(newNoteContent.trim());
            setNewNoteContent('');
            setIsCreating(false);
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
                    <button onClick={() => setIsCreating(true)} className="btn-primary">
                        <Plus className="w-4 h-4" />
                        <span>New Note</span>
                    </button>
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
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreating(false);
                                setNewNoteContent('');
                            }}
                            className="btn-ghost"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={!newNoteContent.trim()}>
                            <Check className="w-4 h-4" />
                            Save Note
                        </button>
                    </div>
                </form>
            )}

            {/* Notes Grid */}
            {notes.length === 0 ? (
                <div className="text-center py-12 text-surface-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notes yet. Create your first note!</p>
                </div>
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

    const handleSave = () => {
        if (editContent.trim() && editContent !== note.content) {
            onUpdate(editContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(note.content);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="card p-4 animate-scale-in">
                <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input min-h-[100px] resize-none mb-3"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button onClick={handleCancel} className="btn-ghost btn text-sm px-3 py-1.5">
                        <X className="w-3 h-3" />
                        Cancel
                    </button>
                    <button onClick={handleSave} className="btn-primary btn text-sm px-3 py-1.5">
                        <Check className="w-3 h-3" />
                        Save
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card card-hover p-4 group">
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
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 rounded text-surface-500 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NoteList;
