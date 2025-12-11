import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../config/api';
import {
    LayoutDashboard,
    Calendar,
    CheckSquare,
    Clock,
    AlertTriangle,
    TrendingUp,
    Plus,
    FileText,
    Bell,
    ArrowRight
} from 'lucide-react';

const GlobalDashboard = () => {
    const { user } = useApp();
    const { navigateTo } = useNavigation();
    const { info } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState(localStorage.getItem('quick_note') || '');

    useEffect(() => {
        fetchDashboardData();
    }, []);

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

    const handleNoteChange = (e) => {
        setNote(e.target.value);
        localStorage.setItem('quick_note', e.target.value);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!data) return null;

    const { stats, tasks, metrics, recentActivity, upcomingEvents } = data;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">
                        {getGreeting()}, {user?.name.split(' ')[0]}
                    </h1>
                    <p className="text-secondary-500 mt-1">
                        Aqui está o resumo do seu dia. Você tem <strong className="text-primary-600">{stats.dueTodayCount} tarefas</strong> para hoje.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigateTo('projects')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-200 rounded-xl text-secondary-600 hover:bg-secondary-50 transition-colors font-medium shadow-sm"
                    >
                        <Plus size={18} /> Novo Projeto
                    </button>
                    <button
                        // Ideally opens a global create task modal, reusing CardModal logic requires props
                        // For now, simple navigation or placeholder
                        onClick={() => info('Para criar uma tarefa, acesse um projeto específico.', 'Dica')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-sm shadow-primary-600/20"
                    >
                        <Plus size={18} /> Nova Tarefa
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Tarefas Ativas"
                    value={stats.totalActive}
                    icon={CheckSquare}
                    color="primary"
                />
                <KPICard
                    title="Para Hoje"
                    value={stats.dueTodayCount}
                    icon={Clock}
                    color="amber"
                />
                <KPICard
                    title="Atrasadas"
                    value={stats.overdueCount}
                    icon={AlertTriangle}
                    color="red"
                    urgent={stats.overdueCount > 0}
                />
                <KPICard
                    title="Concluídas (7d)"
                    value={stats.completedWeek}
                    icon={TrendingUp}
                    color="emerald"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Alerts Section (Only if Overdue > 0) */}
                    {tasks.overdue.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4 text-red-800">
                                <AlertTriangle className="text-red-600" />
                                <h2 className="font-bold text-lg">Atenção Necessária</h2>
                            </div>
                            <div className="space-y-3">
                                {tasks.overdue.slice(0, 3).map(task => (
                                    <TaskRow key={task.id} task={task} />
                                ))}
                                {tasks.overdue.length > 3 && (
                                    <div className="text-center text-red-600 text-sm font-medium pt-2">
                                        + {tasks.overdue.length - 3} outras tarefas atrasadas
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Unified Task List */}
                    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-lg text-secondary-800 flex items-center gap-2">
                                <CheckSquare className="text-primary-500" /> Minhas Tarefas
                            </h2>
                            <span className="text-xs font-medium px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full">
                                {tasks.all.length} Total
                            </span>
                        </div>

                        {tasks.all.length === 0 ? (
                            <div className="text-center py-12 text-secondary-400">
                                <p>Nenhuma tarefa atribuída a você.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {tasks.all.slice(0, 5).map(task => (
                                    <TaskRow key={task.id} task={task} showProject />
                                ))}
                            </div>
                        )}
                        {tasks.all.length > 5 && (
                            <button className="w-full mt-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors">
                                Ver todas as {tasks.all.length} tarefas
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column (Sidebar Widgets) */}
                <div className="space-y-6">

                    {/* Productivity Chart (Velocity) */}
                    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-secondary-800 mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-500" /> Velocidade
                        </h3>
                        <div className="h-32 flex items-end justify-between gap-2 px-2">
                            {metrics.velocity.map((day) => {
                                const height = day.count > 0 ? `${Math.min(day.count * 15, 100)}%` : '4px';
                                return (
                                    <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group">
                                        <div className="w-full relative">
                                            {/* Bar */}
                                            <div
                                                className={`w-full rounded-t-sm transition-all duration-500 ${day.count > 0 ? 'bg-primary-500 group-hover:bg-primary-600' : 'bg-secondary-100'}`}
                                                style={{ height }}
                                            />
                                            {/* Tooltip */}
                                            {day.count > 0 && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-secondary-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {day.count}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-secondary-400 font-medium">
                                            {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-secondary-400 text-center mt-4">Tarefas concluídas (7 dias)</p>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-secondary-800 mb-4 flex items-center gap-2">
                            <Bell size={18} className="text-amber-500" /> Atividade Recente
                        </h3>
                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-secondary-400">Nenhuma atividade recente.</p>
                            ) : (
                                recentActivity.map(act => (
                                    <div key={act.id} className="flex gap-3 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0" />
                                        <div>
                                            <p className="text-secondary-700 font-medium line-clamp-2">{act.title}</p>
                                            <p className="text-xs text-secondary-400 mt-1">
                                                {new Date(act.createdAt).toLocaleString('pt-BR', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Notes */}
                    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText size={48} className="text-yellow-600" />
                        </div>
                        <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2 relative z-10">
                            Bloco Rápido
                        </h3>
                        <textarea
                            value={note}
                            onChange={handleNoteChange}
                            placeholder="Anote suas ideias aqui..."
                            className="w-full h-32 bg-white/50 border border-yellow-200 rounded-xl p-3 text-sm text-secondary-700 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-none relative z-10"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, icon: Icon, color, urgent }) => {
    const colors = {
        primary: 'bg-primary-50 text-primary-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <div className={`bg-white border ${urgent ? 'border-red-200 bg-red-50/30' : 'border-secondary-200'} rounded-2xl p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
                    <Icon size={20} />
                </div>
                {urgent && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-secondary-500">{title}</h3>
                <p className={`text-2xl font-bold ${urgent ? 'text-red-700' : 'text-secondary-900'}`}>{value}</p>
            </div>
        </div>
    );
};

const TaskRow = ({ task, showProject }) => (
    <div className="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-xl group transition-colors border border-transparent hover:border-secondary-100">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-2 h-8 rounded-full ${getPriorityColor(task.priority)}`} />
            <div className="overflow-hidden">
                <h4 className="text-sm font-medium text-secondary-800 truncate">{task.title}</h4>
                <div className="flex items-center gap-2 text-xs text-secondary-500">
                    {showProject && (
                        <span className="flex items-center gap-1 font-medium text-primary-600">
                            {task.project?.name} •
                        </span>
                    )}
                    <span className={`${isOverdue(task.dueDate) ? 'text-red-500 font-bold' : ''}`}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                    </span>
                </div>
            </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                <ArrowRight size={16} />
            </button>
        </div>
    </div>
);

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'urgente': return 'bg-red-500';
        case 'alta': return 'bg-amber-500';
        case 'media': return 'bg-blue-500';
        case 'baixa': return 'bg-slate-400';
        default: return 'bg-slate-400';
    }
};

const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date().setHours(0, 0, 0, 0);
};

export default GlobalDashboard;
