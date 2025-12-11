import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../config/api';
import {
    Calendar,
    CheckSquare,
    Clock,
    AlertTriangle,
    TrendingUp,
    Plus,
    Play,
    Pause,
    Square,
    ArrowRight,
    MoreVertical,
    Users,
    Folder,
    Timer,
    Activity,
    ChevronRight
} from 'lucide-react';

/**
 * GlobalDashboard - Redesigned with modern UI inspired by project management tools
 * Features: KPI cards with gradients, timeline view, time tracking, activity chart
 */
const GlobalDashboard = () => {
    const { user } = useApp();
    const { navigateTo, setActiveProjectId, setActiveBoardId } = useNavigation();
    const { info } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Time tracking state
    const [isTracking, setIsTracking] = useState(false);
    const [trackingTime, setTrackingTime] = useState(0);
    const [trackingTask, setTrackingTask] = useState('Projeto Atual');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTracking) {
            interval = setInterval(() => {
                setTrackingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTracking]);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard/global');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-text-secondary text-sm">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { stats, tasks, metrics, recentActivity, upcomingEvents } = data;

    return (
        <div className="min-h-full bg-background">
            <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigateTo('projects')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-text-secondary hover:bg-surface-hover hover:border-border transition-all font-medium shadow-sm"
                        >
                            <Folder size={18} /> Projetos
                        </button>
                        <button
                            onClick={() => navigateTo('calendar')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl hover:from-primary-700 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-primary-600/25"
                        >
                            <Plus size={18} /> Nova Tarefa
                        </button>
                    </div>
                </div>

                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <KPICard
                        label="Ações Pendentes"
                        value={stats.totalActive}
                        icon={Clock}
                        gradient="from-blue-500 to-cyan-400"
                        iconBg="bg-blue-500/10"
                        trend="+12%"
                    />
                    <KPICard
                        label="Em Progresso"
                        value={stats.dueTodayCount}
                        icon={Activity}
                        gradient="from-amber-500 to-orange-400"
                        iconBg="bg-amber-500/10"
                    />
                    <KPICard
                        label="Concluídas"
                        value={stats.completedWeek}
                        icon={CheckSquare}
                        gradient="from-emerald-500 to-teal-400"
                        iconBg="bg-emerald-500/10"
                        trend="+8%"
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column - Timeline */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Timeline Card */}
                        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between p-5 border-b border-border">
                                <h2 className="font-bold text-text-primary flex items-center gap-2">
                                    <Calendar size={20} className="text-primary-500" />
                                    Timeline
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 bg-surface-hover text-text-secondary text-sm font-medium rounded-lg hover:bg-border transition-colors">
                                        Hoje
                                    </button>
                                    <button className="p-1.5 hover:bg-surface-hover rounded-lg text-text-secondary">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Timeline Content */}
                            <div className="p-5">
                                {/* Timeline Header */}
                                <div className="flex items-center gap-4 mb-4 text-xs font-medium text-text-secondary pl-[140px]">
                                    {['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'].map(time => (
                                        <span key={time} className="flex-1 text-center">{time}</span>
                                    ))}
                                </div>

                                {/* Timeline Rows */}
                                <div className="space-y-3">
                                    {tasks.all.slice(0, 5).map((task, idx) => (
                                        <TimelineRow
                                            key={task.id}
                                            task={task}
                                            color={getTaskColor(idx)}
                                            onClick={() => {
                                                if (task.board?.projectId) {
                                                    setActiveProjectId(task.board.projectId);
                                                    setActiveBoardId(task.boardId);
                                                    navigateTo('kanban');
                                                }
                                            }}
                                        />
                                    ))}
                                </div>

                                {tasks.all.length === 0 && (
                                    <div className="text-center py-12 text-text-secondary">
                                        <Calendar size={40} className="mx-auto mb-3 opacity-50" />
                                        <p>Nenhuma tarefa para exibir</p>
                                    </div>
                                )}

                                {tasks.all.length > 5 && (
                                    <button
                                        onClick={() => navigateTo('calendar')}
                                        className="w-full mt-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        Ver todos <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Overdue Alert */}
                        {stats.overdueCount > 0 && (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-red-500/10 rounded-xl">
                                        <AlertTriangle size={20} className="text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-red-800">Atenção Necessária</h3>
                                        <p className="text-sm text-red-600">{stats.overdueCount} tarefas atrasadas</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {tasks.overdue.slice(0, 3).map(task => (
                                        <div key={task.id} className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-6 rounded-full bg-red-500" />
                                                <span className="text-sm font-medium text-slate-700">{task.title}</span>
                                            </div>
                                            <span className="text-xs text-red-500 font-medium">
                                                {task.dueDate && new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Widgets */}
                    <div className="space-y-6">

                        {/* Time Tracking Widget */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Timer size={18} className="text-primary-400" />
                                    Tempo Rastreado
                                </h3>
                                <button className="p-1 hover:bg-white/10 rounded">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{trackingTask}</p>
                            <p className="text-4xl font-bold font-mono mb-4">{formatTime(trackingTime)}</p>
                            <div className="flex gap-2">
                                {isTracking ? (
                                    <>
                                        <button
                                            onClick={() => setIsTracking(false)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors"
                                        >
                                            <Square size={16} /> Parar
                                        </button>
                                        <button
                                            onClick={() => setIsTracking(false)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
                                        >
                                            <Pause size={16} /> Pausar
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsTracking(true)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium transition-colors"
                                    >
                                        <Play size={16} /> Iniciar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Today's Meetings */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar size={18} className="text-amber-500" />
                                    Reuniões Hoje
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {upcomingEvents?.slice(0, 3).map((event, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1 h-8 rounded-full ${idx === 0 ? 'bg-primary-500' : idx === 1 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{event.title || 'Reunião'}</p>
                                                <p className="text-xs text-slate-400">
                                                    {event.startAt && new Date(event.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                                                {idx + 1}
                                            </span>
                                        </div>
                                    </div>
                                )) || (
                                        <p className="text-sm text-slate-400 text-center py-4">Nenhuma reunião hoje</p>
                                    )}
                            </div>
                            <button
                                onClick={() => navigateTo('calendar')}
                                className="w-full mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1"
                            >
                                Ver tudo <ArrowRight size={14} />
                            </button>
                        </div>

                        {/* Activity Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Activity size={18} className="text-emerald-500" />
                                    Atividade
                                </h3>
                                <select className="text-xs bg-slate-100 border-0 rounded-lg py-1 px-2 text-slate-600">
                                    <option>Última semana</option>
                                    <option>Este mês</option>
                                </select>
                            </div>
                            <ActivityChart data={metrics?.velocity || []} />
                        </div>

                        {/* Last Actions */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800">Últimas Ações</h3>
                            </div>
                            <div className="space-y-3">
                                {recentActivity.slice(0, 4).map((act, idx) => (
                                    <div key={act.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                            {act.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{act.title}</p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(act.createdAt).toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${act.status === 'concluido' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                            {act.status === 'concluido' ? 'Concluído' : 'Em progresso'}
                                        </span>
                                    </div>
                                ))}
                                {recentActivity.length === 0 && (
                                    <p className="text-sm text-slate-400 text-center py-4">Nenhuma atividade recente</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============ Sub-components ============

const KPICard = ({ label, value, icon: Icon, gradient, iconBg, trend }) => (
    <div className="relative bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
        {/* Gradient accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-slate-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
                {trend && (
                    <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                        <TrendingUp size={12} /> {trend}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${iconBg}`}>
                <Icon size={24} className={`bg-gradient-to-r ${gradient} bg-clip-text`} style={{ color: 'currentColor' }} />
            </div>
        </div>

        {/* Arrow indicator (like in reference) */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={18} className="text-slate-300" />
        </div>
    </div>
);

const TimelineRow = ({ task, color, onClick }) => {
    // Simulate time blocks (in real app, use task.startDate/endDate)
    const startHour = 8 + Math.floor(Math.random() * 4);
    const duration = 2 + Math.floor(Math.random() * 3);
    const leftOffset = ((startHour - 8) / 10) * 100;
    const width = (duration / 10) * 100;

    return (
        <div className="flex items-center gap-4 group cursor-pointer" onClick={onClick}>
            {/* User info */}
            <div className="w-[140px] flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-medium text-slate-600">
                    {task.assignedUser?.name?.slice(0, 2).toUpperCase() || 'TA'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-700 truncate">{task.assignedUser?.name || 'Tarefa'}</p>
                    <p className="text-xs text-slate-400">{task.project?.name?.slice(0, 12) || ''}</p>
                </div>
            </div>

            {/* Timeline bar area */}
            <div className="flex-1 h-10 bg-slate-50 rounded-lg relative overflow-hidden">
                {/* Task block */}
                <div
                    className={`absolute top-1 bottom-1 ${color} rounded-md flex items-center px-2 text-white text-xs font-medium shadow-sm group-hover:shadow-md transition-shadow`}
                    style={{ left: `${leftOffset}%`, width: `${Math.min(width, 100 - leftOffset)}%` }}
                >
                    <span className="truncate">{task.title}</span>
                </div>
            </div>
        </div>
    );
};

const ActivityChart = ({ data }) => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const colors = ['bg-pink-400', 'bg-amber-400', 'bg-cyan-400', 'bg-emerald-400', 'bg-violet-400'];

    return (
        <div className="flex justify-between items-end gap-2 h-24">
            {days.map((day, dayIdx) => {
                const dayData = data[dayIdx] || { count: Math.floor(Math.random() * 5) };
                const bubbles = Math.min(dayData.count || Math.floor(Math.random() * 4), 4);

                return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex flex-col-reverse items-center gap-1 h-16 justify-start">
                            {Array.from({ length: bubbles }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full ${colors[(dayIdx + i) % colors.length]} opacity-80`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{day}</span>
                    </div>
                );
            })}
        </div>
    );
};

const getTaskColor = (index) => {
    const colors = [
        'bg-gradient-to-r from-blue-500 to-cyan-400',
        'bg-gradient-to-r from-amber-500 to-orange-400',
        'bg-gradient-to-r from-emerald-500 to-teal-400',
        'bg-gradient-to-r from-violet-500 to-purple-400',
        'bg-gradient-to-r from-rose-500 to-pink-400'
    ];
    return colors[index % colors.length];
};

export default GlobalDashboard;
