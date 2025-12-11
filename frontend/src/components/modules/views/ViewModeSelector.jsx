import React, { useState } from 'react';
import {
    Grid3x3,
    List,
    Calendar,
    Clock,
    BarChart3,
    GitBranch,
    Layers,
    ChevronDown,
    Info,
} from 'lucide-react';

/**
 * View Mode Configuration with detailed descriptions
 */
export const VIEW_MODES = {
    kanban: {
        id: 'kanban',
        label: 'Kanban',
        shortLabel: 'Kanban',
        icon: Grid3x3,
        description: 'Visualização em colunas com drag-and-drop',
        features: ['Arrastar cards', 'Colunas personalizáveis', 'WIP limits'],
        group: 'basic',
    },
    list: {
        id: 'list',
        label: 'Lista',
        shortLabel: 'Lista',
        icon: List,
        description: 'Visualização em lista simples e ordenada',
        features: ['Ordenação rápida', 'Visão compacta', 'Fácil navegação'],
        group: 'basic',
    },
    calendar: {
        id: 'calendar',
        label: 'Calendário',
        shortLabel: 'Cal',
        icon: Calendar,
        description: 'Cards organizados por data no calendário',
        features: ['Visão mensal', 'Datas de vencimento', 'Arrastar datas'],
        group: 'basic',
    },
    timeline: {
        id: 'timeline',
        label: 'Timeline',
        shortLabel: 'Time',
        icon: Clock,
        description: 'Linha do tempo horizontal com zoom',
        features: ['Zoom dia/semana/mês', 'Duração visual', 'Scroll horizontal'],
        group: 'advanced',
    },
    gantt: {
        id: 'gantt',
        label: 'Gantt',
        shortLabel: 'Gantt',
        icon: BarChart3,
        description: 'Gráfico de Gantt com dependências',
        features: ['Linhas de dependência', 'Progresso visual', 'Grupos'],
        group: 'advanced',
    },
    swimlanes: {
        id: 'swimlanes',
        label: 'Raias',
        shortLabel: 'Raias',
        icon: Layers,
        description: 'Cards agrupados por critério (prioridade, tipo, etc)',
        features: ['Múltiplos agrupamentos', 'Estatísticas por raia', 'Colapsar'],
        group: 'advanced',
    },
    hierarchy: {
        id: 'hierarchy',
        label: 'Hierarquia',
        shortLabel: 'Árv',
        icon: GitBranch,
        description: 'Estrutura em árvore com subtarefas',
        features: ['Expandir/colapsar', 'Progresso agregado', 'Níveis infinitos'],
        group: 'advanced',
    },
};

/**
 * Tooltip Component for view mode descriptions
 */
