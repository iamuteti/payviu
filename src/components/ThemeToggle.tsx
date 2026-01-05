
import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
    isDark: boolean;
    toggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => {
    return (
        <button
            onClick={toggle}
            className="p-2.5 glass rounded-xl text-gray-400 hover:text-sky-500 transition-all active:scale-90"
            aria-label="Toggle Theme"
        >
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-sky-600" />}
        </button>
    );
};

export default ThemeToggle;
