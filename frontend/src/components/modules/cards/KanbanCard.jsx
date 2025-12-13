import React from 'react';
import {
    Calendar,
    Clock,
    MessageSquare,
    Paperclip,
    AlertTriangle,
    CheckCircle,
    MoreHorizontal,
    GripVertical,
    Archive,
    CheckSquare,
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Priority configuration
 */
const PRIORITIES = {
    alta: {
        color: 'bg-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        label: 'Alta',
    },
    media: {
        color: 'bg-amber-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        label: 'Média',
    },
    baixa: {
        color: 'bg-emerald-500',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        label: 'Baixa',
    },
};

/**
 * Card type icons and colors
 */
const CARD_TYPES = {
    tarefa: { icon: '📋', label: 'Tarefa', color: 'bg-secondary-100 text-secondary-700' },
    bug: { icon: '🐛', label: 'Bug', color: 'bg-red-100 text-red-700' },
    feature: { icon: '✨', label: 'Feature', color: 'bg-purple-100 text-purple-700' },
    melhoria: { icon: '📈', label: 'Melhoria', color: 'bg-blue-100 text-blue-700' },
    epic: { icon: '🎯', label: 'Epic', color: 'bg-indigo-100 text-indigo-700' },
};

/**
 * Avatar stack component
 */
const AvatarStack = ({ users = [], maxVisible = 3 }) => {
    const visibleUsers = users.slice(0, maxVisible);
    const remaining = users.length - maxVisible;

    return (
        <div className="flex -space-x-2">
            {visibleUsers.map((user, idx) => (
                <div
                    key={user.id || idx}
                    className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center"
                    title={user.name}
                >
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-[10px] font-bold text-white">
                            {user.name?.charAt(0)?.toUpperCase()}
                        </span>
                    )}
                </div>
            ))}
            {remaining > 0 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-secondary-200 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-secondary-600">+{remaining}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Due date badge component
 */
const DueDateBadge = ({ dueDate, isCompleted }) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const now = new Date();
    const isOverdue = isPast(date) && !isCompleted;
    const isDueToday = isToday(date);
    const isDueTomorrow = isTomorrow(date);
    const daysRemaining = differenceInDays(date, now);

    let bgColor = 'bg-secondary-100';
    let textColor = 'text-secondary-600';
    let icon = <Calendar size={12} />;
    let label = format(date, 'dd MMM', { locale: ptBR });

    if (isCompleted) {
        bgColor = 'bg-emerald-100';
        textColor = 'text-emerald-700';
        icon = <CheckCircle size={12} />;
    } else if (isOverdue) {
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        icon = <AlertTriangle size={12} />;
        label = 'Atrasado';
    } else if (isDueToday) {
        bgColor = 'bg-amber-100';
        textColor = 'text-amber-700';
        label = 'Hoje';
    } else if (isDueTomorrow) {
        bgColor = 'bg-amber-50';
        textColor = 'text-amber-600';
        label = 'Amanhã';
    } else if (daysRemaining <= 7) {
        bgColor = 'bg-blue-50';
        textColor = 'text-blue-600';
    }

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {icon}
            {label}
        </span>
    );
};

/**
 * KanbanCard Component
 * Enhanced card design with priority bar, progress indicator, and better visuals
 * 
 * @param {Object} props
 * @param {Object} props.card - Card data
 * @param {boolean} props.isDragging - Whether card is being dragged
 * @param {boolean} props.isCompact - Compact view mode
 * @param {function} props.onClick - Click handler
 * @param {function} props.onMenuClick - Menu click handler
 * @param {Object} props.dragHandleProps - Props for drag handle
 */