const ViewModeTooltip = ({ mode, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {isVisible && (
                <div className="absolute z-50 w-64 p-3 bg-secondary-900 text-white text-xs rounded-lg shadow-xl -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full">
                    {/* Arrow */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-secondary-900 rotate-45" />

                    {/* Content */}
                    <div className="relative">
                        <p className="font-semibold mb-1">{mode.label}</p>
                        <p className="text-secondary-300 mb-2">{mode.description}</p>
                        <div className="flex flex-wrap gap-1">
                            {mode.features.map((feature, idx) => (
                                <span
                                    key={idx}
                                    className="px-1.5 py-0.5 bg-secondary-700 rounded text-secondary-200"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * ViewModeSelector Component
 * Enhanced selector with labels, tooltips, and visual grouping
 * 
 * @param {Object} props
 * @param {string} props.currentMode - Current active view mode
 * @param {function} props.onModeChange - Callback when mode changes
 * @param {Array} props.enabledModes - List of enabled mode IDs (defaults to all)
 * @param {boolean} props.showLabels - Show text labels
 * @param {string} props.variant - 'compact' | 'full' | 'dropdown'
 */
const ViewModeSelector = ({
    currentMode = 'kanban',
    onModeChange,
    enabledModes = Object.keys(VIEW_MODES),
    showLabels = true,
    variant = 'full',
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Group modes
    const basicModes = enabledModes.filter(id => VIEW_MODES[id]?.group === 'basic').map(id => VIEW_MODES[id]);
    const advancedModes = enabledModes.filter(id => VIEW_MODES[id]?.group === 'advanced').map(id => VIEW_MODES[id]);

    // Render a single mode button
    const renderModeButton = (mode, isActive) => {
        const Icon = mode.icon;

        return (
            <ViewModeTooltip key={mode.id} mode={mode}>
                <button
                    onClick={() => onModeChange?.(mode.id)}
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                        ${isActive
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                            : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                        }
                    `}
                >
                    <Icon size={18} />
                    {showLabels && (
                        <span className="text-sm font-medium">
                            {variant === 'compact' ? mode.shortLabel : mode.label}
                        </span>
                    )}
                </button>
            </ViewModeTooltip>
        );
    };

    // Dropdown variant
    if (variant === 'dropdown') {
        const currentModeConfig = VIEW_MODES[currentMode];
        const CurrentIcon = currentModeConfig?.icon || Grid3x3;

        return (
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                    <CurrentIcon size={18} className="text-primary-600" />
                    <span className="font-medium text-secondary-800">{currentModeConfig?.label}</span>
                    <ChevronDown size={16} className={`text-secondary-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute z-50 mt-2 w-72 bg-white rounded-xl shadow-xl border border-secondary-100 py-2">
                            {/* Basic modes */}
                            <div className="px-3 py-1.5 text-xs font-semibold text-secondary-400 uppercase tracking-wide">
                                Visualizações Básicas
                            </div>
                            {basicModes.map(mode => {
                                const Icon = mode.icon;
                                const isActive = currentMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        onClick={() => { onModeChange?.(mode.id); setIsDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary-50 transition-colors ${isActive ? 'bg-primary-50' : ''}`}
                                    >
                                        <Icon size={18} className={isActive ? 'text-primary-600' : 'text-secondary-500'} />
                                        <div className="text-left">
                                            <p className={`text-sm font-medium ${isActive ? 'text-primary-700' : 'text-secondary-800'}`}>{mode.label}</p>
                                            <p className="text-xs text-secondary-500">{mode.description}</p>
                                        </div>
                                        {isActive && (
                                            <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}

                            {/* Advanced modes */}
                            <div className="px-3 py-1.5 mt-2 text-xs font-semibold text-secondary-400 uppercase tracking-wide border-t border-secondary-100 pt-2">
                                Visualizações Avançadas
                            </div>
                            {advancedModes.map(mode => {
                                const Icon = mode.icon;
                                const isActive = currentMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        onClick={() => { onModeChange?.(mode.id); setIsDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary-50 transition-colors ${isActive ? 'bg-primary-50' : ''}`}
                                    >
                                        <Icon size={18} className={isActive ? 'text-primary-600' : 'text-secondary-500'} />
                                        <div className="text-left">
                                            <p className={`text-sm font-medium ${isActive ? 'text-primary-700' : 'text-secondary-800'}`}>{mode.label}</p>
                                            <p className="text-xs text-secondary-500">{mode.description}</p>
                                        </div>
                                        {isActive && (
                                            <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Full/Compact variant
    return (
        <div className="flex items-center gap-1 p-1 bg-secondary-100 rounded-xl">
            {/* Basic modes */}
            <div className="flex items-center gap-1">
                {basicModes.map(mode => renderModeButton(mode, currentMode === mode.id))}
            </div>

            {/* Separator */}
            {advancedModes.length > 0 && (
                <div className="w-px h-8 bg-secondary-300 mx-1" />
            )}

            {/* Advanced modes */}
            <div className="flex items-center gap-1">
                {advancedModes.map(mode => renderModeButton(mode, currentMode === mode.id))}
            </div>
        </div>
    );
};

export default ViewModeSelector;
