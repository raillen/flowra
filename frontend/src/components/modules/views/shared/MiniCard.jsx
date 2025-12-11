import React from 'react';
import { User, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * MiniCard Component
 * Compact card display for Timeline, Gantt, and other dense views
 * 
 * @param {Object} props
 * @param {Object} props.card - Card data
 * @param {boolean} props.showProgress - Show progress bar
 * @param {boolean} props.showAssignee - Show assignee avatar
 * @param {boolean} props.compact - Extra compact mode
 * @param {function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
const MiniCard = ({
    card,
    showProgress = false,
    showAssignee = true,
    compact = false,
    onClick,
    className = '',
}) => {
    const priorityColors = {
        alta: 'border-l-red-500 bg-red-50',
        media: 'border-l-yellow-500 bg-yellow-50',
        baixa: 'border-l-green-500 bg-green-50',
    };

    const statusColors = {
        new: 'bg-slate-100 text-slate-600',
        in_progress: 'bg-blue-100 text-blue-600',
        blocked: 'bg-red-100 text-red-600',
        completed: 'bg-green-100 text-green-600',
    };

    const typeIcons = {
        task: '📋',
        bug: '🐛',
        feature: '✨',
        improvement: '📈',
        epic: '🎯',
    };

    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'completed';
    const isCompleted = card.status === 'completed' || card.completedAt;
    const isBlocked = card.blockedBy?.length > 0;

    return (
        <div
            onClick={() => onClick?.(card)}
            className={`
                group rounded border-l-4 shadow-sm cursor-pointer
                transition-all hover:shadow-md
                ${priorityColors[card.priority] || 'border-l-slate-400 bg-white'}
                ${isCompleted ? 'opacity-70' : ''}
                ${isBlocked ? 'ring-2 ring-red-300' : ''}
                ${compact ? 'p-1.5 text-xs' : 'p-2 text-sm'}
                ${className}
            `}
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                    {/* Type icon */}
                    {card.type && (
                        <span className="text-xs">{typeIcons[card.type] || '📄'}</span>
                    )}

                    {/* Title */}
                    <span className={`font-medium truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                        {card.title}
                    </span>
                </div>

                {/* Status/Warning icons */}
                <div className="flex items-center gap-1 shrink-0">
                    {isBlocked && (
                        <AlertTriangle size={12} className="text-red-500" />
                    )}
                    {isOverdue && !isCompleted && (
                        <Clock size={12} className="text-red-500" />
                    )}
                    {isCompleted && (
                        <CheckCircle size={12} className="text-green-500" />
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {showProgress && typeof card.progress === 'number' && (
                <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${card.progress >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(card.progress, 100)}%` }}
                    />
                </div>
            )}

            {/* Bottom row - meta info */}
            {!compact && (
                <div className="flex items-center justify-between gap-2 mt-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        {/* Due date */}
                        {card.dueDate && (
                            <span className={`flex items-center gap-0.5 ${isOverdue ? 'text-red-500' : ''}`}>
                                <Calendar size={10} />
                                {format(new Date(card.dueDate), 'dd/MM', { locale: ptBR })}
                            </span>
                        )}

                        {/* Story points */}
                        {card.storyPoints && (
                            <span className="bg-slate-200 px-1 rounded text-[10px]">
                                {card.storyPoints}pts
                            </span>
                        )}
                    </div>

                    {/* Assignee */}
                    {showAssignee && card.assignedUser && (
                        <div className="flex items-center gap-1">
                            {card.assignedUser.avatarUrl ? (
                                <img
                                    src={card.assignedUser.avatarUrl}
                                    alt={card.assignedUser.name}
                                    className="w-4 h-4 rounded-full"
                                />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <span className="text-[8px] text-white font-medium">
                                        {card.assignedUser.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MiniCard;
