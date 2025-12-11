import React, { useState, useRef, useEffect } from 'react';
import {
    Layout,
    List,
    Calendar,
    Clock,
    GitBranch,
    Layers,
    ChevronDown
} from 'lucide-react';

const ViewModeSelector = ({ currentMode, onModeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const modes = [
        { id: 'kanban', label: 'Kanban', icon: Layout },
        { id: 'list', label: 'Lista', icon: List },
        { id: 'calendar', label: 'Calendário', icon: Calendar },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'gantt', label: 'Gantt', icon: GitBranch },
        { id: 'swimlanes', label: 'Swimlanes', icon: Layers },
        // { id: 'hierarchy', label: 'Hierarquia', icon: Grid3x3 },
    ];

    const currentModeData = modes.find(m => m.id === currentMode) || modes[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                {React.createElement(currentModeData.icon, { size: 18, className: "text-primary" })}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    {currentModeData.label}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden py-1">
                    {modes.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => {
                                onModeChange(mode.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${currentMode === mode.id
                                    ? 'bg-primary-50 dark:bg-indigo-900/20 text-primary-600 dark:text-indigo-400'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {React.createElement(mode.icon, { size: 16 })}
                            {mode.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewModeSelector;
