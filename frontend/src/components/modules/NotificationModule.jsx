import React, { useState } from 'react';
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Filter,
    Search,
    Calendar,
    MessageSquare,
    Briefcase,
    AlertCircle,
    Info,
    Clock
} from 'lucide-react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationModule = () => {
    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotificationContext();

    const [filter, setFilter] = useState('all'); // all, unread, mention, system
    const [searchTerm, setSearchTerm] = useState('');

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        // Text search
        const matchesSearch =
            notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (notification.message || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Type filter
        switch (filter) {
            case 'unread':
                return !notification.read;
            case 'mention':
                return notification.type === 'mention' || notification.type === 'assigned';
            case 'system':
                return notification.type === 'system';
            default:
                return true;
        }
    });

    const getIcon = (type, priority) => {
        if (type.includes('card_overdue') || priority === 'urgent') return <AlertCircle className="text-red-500" />;
        if (type.includes('event')) return <Calendar className="text-orange-500" />;
        if (type === 'mention' || type === 'chat') return <MessageSquare className="text-blue-500" />;
        if (type === 'assigned' || type === 'project') return <Briefcase className="text-purple-500" />;
        return <Info className="text-gray-500" />;
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            urgent: 'bg-red-100 text-red-700 border-red-200',
            high: 'bg-orange-100 text-orange-700 border-orange-200',
            normal: 'bg-blue-100 text-blue-700 border-blue-200',
            low: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        const labels = {
            urgent: 'Urgente',
            high: 'Alta',
            normal: 'Normal',
            low: 'Baixa',
        };

        return (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${styles[priority] || styles.normal}`}>
                {labels[priority] || 'Normal'}
            </span>
        );
    };

    return (
        <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                        <Bell className="text-primary-600" />
                        Central de Notificações
                    </h1>
                    <p className="text-secondary-500 mt-1">
                        Gerencie seus alertas e fique por dentro do que acontece.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => markAllAsRead()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-200 text-secondary-700 rounded-xl hover:bg-secondary-50 transition-colors shadow-sm"
                    >
                        <CheckCheck size={18} />
                        <span className="hidden sm:inline">Marcar todas como lidas</span>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-secondary-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary-50 text-primary-700' : 'text-secondary-600 hover:bg-secondary-50'}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-primary-50 text-primary-700' : 'text-secondary-600 hover:bg-secondary-50'}`}
                    >
                        Não lidas
                    </button>
                    <button
                        onClick={() => setFilter('mention')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'mention' ? 'bg-primary-50 text-primary-700' : 'text-secondary-600 hover:bg-secondary-50'}`}
                    >
                        Menções
                    </button>
                    <button
                        onClick={() => setFilter('system')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'system' ? 'bg-primary-50 text-primary-700' : 'text-secondary-600 hover:bg-secondary-50'}`}
                    >
                        Sistema
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar notificações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 flex-1 overflow-hidden flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-secondary-400 p-8">
                        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-secondary-900">Sem notificações</h3>
                        <p className="text-sm mt-1">Nenhuma notificação encontrada com os filtros atuais.</p>
                        {filter !== 'all' && (
                            <button
                                onClick={() => { setFilter('all'); setSearchTerm(''); }}
                                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-secondary-100 overflow-y-auto">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-secondary-50 transition-colors group flex gap-4 ${!notification.read ? 'bg-primary-50/20' : ''}`}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notification.read ? 'bg-white shadow-sm border border-secondary-100' : 'bg-secondary-100'}`}>
                                    {getIcon(notification.type, notification.priority)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`text-sm ${!notification.read ? 'font-bold text-secondary-900' : 'font-medium text-secondary-700'}`}>
                                                {notification.title}
                                            </h4>
                                            {getPriorityBadge(notification.priority || 'normal')}
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <span className="text-xs text-secondary-400 flex items-center gap-1 shrink-0" title={format(new Date(notification.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}>
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>

                                    <p className="text-sm text-secondary-600 leading-relaxed">
                                        {notification.message || notification.content}
                                    </p>

                                    {notification.link && (
                                        <a href={notification.link} className="inline-flex items-center text-xs font-semibold text-primary-600 mt-2 hover:underline">
                                            Ver detalhes →
                                        </a>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            title="Marcar como lida"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationModule;
