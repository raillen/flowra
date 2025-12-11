import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    X,
    Calendar,
    User,
    Tag,
    Flag,
    CheckCircle,
    Layers,
    BarChart,
    ChevronRight,
    Hash,
    Type,
    CheckSquare,
    List
} from 'lucide-react';
import SavedFiltersDropdown from '../../common/SavedFiltersDropdown';

/**
 * Filter chip component for active filters
 */
const FilterChip = ({ label, value, onRemove, color = 'primary' }) => (
    <span className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        bg-${color}-100 text-${color}-700 border border-${color}-200
        transition-all hover:bg-${color}-200
    `}>
        <span className="truncate max-w-[150px]">{label}: {value}</span>
        <button
            onClick={onRemove}
            className={`hover:bg-${color}-300 rounded-full p-0.5 transition-colors`}
        >
            <X size={12} />
        </button>
    </span>
);

/**
 * Filter Section in Drawer
 */
const FilterSection = ({ title, icon: Icon, children }) => (
    <div className="border-b border-gray-100 py-4 last:border-0">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3 px-1">
            {Icon && <Icon size={16} className="text-slate-500" />}
            {title}
        </h4>
        <div className="space-y-3 px-1">
            {children}
        </div>
    </div>
);

/**
 * FilterPanel Component
 * Main bar with Search + Drawer for advanced filters
 * Supports Custom Fields
 */
const FilterPanel = ({
    filters = {},
    onFiltersChange,
    users = [],
    tags = [],
    totalCards = 0,
    filteredCount = 0,
    customFieldDefinitions = [], // { id, name, type, options }[]
    projectId,
    boardId,
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search || '');

    // Priority options
    const priorityOptions = [
        { value: 'alta', label: '🔴 Alta' },
        { value: 'media', label: '🟡 Média' },
        { value: 'baixa', label: '🟢 Baixa' },
    ];

    // Status options
    const statusOptions = [
        { value: 'novo', label: '⚪ Novo' },
        { value: 'em_progresso', label: '🔵 Em Progresso' },
        { value: 'bloqueado', label: '🔴 Bloqueado' },
        { value: 'concluido', label: '🟢 Concluído' },
    ];

    // Type options
    const typeOptions = [
        { value: 'tarefa', label: '📋 Tarefa' },
        { value: 'bug', label: '🐛 Bug' },
        { value: 'feature', label: '✨ Feature' },
        { value: 'melhoria', label: '📈 Melhoria' },
    ];

    // Due date presets
    const dueDateOptions = [
        { value: 'overdue', label: '⚠️ Atrasados' },
        { value: 'today', label: '📅 Hoje' },
        { value: 'week', label: '📆 Esta Semana' },
        { value: 'month', label: '🗓️ Este Mês' },
        { value: 'no_date', label: '❌ Sem Data' },
    ];

    // Progress options
    const progressOptions = [
        { value: '0-25', label: '0-25%' },
        { value: '25-50', label: '25-50%' },
        { value: '50-75', label: '50-75%' },
        { value: '75-100', label: '75-100%' },
    ];

    // Handle filter change
    const handleFilterChange = (key, value) => {
        onFiltersChange?.({ ...filters, [key]: value });
    };

    // Handle search with debounce
    const handleSearchChange = (value) => {
        setSearchValue(value);
        const timer = setTimeout(() => {
            handleFilterChange('search', value);
        }, 300);
        return () => clearTimeout(timer);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchValue('');
        onFiltersChange?.({});
        setIsDrawerOpen(false);
    };

    // Get active filter count (excluding search)
    const activeFilterCount = useMemo(() => {
        const { search, ...rest } = filters;
        return Object.values(rest).filter(v => v && v !== '').length;
    }, [filters]);

    // Active filters display list
    const activeFilters = useMemo(() => {
        const active = [];
        if (filters.priority) {
            const opt = priorityOptions.find(o => o.value === filters.priority);
            active.push({ key: 'priority', label: 'Prioridade', value: opt?.label || filters.priority });
        }
        if (filters.status) {
            const opt = statusOptions.find(o => o.value === filters.status);
            active.push({ key: 'status', label: 'Status', value: opt?.label || filters.status });
        }
        if (filters.type) {
            const opt = typeOptions.find(o => o.value === filters.type);
            active.push({ key: 'type', label: 'Tipo', value: opt?.label || filters.type });
        }
        if (filters.dueDate) {
            const opt = dueDateOptions.find(o => o.value === filters.dueDate);
            active.push({ key: 'dueDate', label: 'Prazo', value: opt?.label || filters.dueDate });
        }
        if (filters.assignee) {
            const user = users.find(u => u.id === filters.assignee);
            active.push({ key: 'assignee', label: 'Responsável', value: user?.name || filters.assignee });
        }
        if (filters.tag) {
            const tag = tags.find(t => t.id === filters.tag);
            active.push({ key: 'tag', label: 'Tag', value: tag?.name || filters.tag });
        }
        if (filters.progress) active.push({ key: 'progress', label: 'Progresso', value: filters.progress });
        if (filters.startDate) active.push({ key: 'startDate', label: 'Início', value: filters.startDate });
        if (filters.endDate) active.push({ key: 'endDate', label: 'Fim', value: filters.endDate });

        // Custom Fields Active Chips
        customFieldDefinitions.forEach(def => {
            const val = filters[`custom_${def.id}`];
            if (val) {
                active.push({
                    key: `custom_${def.id}`,
                    label: def.name,
                    value: def.type === 'boolean' ? (val === 'true' ? 'Sim' : 'Não') : val
                });
            }
        });

        return active;
    }, [filters, users, tags, customFieldDefinitions]);

    // Render Custom Field Filter Input
    const renderCustomFieldFilter = (def) => {
        const filterKey = `custom_${def.id}`;
        const value = filters[filterKey] || '';

        switch (def.type) {
            case 'select':
                return (
                    <div className="mb-3 last:mb-0">
                        <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                            <List size={10} /> {def.name}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="">Qualquer</option>
                            {def.options?.map((opt, idx) => (
                                <option key={idx} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                );
            case 'boolean':
            case 'checkbox':
                return (
                    <div className="mb-3 last:mb-0">
                        <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                            <CheckSquare size={10} /> {def.name}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="">Indiferente</option>
                            <option value="true">Sim</option>
                            <option value="false">Não</option>
                        </select>
                    </div>
                );
            case 'date':
                return (
                    <div className="mb-3 last:mb-0">
                        <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                            <Calendar size={10} /> {def.name}
                        </label>
                        <input
                            type="date"
                            value={value}
                            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>
                );
            case 'number':
                return (
                    <div className="mb-3 last:mb-0">
                        <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                            <Hash size={10} /> {def.name}
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            placeholder="Valor exato"
                        />
                    </div>
                );
            default: // text
                return (
                    <div className="mb-3 last:mb-0">
                        <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1">
                            <Type size={10} /> {def.name}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            placeholder="Contém..."
                        />
                    </div>
                );
        }
    };

    return (
        <div className="bg-white rounded-xl border border-secondary-200 shadow-sm">
            {/* Top Bar */}
            <div className="p-3 flex flex-wrap items-center gap-3">
                {/* Search - Always visible */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                    <input
                        type="text"
                        placeholder="Buscar cards..."
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-secondary-200 rounded-lg bg-secondary-50
                                   focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${activeFilterCount > 0
                        ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm'
                        : 'bg-white border-secondary-200 text-secondary-600 hover:bg-secondary-50'
                        }`}
                >
                    <Filter size={16} />
                    <span className="text-sm font-medium">Filtros</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem]">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Saved Filters */}
                <SavedFiltersDropdown
                    currentFilters={filters}
                    onLoadFilter={onFiltersChange}
                    projectId={projectId}
                    boardId={boardId}
                />

                {/* Results Count */}
                <div className="text-sm text-secondary-500 px-2 border-l border-secondary-200">
                    <span className="font-semibold text-secondary-900">{filteredCount}</span>
                    <span className="text-xs ml-1">results</span>
                </div>
            </div>

            {/* Active Filters Bar (if any) */}
            {activeFilters.length > 0 && (
                <div className="px-3 pb-3 pt-0 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {activeFilters.map(filter => (
                        <FilterChip
                            key={filter.key}
                            label={filter.label}
                            value={filter.value}
                            onRemove={() => handleFilterChange(filter.key, '')}
                        />
                    ))}
                    <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1"
                    >
                        Limpar tudo
                    </button>
                </div>
            )}

            {/* DRAWER / SIDEBAR */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsDrawerOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Filter size={20} className="text-primary-600" />
                                Filtrar Cards
                            </h3>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-1">

                            <FilterSection title="Status" icon={CheckCircle}>
                                <div className="space-y-2">
                                    {statusOptions.map(opt => (
                                        <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 p-2 rounded cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={filters.status === opt.value}
                                                onChange={() => handleFilterChange('status', opt.value)}
                                                className="text-primary-600 focus:ring-primary-500"
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                    {filters.status && (
                                        <button onClick={() => handleFilterChange('status', '')} className="text-xs text-slate-400 ml-7 hover:text-red-500">
                                            Limpar seleção
                                        </button>
                                    )}
                                </div>
                            </FilterSection>

                            <FilterSection title="Prioridade" icon={Flag}>
                                <select
                                    value={filters.priority || ''}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="">Todas</option>
                                    {priorityOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </FilterSection>

                            {customFieldDefinitions.length > 0 && (
                                <FilterSection title="Campos Personalizados" icon={Layers}>
                                    {customFieldDefinitions.map(def => (
                                        <div key={def.id}>
                                            {renderCustomFieldFilter(def)}
                                        </div>
                                    ))}
                                </FilterSection>
                            )}

                            <FilterSection title="Tipo" icon={Layers}>
                                <div className="grid grid-cols-2 gap-2">
                                    {typeOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleFilterChange('type', filters.type === opt.value ? '' : opt.value)}
                                            className={`
                                                flex items-center justify-center p-2 rounded-lg text-sm border transition-all
                                                ${filters.type === opt.value
                                                    ? 'bg-primary-50 border-primary-200 text-primary-700 font-medium shadow-sm'
                                                    : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            <FilterSection title="Responsável" icon={User}>
                                <select
                                    value={filters.assignee || ''}
                                    onChange={(e) => handleFilterChange('assignee', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="">Qualquer um</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </FilterSection>

                            <FilterSection title="Prazo e Datas" icon={Calendar}>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Filtro Rápido</label>
                                        <select
                                            value={filters.dueDate || ''}
                                            onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="">Nenhum</option>
                                            {dueDateOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 mb-1 block">De</label>
                                            <input
                                                type="date"
                                                value={filters.startDate || ''}
                                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 mb-1 block">Até</label>
                                            <input
                                                type="date"
                                                value={filters.endDate || ''}
                                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </FilterSection>

                            {tags.length > 0 && (
                                <FilterSection title="Tags" icon={Tag}>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button
                                                key={tag.id}
                                                onClick={() => handleFilterChange('tag', filters.tag === tag.id ? '' : tag.id)}
                                                className={`
                                                    px-2.5 py-1 text-xs rounded-full border transition-colors
                                                    ${filters.tag === tag.id
                                                        ? 'bg-indigo-100 border-indigo-200 text-indigo-700 font-medium'
                                                        : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
                                                    }
                                                `}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </FilterSection>
                            )}

                            <FilterSection title="Progresso" icon={BarChart}>
                                <div className="grid grid-cols-2 gap-2">
                                    {progressOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleFilterChange('progress', filters.progress === opt.value ? '' : opt.value)}
                                            className={`
                                                p-2 rounded-lg text-xs border text-center transition-all
                                                ${filters.progress === opt.value
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                                                    : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Limpar Tudo
                            </button>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                Ver {filteredCount} Cards
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
