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
    // Simplified Priority Colors (Thinner/Subtle)
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
                group relative bg-white rounded-lg cursor-pointer
                transition-all duration-200 ease-out
                border border-gray-200
                ${isDragging
                    ? 'shadow-lg rotate-2 scale-105 ring-2 ring-gray-900 z-50'
                    : 'shadow-sm hover:shadow-md hover:border-gray-300'
                }
                ${isCompleted ? 'opacity-75 bg-gray-50' : ''}
                ${isBlocked ? 'ring-2 ring-red-100' : ''}
            `}
        >
            {/* Priority Indicator - Clean Left Border */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${priority.color} rounded-l-lg`} />

            {/* Card Content */}
            <div className="pl-4 pr-3 py-3">
                {/* Header: Type, Drag, Actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        {/* Type Icon Only for cleaner look, or subtle badge */}
                        <span className="text-lg leading-none" title={cardType.label}>
                            {cardType.icon}
                        </span>

                        {isBlocked && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700">
                                <AlertTriangle size={10} />
                                Bloqueado
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div
                            {...dragHandleProps}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical size={14} />
                        </div>

                        {onArchive && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onArchive(card.id); }}
                                className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                            >
                                <Archive size={14} />
                            </button>
                        )}

                        {onMenuClick && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMenuClick(card); }}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            >
                                <MoreHorizontal size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h4 className={`text-sm font-semibold text-gray-900 leading-snug mb-2 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                    {card.title}
                </h4>

                {/* Tags - Cleaner, smaller */}
                {!isCompact && card.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {card.tags.slice(0, 3).map((tagItem, idx) => {
                            const tag = tagItem.tag || tagItem;
                            // Simplify tag colors to avoid neon clashes, or keep user colors but muted
                            return (
                                <span
                                    key={tag.id || idx}
                                    className="px-2 py-0.5 rounded text-[10px] font-medium border border-transparent"
                                    style={{
                                        backgroundColor: `${tag.color}15`, // 15% opacity
                                        color: tag.color,
                                    }}
                                >
                                    {tag.name}
                                </span>
                            );
                        })}
                        {card.tags.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                                +{card.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Progress - Thinner, gray background */}
                {hasProgress && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                            <span className="flex items-center gap-1">
                                {checklistItems.length > 0 && <CheckSquare size={10} />}
                                {checklistItems.length > 0
                                    ? <span className="uppercase tracking-wider font-semibold">Checklist</span>
                                    : <span className="uppercase tracking-wider font-semibold">Progresso</span>
                                }
                            </span>
                            <span className="font-medium">
                                {checklistItems.length > 0
                                    ? `${checklistItems.filter(i => i.done).length}/${checklistItems.length}`
                                    : `${displayProgress}%`
                                }
                            </span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${displayProgress >= 100 ? 'bg-emerald-500' : 'bg-gray-900'}`}
                                style={{ width: `${Math.min(displayProgress, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                        <DueDateBadge dueDate={card.dueDate} isCompleted={isCompleted} />

                        {card.storyPoints && (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {card.storyPoints} pts
                            </span>
                        )}

                        {/* Counts (Comments/Attachments) */}
                        <div className="flex items-center gap-2 text-gray-400">
                            {(card._count?.comments || card.comments?.length > 0) && (
                                <span className="flex items-center gap-0.5 text-xs">
                                    <MessageSquare size={12} />
                                    <span className="text-[10px]">{card._count?.comments || card.comments?.length}</span>
                                </span>
                            )}
                            {(card._count?.attachments || card.attachments?.length > 0) && (
                                <span className="flex items-center gap-0.5 text-xs">
                                    <Paperclip size={12} />
                                    <span className="text-[10px]">{card._count?.attachments || card.attachments?.length}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Assignees */}
                    {assignees.length > 0 && (
                        <div className="scale-90 origin-right">
                            <AvatarStack users={assignees} maxVisible={3} />
                        </div>
                    )}
                </div>
            </div>

            {/* Completed Icon Overlay */}
            {isCompleted && (
                <div className="absolute top-2 right-2 text-emerald-500/20">
                    <CheckCircle size={40} />
                </div>
            )}
        </div>
    );
};

export default KanbanCard;
