import React, { useState, useEffect } from 'react';
import { Search, History, Clock, User, FileText, ChevronLeft, ChevronRight, Activity, Filter } from 'lucide-react';
import { Badge, Spinner } from '../../../ui';

const AuditLogsTab = ({ accentColor }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [filters, setFilters] = useState({ action: '', entityType: '', userId: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Build query
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit
            });
            if (filters.action) params.append('action', filters.action);
            if (filters.entityType) params.append('entityType', filters.entityType);

            // Fetch
            // Fetch
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/api/audit-logs?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.data) {
                setLogs(data.data);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'create': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'update': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'delete': return 'bg-red-100 text-red-700 border-red-200';
            case 'login': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getActionLabel = (action) => {
        const labels = {
            create: 'Criação',
            update: 'Edição',
            delete: 'Exclusão',
            move: 'Movimentação',
            login: 'Acesso',
            attach: 'Anexo',
            download: 'Download'
        };
        return labels[action] || action;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <History className="text-indigo-500" /> Log de Auditoria
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Rastreamento completo de atividades no sistema</p>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center flex-1">
                    {/* Search input removed as requested */}

                    <select
                        className="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer"
                        value={filters.action}
                        onChange={e => setFilters(prev => ({ ...prev, action: e.target.value, page: 1 }))}
                    >
                        <option value="">Todas Ações</option>
                        <option value="create">Criação</option>
                        <option value="update">Edição</option>
                        <option value="delete">Exclusão</option>
                        <option value="move">Movimentação</option>
                        <option value="login">Login</option>
                    </select>

                    <select
                        className="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer"
                        value={filters.entityType}
                        onChange={e => setFilters(prev => ({ ...prev, entityType: e.target.value, page: 1 }))}
                    >
                        <option value="">Todos Tipos</option>
                        <option value="card">Cards</option>
                        <option value="board">Boards</option>
                        <option value="project">Projetos</option>
                        <option value="user">Usuários</option>
                        <option value="permission">Permissões</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Activity size={16} />
                    <span>{pagination.total} registros encontrados</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Spinner size="lg" color={accentColor} />
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="text-left p-4">Ação</th>
                                <th className="text-left p-4">Entidade</th>
                                <th className="text-left p-4">Detalhes</th>
                                <th className="text-left p-4">Usuário</th>
                                <th className="text-right p-4">Data/Hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                                            {getActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                                                {log.entityType}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {/* Simplified details view */}
                                        <div className="max-w-md truncate text-slate-600 dark:text-slate-400" title={log.entityTitle}>
                                            {log.entityTitle ? (
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{log.entityTitle}</span>
                                            ) : (
                                                <span className="italic">ID: {log.entityId}</span>
                                            )}
                                            {log.changes && <span className="text-xs ml-2 text-slate-400">(ver alterações)</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold">
                                                {(log.userName || 'U').substring(0, 1).toUpperCase()}
                                            </div>
                                            <span className="text-slate-700 dark:text-slate-300">{log.userName || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right tabular-nums text-slate-500">
                                        <div className="flex items-center justify-end gap-2">
                                            <Clock size={14} />
                                            {formatDate(log.createdAt)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-2">
                <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={20} className="text-slate-500" />
                </button>
                <span className="text-sm text-slate-500 font-medium">Página {pagination.page} de {pagination.pages}</span>
                <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={20} className="text-slate-500" />
                </button>
            </div>
        </div>
    );
};

export default AuditLogsTab;
