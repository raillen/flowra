import React, { useState, useEffect } from 'react';
import { Plus, FileText, Copy, Inbox, Grid, List, Trash2, Edit2, ExternalLink, Calendar, Eye, Layers } from 'lucide-react';
import { Button, Modal } from '../../ui';
import TemplateBuilder from '../briefing/TemplateBuilder';
import BriefingSubmissionsTab from '../briefing/BriefingSubmissionsTab';
import PreviewModal from '../briefing/PreviewModal';
import TemplateGallery from '../briefing/TemplateGallery';
import { listTemplates, createTemplate, updateTemplate } from '../../../services/briefingService';
import api from '../../../config/api';
import { useToast } from '../../../contexts/ToastContext';

export default function BriefingTemplatesView() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [newTemplateData, setNewTemplateData] = useState({ name: 'Novo Formulário', fields: [], isPublic: false });
    const [activeTab, setActiveTab] = useState('modelos');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [deleting, setDeleting] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const { confirm, success, error: showError, info } = useToast();

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const data = await listTemplates();
            setTemplates(data);
        } catch (error) {
            console.error("Failed to load templates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setCurrentTemplate(null);
        setNewTemplateData({ name: 'Novo Formulário', description: '', fields: [], isPublic: false, defaultBoardId: null, defaultColumnId: null, projectId: null });
        setIsBuilderOpen(true);
    };

    const handleUseTemplate = (fields) => {
        setCurrentTemplate(null);
        setNewTemplateData({
            name: 'Novo Formulário',
            description: '',
            fields: fields,
            isPublic: false,
            defaultBoardId: null,
            defaultColumnId: null,
            projectId: null
        });
        setIsBuilderOpen(true);
    };

    const handleSave = async () => {
        try {
            if (currentTemplate) {
                await updateTemplate(currentTemplate.id, newTemplateData);
                success('Modelo atualizado com sucesso');
            } else {
                await createTemplate(newTemplateData);
                success('Modelo criado com sucesso');
            }
            setIsBuilderOpen(false);
            loadTemplates();
        } catch (e) {
            console.error("Save failed", e);
            showError('Não foi possível salvar o modelo');
        }
    };

    const handleEdit = (template, e) => {
        if (e) e.stopPropagation();

        let fields = [];
        try {
            fields = typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields;
        } catch (e) {
            console.error("Error parsing fields", e);
        }

        setCurrentTemplate(template);
        setNewTemplateData({
            name: template.name,
            description: template.description,
            fields: fields || [],
            isPublic: template.isPublic,
            defaultBoardId: template.defaultBoardId,
            defaultColumnId: template.defaultColumnId,
            projectId: template.projectId
        });
        setIsBuilderOpen(true);
    };

    const handleDelete = async (template, e) => {
        if (e) e.stopPropagation();

        const confirmed = await confirm({
            title: 'Excluir Modelo',
            message: `Excluir o modelo "${template.name}"? Isso não afetará briefings já submetidos.`,
            confirmText: 'Excluir',
            variant: 'danger'
        });
        if (!confirmed) return;

        setDeleting(template.id);
        try {
            await api.delete(`/briefing/templates/${template.id}`);
            setTemplates(prev => prev.filter(t => t.id !== template.id));
            success('Modelo excluído com sucesso');
        } catch (error) {
            console.error("Delete failed", error);
            showError('Não foi possível excluir o modelo');
        } finally {
            setDeleting(null);
        }
    };

    const handleCopyLink = (template, e) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}/public/briefing/${template.publicToken}`);
        info('Link público copiado!', 'Copiado');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderTemplatesContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            );
        }

        if (templates.length === 0) {
            return (
                <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">Nenhum modelo encontrado</h3>
                    <p className="text-gray-500 mb-6">Crie seu primeiro modelo de briefing para começar.</p>
                    <Button onClick={handleCreate}>Criar Modelo</Button>
                </div>
            );
        }

        // List View
        if (viewMode === 'list') {
            return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Campos</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Criado</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {templates.map(tpl => {
                                const fieldCount = (typeof tpl.fields === 'string' ? JSON.parse(tpl.fields) : tpl.fields)?.length || 0;
                                return (
                                    <tr key={tpl.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="font-medium text-gray-800">{tpl.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500 line-clamp-1">{tpl.description || '—'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{fieldCount} campos</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${tpl.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {tpl.isPublic ? 'Público' : 'Interno'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                {formatDate(tpl.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={(e) => handleEdit(tpl, e)}
                                                    className="text-gray-500 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {tpl.isPublic && (
                                                    <button
                                                        onClick={(e) => handleCopyLink(tpl, e)}
                                                        className="text-gray-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded"
                                                        title="Copiar Link Público"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(tpl, e)}
                                                    disabled={deleting === tpl.id}
                                                    className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-50 rounded disabled:opacity-50"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Grid View
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(tpl => {
                    const fieldCount = (typeof tpl.fields === 'string' ? JSON.parse(tpl.fields) : tpl.fields)?.length || 0;

                    return (
                        <div key={tpl.id}
                            onClick={() => handleEdit(tpl)}
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all group relative cursor-pointer hover:border-primary/30"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <FileText size={24} />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    {tpl.isPublic && (
                                        <button
                                            onClick={(e) => handleCopyLink(tpl, e)}
                                            className="p-2 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"
                                            title="Copiar Link Público"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(tpl, e)}
                                        disabled={deleting === tpl.id}
                                        className="p-2 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 disabled:opacity-50"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1 truncate">{tpl.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{tpl.description || 'Sem descrição'}</p>

                            <div className="flex items-center gap-3 text-xs text-gray-400 border-t border-gray-50 pt-4">
                                <span className={`px-2 py-0.5 rounded-full ${tpl.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {tpl.isPublic ? 'Público' : 'Interno'}
                                </span>
                                <span>•</span>
                                <span>{fieldCount} Campos</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Briefings</h1>
                    <p className="text-slate-500 mt-1">Gerencie seus formulários e modelos de solicitação</p>
                </div>
                {activeTab === 'modelos' && (
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Visualização em Grade"
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Visualização em Lista"
                            >
                                <List size={18} />
                            </button>
                        </div>
                        <Button variant="outline" onClick={() => setIsGalleryOpen(true)}>
                            <Layers size={16} className="mr-2" /> Templates
                        </Button>
                        <Button onClick={handleCreate}>
                            <Plus size={16} className="mr-2" /> Novo Formulário
                        </Button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('modelos')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'modelos' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <FileText size={16} className="inline mr-2" />
                    Modelos
                </button>
                <button
                    onClick={() => setActiveTab('respostas')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'respostas' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Inbox size={16} className="inline mr-2" />
                    Respostas
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'respostas' ? <BriefingSubmissionsTab /> : renderTemplatesContent()}

            {/* Builder Modal */}
            <Modal isOpen={isBuilderOpen} onClose={() => setIsBuilderOpen(false)} title={null} maxWidth="max-w-7xl" noPadding>
                <div className="h-[90vh] overflow-y-auto bg-gray-50/50">
                    {/* Template Name Input */}
                    <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                        <input
                            type="text"
                            value={newTemplateData.name}
                            onChange={(e) => setNewTemplateData(prev => ({ ...prev, name: e.target.value }))}
                            className="text-2xl font-bold text-gray-800 border-none outline-none w-full bg-transparent placeholder-gray-400"
                            placeholder="Nome do Formulário"
                        />
                    </div>

                    <TemplateBuilder
                        fields={newTemplateData.fields}
                        onChange={(fields) => setNewTemplateData(prev => ({ ...prev, fields }))}
                        description={newTemplateData.description}
                        onDescriptionChange={(desc) => setNewTemplateData(prev => ({ ...prev, description: desc }))}
                        isPublic={newTemplateData.isPublic}
                        onIsPublicChange={(val) => setNewTemplateData(prev => ({ ...prev, isPublic: val }))}
                    />
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between gap-3 z-50">
                        <div className="flex gap-2">
                            {currentTemplate && (
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        handleDelete(currentTemplate);
                                        setIsBuilderOpen(false);
                                    }}
                                >
                                    <Trash2 size={16} className="mr-2" /> Excluir
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                                <Eye size={16} className="mr-2" /> Preview
                            </Button>
                            <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave}>Salvar Modelo</Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                template={newTemplateData}
                fields={newTemplateData.fields}
            />

            {/* Template Gallery */}
            <TemplateGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onSelectTemplate={handleUseTemplate}
            />
        </div>
    );
}
