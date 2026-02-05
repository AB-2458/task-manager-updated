import { Menu, Bell, Search } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 px-4 lg:px-8 py-4">
            <div className="glass-subtle rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
                {/* Left: Menu + Search */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 w-64">
                        <Search className="w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
                        />
                        <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-700 rounded">⌘K</kbd>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full" />
                    </button>

                    {/* Date */}
                    <div className="hidden md:block px-4 py-2 rounded-xl bg-slate-800/30 text-sm text-slate-400">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
