import React, { useMemo } from 'react';
import {
    differenceInDays,
    addDays,
    format,
    startOfDay,
    startOfWeek,
    startOfMonth,
    eachDayOfInterval,
    eachWeekOfInterval,
    eachMonthOfInterval,
    isToday,
    isWeekend,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * TimeScale Component
 * Renders a horizontal time scale (header) for Timeline and Gantt views
 * 
 * @param {Object} props
 * @param {Date} props.startDate - Start date of the scale
 * @param {Date} props.endDate - End date of the scale
 * @param {string} props.zoom - Zoom level: 'day' | 'week' | 'month'
 * @param {number} props.cellWidth - Width of each cell in pixels
 * @param {function} props.onCellClick - Callback when a cell is clicked
 */
const TimeScale = ({
    startDate,
    endDate,
    zoom = 'week',
    cellWidth = 40,
    onCellClick,
}) => {
    // Generate time intervals based on zoom level
    const intervals = useMemo(() => {
        const start = startOfDay(startDate);
        const end = startOfDay(endDate);

        switch (zoom) {
            case 'day':
                return eachDayOfInterval({ start, end }).map(date => ({
                    date,
                    label: format(date, 'd', { locale: ptBR }),
                    subLabel: format(date, 'EEE', { locale: ptBR }),
                    isToday: isToday(date),
                    isWeekend: isWeekend(date),
                }));
            case 'week':
                return eachWeekOfInterval({ start, end }, { weekStartsOn: 0 }).map(date => ({
                    date,
                    label: format(date, "'Sem' w", { locale: ptBR }),
                    subLabel: format(date, 'MMM', { locale: ptBR }),
                    isToday: false,
                    isWeekend: false,
                }));
            case 'month':
                return eachMonthOfInterval({ start, end }).map(date => ({
                    date,
                    label: format(date, 'MMM', { locale: ptBR }),
                    subLabel: format(date, 'yyyy', { locale: ptBR }),
                    isToday: false,
                    isWeekend: false,
                }));
            default:
                return [];
        }
    }, [startDate, endDate, zoom]);

    // Calculate total width
    const totalWidth = intervals.length * cellWidth;

    return (
        <div className="flex flex-col border-b border-slate-200 bg-slate-50">
            {/* Top row - Month/Year labels for day view */}
            {zoom === 'day' && (
                <div className="flex border-b border-slate-200">
                    {intervals.reduce((acc, interval, index) => {
                        const monthLabel = format(interval.date, 'MMMM yyyy', { locale: ptBR });
                        const lastMonth = acc.length > 0 ? acc[acc.length - 1].label : null;

                        if (monthLabel !== lastMonth) {
                            acc.push({ label: monthLabel, startIndex: index, count: 1 });
                        } else if (acc.length > 0) {
                            acc[acc.length - 1].count++;
                        }
                        return acc;
                    }, []).map((group, idx) => (
                        <div
                            key={idx}
                            className="text-xs font-medium text-slate-600 px-2 py-1 border-r border-slate-200 truncate"
                            style={{ width: group.count * cellWidth }}
                        >
                            {group.label}
                        </div>
                    ))}
                </div>
            )}

            {/* Main scale row */}
            <div className="flex">
                {intervals.map((interval, index) => (
                    <div
                        key={index}
                        onClick={() => onCellClick?.(interval.date)}
                        className={`
                            flex flex-col items-center justify-center
                            border-r border-slate-200 cursor-pointer
                            hover:bg-slate-100 transition-colors
                            ${interval.isToday ? 'bg-indigo-50 border-indigo-200' : ''}
                            ${interval.isWeekend ? 'bg-slate-100' : ''}
                        `}
                        style={{ width: cellWidth, minWidth: cellWidth }}
                    >
                        <span className={`text-xs font-medium ${interval.isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                            {interval.label}
                        </span>
                        {interval.subLabel && (
                            <span className="text-[10px] text-slate-400">
                                {interval.subLabel}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Calculate position of a task bar based on dates
 * @param {Date} taskStart - Task start date
 * @param {Date} taskEnd - Task end date  
 * @param {Date} scaleStart - Scale start date
 * @param {number} cellWidth - Width of each cell
 * @param {string} zoom - Zoom level
 * @returns {Object} - { left, width } in pixels
 */
export const calculateTaskPosition = (taskStart, taskEnd, scaleStart, cellWidth, zoom) => {
    const startDiff = differenceInDays(taskStart, scaleStart);
    const duration = differenceInDays(taskEnd, taskStart) + 1; // Include end date

    let multiplier = 1;
    if (zoom === 'week') multiplier = 1 / 7;
    if (zoom === 'month') multiplier = 1 / 30; // Approximate

    return {
        left: startDiff * cellWidth * multiplier,
        width: Math.max(duration * cellWidth * multiplier, cellWidth), // Minimum 1 cell
    };
};

/**
 * Get date range from cards
 * @param {Array} cards - Array of cards with startDate and dueDate
 * @returns {Object} - { startDate, endDate }
 */
export const getDateRangeFromCards = (cards) => {
    const dates = cards
        .flatMap(card => [card.startDate, card.dueDate])
        .filter(Boolean)
        .map(d => new Date(d));

    if (dates.length === 0) {
        const today = new Date();
        return {
            startDate: addDays(today, -7),
            endDate: addDays(today, 30),
        };
    }

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return {
        startDate: addDays(minDate, -7), // 7 days buffer
        endDate: addDays(maxDate, 14), // 14 days buffer
    };
};

export default TimeScale;
