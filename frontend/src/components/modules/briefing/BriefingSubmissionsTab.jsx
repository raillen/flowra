import React, { useState, useEffect } from 'react';
import {
    FileText, ExternalLink, Calendar, Inbox, Eye, Trash2,
    ArrowRight, Edit2, X, Layout, Folder, CreditCard
} from 'lucide-react';
import { listSubmissions, listProjects, listBoards, listColumns } from '../../../services/briefingService';
import { Modal, Button } from '../../ui';
import api from '../../../config/api';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useToast } from '../../../contexts/ToastContext';
import BriefingRenderer from './BriefingRenderer';

export default function BriefingSubmissionsTab() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRedirectModal, setShowRedirectModal] = useState(false);
    const [redirectData, setRedirectData] = useState({ projectId: '', boardId: '', columnId: '' });
    const [projects, setProjects] = useState([]);
    const [boards, setBoards] = useState([]);
    const [columns, setColumns] = useState([]);
    const [deleting, setDeleting] = useState(null);
    const { navigateTo, setActiveProjectId, setActiveBoardId } = useNavigation();
    const { confirm, success, error: showError, warning } = useToast();

    useEffect(() => {
        loadSubmissions();
        loadProjects();
    }, []);

    const loadSubmissions = async () => {
        setLoading(true);
        try {
            const data = await listSubmissions();
            setSubmissions(data);
        } catch (error) {
            console.error("Failed to load submissions", error);
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const data = await listProjects();
            setProjects(data.data || data);
        } catch (e) {
            console.error('Failed to load projects', e);
        }
    };

    const loadBoards = async (projectId) => {
        try {
            const data = await listBoards(projectId);
            setBoards(data.data || data);
        } catch (e) {
            console.error('Failed to load boards', e);
        }
    };

    const loadColumns = async (boardId) => {
        try {
            const data = await listColumns(boardId);
            setColumns(data.data || data);
        } catch (e) {
            console.error('Failed to load columns', e);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleViewDetails = (submission) => {
        setSelectedSubmission(submission);
        setShowDetailsModal(true);
    };

    const handleDelete = async (submission) => {
        const confirmed = await confirm({
            title: 'Excluir Briefing',
            message: `Tem certeza que deseja excluir o card "${submission.title}"?`,
            confirmText: 'Excluir',
            variant: 'danger'
        });
        if (!confirmed) return;

        setDeleting(submission.id);
        try {
            await api.delete(`/cards/${submission.id}`);
            setSubmissions(prev => prev.filter(s => s.id !== submission.id));
            success('Briefing excluído com sucesso');
        } catch (e) {
            console.error('Failed to delete', e);
            showError('Não foi possível excluir o briefing');
        } finally {
            setDeleting(null);
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

    // Parse briefing data
    const parseBriefingData = (data) => {
        if (!data) return {};
        try {
            return typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
            return {};
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Nenhuma resposta recebida</h3>
                <p className="text-gray-500">Quando alguém preencher um formulário público, as respostas aparecerão aqui.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Card</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Destino Atual</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {submissions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <FileText size={16} />
                                        </div>
                                        <span className="font-medium text-gray-800">{sub.briefingTemplate?.name || 'Modelo Excluído'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-gray-700">{sub.title}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-500">
                                        {sub.board?.name} → {sub.column?.title}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar size={14} />
                                        {formatDate(sub.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => handleViewDetails(sub)}
                                            className="text-gray-500 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded"
                                            title="Ver Detalhes"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleNavigateToCard(sub)}
                                            className="text-gray-500 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded"
                                            title="Ir para Card"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenRedirectModal(sub)}
                                            className="text-gray-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded"
                                            title="Redirecionar"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sub)}
                                            disabled={deleting === sub.id}
                                            className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-50 rounded disabled:opacity-50"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => { setShowDetailsModal(false); setSelectedSubmission(null); }}
                title="Detalhes da Resposta"
                maxWidth="max-w-3xl"
            >
                {selectedSubmission && (
                    <div className="space-y-6">
                        {/* Header info */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{selectedSubmission.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        Template: {selectedSubmission.briefingTemplate?.name || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDate(selectedSubmission.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Layout size={14} />
                                    {selectedSubmission.board?.name}
                                </span>
                            </div>
                        </div>

                        {/* Briefing Data */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Respostas do Formulário</h4>
                            <div className="space-y-3 bg-white border border-gray-200 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                                {selectedSubmission.briefingTemplate ? (
                                    <BriefingRenderer
                                        template={selectedSubmission.briefingTemplate}
                                        initialData={parseBriefingData(selectedSubmission.briefingData)}
                                        readOnly={true}
                                    />
                                ) : (
                                    Object.entries(parseBriefingData(selectedSubmission.briefingData)).map(([key, value]) => (
                                        <div key={key} className="border-b border-gray-100 pb-3 last:border-0">
                                            <span className="text-xs font-medium text-gray-500 uppercase">{key}</span>
                                            <p className="text-gray-800 mt-1">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between pt-4 border-t border-gray-100">
                            <Button
                                variant="danger"
                                onClick={() => { handleDelete(selectedSubmission); setShowDetailsModal(false); }}
                            >
                                <Trash2 size={16} className="mr-2" /> Excluir
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => handleNavigateToCard(selectedSubmission)}
                                >
                                    <ExternalLink size={16} className="mr-2" /> Ir para Card
                                </Button>
                                <Button onClick={() => setShowDetailsModal(false)}>
                                    Fechar
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
                title="Redirecionar Briefing"
                maxWidth="max-w-lg"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Mova este card de briefing para outro projeto, board ou coluna.
                    </p>

                    {/* Project */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Folder size={14} className="inline mr-1" /> Projeto
                        </label>
                        <select
                            value={redirectData.projectId}
                            onChange={(e) => {
                                setRedirectData({ projectId: e.target.value, boardId: '', columnId: '' });
                                setColumns([]);
                                if (e.target.value) loadBoards(e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Selecione um projeto</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Board */}
                    {redirectData.projectId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Layout size={14} className="inline mr-1" /> Board
                            </label>
                            <select
                                value={redirectData.boardId}
                                onChange={(e) => {
                                    setRedirectData(prev => ({ ...prev, boardId: e.target.value, columnId: '' }));
                                    if (e.target.value) loadColumns(e.target.value);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Selecione um board</option>
                                {boards.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Column */}
                    {redirectData.boardId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <CreditCard size={14} className="inline mr-1" /> Coluna
                            </label>
                            <select
                                value={redirectData.columnId}
                                onChange={(e) => setRedirectData(prev => ({ ...prev, columnId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Selecione uma coluna</option>
                                {columns.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowRedirectModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleRedirect} disabled={!redirectData.columnId}>
                            <ArrowRight size={16} className="mr-2" /> Redirecionar
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
