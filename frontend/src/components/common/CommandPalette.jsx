import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Search,
    X,
    Folder,
    Layout,
    CreditCard,
    FileText,
    ArrowRight,
    Command,
    Clock,
} from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';

/**
 * Command Palette Component
 * Global search triggered by Cmd+K / Ctrl+K
 * 
 * @module components/common/CommandPalette
 */
const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);
    const { navigateTo, setActiveProjectId, setActiveBoardId } = useNavigation();
    const { projects } = useApp();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved).slice(0, 5));
        }
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Get all searchable items
    const getAllItems = useCallback(() => {
        const items = [];

        // Add projects
        projects.forEach(project => {
            items.push({
                type: 'project',
                id: project.id,
                title: project.name,
                subtitle: project.description || 'Projeto',
                icon: Folder,
                action: () => {
                    setActiveProjectId(project.id);
                    navigateTo('projects');
                },
            });

            // Add boards from each project
            if (project.boards) {
                project.boards.forEach(board => {
                    items.push({
                        type: 'board',
                        id: board.id,
                        title: board.name,
                        subtitle: `Board em ${project.name}`,
                        icon: Layout,
                        action: () => {
                            setActiveProjectId(project.id);
                            setActiveBoardId(board.id);
                            navigateTo('kanban');
                        },
                    });
                });
            }
        });

        // Add quick navigation
        items.push(
            { type: 'nav', id: 'dashboard', title: 'Dashboard', subtitle: 'Ir para Dashboard', icon: Layout, action: () => navigateTo('dashboard') },
            { type: 'nav', id: 'projects', title: 'Projetos', subtitle: 'Ver todos os projetos', icon: Folder, action: () => navigateTo('projects') },
            { type: 'nav', id: 'kanban', title: 'Kanban', subtitle: 'Abrir Kanban', icon: Layout, action: () => navigateTo('kanban') },
            { type: 'nav', id: 'notes', title: 'Anotações', subtitle: 'Minhas notas', icon: FileText, action: () => navigateTo('notes') },
        );

        return items;
    }, [projects, navigateTo, setActiveProjectId, setActiveBoardId]);

    // Filter items based on query
    const filteredItems = query.trim()
        ? getAllItems().filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    // Group items by type
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {});

    const typeLabels = {
        project: 'Projetos',
        board: 'Boards',
        card: 'Cards',
        note: 'Notas',
        nav: 'Navegação',
    };

    // Flatten for keyboard navigation
    const flatItems = Object.values(groupedItems).flat();

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, flatItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
            e.preventDefault();
            handleSelect(flatItems[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    // Handle item selection
    const handleSelect = (item) => {
        // Save to recent searches
        const newRecent = [
            { title: item.title, type: item.type },
            ...recentSearches.filter(r => r.title !== item.title),
        ].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));

        // Execute action
        item.action();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Palette */}
            <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Search input */}
                <div className="flex items-center gap-3 p-4 border-b border-secondary-100">
                    <Search size={20} className="text-secondary-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Buscar projetos, boards, cards..."
                        className="flex-1 text-lg outline-none placeholder:text-secondary-400"
                    />
                    <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-secondary-500 bg-secondary-100 rounded-lg">
                        <span>ESC</span>
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto">
                    {query.trim() === '' ? (
                        // Show recent searches or hint
                        <div className="p-4 text-center text-secondary-500">
                            {recentSearches.length > 0 ? (
                                <div>
                                    <p className="text-xs uppercase font-medium text-secondary-400 mb-3">Recentes</p>
                                    <div className="space-y-1">
                                        {recentSearches.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary-50 cursor-pointer text-left"
                                                onClick={() => setQuery(item.title)}
                                            >
                                                <Clock size={14} className="text-secondary-400" />
                                                <span className="text-sm text-secondary-700">{item.title}</span>
                                                <span className="text-xs text-secondary-400 ml-auto">{typeLabels[item.type]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <Command size={32} className="mx-auto text-secondary-300 mb-3" />
                                    <p className="text-sm">Digite para buscar projetos, boards e mais...</p>
                                </div>
                            )}
                        </div>
                    ) : flatItems.length === 0 ? (
                        // No results
                        <div className="p-8 text-center text-secondary-500">
                            <Search size={32} className="mx-auto text-secondary-300 mb-3" />
                            <p>Nenhum resultado para "{query}"</p>
                        </div>
                    ) : (
                        // Show grouped results
                        <div className="py-2">
                            {Object.entries(groupedItems).map(([type, items]) => (
                                <div key={type}>
                                    <p className="px-4 py-2 text-xs uppercase font-medium text-secondary-400">
                                        {typeLabels[type] || type}
                                    </p>
                                    {items.map((item, idx) => {
                                        const globalIndex = flatItems.indexOf(item);
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${globalIndex === selectedIndex
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'hover:bg-secondary-50'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${globalIndex === selectedIndex
                                                    ? 'bg-primary-100'
                                                    : 'bg-secondary-100'
                                                    }`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{item.title}</p>
                                                    <p className="text-xs text-secondary-500 truncate">{item.subtitle}</p>
                                                </div>
                                                <ArrowRight size={14} className="text-secondary-400" />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-4 py-3 border-t border-secondary-100 bg-secondary-50 flex items-center justify-between text-xs text-secondary-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white rounded border border-secondary-200">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-white rounded border border-secondary-200">↓</kbd>
                            <span>navegar</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white rounded border border-secondary-200">↵</kbd>
                            <span>selecionar</span>
                        </span>
                    </div>
                    <span>Powered by Flowra</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