const KanbanCard = ({
    card,
    isDragging = false,
    isCompact = false,
    onClick,
    onMenuClick,
    onArchive,
    dragHandleProps = {},
}) => {
    const priority = PRIORITIES[card.priority] || PRIORITIES.media;
    const cardType = CARD_TYPES[card.type] || CARD_TYPES.tarefa;
    const isCompleted = card.status === 'concluido' || card.completedAt;
    const isBlocked = card.blockedBy?.length > 0;

    // Parse checklist and calculate progress
    let checklistItems = [];
    let checklistProgress = 0;
    try {
        if (card.checklist) {
            checklistItems = typeof card.checklist === 'string' ? JSON.parse(card.checklist) : card.checklist;
            if (checklistItems.length > 0) {
                const completed = checklistItems.filter(i => i.done).length;
                checklistProgress = Math.round((completed / checklistItems.length) * 100);
            }
        }
    } catch (e) {
        console.error('Error parsing checklist:', e);
    }

    const hasProgress = (typeof card.progress === 'number' && card.progress > 0) || checklistProgress > 0;
    const displayProgress = checklistProgress || card.progress || 0;

    // Collect all assignees
    const assignees = [];
    if (card.assignedUser) assignees.push(card.assignedUser);
    if (card.assignees) assignees.push(...card.assignees);

    return (
        <div
            onClick={onClick}
            className={`
                group relative bg-surface rounded-xl overflow-hidden cursor-pointer
                transition-all duration-200 ease-out
                ${isDragging
                    ? 'shadow-card-drag rotate-2 scale-105 ring-2 ring-primary-300'
                    : 'shadow-card hover:shadow-card-hover'
                }
                ${isCompleted ? 'opacity-75' : ''}
                ${isBlocked ? 'ring-2 ring-red-300 ring-opacity-50' : ''}
            `}
        >
            {/* Priority side bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${priority.color}`} />

            {/* Card content */}
            <div className="pl-4 pr-3 py-3">
                {/* Top row - Type badge, drag handle, menu */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        {/* Type badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${cardType.color}`}>
                            <span>{cardType.icon}</span>
                            {!isCompact && cardType.label}
                        </span>

                        {/* Blocked indicator */}
                        {isBlocked && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                                <AlertTriangle size={12} />
                                Bloqueado
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Drag handle */}
                        <div
                            {...dragHandleProps}
                            className="p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical size={16} />
                        </div>

                        {/* Archive button */}
                        {onArchive && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onArchive(card.id); }}
                                className="p-1 text-secondary-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                                title="Arquivar"
                            >
                                <Archive size={16} />
                            </button>
                        )}

                        {/* Menu button */}
                        {onMenuClick && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMenuClick(card); }}
                                className="p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded"
                            >
                                <MoreHorizontal size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h4 className={`font-semibold text-secondary-800 leading-snug mb-2 ${isCompleted ? 'line-through text-secondary-500' : ''}`}>
                    {card.title}
                </h4>

                {/* Description preview */}
                {!isCompact && card.description && (
                    <p className="text-sm text-secondary-500 line-clamp-2 mb-3">
                        {card.description}
                    </p>
                )}

                {/* Tags */}
                {!isCompact && card.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {card.tags.slice(0, 3).map((tagItem, idx) => {
                            const tag = tagItem.tag || tagItem;
                            return (
                                <span
                                    key={tag.id || idx}
                                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: `${tag.color}20`,
                                        color: tag.color,
                                    }}
                                >
                                    {tag.name}
                                </span>
                            );
                        })}
                        {card.tags.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600">
                                +{card.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Progress bar */}
                {hasProgress && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-secondary-500 mb-1">
                            <span className="flex items-center gap-1">
                                {checklistItems.length > 0 && <CheckSquare size={12} />}
                                {checklistItems.length > 0 ? 'Tarefas' : 'Progresso'}
                            </span>
                            <span className="font-medium">
                                {checklistItems.length > 0
                                    ? `${checklistItems.filter(i => i.done).length}/${checklistItems.length}`
                                    : `${displayProgress}%`
                                }
                            </span>
                        </div>
                        <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${displayProgress >= 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                                style={{ width: `${Math.min(displayProgress, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Bottom row - Due date, counts, assignees */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        {/* Due date */}
                        <DueDateBadge dueDate={card.dueDate} isCompleted={isCompleted} />

                        {/* Story points */}
                        {card.storyPoints && (
                            <span className="px-1.5 py-0.5 bg-secondary-100 rounded text-xs font-bold text-secondary-600">
                                {card.storyPoints} pts
                            </span>
                        )}

                        {/* Counts */}
                        <div className="flex items-center gap-2 text-xs text-secondary-400">
                            {(card._count?.comments || card.comments?.length > 0) && (
                                <span className="flex items-center gap-0.5">
                                    <MessageSquare size={12} />
                                    {card._count?.comments || card.comments?.length}
                                </span>
                            )}
                            {(card._count?.attachments || card.attachments?.length > 0) && (
                                <span className="flex items-center gap-0.5">
                                    <Paperclip size={12} />
                                    {card._count?.attachments || card.attachments?.length}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Assignees */}
                    {assignees.length > 0 && (
                        <AvatarStack users={assignees} maxVisible={3} />
                    )}
                </div>
            </div>

            {/* Completed overlay */}
            {isCompleted && (
                <div className="absolute top-2 right-2">
                    <CheckCircle size={20} className="text-emerald-500" />
                </div>
            )}
        </div>
    );
};

export default KanbanCard;
