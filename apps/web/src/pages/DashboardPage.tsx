import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Task, Note } from '../types';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { TaskList } from '../components/TaskList';
import { NoteList } from '../components/NoteList';
import { Loader2 } from 'lucide-react';

type Tab = 'tasks' | 'notes';

export function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [tasksRes, notesRes] = await Promise.all([
                api.get<Task[]>('/tasks'),
                api.get<Note[]>('/notes'),
            ]);

            if (tasksRes.data) setTasks(tasksRes.data);
            if (notesRes.data) setNotes(notesRes.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    // Task handlers
    const handleCreateTask = async (title: string) => {
        try {
            const res = await api.post<Task>('/tasks', { title });
            if (res.data) {
                setTasks(prev => [res.data!, ...prev]);
            }
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    const handleToggleTask = async (id: string, completed: boolean) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));

        try {
            await api.patch(`/tasks/${id}`, { completed });
        } catch (err) {
            // Revert on error
            setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
            console.error('Failed to update task:', err);
        }
    };

    const handleDeleteTask = async (id: string) => {
        // Optimistic update
        const taskToDelete = tasks.find(t => t.id === id);
        setTasks(prev => prev.filter(t => t.id !== id));

        try {
            await api.delete(`/tasks/${id}`);
        } catch (err) {
            // Revert on error
            if (taskToDelete) {
                setTasks(prev => [...prev, taskToDelete]);
            }
            console.error('Failed to delete task:', err);
        }
    };

    // Note handlers
    const handleCreateNote = async (content: string) => {
        try {
            const res = await api.post<Note>('/notes', { content });
            if (res.data) {
                setNotes(prev => [res.data!, ...prev]);
            }
        } catch (err) {
            console.error('Failed to create note:', err);
        }
    };

    const handleUpdateNote = async (id: string, content: string) => {
        // Optimistic update
        setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));

        try {
            await api.patch(`/notes/${id}`, { content });
        } catch (err) {
            // Revert would need original content - for simplicity, refetch
            fetchData();
            console.error('Failed to update note:', err);
        }
    };

    const handleDeleteNote = async (id: string) => {
        // Optimistic update
        const noteToDelete = notes.find(n => n.id === id);
        setNotes(prev => prev.filter(n => n.id !== id));

        try {
            await api.delete(`/notes/${id}`);
        } catch (err) {
            // Revert on error
            if (noteToDelete) {
                setNotes(prev => [...prev, noteToDelete]);
            }
            console.error('Failed to delete note:', err);
        }
    };

    const completedTasks = tasks.filter(t => t.completed).length;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-900 flex">
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                taskCount={tasks.length}
                noteCount={notes.length}
                completedTaskCount={completedTasks}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
                {/* Header */}
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Content */}
                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        {error && (
                            <div className="mb-6 p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                                {error}
                            </div>
                        )}

                        {activeTab === 'tasks' ? (
                            <TaskList
                                tasks={tasks}
                                onCreateTask={handleCreateTask}
                                onToggleTask={handleToggleTask}
                                onDeleteTask={handleDeleteTask}
                            />
                        ) : (
                            <NoteList
                                notes={notes}
                                onCreateNote={handleCreateNote}
                                onUpdateNote={handleUpdateNote}
                                onDeleteNote={handleDeleteNote}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DashboardPage;
