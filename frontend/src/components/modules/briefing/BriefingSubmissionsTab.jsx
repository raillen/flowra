/**
 * Briefing Submissions Tab (Enhanced)
 * Shows all submitted briefings with filters, actions, and improved UI
 * 
 * @module briefing/BriefingSubmissionsTab
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText, ExternalLink, Calendar, Inbox, Eye, Trash2,
    ArrowRight, X, Layout, Folder, CreditCard, Search,
    Filter, Download, CheckSquare, Square, MoreVertical,
    Clock, User, Tag, ChevronDown, RefreshCw, Archive,
    Copy, Printer, Share2, CheckCircle, AlertCircle, Clock3
} from 'lucide-react';
import { listSubmissions, listProjects, listBoards, listColumns } from '../../../services/briefingService';
import { Modal, Button, BaseInput, BaseSelect } from '../../ui';
import api from '../../../config/api';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useToast } from '../../../contexts/ToastContext';
import BriefingRenderer from './BriefingRenderer';

// Status configuration
const STATUS_CONFIG = {
    pending: { label: 'Pendente', color: 'yellow', icon: Clock3 },
    in_progress: { label: 'Em Andamento', color: 'blue', icon: RefreshCw },
    completed: { label: 'Concluído', color: 'green', icon: CheckCircle },
    archived: { label: 'Arquivado', color: 'gray', icon: Archive }
};

export default function BriefingSubmissionsTab() {
    // State
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRedirectModal, setShowRedirectModal] = useState(false);
    const [redirectData, setRedirectData] = useState({ projectId: '', boardId: '', columnId: '' });
    const [projects, setProjects] = useState([]);
    const [boards, setBoards] = useState([]);
    const [columns, setColumns] = useState([]);
    const [deleting, setDeleting] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTemplate, setFilterTemplate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const { navigateTo, setActiveProjectId, setActiveBoardId } = useNavigation();
    const { confirm, success, error: showError, warning, info } = useToast();

    // Load data
    useEffect(() => {
        loadSubmissions();
        loadProjects();
    }, []);

    const loadSubmissions = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const data = await listSubmissions();
            setSubmissions(data || []);
        } catch (error) {
            console.error("Failed to load submissions", error);
            showError('Erro ao carregar respostas');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadProjects = async () => {
        try {
            const data = await listProjects();
            const projectsData = data.data || data;
            setProjects(Array.isArray(projectsData) ? projectsData : []);
        } catch (e) {
            console.error('Failed to load projects', e);
        }
    };

    const loadBoards = async (projectId) => {
        try {
            const data = await listBoards(projectId);
            const boardsData = data.data || data;
            setBoards(Array.isArray(boardsData) ? boardsData : []);
        } catch (e) {
            console.error('Failed to load boards', e);
        }
    };

    const loadColumns = async (boardId) => {
        try {
            const data = await listColumns(boardId);
            const columnsData = data.data || data;
            setColumns(Array.isArray(columnsData) ? columnsData : []);
        } catch (e) {
            console.error('Failed to load columns', e);
        }
    };

    // Get unique templates for filter
    const uniqueTemplates = useMemo(() => {
        const templates = new Map();
        submissions.forEach(sub => {
            if (sub.briefingTemplate) {
                templates.set(sub.briefingTemplate.id, sub.briefingTemplate.name);
            }
        });
        return Array.from(templates, ([id, name]) => ({ id, name }));
    }, [submissions]);

    // Filtered submissions
    const filteredSubmissions = useMemo(() => {
        return submissions.filter(sub => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matches =
                    sub.title?.toLowerCase().includes(query) ||
                    sub.briefingTemplate?.name?.toLowerCase().includes(query) ||
                    sub.board?.name?.toLowerCase().includes(query);
                if (!matches) return false;
            }

            // Template filter
            if (filterTemplate && sub.briefingTemplate?.id !== filterTemplate) {
                return false;
            }

            // Status filter (based on column position or custom status)
            if (filterStatus) {
                const cardStatus = getCardStatus(sub);
                if (cardStatus !== filterStatus) return false;
            }

            return true;
        });
    }, [submissions, searchQuery, filterTemplate, filterStatus]);

    // Helpers
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;
        return formatDate(dateString);
    };

    const getCardStatus = (sub) => {
        // Determine status based on column or custom field
        if (sub.isArchived) return 'archived';
        if (sub.column?.title?.toLowerCase().includes('conclu')) return 'completed';
        if (sub.column?.title?.toLowerCase().includes('andamento') ||
            sub.column?.title?.toLowerCase().includes('doing')) return 'in_progress';
        return 'pending';
    };

    const parseBriefingData = (data) => {
        if (!data) return {};
        try {
            return typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
            return {};
        }
    };

    // Actions
    const handleViewDetails = (submission) => {
        setSelectedSubmission(submission);
        setShowDetailsModal(true);
    };

    const handleDelete = async (submission) => {
        const confirmed = await confirm({
            title: 'Excluir Briefing',
            message: `Tem certeza que deseja excluir "${submission.title}"? Esta ação não pode ser desfeita.`,
            confirmText: 'Excluir',
            variant: 'danger'
        });
        if (!confirmed) return;

        setDeleting(submission.id);
        try {
            await api.delete(`/cards/${submission.id}`);
            setSubmissions(prev => prev.filter(s => s.id !== submission.id));
            setSelectedIds(prev => prev.filter(id => id !== submission.id));
            success('Briefing excluído com sucesso');
        } catch (e) {
            console.error('Failed to delete', e);
            showError('Não foi possível excluir o briefing');
        } finally {
            setDeleting(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const confirmed = await confirm({
            title: 'Excluir Múltiplos',
            message: `Excluir ${selectedIds.length} briefing(s) selecionado(s)? Esta ação não pode ser desfeita.`,
            confirmText: 'Excluir Todos',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/cards/${id}`)));
            setSubmissions(prev => prev.filter(s => !selectedIds.includes(s.id)));
            setSelectedIds([]);
            success(`${selectedIds.length} briefings excluídos`);
        } catch (e) {
            showError('Erro ao excluir alguns briefings');
        }
    };

    const handleNavigateToCard = (submission) => {
        setActiveProjectId(submission.board?.projectId);
        setActiveBoardId(submission.boardId);
        navigateTo('kanban');
    };

    const handleOpenRedirectModal = (submission) => {
        setSelectedSubmission(submission);
        setRedirectData({ projectId: '', boardId: '', columnId: '' });
        setBoards([]);
        setColumns([]);
        setShowRedirectModal(true);
    };

    const handleRedirect = async () => {
        if (!redirectData.columnId) {
            warning('Selecione projeto, board e coluna');
            return;
        }

        try {
            await api.put(`/cards/${selectedSubmission.id}`, {
                boardId: redirectData.boardId,
                columnId: redirectData.columnId
            });

            loadSubmissions();
            setShowRedirectModal(false);
            setSelectedSubmission(null);
            success('Briefing redirecionado com sucesso');
        } catch (e) {
            console.error('Failed to redirect', e);
            showError('Não foi possível redirecionar');
        }
    };

    const handleExport = (format = 'json') => {
        const dataToExport = selectedIds.length > 0
            ? submissions.filter(s => selectedIds.includes(s.id))
            : filteredSubmissions;

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `briefings_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            // CSV export
            const headers = ['ID', 'Título', 'Template', 'Board', 'Coluna', 'Data'];
            const rows = dataToExport.map(s => [
                s.id,
                s.title,
                s.briefingTemplate?.name || '',
                s.board?.name || '',
                s.column?.title || '',
                formatDate(s.createdAt)
            ]);
            const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `briefings_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }

        info(`Exportado ${dataToExport.length} registro(s)`);
    };

    const handleCopyToClipboard = (submission) => {
        const data = parseBriefingData(submission.briefingData);
        const text = Object.entries(data)
            .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
            .join('\n');
        navigator.clipboard.writeText(text);
        info('Dados copiados!');
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredSubmissions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSubmissions.map(s => s.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    // Render status badge
    const renderStatusBadge = (submission) => {
        const status = getCardStatus(submission);
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;

        const colorClasses = {
            yellow: 'bg-yellow-100 text-yellow-700',
            blue: 'bg-blue-100 text-blue-700',
            green: 'bg-green-100 text-green-700',
            gray: 'bg-gray-100 text-gray-600'
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    // Empty state
    if (submissions.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gradient-to-b from-gray-50 to-white">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Inbox size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma resposta recebida</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    Quando alguém preencher um formulário público ou interno,
                    as respostas aparecerão aqui para você gerenciar.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Toolbar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-4">
                    {/* Search - Using BaseInput structure manually for icon placement or using BaseInput with leftIcon */}
                    <div className="relative flex-1 max-w-md">
                        <BaseInput
                            leftIcon={Search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por título, template ou board..."
                            rightIcon={searchQuery ? X : null}
                        // Using a little hack to make the right icon clickable for clearing
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm font-medium ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Filter size={16} />
                        Filtros
                        {(filterTemplate || filterStatus) && (
                            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                        )}
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={() => loadSubmissions(true)}
                        disabled={refreshing}
                        className="p-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    </button>

                    {/* Export */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                            <Download size={16} />
                            Exportar
                            <ChevronDown size={14} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-40">
                            <button
                                onClick={() => handleExport('json')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 first:rounded-t-lg"
                            >
                                Exportar JSON
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-700 last:rounded-b-lg"
                            >
                                Exportar CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expanded filters */}
                {showFilters && (
                    <div className="flex items-end gap-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                        <div className="flex-1">
                            <BaseSelect
                                label="Template"
                                value={filterTemplate}
                                onChange={(e) => setFilterTemplate(e.target.value)}
                            >
                                <option value="">Todos os templates</option>
                                {uniqueTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </BaseSelect>
                        </div>
                        <div className="flex-1">
                            <BaseSelect
                                label="Status"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Todos os status</option>
                                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </BaseSelect>
                        </div>
                        <div className="pb-0.5">
                            <button
                                onClick={() => { setFilterTemplate(''); setFilterStatus(''); }}
                                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk actions bar */}
            {selectedIds.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4 flex items-center justify-between animate-in slide-in-from-top-2 shadow-sm">
                    <span className="text-sm text-indigo-700 font-medium pl-2">
                        {selectedIds.length} item(s) selecionado(s)
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="bg-white hover:bg-gray-50 border-indigo-200 text-indigo-700">
                            <Download size={14} className="mr-1" /> Exportar
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                            <Trash2 size={14} className="mr-1" /> Excluir
                        </Button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-md transition-colors ml-2"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Results count */}
            <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-sm text-gray-500">
                    Mostrando <strong>{filteredSubmissions.length}</strong> de {submissions.length} resposta(s)
                </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50/80 border-b border-gray-200">
                        <tr>
                            <th className="w-12 px-4 py-3 text-center">
                                <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded transition-colors">
                                    {selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0 ? (
                                        <CheckSquare size={18} className="text-indigo-600" />
                                    ) : (
                                        <Square size={18} className="text-gray-400" />
                                    )}
                                </button>
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modelo / Título</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Destino</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSubmissions.map((sub) => (
                            <tr
                                key={sub.id}
                                className={`hover:bg-gray-50/80 transition-colors group ${selectedIds.includes(sub.id) ? 'bg-indigo-50/30' : ''}`}
                            >
                                <td className="px-4 py-4 text-center">
                                    <button
                                        onClick={() => toggleSelect(sub.id)}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        {selectedIds.includes(sub.id) ? (
                                            <CheckSquare size={18} className="text-indigo-600" />
                                        ) : (
                                            <Square size={18} className="text-gray-400 opacity-50 group-hover:opacity-100" />
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                            <FileText size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-900 truncate max-w-[200px]">{sub.title}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {sub.briefingTemplate?.name || 'Modelo removido'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <div className="text-gray-700 font-medium">{sub.board?.name || '—'}</div>
                                        <div className="text-xs text-gray-400">{sub.column?.title || ''}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {renderStatusBadge(sub)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 flex flex-col">
                                        <span>{formatDate(sub.createdAt).split(' ')[0]}</span>
                                        <span className="text-xs text-gray-400">{formatDate(sub.createdAt).split(' ')[1]}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleViewDetails(sub)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Ver Detalhes"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleNavigateToCard(sub)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Ir para Card"
                                        >
                                            <ExternalLink size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleCopyToClipboard(sub)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Copiar Dados"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenRedirectModal(sub)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Redirecionar"
                                        >
                                            <ArrowRight size={18} />
                                        </button>
                                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                        <button
                                            onClick={() => handleDelete(sub)}
                                            disabled={deleting === sub.id}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* No results */}
                {filteredSubmissions.length === 0 && (
                    <div className="text-center py-16 text-gray-400 bg-gray-50/30">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum resultado encontrado</h3>
                        <p className="text-sm">Tente ajustar seus filtros ou buscar por outro termo.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setFilterTemplate(''); setFilterStatus(''); }}
                            className="mt-4 text-indigo-600 hover:underline text-sm font-medium"
                        >
                            Limpar busca e filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Details Modal - Enhanced */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => { setShowDetailsModal(false); setSelectedSubmission(null); }}
                title={null}
                maxWidth="max-w-4xl"
                noPadding
            >
                {selectedSubmission && (
                    <div className="h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="bg-white border-b border-gray-100 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedSubmission.title}</h2>
                                        <p className="text-gray-500 text-sm">
                                            Template: {selectedSubmission.briefingTemplate?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-6 mt-6 text-sm text-gray-600">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                    <Calendar size={14} className="text-gray-400" />
                                    {formatDate(selectedSubmission.createdAt)}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                    <Layout size={14} className="text-gray-400" />
                                    {selectedSubmission.board?.name} <span className="text-gray-300">/</span> {selectedSubmission.column?.title}
                                </span>
                                {renderStatusBadge(selectedSubmission)}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText size={18} className="text-indigo-600" />
                                        Respostas do Briefing
                                    </h4>
                                    <div className="text-xs text-gray-400 uppercase font-medium tracking-wider">
                                        Somente Leitura
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                                    {selectedSubmission.briefingTemplate ? (
                                        <BriefingRenderer
                                            template={selectedSubmission.briefingTemplate}
                                            initialData={parseBriefingData(selectedSubmission.briefingData)}
                                            readOnly={true}
                                        />
                                    ) : (
                                        <div className="space-y-6">
                                            {Object.entries(parseBriefingData(selectedSubmission.briefingData)).map(([key, value]) => (
                                                <div key={key} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">{key}</span>
                                                    <div className="text-gray-900 text-base leading-relaxed p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                        {typeof value === 'object' ? <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre> : String(value)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
                            <div className="flex gap-2">
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => { handleDelete(selectedSubmission); setShowDetailsModal(false); }}
                                    className="text-red-600 bg-red-50 hover:bg-red-100 border-red-100"
                                >
                                    <Trash2 size={14} className="mr-1" /> Excluir
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyToClipboard(selectedSubmission)}
                                >
                                    <Copy size={14} className="mr-1" /> Copiar Dados
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { handleOpenRedirectModal(selectedSubmission); setShowDetailsModal(false); }}
                                >
                                    <ArrowRight size={14} className="mr-1" /> Mover
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleNavigateToCard(selectedSubmission)}
                                    className="shadow-md shadow-indigo-100"
                                >
                                    <ExternalLink size={14} className="mr-1" /> Ver no Kanban
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Redirect Modal */}
            <Modal
                isOpen={showRedirectModal}
                onClose={() => { setShowRedirectModal(false); setSelectedSubmission(null); }}
                title="Mover Briefing"
                maxWidth="max-w-lg"
            >
                <div className="space-y-5 py-2">
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2">
                        <InfoIcon className="text-blue-500 shrink-0 mt-0.5" size={16} />
                        Mova este card para outro quadro e coluna. O histórico de atividades será preservado.
                    </p>

                    {/* Project */}
                    <div>
                        <BaseSelect
                            label="Projeto"
                            leftIcon={Folder}
                            value={redirectData.projectId}
                            onChange={(e) => {
                                setRedirectData({ projectId: e.target.value, boardId: '', columnId: '' });
                                setColumns([]);
                                if (e.target.value) loadBoards(e.target.value);
                            }}
                        >
                            <option value="">Selecione um projeto</option>
                            {Array.isArray(projects) && projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </BaseSelect>
                    </div>

                    {/* Board */}
                    {redirectData.projectId && (
                        <div className="animate-in slide-in-from-top-2">
                            <BaseSelect
                                label="Quadro (Board)"
                                leftIcon={Layout}
                                value={redirectData.boardId}
                                onChange={(e) => {
                                    setRedirectData(prev => ({ ...prev, boardId: e.target.value, columnId: '' }));
                                    if (e.target.value) loadColumns(e.target.value);
                                }}
                            >
                                <option value="">Selecione um board</option>
                                {Array.isArray(boards) && boards.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </BaseSelect>
                        </div>
                    )}

                    {/* Column */}
                    {redirectData.boardId && (
                        <div className="animate-in slide-in-from-top-2">
                            <BaseSelect
                                label="Coluna (Status)"
                                leftIcon={CheckSquare}
                                value={redirectData.columnId}
                                onChange={(e) => setRedirectData(prev => ({ ...prev, columnId: e.target.value }))}
                            >
                                <option value="">Selecione uma coluna</option>
                                {Array.isArray(columns) && columns.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </BaseSelect>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 gap-2">
                        <Button variant="outline" onClick={() => setShowRedirectModal(false)}>Cancelar</Button>
                        <Button
                            onClick={handleRedirect}
                            disabled={!redirectData.columnId}
                        >
                            Confirmar Movimentação
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

// Missing InfoIcon helper
const InfoIcon = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);
