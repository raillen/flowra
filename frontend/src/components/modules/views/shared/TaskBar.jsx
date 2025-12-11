import React from 'react';

/**
 * TaskBar Component
 * Represents a card as a horizontal bar in Timeline/Gantt views
 * 
 * @param {Object} props
 * @param {Object} props.card - Card data
 * @param {number} props.left - Left position in pixels
 * @param {number} props.width - Width in pixels
 * @param {boolean} props.showProgress - Show progress overlay
 * @param {boolean} props.isSelected - Whether the bar is selected
 * @param {function} props.onClick - Click handler
 * @param {function} props.onDragStart - Drag start handler
 * @param {function} props.onDragEnd - Drag end handler
 */
const TaskBar = ({
    card,
    left,
    width,
    showProgress = true,
    isSelected = false,
    onClick,
    onDragStart,
    onDragEnd,
    onResizeStart, // New prop
    onMoveStart,   // New prop for custom drag (non-HTML5)
    className = '',
}) => {
    const priorityColors = {
        alta: 'bg-red-500',
        media: 'bg-amber-500',
        baixa: 'bg-green-500',
    };

    const statusColors = {
        new: 'bg-slate-500',
        in_progress: 'bg-blue-500',
        blocked: 'bg-red-600',
        completed: 'bg-green-600',
    };

    const isCompleted = card.status === 'completed' || card.completedAt;
    const isBlocked = card.blockedBy?.length > 0;
    const progress = card.progress || 0;

    // Determine bar color based on status/priority
    const barColor = isBlocked
        ? 'bg-red-500'
        : isCompleted
            ? 'bg-green-500'
            : card.status
                ? statusColors[card.status] || 'bg-indigo-500'
                : priorityColors[card.priority] || 'bg-indigo-500';

    const handleMouseDown = (e) => {
        if (onMoveStart) {
            onMoveStart(e, card);
        } else if (onDragStart) {
            onDragStart(e, card);
        }
    };

    // Resize handles
    const handleResizeLeft = (e) => {
        e.stopPropagation();
        onResizeStart && onResizeStart(e, card, 'left');
    };

    const handleResizeRight = (e) => {
        e.stopPropagation();
        onResizeStart && onResizeStart(e, card, 'right');
    };

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick?.(card); }}
            onMouseDown={handleMouseDown}
            draggable={!!onDragStart && !onMoveStart} // Disable HTML5 drag if using custom move
            onDragStart={(e) => onDragStart?.(e, card)}
            onDragEnd={(e) => onDragEnd?.(e, card)}
            className={`
                absolute h-8 rounded-md cursor-pointer
                flex items-center px-2 overflow-hidden
                shadow-sm hover:shadow-md transition-shadow
                group select-none
                ${barColor}
                ${isSelected ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}
                ${isBlocked ? 'animate-pulse opacity-90' : ''}
                ${className}
            `}
            style={{
                left: `${left}px`,
                width: `${width}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: onDragStart ? 'grab' : 'pointer'
            }}
            title={`${card.title}${card.dueDate ? ` - ${new Date(card.dueDate).toLocaleDateString()}` : ''}`}
        >
            {/* Progress overlay */}
            {showProgress && progress > 0 && (
                <div
                    className="absolute inset-0 bg-black/20 pointer-events-none"
                    style={{
                        width: `${100 - progress}%`,
                        right: 0,
                        left: 'auto',
                    }}
                />
            )}

            {/* Card title */}
            <span className="text-xs font-medium text-white truncate relative z-10">
                {card.title}
            </span>

            {/* Progress indicator */}
            {showProgress && progress > 0 && (
                <span className="ml-auto text-[10px] font-bold text-white/80 relative z-10">
                    {progress}%
                </span>
            )}

            {/* Blocked indicator */}
            {isBlocked && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-white text-xs">
                    ⚠️
                </span>
            )}

            {/* Resize handles */}
            {onResizeStart && (
                <>
                    <div
                        onMouseDown={handleResizeLeft}
                        className="absolute left-0 top-0 bottom-0 w-2 bg-white/30 opacity-0 group-hover:opacity-100 cursor-ew-resize hover:bg-white/50 z-20"
                    />
                    <div
                        onMouseDown={handleResizeRight}
                        className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 opacity-0 group-hover:opacity-100 cursor-ew-resize hover:bg-white/50 z-20"
                    />
                </>
            )}
        </div>
    );
};

export default TaskBar;
