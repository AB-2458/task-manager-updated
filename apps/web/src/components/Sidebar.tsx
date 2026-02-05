import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    CheckSquare,
    FileText,
    LogOut,
    X,
    Moon,
    Sun,
    Sparkles,
    TrendingUp
} from 'lucide-react';

type Tab = 'tasks' | 'notes';

interface SidebarProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    isOpen: boolean;
    onClose: () => void;
    taskCount: number;
    noteCount: number;
    completedTaskCount: number;
}

export function Sidebar({
    activeTab,
    onTabChange,
    isOpen,
    onClose,
    taskCount,
    noteCount,
    completedTaskCount,
}: SidebarProps) {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const completionRate = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-72 z-50 sidebar-modern
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
                <div className="flex flex-col h-full p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">TaskFlow</h1>
                                <p className="text-xs text-slate-500">Organize your life</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress Card */}
                    <div className="glass-subtle rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Progress</p>
                                <p className="text-xs text-slate-400">{completedTaskCount} of {taskCount} tasks</p>
                            </div>
                        </div>
                        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                        <p className="text-right text-xs text-emerald-400 mt-1 font-medium">{completionRate}%</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        <button
                            onClick={() => { onTabChange('tasks'); onClose(); }}
                            className={`sidebar-item w-full ${activeTab === 'tasks' ? 'active' : ''}`}
                        >
                            <CheckSquare className="w-5 h-5" />
                            <span className="flex-1 text-left">Tasks</span>
                            <span className={`
                px-2 py-0.5 text-xs font-medium rounded-full
                ${activeTab === 'tasks'
                                    ? 'bg-indigo-500/30 text-indigo-300'
                                    : 'bg-slate-700 text-slate-400'}
              `}>
                                {taskCount}
                            </span>
                        </button>

                        <button
                            onClick={() => { onTabChange('notes'); onClose(); }}
                            className={`sidebar-item w-full ${activeTab === 'notes' ? 'active' : ''}`}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="flex-1 text-left">Notes</span>
                            <span className={`
                px-2 py-0.5 text-xs font-medium rounded-full
                ${activeTab === 'notes'
                                    ? 'bg-indigo-500/30 text-indigo-300'
                                    : 'bg-slate-700 text-slate-400'}
              `}>
                                {noteCount}
                            </span>
                        </button>
                    </nav>

                    {/* Footer */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="sidebar-item w-full"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="w-5 h-5 text-amber-400" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-5 h-5 text-indigo-400" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>

                        {/* User Info */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{user?.email}</p>
                                <p className="text-xs text-slate-500">Free Plan</p>
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={signOut}
                            className="sidebar-item w-full text-red-400 hover:bg-red-500/10"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
