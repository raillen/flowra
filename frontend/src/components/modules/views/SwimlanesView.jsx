import React, { useState, useMemo, useCallback } from 'react';
import {
    ChevronDown,
    ChevronRight,
    User,
    Flag,
    Tag,
    Layers,
    CheckCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import MiniCard from './shared/MiniCard';

/**
 * Swimlane grouping options
 */
export const SWIMLANE_GROUPS = {
    assignee: {
        id: 'assignee',
        label: 'Responsável',
        icon: User,
        getKey: (card) => card.assignedUser?.name || 'Não atribuído',
        getColor: () => 'bg-indigo-500',
    },
    priority: {
        id: 'priority',
        label: 'Prioridade',
        icon: Flag,
        getKey: (card) => card.priority || 'sem_prioridade',
        getLabel: (key) => ({
            alta: 'Alta',
            media: 'Média',
            baixa: 'Baixa',
            sem_prioridade: 'Sem Prioridade',
        }[key] || key),
        getColor: (key) => ({
            alta: 'bg-red-500',
            media: 'bg-amber-500',
            baixa: 'bg-green-500',
            sem_prioridade: 'bg-slate-400',
        }[key] || 'bg-slate-400'),
        order: ['alta', 'media', 'baixa', 'sem_prioridade'],
    },
    status: {
        id: 'status',
        label: 'Status',
        icon: CheckCircle,
        getKey: (card) => card.status || 'new',
        getLabel: (key) => ({
            new: 'Novo',
            in_progress: 'Em Progresso',
            blocked: 'Bloqueado',
            completed: 'Concluído',
        }[key] || key),
        getColor: (key) => ({
            new: 'bg-slate-500',
            in_progress: 'bg-blue-500',
            blocked: 'bg-red-500',
            completed: 'bg-green-500',
        }[key] || 'bg-slate-400'),
        order: ['new', 'in_progress', 'blocked', 'completed'],
    },
    type: {
        id: 'type',
        label: 'Tipo',
        icon: Layers,
        getKey: (card) => card.type || 'task',
        getLabel: (key) => ({
            task: 'Tarefa',
            bug: 'Bug',
            feature: 'Feature',
            improvement: 'Melhoria',
            epic: 'Epic',
        }[key] || key),
        getColor: (key) => ({
            task: 'bg-slate-500',
            bug: 'bg-red-500',
            feature: 'bg-purple-500',
            improvement: 'bg-blue-500',
            epic: 'bg-indigo-600',
        }[key] || 'bg-slate-400'),
    },
    column: {
        id: 'column',
        label: 'Coluna',
        icon: Layers,
        getKey: (card, columns) => {
            const col = columns?.find(c => c.id === card.columnId);
            return col?.name || 'Sem Coluna';
        },
        getColor: () => 'bg-slate-500',
    },
};

/**
 * SwimlanesView Component
 * Groups cards into horizontal lanes by selected criteria
 * 
 * @param {Object} props
 * @param {Array} props.cards - Cards to display
 * @param {Array} props.columns - Columns data
 * @param {function} props.onCardClick - Callback when card is clicked
 * @param {function} props.onCardMove - Callback when card is moved between lanes
 */
const SwimlanesView = ({
    cards = [],
    columns = [],
    onCardClick,
    onCardMove,
}) => {
    const [groupBy, setGroupBy] = useState('priority');
    const [collapsedLanes, setCollapsedLanes] = useState(new Set());
    const [draggedCard, setDraggedCard] = useState(null);
    const [dragOverLane, setDragOverLane] = useState(null);

    const groupConfig = SWIMLANE_GROUPS[groupBy];

    // Group cards
    const groupedCards = useMemo(() => {
        const groups = {};

        cards.forEach(card => {
            const key = groupConfig.getKey(card, columns);
            if (!groups[key]) {
                groups[key] = {
                    key,
                    label: groupConfig.getLabel?.(key) || key,
                    color: typeof groupConfig.getColor === 'function'
                        ? groupConfig.getColor(key)
                        : groupConfig.getColor,
                    cards: [],
                };
            }
            groups[key].cards.push(card);
        });

        // Sort by order if defined
        let sortedGroups = Object.values(groups);
        if (groupConfig.order) {
            sortedGroups.sort((a, b) => {
                const aIndex = groupConfig.order.indexOf(a.key);
                const bIndex = groupConfig.order.indexOf(b.key);
                return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
            });
        }

        return sortedGroups;
    }, [cards, columns, groupBy, groupConfig]);

    // Lane statistics
    const getLaneStats = useCallback((laneCards) => {
        const total = laneCards.length;
        const completed = laneCards.filter(c => c.status === 'completed' || c.completedAt).length;
        const blocked = laneCards.filter(c => c.blockedBy?.length > 0).length;
        const overdue = laneCards.filter(c => {
            if (!c.dueDate || c.status === 'completed') return false;
            return new Date(c.dueDate) < new Date();
        }).length;

        return { total, completed, blocked, overdue };
    }, []);

    // Toggle lane collapse
    const toggleLane = (laneKey) => {
        setCollapsedLanes(prev => {
            const next = new Set(prev);
            if (next.has(laneKey)) {
                next.delete(laneKey);
            } else {
                next.add(laneKey);
            }
            return next;
        });
    };

    // Drag handlers
    const handleDragStart = (e, card) => {
        setDraggedCard(card);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedCard(null);
        setDragOverLane(null);
    };

    const handleDragOver = (e, laneKey) => {
        e.preventDefault();
        setDragOverLane(laneKey);
    };

    const handleDrop = (e, laneKey) => {
        e.preventDefault();
        if (draggedCard && onCardMove) {
            onCardMove(draggedCard, laneKey, groupBy);
        }
        setDraggedCard(null);
        setDragOverLane(null);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700">Raias (Swimlanes)</h3>
                    <span className="text-sm text-slate-500">
                        {cards.length} cards em {groupedCards.length} grupos
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Agrupar por:</span>
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                        className="px-2 py-1 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {Object.values(SWIMLANE_GROUPS).map(group => (
                            <option key={group.id} value={group.id}>
                                {group.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Swimlanes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {groupedCards.map(lane => {
                    const isCollapsed = collapsedLanes.has(lane.key);
                    const stats = getLaneStats(lane.cards);
                    const isDragOver = dragOverLane === lane.key && draggedCard;

                    return (
                        <div
                            key={lane.key}
                            className={`rounded-lg border transition-all ${isDragOver
                                    ? 'border-indigo-400 bg-indigo-50'
                                    : 'border-slate-200 bg-slate-50'
                                }`}
                            onDragOver={(e) => handleDragOver(e, lane.key)}
                            onDrop={(e) => handleDrop(e, lane.key)}
                            onDragLeave={() => setDragOverLane(null)}
                        >
                            {/* Lane header */}
                            <div
                                onClick={() => toggleLane(lane.key)}
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-100 rounded-t-lg"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Expand/Collapse icon */}
                                    {isCollapsed ? (
                                        <ChevronRight size={18} className="text-slate-400" />
                                    ) : (
                                        <ChevronDown size={18} className="text-slate-400" />
                                    )}

                                    {/* Color indicator */}
                                    <div className={`w-3 h-3 rounded-full ${lane.color}`} />

                                    {/* Label */}
                                    <span className="font-medium text-slate-700">{lane.label}</span>

                                    {/* Card count */}
                                    <span className="px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-200 rounded-full">
                                        {stats.total}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-xs">
                                    {stats.completed > 0 && (
                                        <span className="flex items-center gap-1 text-green-600">
                                            <CheckCircle size={12} />
                                            {stats.completed}
                                        </span>
                                    )}
                                    {stats.blocked > 0 && (
                                        <span className="flex items-center gap-1 text-red-600">
                                            <AlertTriangle size={12} />
                                            {stats.blocked}
                                        </span>
                                    )}
                                    {stats.overdue > 0 && (
                                        <span className="flex items-center gap-1 text-amber-600">
                                            <Clock size={12} />
                                            {stats.overdue}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Lane content */}
                            {!isCollapsed && (
                                <div className="p-3 pt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                    {lane.cards.map(card => (
                                        <div
                                            key={card.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, card)}
                                            onDragEnd={handleDragEnd}
                                            className={`transition-opacity ${draggedCard?.id === card.id ? 'opacity-50' : ''
                                                }`}
                                        >
                                            <MiniCard
                                                card={card}
                                                showProgress
                                                onClick={onCardClick}
                                            />
                                        </div>
                                    ))}

                                    {lane.cards.length === 0 && (
                                        <div className="col-span-full py-4 text-center text-sm text-slate-400">
                                            Nenhum card neste grupo
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {groupedCards.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Layers size={48} className="mb-2 opacity-50" />
                        <p>Nenhum card encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SwimlanesView;
