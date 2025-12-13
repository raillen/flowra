import React, { useState } from 'react';
import { useCollaborators } from '../../../../hooks/useCollaborators';
import { useCompanies } from '../../../../hooks/useCompanies';
import { useGroups } from '../../../../hooks/useGroups';
import { Users, Plus, Search, Trash2, Edit2, Mail, CreditCard, Building, Layers, Eye, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Badge, Modal, ConfirmationDialog, Toast } from '../../../ui';

const CollaboratorsTab = ({ accentColor }) => {
    const { collaborators, addCollaborator, updateCollaborator, deleteCollaborator } = useCollaborators();
    const { companies } = useCompanies();
    const { groups } = useGroups();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialForm = {
        name: '', email: '', employeeId: '', pis: '', status: 'Ativo',
        companyIds: [], groupIds: []
    };
    const [formData, setFormData] = useState(initialForm);
    const [viewingCollab, setViewingCollab] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, collaborator: null });
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

    // Import State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importStrategy, setImportStrategy] = useState('senior');
    const [isImporting, setIsImporting] = useState(false);
    const [importPreview, setImportPreview] = useState(null);

    const openNew = () => {
        setEditingId(null);
        setFormData(initialForm);
        setIsModalOpen(true);
    };

    const openEdit = (collab) => {
        setEditingId(collab.id);
        setFormData({
            name: collab.name || '',
            email: collab.email || '',
            employeeId: collab.employeeId || '',
            pis: collab.pis || '',
            status: collab.status || 'Ativo',
            companyIds: collab.companyIds || [],
            groupIds: collab.groupIds || []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCollaborator(editingId, formData);
                setToast({ isOpen: true, message: 'Colaborador atualizado!', type: 'success' });
            } else {
                await addCollaborator(formData);
                setToast({ isOpen: true, message: 'Colaborador criado!', type: 'success' });
            }
            setIsModalOpen(false);
        } catch (error) {
            setToast({ isOpen: true, message: error.response?.data?.message || 'Erro ao salvar', type: 'error' });
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);

        try {
            // Using fetch directly for simplicity, ideally use a configured axios instance
            // Assuming API runs on same host/port or proxy logic handles it
            // Adjust URL if needed
            const response = await fetch(`http://localhost:3001/api/import/collaborators?type=${importStrategy}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setImportPreview(data);
                setToast({ isOpen: true, message: 'Arquivo processado! Verifique a prévia.', type: 'success' });
            } else {
                setToast({ isOpen: true, message: data.message || 'Erro na importação', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Erro de conexão na importação.', type: 'error' });
        } finally {
            setIsImporting(false);
        }
    };

    const confirmImport = async () => {
        // Here we would actually save the previewed data
        // For now, we'll just simulate success and close, assuming the Controller could have saved it directly 
        // OR we loop through preview and call addCollaborator (which is safer client-side if we want to reuse logic/hooks)

        setIsImporting(true);
        try {
            let success = 0;
            if (importPreview && importPreview.preview) {
                for (const item of importPreview.preview) {
                    // Basic mapping to form structure
                    await addCollaborator({
                        name: item.name,
                        email: item.email || `temp-${Date.now()}@email.com`, // Fallback
                        employeeId: item.employeeId || '',
                        pis: item.pis || '',
                        status: item.status || 'Ativo',
                        companyIds: [],
                        groupIds: []
                    });
                    success++;
                }
            }
            setToast({ isOpen: true, message: `${success} colaboradores importados com sucesso!`, type: 'success' });
            setIsImportModalOpen(false);
            setImportPreview(null);
            setImportFile(null);
        } catch (error) {
            setToast({ isOpen: true, message: 'Erro ao salvar alguns colaboradores.', type: 'warning' });
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        const templates = {
            senior: {
                content: "nomFun;emaPar;numCpf;pisPasep;numCad;titCar;sitAfa\nJoão da Silva;joao@empresa.com.br;12345678900;12345678900;1001;Analista;7",
                filename: "modelo_importacao_senior.csv"
            },
            totvs: {
                content: "NOME_FUNCIONARIO;EMAIL;CPF;PIS_PASEP;MATRICULA;FUNCAO;COD_SITUACAO\nMaria Souza;maria@empresa.com.br;98765432100;98765432100;2002;Gerente;A",
                filename: "modelo_importacao_totvs.csv"
            }
        };

        const template = templates[importStrategy];
        if (!template) return;

        const blob = new Blob([template.content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = template.filename;
        link.click();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="text-indigo-500" /> Colaboradores
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie o acesso e informações da sua equipe</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsImportModalOpen(true)} icon={Upload}>
                        Importar
                    </Button>
                    <Button onClick={openNew} icon={Plus} className="shadow-lg shadow-indigo-500/20">
                        Novo Colaborador
                    </Button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                            placeholder="Buscar por nome, email ou matrícula..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Colaborador</th>
                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Acesso</th>
                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {collaborators.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                            {c.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">{c.name}</p>
                                            <p className="text-xs text-slate-500">{c.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                            <Building size={12} />
                                            {c.companyIds?.length || 0} Empresas
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                            <Layers size={12} />
                                            {c.groupIds?.length || 0} Grupos
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge color={c.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                        {c.status}
                                    </Badge>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button title="Ver Detalhes" onClick={() => setViewingCollab(c)} className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                            <Eye size={16} />
                                        </button>
                                        <button title="Editar" onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                            <Edit2 size={16} />
                                        </button>
                                        <button title="Excluir" onClick={() => setDeleteConfirm({ isOpen: true, collaborator: c })} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Import Modal */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => { setIsImportModalOpen(false); setImportPreview(null); setImportFile(null); }}
                title="Importar Colaboradores"
                maxWidth="max-w-2xl"
            >
                {!importPreview ? (
                    <form onSubmit={handleImport} className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                                <p className="font-bold mb-1">Como funciona a importação:</p>
                                <p>O sistema aceita arquivos CSV exportados diretamente dos sistemas de gestão ou planilhas padronizadas (separadas por ponto e vírgula).</p>
                                <button type="button" onClick={downloadTemplate} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium mt-1 flex items-center gap-1">
                                    <FileSpreadsheet size={14} /> Baixar modelo de exemplo ({importStrategy.toUpperCase()})
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="label mb-2 block font-medium text-slate-700 dark:text-slate-300">Sistema de Origem</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={importStrategy}
                                    onChange={e => setImportStrategy(e.target.value)}
                                >
                                    <option value="senior">Senior Sistemas (HCM/X)</option>
                                    <option value="totvs">TOTVS (RM/Protheus)</option>
                                </select>
                            </div>
                            <div>
                                <label className="label mb-2 block font-medium text-slate-700 dark:text-slate-300">Arquivo CSV</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={e => setImportFile(e.target.files[0])}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label htmlFor="csv-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-500 hover:text-indigo-500 transition-colors text-slate-500">
                                        <FileSpreadsheet size={20} />
                                        {importFile ? importFile.name : 'Selecionar Arquivo'}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={!importFile || isImporting}>
                                {isImporting ? 'Processando...' : 'Carregar e Validar'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <CheckCircle size={24} />
                            <div>
                                <h4 className="font-bold">Arquivo Validado!</h4>
                                <p className="text-sm">{importPreview.total} colaboradores encontrados.</p>
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left font-medium text-slate-500">Nome</th>
                                        <th className="p-3 text-left font-medium text-slate-500">Email</th>
                                        <th className="p-3 text-left font-medium text-slate-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {importPreview.preview.slice(0, 50).map((row, i) => (
                                        <tr key={i}>
                                            <td className="p-3 text-slate-700 dark:text-slate-300">{row.name}</td>
                                            <td className="p-3 text-slate-500">{row.email}</td>
                                            <td className="p-3">
                                                <Badge color="bg-emerald-100 text-emerald-700">{row.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {importPreview.total > 50 && (
                                <p className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800">
                                    E mais {importPreview.total - 50} registros...
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" onClick={() => setImportPreview(null)}>Voltar</Button>
                            <Button onClick={confirmImport} disabled={isImporting}>
                                {isImporting ? 'Salvando...' : 'Confirmar Importação'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit/Create Modal (Existing) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Editar Colaborador" : "Novo Colaborador"}
                maxWidth="max-w-3xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... Existing form ... */}
                    {/* Header / Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                                Nome Completo <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Users className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                <input
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Ex: João Silva"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                                Email Profissional <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                <input
                                    required
                                    type="email"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="joao@empresa.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Status</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Ativo">🟢 Ativo</option>
                                <option value="Inativo">🔴 Inativo</option>
                                <option value="Férias">🟡 Férias</option>
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Matrícula / ID</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Ex: EMP-001"
                                value={formData.employeeId}
                                onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">PIS</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                <input
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="000.00000.00-0"
                                    value={formData.pis}
                                    onChange={e => setFormData({ ...formData, pis: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 my-6"></div>

                    {/* Permissions / Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Companies Selection */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 h-64 flex flex-col">
                            <h4 className="font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                                <Building size={16} className="text-indigo-500" />
                                Empresas Vinculadas
                            </h4>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                {companies.map(company => (
                                    <label
                                        key={company.id}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none
                                            ${formData.companyIds.includes(company.id)
                                                ? 'bg-white dark:bg-slate-700 border-indigo-200 dark:border-indigo-500/30 ring-1 ring-indigo-500/20 shadow-sm'
                                                : 'bg-transparent border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            checked={formData.companyIds.includes(company.id)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setFormData(prev => ({ ...prev, companyIds: [...prev.companyIds, company.id] }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, companyIds: prev.companyIds.filter(id => id !== company.id) }));
                                                }
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{company.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{company.cnpj}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Groups Selection */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 h-64 flex flex-col">
                            <h4 className="font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                                <Layers size={16} className="text-emerald-500" />
                                Grupos de Acesso
                            </h4>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                {groups.map(group => (
                                    <label
                                        key={group.id}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none
                                            ${formData.groupIds.includes(group.id)
                                                ? 'bg-white dark:bg-slate-700 border-emerald-200 dark:border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-sm'
                                                : 'bg-transparent border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                            checked={formData.groupIds.includes(group.id)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setFormData(prev => ({ ...prev, groupIds: [...prev.groupIds, group.id] }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, groupIds: prev.groupIds.filter(id => id !== group.id) }));
                                                }
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{group.name}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="px-6">Cancelar</Button>
                        <Button type="submit" className="px-8 shadow-lg shadow-indigo-200 dark:shadow-none">Salvar Colaborador</Button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={!!viewingCollab}
                onClose={() => setViewingCollab(null)}
                title="Detalhes do Colaborador"
                maxWidth="max-w-2xl"
            >
                {viewingCollab && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
                                {viewingCollab.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{viewingCollab.name}</h3>
                                <p className="text-slate-500 text-sm flex items-center gap-2">
                                    <Mail size={14} /> {viewingCollab.email}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Badge color={viewingCollab.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                                        {viewingCollab.status}
                                    </Badge>
                                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 font-mono">
                                        ID: {viewingCollab.employeeId || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                    <Building size={16} className="text-indigo-500" /> Empresas
                                </h4>
                                <div className="space-y-2">
                                    {companies.filter(c => viewingCollab.companyIds?.includes(c.id)).map(c => (
                                        <div key={c.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: c.accentColor || '#6366f1' }} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.name}</p>
                                                <p className="text-[10px] text-slate-400">{c.cnpj}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!viewingCollab.companyIds || viewingCollab.companyIds.length === 0) && (
                                        <p className="text-sm text-slate-400 italic">Nenhuma empresa vinculada</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                    <Layers size={16} className="text-emerald-500" /> Grupos
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {groups.filter(g => viewingCollab.groupIds?.includes(g.id)).map(g => (
                                        <span key={g.id} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-full border border-emerald-100 dark:border-emerald-800">
                                            {g.name}
                                        </span>
                                    ))}
                                    {(!viewingCollab.groupIds || viewingCollab.groupIds.length === 0) && (
                                        <p className="text-sm text-slate-400 italic">Nenhum grupo vinculado</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button variant="secondary" onClick={() => setViewingCollab(null)}>Fechar</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmationDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, collaborator: null })}
                onConfirm={async () => {
                    await deleteCollaborator(deleteConfirm.collaborator.id);
                    setDeleteConfirm({ isOpen: false, collaborator: null });
                }}
                title="Excluir Colaborador"
                message={`Deseja realmente excluir ${deleteConfirm.collaborator?.name}?`}
                type="danger"
            />

            <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />
        </div>
    );
};

export default CollaboratorsTab;
