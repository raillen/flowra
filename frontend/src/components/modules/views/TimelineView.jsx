import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { addDays, differenceInDays, format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ZoomIn, ZoomOut, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import TimeScale, { getDateRangeFromCards, calculateTaskPosition } from './shared/TimeScale';
import TaskBar from './shared/TaskBar';
import { Button } from '../../ui';

/**
 * TimelineView Component
 * Displays cards as horizontal bars on a timeline
 * 
 * @param {Object} props
 * @param {Array} props.cards - Cards to display
 * @param {Array} props.columns - Columns (for grouping)
 * @param {function} props.onCardClick - Callback when card is clicked
 * @param {function} props.onCardUpdate - Callback when card is updated
 */

const TimelineView = ({
    cards = [],
    columns = [],
    onCardClick,
    onCardUpdate,
}) => {
    const containerRef = useRef(null);
    const [zoom, setZoom] = useState('week'); // day | week | month
    const [scrollLeft, setScrollLeft] = useState(0);
    const [selectedCard, setSelectedCard] = useState(null);

    // Interaction state
    const [interaction, setInteraction] = useState(null); // { type: 'move'|'resize', cardId, direction, startX, initialDates: {start, end} }
    const [optimisticUpdates, setOptimisticUpdates] = useState({});

    // Cell widths per zoom level
    const cellWidths = {
        day: 40,
        week: 80,
        month: 120,
    };
    const cellWidth = cellWidths[zoom];

    // Calculate date range from cards
    const { startDate, endDate } = useMemo(() => {
        return getDateRangeFromCards(cards);
    }, [cards]);

    // Total width calculation
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

    const cardsWithoutDates = useMemo(() => {
        return cards.filter(card => !card.startDate && !card.dueDate);
    }, [cards]);

    // Apply optimistic updates to cards for rendering
    const visibleCards = useMemo(() => {
        return cardsWithDates.map(card => {
            const updates = optimisticUpdates[card.id];
            if (updates) {
                return { ...card, ...updates };
            }
            return card;
        });
    }, [cardsWithDates, optimisticUpdates]);

    // Group cards by row (to avoid overlap)
    const cardRows = useMemo(() => {
        const rows = [];
        const sortedCards = [...visibleCards].sort((a, b) => {
            const aStart = a.startDate ? new Date(a.startDate) : new Date(a.dueDate);
            const bStart = b.startDate ? new Date(b.startDate) : new Date(b.dueDate);
            return aStart - bStart;
        });

        sortedCards.forEach(card => {
            const cardStart = card.startDate ? new Date(card.startDate) : new Date(card.dueDate);
            const cardEnd = card.dueDate ? new Date(card.dueDate) : addDays(cardStart, 1);

            // Find a row where this card doesn't overlap
            let rowIndex = 0;
            while (true) {
                if (!rows[rowIndex]) {
                    rows[rowIndex] = [];
                }

                const hasOverlap = rows[rowIndex].some(existingCard => {
                    const existingStart = existingCard.startDate
                        ? new Date(existingCard.startDate)
                        : new Date(existingCard.dueDate);
                    const existingEnd = existingCard.dueDate
                        ? new Date(existingCard.dueDate)
                        : addDays(existingStart, 1);

                    return !(cardEnd <= existingStart || cardStart >= existingEnd);
                });

                if (!hasOverlap) {
                    rows[rowIndex].push(card);
                    break;
                }
                rowIndex++;
            }
        });

        return rows;
    }, [visibleCards]); // Depend on visibleCards (which includes optimistic updates)

    // Scroll handlers
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

    const scrollByAmount = useCallback((amount) => {
        if (containerRef.current) {
            containerRef.current.scrollLeft += amount;
        }
    }, []);

    // Zoom handlers
    const handleZoomIn = () => {
        if (zoom === 'month') setZoom('week');
        else if (zoom === 'week') setZoom('day');
    };

    const handleZoomOut = () => {
        if (zoom === 'day') setZoom('week');
        else if (zoom === 'week') setZoom('month');
    };

    // Handle card click
    const handleCardClick = (card) => {
        if (interaction) return; // Prevent click during drag
        setSelectedCard(card.id);
        onCardClick?.(card);
    };

    // Interaction Handlers
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
                // Prevent start > end
                if (newStart >= newEnd) newStart = addDays(newEnd, -1);
            } else {
                newEnd = addDays(newEnd, deltaDays);
                // Prevent end < start
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


    // Scroll to today on mount
    useEffect(() => {
        scrollToToday();
    }, [scrollToToday]);

    // Row height
    const rowHeight = 48;

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700">Timeline</h3>
                    <span className="text-sm text-slate-500">
                        {cardsWithDates.length} cards com datas
                    </span>
                    {cardsWithoutDates.length > 0 && (
                        <span className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            <AlertCircle size={14} />
                            {cardsWithoutDates.length} sem datas
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Scroll controls */}
                    <button
                        onClick={() => scrollByAmount(-200)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                        title="Rolar para esquerda"
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
                        onClick={() => scrollByAmount(200)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                        title="Rolar para direita"
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
                            title="Diminuir zoom"
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
                            title="Aumentar zoom"
                        >
                            <ZoomIn size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline content */}
            <div className="flex flex-1 overflow-hidden select-none">
                {/* Left sidebar - card names (optional) */}
                <div className="w-48 flex-shrink-0 border-r border-slate-200 bg-slate-50 overflow-y-auto">
                    <div className="sticky top-0 h-[52px] bg-slate-50 border-b border-slate-200 flex items-center px-3">
                        <span className="text-xs font-medium text-slate-500">Cards</span>
                    </div>
                    {cardRows.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className={`flex items-center px-3 border-b border-slate-100 ${row.some(c => selectedCard === c.id) ? 'bg-indigo-50' : ''
                                }`}
                            style={{ height: rowHeight }}
                        >
                            {row.length > 0 && (
                                <span
                                    className="text-xs text-slate-600 truncate cursor-pointer hover:text-indigo-600"
                                    onClick={() => handleCardClick(row[0])}
                                    title={row[0].title}
                                >
                                    {row[0].title}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Timeline area */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto cursor-gray"
                    onScroll={(e) => setScrollLeft(e.target.scrollLeft)}
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

                    {/* Card rows */}
                    <div className="relative" style={{ width: totalWidth, minHeight: cardRows.length * rowHeight }}>
                        {/* Today line */}
                        {(() => {
                            const position = calculateTaskPosition(
                                new Date(),
                                new Date(),
                                startDate,
                                cellWidth,
                                zoom
                            );
                            return (
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-20"
                                    style={{ left: position.left }}
                                >
                                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-400 rounded-full" />
                                </div>
                            );
                        })()}

                        {/* Card bars */}
                        {cardRows.map((row, rowIndex) =>
                            row.map(card => {
                                const cardStart = card.startDate
                                    ? new Date(card.startDate)
                                    : new Date(card.dueDate);
                                const cardEnd = card.dueDate
                                    ? new Date(card.dueDate)
                                    : addDays(cardStart, 1);

                                const position = calculateTaskPosition(
                                    cardStart,
                                    cardEnd,
                                    startDate,
                                    cellWidth,
                                    zoom
                                );

                                return (
                                    <div
                                        key={card.id}
                                        className="absolute"
                                        style={{
                                            top: rowIndex * rowHeight,
                                            left: 0,
                                            right: 0,
                                            height: rowHeight,
                                        }}
                                    >
                                        <TaskBar
                                            card={card}
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
                        )}
                    </div>
                </div>
            </div>

            {/* Cards without dates warning */}
            {cardsWithoutDates.length > 0 && (
                <div className="p-3 bg-amber-50 border-t border-amber-200">
                    <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">
                                {cardsWithoutDates.length} cards não aparecem na timeline
                            </p>
                            <p className="text-xs text-amber-600">
                                Adicione datas de início e/ou vencimento para visualizar esses cards.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimelineView;
