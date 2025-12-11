import React, { useState, useEffect, useRef } from 'react';
import { Save, ChevronDown, Trash2, Star, Bookmark, Plus, Check } from 'lucide-react';
import api from '../../config/api';

/**
 * SavedFiltersDropdown component
 * Allows users to save, load, and manage filter presets
 */
const SavedFiltersDropdown = ({
    currentFilters = {},
    onLoadFilter,
    projectId,
    boardId
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [savedFilters, setSavedFilters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch saved filters
    const fetchFilters = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (projectId) params.append('projectId', projectId);
            if (boardId) params.append('boardId', boardId);

            const response = await api.get(`/filters?${params.toString()}`);
            setSavedFilters(response.data.data || []);
        } catch (error) {
            console.error('Error fetching filters:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load filters when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchFilters();
        }
    }, [isOpen, projectId, boardId]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setShowSaveForm(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Save new filter
    const handleSaveFilter = async () => {
        if (!filterName.trim()) return;

        try {
            setIsSaving(true);
            await api.post('/filters', {
                name: filterName,
                filters: currentFilters,
                projectId,
                boardId
            });
            setFilterName('');
            setShowSaveForm(false);
            fetchFilters();
        } catch (error) {
            console.error('Error saving filter:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete filter
    const handleDeleteFilter = async (id, e) => {
        e.stopPropagation();
        try {
            await api.delete(`/filters/${id}`);
            setSavedFilters(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error('Error deleting filter:', error);
        }
    };

    // Load filter
    const handleLoadFilter = (filter) => {
        onLoadFilter(filter.filters);
        setIsOpen(false);
    };

    // Check if current filters are empty
    const hasActiveFilters = Object.keys(currentFilters).some(key =>
        currentFilters[key] &&
        (Array.isArray(currentFilters[key]) ? currentFilters[key].length > 0 : true)
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          border transition-all
          ${isOpen
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }
        `}
            >
                <Bookmark size={16} />
                <span className="hidden sm:inline">Filtros Salvos</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-surface rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="p-3 border-b border-border bg-surface-hover/50">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-text-primary">Filtros Salvos</span>
                            {hasActiveFilters && !showSaveForm && (
                                <button
                                    onClick={() => setShowSaveForm(true)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                    <Plus size={14} />
                                    Salvar Atual
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Save Form */}
                    {showSaveForm && (
                        <div className="p-3 border-b border-border bg-primary/5">
                            <input
                                type="text"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="Nome do filtro..."
                                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg mb-2 outline-none focus:border-primary"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowSaveForm(false)}
                                    className="flex-1 py-1.5 text-xs text-text-secondary hover:bg-surface-hover rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveFilter}
                                    disabled={!filterName.trim() || isSaving}
                                    className="flex-1 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                    {isSaving ? '...' : <><Save size={12} /> Salvar</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filters List */}
                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-text-secondary">
                                Carregando...
                            </div>
                        ) : savedFilters.length === 0 ? (
                            <div className="p-4 text-center text-sm text-text-secondary">
                                <Bookmark size={24} className="mx-auto mb-2 opacity-50" />
                                Nenhum filtro salvo
                            </div>
                        ) : (
                            savedFilters.map((filter) => (
                                <div
                                    key={filter.id}
                                    onClick={() => handleLoadFilter(filter)}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-surface-hover cursor-pointer group transition-colors"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {filter.isDefault && <Star size={14} className="text-amber-500 flex-shrink-0" />}
                                        <span className="text-sm text-text-primary truncate">{filter.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteFilter(filter.id, e)}
                                        className="p-1 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer hint */}
                    {savedFilters.length > 0 && (
                        <div className="p-2 border-t border-border bg-surface-hover/30">
                            <p className="text-[10px] text-text-secondary text-center">
                                Clique para aplicar filtro
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SavedFiltersDropdown;
