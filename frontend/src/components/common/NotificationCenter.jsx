import React, { useState, useRef, useEffect } from 'react';
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Trash2,
    Clock,
    AlertCircle,
    AlertTriangle,
    CreditCard,
    Calendar,
    FileText,
    MessageCircle,
    UserPlus,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigation } from '../../contexts/NavigationContext';

/**
 * NotificationCenter Component
 * Dropdown with notifications, bell icon with badge
 * 
 * @module components/common/NotificationCenter
 */
const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const dropdownRef = useRef(null);
    const {
        notifications,
        unreadCount,
        loading,
        permission,
        requestPermission,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();
    const { navigateTo, setActiveBoardId, setActiveProjectId } = useNavigation();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle notification click
    const handleClick = (notification) => {
        markAsRead(notification.id);

        if (notification.refType === 'card') {
            navigateTo('kanban');
        } else if (notification.refType === 'note') {
            navigateTo('notes');
        } else if (notification.refType === 'event') {
            navigateTo('calendar');
        }

        setIsOpen(false);
    };

    // Get icon for notification type
    const getIcon = (type) => {
        const icons = {
            card_overdue: AlertCircle,
            card_due_today: AlertTriangle,
            card_due_tomorrow: Clock,
            event_soon: Calendar,
            mention: MessageCircle,
            assigned: UserPlus,
            note: FileText,
        };
        return icons[type] || Bell;
    };

    // Get color for priority
    const getPriorityColor = (priority) => {
        const colors = {
            urgent: 'text-red-600 bg-red-50',
            high: 'text-orange-600 bg-orange-50',
            normal: 'text-primary-600 bg-primary-50',
            low: 'text-secondary-600 bg-secondary-50',
        };
        return colors[priority] || colors.normal;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 text-secondary-500 hover:text-primary-600 bg-white hover:bg-primary-50 border border-secondary-200 rounded-xl transition-all relative ${isOpen ? 'bg-primary-50 text-primary-600' : ''
                    }`}
            >
                <Bell size={18} />

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full px-1 animate-bounce-in">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-secondary-200 overflow-hidden z-50 animate-fade-in-down">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-secondary-100 flex items-center justify-between bg-secondary-50">
                        <h3 className="font-semibold text-secondary-800">Notificações</h3>
                        <div className="flex items-center gap-2">
                            {/* Sound toggle */}
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className="p-1.5 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-200 rounded-lg transition-colors"
                                title={soundEnabled ? 'Desativar som' : 'Ativar som'}
                            >
                                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            </button>

                            {/* Mark all as read */}
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="p-1.5 text-secondary-400 hover:text-primary-600 hover:bg-secondary-200 rounded-lg transition-colors"
                                    title="Marcar todas como lidas"
                                >
                                    <CheckCheck size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Browser notification permission prompt */}
                    {permission === 'default' && (
                        <div className="px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
                            <p className="text-sm text-primary-700">Ativar notificações do navegador?</p>
                            <button
                                onClick={requestPermission}
                                className="text-sm font-medium text-primary-600 hover:text-primary-800"
                            >
                                Ativar
                            </button>
                        </div>
                    )}

                    {/* Notifications list */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-secondary-500">
                                <Bell size={32} className="mx-auto text-secondary-300 mb-3" />
                                <p>Nenhuma notificação</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => {
                                    const Icon = getIcon(notification.type);
                                    const priorityColors = getPriorityColor(notification.priority);

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`px-4 py-3 border-b border-secondary-100 hover:bg-secondary-50 transition-colors cursor-pointer ${!notification.read ? 'bg-primary-50/30' : ''
                                                }`}
                                            onClick={() => handleClick(notification)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${priorityColors}`}>
                                                    <Icon size={16} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm text-secondary-800">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-secondary-600 truncate">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-secondary-400 mt-1">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="p-1 text-secondary-400 hover:text-primary-600 hover:bg-secondary-100 rounded transition-colors"
                                                            title="Marcar como lida"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-secondary-100 bg-secondary-50 text-center">
                            <button
                                onClick={() => {
                                    navigateTo('notifications');
                                    setIsOpen(false);
                                }}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Ver todas
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Format time ago
 */
const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString('pt-BR');
};

export default NotificationCenter;
