import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const themes = [
    { id: 'light', name: 'Claro' },
    { id: 'dark', name: 'Escuro' },
    { id: 'gruvbox', name: 'Gruvbox' },
    { id: 'nord', name: 'Nord' },
    { id: 'rose-pine', name: 'Rosé Pine' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'catppuccin', name: 'Catppuccin' },
    { id: 'solarized', name: 'Solarized' },
    { id: 'tokyo-night', name: 'Tokyo Night' },
    { id: 'synthwave', name: 'Synthwave 84' },
];

const ThemeToggle = ({ className = '' }) => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentThemeName = themes.find(t => t.id === theme)?.name || 'Tema';

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors border border-transparent hover:border-border"
            >
                <Palette size={18} />
                <span className="hidden md:inline">{currentThemeName}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-surface rounded-xl shadow-xl border border-border py-1 z-50 animate-fade-in-down">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTheme(t.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-surface-hover transition-colors
                                ${theme === t.id ? 'text-primary font-medium' : 'text-text-secondary'}
                            `}
                        >
                            <span>{t.name}</span>
                            {theme === t.id && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;
