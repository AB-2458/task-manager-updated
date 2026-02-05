import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Task, Note, Priority } from '../types';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { TaskList } from '../components/TaskList';
import { NoteList } from '../components/NoteList';
import { TaskListSkeleton, NoteListSkeleton } from '../components/Skeleton';

type Tab = 'tasks' | 'notes';

export function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const [tasksRes, notesRes] = await Promise.all([
                api.get<Task[]>('/tasks'),
                api.get<Note[]>('/notes'),
            ]);

            if (tasksRes.data) setTasks(tasksRes.data);
            if (notesRes.data) setNotes(notesRes.data);
        } catch (err) {
            toast.error('Failed to load data. Please refresh the page.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Task handlers
    const handleCreateTask = async (title: string, dueDate?: string, priority?: Priority) => {
        try {
            const res = await api.post<Task>('/tasks', {
                title,
                due_date: dueDate || null,
                priority: priority || 'medium',
            });
            if (res.data) {
                setTasks(prev => [res.data!, ...prev]);
                toast.success('Task created');
            }
        } catch (err) {
            toast.error('Failed to create task');
            console.error('Failed to create task:', err);
        }
    };

    const handleToggleTask = async (id: string, completed: boolean) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));

        try {
            await api.patch(`/tasks/${id}`, { completed });
            if (completed) {
                toast.success('Task completed! 🎉');
            }
        } catch (err) {
            // Revert on error
            setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
            toast.error('Failed to update task');
            console.error('Failed to update task:', err);
        }
    };

    const handleDeleteTask = async (id: string) => {
        // Optimistic update
        const taskToDelete = tasks.find(t => t.id === id);
        setTasks(prev => prev.filter(t => t.id !== id));

        try {
            await api.delete(`/tasks/${id}`);
            toast.success('Task deleted');
        } catch (err) {
            // Revert on error
            if (taskToDelete) {
                setTasks(prev => [...prev, taskToDelete]);
            }
            toast.error('Failed to delete task');
            console.error('Failed to delete task:', err);
        }
    };

    // Note handlers
    const handleCreateNote = async (content: string) => {
        try {
            const res = await api.post<Note>('/notes', { content });
            if (res.data) {
                setNotes(prev => [res.data!, ...prev]);
                toast.success('Note created');
            }
        } catch (err) {
            toast.error('Failed to create note');
            console.error('Failed to create note:', err);
        }
    };

    const handleUpdateNote = async (id: string, content: string) => {
        // Optimistic update
        const originalNote = notes.find(n => n.id === id);
        setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));

        try {
            await api.patch(`/notes/${id}`, { content });
            toast.success('Note updated');
        } catch (err) {
            // Revert on error
            if (originalNote) {
                setNotes(prev => prev.map(n => n.id === id ? originalNote : n));
            }
            toast.error('Failed to update note');
            console.error('Failed to update note:', err);
        }
    };

    const handleDeleteNote = async (id: string) => {
        // Optimistic update
        const noteToDelete = notes.find(n => n.id === id);
        setNotes(prev => prev.filter(n => n.id !== id));

        try {
            await api.delete(`/notes/${id}`);
            toast.success('Note deleted');
        } catch (err) {
            // Revert on error
            if (noteToDelete) {
                setNotes(prev => [...prev, noteToDelete]);
            }
            toast.error('Failed to delete note');
            console.error('Failed to delete note:', err);
        }
    };

    const completedTasks = tasks.filter(t => t.completed).length;

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
                        {isLoading ? (
                            // Skeleton loading states
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <div className="h-8 w-32 bg-surface-700 rounded animate-pulse mb-2" />
                                    <div className="h-4 w-48 bg-surface-700 rounded animate-pulse" />
                                </div>
                                {activeTab === 'tasks' ? (
                                    <TaskListSkeleton count={5} />
                                ) : (
                                    <NoteListSkeleton count={4} />
                                )}
                            </div>
                        ) : activeTab === 'tasks' ? (
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
