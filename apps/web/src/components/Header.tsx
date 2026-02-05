import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-30 bg-surface-900/80 backdrop-blur-sm border-b border-surface-700">
            <div className="flex items-center justify-between h-14 px-4">
                {/* Left - Menu button (mobile) */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Spacer for desktop */}
                <div className="hidden lg:block" />

                {/* Right - Theme toggle */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
