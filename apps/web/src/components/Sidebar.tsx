import { Link } from 'react-router-dom';
import {
    CheckSquare,
    FileText,
    X,
    LayoutDashboard,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    activeTab: 'tasks' | 'notes';
    onTabChange: (tab: 'tasks' | 'notes') => void;
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
    const { signOut, user } = useAuth();

    const handleSignOut = async () => {
        await signOut();
    };

    const navItems = [
        {
            id: 'tasks' as const,
            label: 'Tasks',
            icon: CheckSquare,
            count: taskCount,
            subtext: `${completedTaskCount} completed`,
        },
        {
            id: 'notes' as const,
            label: 'Notes',
            icon: FileText,
            count: noteCount,
        },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-surface-800 border-r border-surface-700
          transform transition-transform duration-200 ease-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-surface-700">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                                <LayoutDashboard className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-surface-100">Task Manager</span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 rounded hover:bg-surface-700 text-surface-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onTabChange(item.id);
                                        onClose();
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-all duration-150
                    ${isActive
                                            ? 'bg-primary-600/20 text-primary-400'
                                            : 'text-surface-300 hover:bg-surface-700 hover:text-surface-100'
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{item.label}</span>
                                            <span className={`
                        text-xs px-1.5 py-0.5 rounded
                        ${isActive ? 'bg-primary-600/30' : 'bg-surface-700'}
                      `}>
                                                {item.count}
                                            </span>
                                        </div>
                                        {item.subtext && (
                                            <p className="text-xs text-surface-500 mt-0.5">{item.subtext}</p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-3 border-t border-surface-700">
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-surface-200 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Sign out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
