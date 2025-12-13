import React, { useState, useEffect } from 'react';
// Analytics View Component
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, Layers } from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';
import * as analyticsService from '../../../services/analyticsService';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

const AnalyticsView = ({ boardId }) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalCards: 0,
        completedCards: 0,
        overdueCards: 0,
        totalEstimatedHours: 0,
        completionRate: 0
    });
    const [workload, setWorkload] = useState([]);
    const [statusDist, setStatusDist] = useState([]);
    const [burndown, setBurndown] = useState([]);

    useEffect(() => {
        if (!boardId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [summaryData, workloadData, statusData, burndownData] = await Promise.all([
                    analyticsService.getBoardSummary(boardId),
                    analyticsService.getMemberWorkload(boardId),
                    analyticsService.getStatusDistribution(boardId),
                    analyticsService.getBurndown(boardId)
                ]);

                setSummary(summaryData);
                setWorkload(workloadData);
                setStatusDist(statusData);
                setBurndown(burndownData);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [boardId]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6 bg-slate-50">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Analytics & Workload</h2>
                <p className="text-slate-500">Visão geral de desempenho e distribuição do time.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total de Cards"
                    value={summary.totalCards}
                    subtext=""
                    icon={Layers}
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Taxa de Conclusão"
                    value={`${summary.completionRate}%`}
                    subtext={`${summary.completedCards} de ${summary.totalCards} concluídos`}
                    icon={CheckCircle}
                    color="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Horas Estimadas"
                    value={`${summary.totalEstimatedHours}h`}
                    subtext="Total planejado"
                    icon={Clock}
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Em Atraso"
                    value={summary.overdueCards}
                    subtext="Requer atenção"
                    icon={AlertCircle}
                    color="bg-red-100 text-red-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Distribuição de Status */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-slate-500" /> Distribuição de Status
                    </h3>
                    <div className="h-[300px]">
                        {statusDist.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDist}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">Sem dados</div>
                        )}
                    </div>
                </div>

                {/* Workload por Membro */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-slate-500" /> Workload por Membro
                    </h3>
                    <div className="h-[300px]">
                        {workload.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workload} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="tasks" name="Tarefas Ativas" fill="#3b82f6" stackId="a" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="overdue" name="Em Atraso" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">Sem membros com tarefas</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Burndown Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-slate-500" /> Burndown (Progresso)
                </h3>
                <div className="h-[350px]">
                    {burndown.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={burndown}>
                                <defs>
                                    <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="remaining" name="Trabalho Restante" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRemaining)" />
                                <Line type="monotone" dataKey="ideal" name="Linha Ideal" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">Dados insuficientes para Burndown</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Icon component wrapper
const PieChartIcon = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
);

export default AnalyticsView;
