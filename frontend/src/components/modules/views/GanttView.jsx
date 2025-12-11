import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { addDays, differenceInDays, format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ZoomIn, ZoomOut, AlertCircle, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import TimeScale, { getDateRangeFromCards, calculateTaskPosition } from './shared/TimeScale';
import TaskBar from './shared/TaskBar';
import { DependencyLinesContainer } from './shared/DependencyLine';

/**
 * GanttView Component
 * Full Gantt chart with dependencies, progress bars, and milestones
 * 
 * @param {Object} props
 * @param {Array} props.cards - Cards to display
 * @param {Array} props.columns - Columns (for grouping)
 * @param {function} props.onCardClick - Callback when card is clicked
 * @param {function} props.onCardUpdate - Callback when card is updated
 */
const GanttView = ({
    cards = [],
    columns = [],
    onCardClick,
    onCardUpdate,
}) => {
    const containerRef = useRef(null);
    const [zoom, setZoom] = useState('week');
    const [selectedCard, setSelectedCard] = useState(null);
    const [showDependencies, setShowDependencies] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState(new Set(['all']));

    // Interaction state
    const [interaction, setInteraction] = useState(null);
    const [optimisticUpdates, setOptimisticUpdates] = useState({});

    // Cell widths per zoom level
    const cellWidths = { day: 40, week: 80, month: 120 };
    const cellWidth = cellWidths[zoom];

    // Calculate date range
    const { startDate, endDate } = useMemo(() => {
        return getDateRangeFromCards(cards);
    }, [cards]);

    // Width calculation
    const totalDays = differenceInDays(endDate, startDate);
    const totalWidth = useMemo(() => {
        switch (zoom) {
            case 'day': return totalDays * cellWidth;
            case 'week': return Math.ceil(totalDays / 7) * cellWidth;
            case 'month': return Math.ceil(totalDays / 30) * cellWidth;
            default: return totalDays * cellWidth;
        }
    }, [totalDays, cellWidth, zoom]);

    // Filter cards with dates
    const cardsWithDates = useMemo(() => {
        return cards.filter(card => card.startDate || card.dueDate);
    }, [cards]);

    // Merged cards for rendering (includes optimistic updates)
    const mergedCards = useMemo(() => {
        return cardsWithDates.map(card => {
            if (optimisticUpdates[card.id]) {
                return { ...card, ...optimisticUpdates[card.id] };
            }
            return card;
        });
    }, [cardsWithDates, optimisticUpdates]);

    // Group cards by column
    const cardsByColumn = useMemo(() => {
        const groups = {};
        columns.forEach(col => {
            groups[col.id] = {
                column: col,
                cards: mergedCards.filter(card => card.columnId === col.id)
                    .sort((a, b) => {
                        const aStart = a.startDate ? new Date(a.startDate) : new Date(a.dueDate);
                        const bStart = b.startDate ? new Date(b.startDate) : new Date(b.dueDate);
                        return aStart - bStart;
                    }),
            };
        });
        return groups;
    }, [mergedCards, columns]);

    // Calculate card positions for dependency lines
    const cardPositions = useMemo(() => {
        const positions = new Map();
        let currentY = 52; // After header

        Object.values(cardsByColumn).forEach(group => {
            if (!expandedGroups.has('all') && !expandedGroups.has(group.column.id)) {
                currentY += 40; // Collapsed group header
                return;
            }
            currentY += 40; // Group header

            group.cards.forEach(card => {
                const cardStart = card.startDate ? new Date(card.startDate) : new Date(card.dueDate);
                const cardEnd = card.dueDate ? new Date(card.dueDate) : addDays(cardStart, 1);
                const pos = calculateTaskPosition(cardStart, cardEnd, startDate, cellWidth, zoom);

                positions.set(card.id, {
                    x: pos.left + pos.width,
                    y: currentY + 20, // Center of row
                    left: pos.left,
                    width: pos.width,
                });

                currentY += 48;
            });
        });

        return positions;
    }, [cardsByColumn, expandedGroups, startDate, cellWidth, zoom]);

    // Build dependency lines
    const dependencies = useMemo(() => {
        if (!showDependencies) return [];

        const lines = [];
        mergedCards.forEach(card => {
            if (card.blockedBy?.length > 0) {
                card.blockedBy.forEach(blocker => {
                    const fromPos = cardPositions.get(blocker.blockingCardId);
                    const toPos = cardPositions.get(card.id);

                    if (fromPos && toPos) {
                        lines.push({
                            fromId: blocker.blockingCardId,
                            toId: card.id,
                            from: { x: fromPos.x, y: fromPos.y },
                            to: { x: toPos.left, y: toPos.y },
                            type: 'blocking',
                        });
                    }
                });
            }
        });

        return lines;
    }, [mergedCards, cardPositions, showDependencies]);

    // Row height
    const rowHeight = 48;

    // Toggle group expand
    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    // Zoom handlers
    const handleZoomIn = () => {
        if (zoom === 'month') setZoom('week');
        else if (zoom === 'week') setZoom('day');
    };

    const handleZoomOut = () => {
        if (zoom === 'day') setZoom('week');
        else if (zoom === 'week') setZoom('month');
    };

    // Scroll to today
    const scrollToToday = useCallback(() => {
        const today = new Date();
        const daysSinceStart = differenceInDays(today, startDate);
        let newScrollLeft;

        switch (zoom) {
            case 'day': newScrollLeft = daysSinceStart * cellWidth - 200; break;
            case 'week': newScrollLeft = (daysSinceStart / 7) * cellWidth - 200; break;
            case 'month': newScrollLeft = (daysSinceStart / 30) * cellWidth - 100; break;
            default: newScrollLeft = daysSinceStart * cellWidth - 200;
        }

        if (containerRef.current) {
            containerRef.current.scrollLeft = Math.max(0, newScrollLeft);
        }
    }, [startDate, zoom, cellWidth]);

    const handleCardClick = (card) => {
        if (interaction) return;
        setSelectedCard(card.id);
        onCardClick?.(card);
    };

    // Interaction Logic
    const getPixelsPerDay = () => {
        let multiplier = 1;
        if (zoom === 'week') multiplier = 1 / 7;
        if (zoom === 'month') multiplier = 1 / 30;
        return cellWidth * multiplier;
    };

    const handleInteractionStart = (e, card, type, direction = null) => {
        e.preventDefault();
        e.stopPropagation();

        setInteraction({
            type,
            cardId: card.id,
            direction,
            startX: e.clientX,
            initialDates: {
                startDate: card.startDate ? new Date(card.startDate) : new Date(card.dueDate),
                dueDate: card.dueDate ? new Date(card.dueDate) : addDays(new Date(card.startDate), 1)
            }
        });
    };

    const handleMouseMove = useCallback((e) => {
        if (!interaction) return;

        const pixelsPerDay = getPixelsPerDay();
        const deltaPixels = e.clientX - interaction.startX;
        const deltaDays = Math.round(deltaPixels / pixelsPerDay);

        const { initialDates } = interaction;
        let newStart = new Date(initialDates.startDate);
        let newEnd = new Date(initialDates.dueDate);

        if (interaction.type === 'move') {
            newStart = addDays(newStart, deltaDays);
            newEnd = addDays(newEnd, deltaDays);
        } else if (interaction.type === 'resize') {
            if (interaction.direction === 'left') {
                newStart = addDays(newStart, deltaDays);
                if (newStart >= newEnd) newStart = addDays(newEnd, -1);
            } else {
                newEnd = addDays(newEnd, deltaDays);
                if (newEnd <= newStart) newEnd = addDays(newStart, 1);
            }
        }

        setOptimisticUpdates(prev => ({
            ...prev,
            [interaction.cardId]: {
                startDate: newStart.toISOString(),
                dueDate: newEnd.toISOString()
            }
        }));

    }, [interaction, cellWidth, zoom]);

    const handleMouseUp = useCallback(() => {
        if (!interaction) return;

        const finalDates = optimisticUpdates[interaction.cardId];
        if (finalDates && onCardUpdate) {
            onCardUpdate(interaction.cardId, finalDates);
        }

        setInteraction(null);
        setOptimisticUpdates({});
    }, [interaction, optimisticUpdates, onCardUpdate]);

    useEffect(() => {
        if (interaction) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [interaction, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        scrollToToday();
    }, [scrollToToday]);

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700">Gráfico de Gantt</h3>
                    <span className="text-sm text-slate-500">
                        {cardsWithDates.length} cards
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Toggle dependencies */}
                    <button
                        onClick={() => setShowDependencies(!showDependencies)}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${showDependencies
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                            }`}
                    >
                        {showDependencies ? <Eye size={14} /> : <EyeOff size={14} />}
                        Dependências
                    </button>

                    <div className="w-px h-6 bg-slate-300" />

                    {/* Scroll controls */}
                    <button
                        onClick={() => containerRef.current.scrollLeft -= 200}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={scrollToToday}
                        className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded"
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => containerRef.current.scrollLeft += 200}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <div className="w-px h-6 bg-slate-300" />

                    {/* Zoom controls */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded p-0.5">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom === 'month'}
                            className={`p-1.5 rounded ${zoom === 'month' ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            <ZoomOut size={16} />
                        </button>
                        <span className="px-2 text-xs font-medium text-slate-600 min-w-[50px] text-center">
                            {zoom === 'day' ? 'Dia' : zoom === 'week' ? 'Semana' : 'Mês'}
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={zoom === 'day'}
                            className={`p-1.5 rounded ${zoom === 'day' ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            <ZoomIn size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Gantt content */}
            <div className="flex flex-1 overflow-hidden select-none">
                {/* Left sidebar - groups and cards */}
                <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-slate-50 overflow-y-auto">
                    <div className="sticky top-0 h-[52px] bg-slate-50 border-b border-slate-200 flex items-center px-3 z-10">
                        <span className="text-xs font-medium text-slate-500">Tarefas por Coluna</span>
                    </div>

                    {Object.values(cardsByColumn).map(group => (
                        <div key={group.column.id}>
                            {/* Group header */}
                            <div
                                onClick={() => toggleGroup(group.column.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200 cursor-pointer hover:bg-slate-150"
                            >
                                <span className={`transform transition-transform ${expandedGroups.has('all') || expandedGroups.has(group.column.id) ? 'rotate-90' : ''}`}>
                                    ▶
                                </span>
                                <span className="text-sm font-medium text-slate-700">{group.column.name}</span>
                                <span className="ml-auto text-xs text-slate-500">{group.cards.length}</span>
                            </div>

                            {/* Group cards */}
                            {(expandedGroups.has('all') || expandedGroups.has(group.column.id)) &&
                                group.cards.map(card => (
                                    <div
                                        key={card.id}
                                        onClick={() => handleCardClick(card)}
                                        className={`flex items-center px-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${selectedCard === card.id ? 'bg-indigo-50' : ''
                                            }`}
                                        style={{ height: rowHeight }}
                                    >
                                        <span className="text-xs text-slate-600 truncate" title={card.title}>
                                            {card.title}
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                    ))}
                </div>

                {/* Gantt chart area */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto relative cursor-gray"
                >
                    {/* Time scale header */}
                    <div className="sticky top-0 z-10">
                        <TimeScale
                            startDate={startDate}
                            endDate={endDate}
                            zoom={zoom}
                            cellWidth={cellWidth}
                        />
                    </div>

                    {/* Chart body */}
                    <div className="relative" style={{ width: totalWidth }}>
                        {/* Today line */}
                        {(() => {
                            const position = calculateTaskPosition(new Date(), new Date(), startDate, cellWidth, zoom);
                            return (
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-30"
                                    style={{ left: position.left }}
                                >
                                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-400 rounded-full" />
                                </div>
                            );
                        })()}

                        {/* Dependency lines */}
                        {showDependencies && dependencies.length > 0 && (
                            <DependencyLinesContainer
                                dependencies={dependencies}
                                width={totalWidth}
                                height={Object.values(cardsByColumn).reduce((sum, g) =>
                                    sum + (expandedGroups.has('all') || expandedGroups.has(g.column.id) ? g.cards.length * rowHeight + 40 : 40), 0
                                )}
                            />
                        )}

                        {/* Task bars by group */}
                        {Object.values(cardsByColumn).map((group, groupIndex) => (
                            <div key={group.column.id}>
                                {/* Group header row */}
                                <div className="h-10 bg-slate-50 border-b border-slate-200" />

                                {/* Cards */}
                                {(expandedGroups.has('all') || expandedGroups.has(group.column.id)) &&
                                    group.cards.map(card => {
                                        const currentCard = optimisticUpdates[card.id] ? { ...card, ...optimisticUpdates[card.id] } : card;
                                        const cardStart = currentCard.startDate ? new Date(currentCard.startDate) : new Date(currentCard.dueDate);
                                        const cardEnd = currentCard.dueDate ? new Date(currentCard.dueDate) : addDays(cardStart, 1);
                                        const position = calculateTaskPosition(cardStart, cardEnd, startDate, cellWidth, zoom);

                                        return (
                                            <div
                                                key={card.id}
                                                className="relative border-b border-slate-100"
                                                style={{ height: rowHeight }}
                                            >
                                                <TaskBar
                                                    card={currentCard}
                                                    left={position.left}
                                                    width={position.width}
                                                    showProgress
                                                    isSelected={selectedCard === card.id}
                                                    onClick={handleCardClick}
                                                    onMoveStart={(e, c) => handleInteractionStart(e, c, 'move')}
                                                    onResizeStart={(e, c, direction) => handleInteractionStart(e, c, 'resize', direction)}
                                                    className={interaction?.cardId === card.id ? 'z-50 shadow-xl opacity-90' : ''}
                                                />
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttView;
