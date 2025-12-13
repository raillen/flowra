import React, { useState } from 'react';
import { useCompanies } from '../../../../hooks/useCompanies';
import { Building, Plus, Search, RefreshCw, Trash2, Edit2, Globe, MapPin, Phone, Mail, MoreVertical } from 'lucide-react';
import { Button, Badge, Modal, ConfirmationDialog, Toast } from '../../../ui';
import { formatCNPJ } from '../../../../utils/formatters';
import { fetchCompanyByCNPJ } from '../../../../services/companyService';

const CompaniesTab = ({ accentColor }) => {
    const { companies, addCompany, updateCompany, deleteCompany } = useCompanies();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);

    const initialForm = {
        name: '', legalName: '', cnpj: '', city: '', state: '',
        segment: '', contactName: '', contactEmail: '', contactPhone: '', accentColor: '#6366f1'
    };
    const [formData, setFormData] = useState(initialForm);

    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, company: null });
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

    const handleFetchCNPJ = async () => {
        const cleanCnpj = formData.cnpj.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;

        setIsLoadingCnpj(true);
        try {
            const data = await fetchCompanyByCNPJ(cleanCnpj);
            setFormData(prev => ({
                ...prev,
                legalName: data.razao_social || '',
                name: data.nome_fantasia || data.razao_social || '',
                city: data.municipio || '',
                state: data.uf || '',
                segment: data.cnae_fiscal_descricao || '',
                contactPhone: data.ddd_telefone_1 || '',
                contactEmail: data.email || ''
            }));
            setToast({ isOpen: true, message: 'Dados encontrados!', type: 'success' });
        } catch (error) {
            setToast({ isOpen: true, message: 'CNPJ não encontrado ou erro na busca.', type: 'error' });
        } finally {
            setIsLoadingCnpj(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCompany(editingId, formData);
                setToast({ isOpen: true, message: 'Empresa atualizada com sucesso!', type: 'success' });
            } else {
                await addCompany(formData);
                setToast({ isOpen: true, message: 'Empresa criada com sucesso!', type: 'success' });
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData(initialForm);
        } catch (error) {
            setToast({ isOpen: true, message: error.response?.data?.message || 'Erro ao salvar', type: 'error' });
        }
    };

    const handleDelete = async () => {
        if (deleteConfirm.company) {
            try {
                await deleteCompany(deleteConfirm.company.id);
                setToast({ isOpen: true, message: 'Empresa removida!', type: 'success' });
            } catch (error) {
                setToast({ isOpen: true, message: 'Erro ao remover empresa', type: 'error' });
            }
            setDeleteConfirm({ isOpen: false, company: null });
        }
    };

    const openEdit = (company) => {
        setEditingId(company.id);
        setFormData({
            name: company.name || '',
            legalName: company.legalName || '',
            cnpj: company.cnpj || '',
            city: company.city || '',
            state: company.state || '',
            segment: company.segment || '',
            contactName: company.contactName || '',
            contactEmail: company.contactEmail || '',
            contactPhone: company.contactPhone || '',
            accentColor: company.accentColor || '#6366f1'
        });
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingId(null);
        setFormData(initialForm);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Building className="text-indigo-500" /> Gerenciar Empresas
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Cadastre e edite as informações das suas empresas</p>
                </div>
                <Button onClick={openNew} icon={Plus} className="shadow-lg shadow-indigo-500/20">
                    Nova Empresa
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                    placeholder="Buscar empresas por nome, CNPJ ou cidade..."
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
            </div>

            {/* Wrapper for Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {companies.map((company) => (
                    <div
                        key={company.id}
                        className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-pointer"
                        onClick={() => openEdit(company)}
                    >
                        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: company.accentColor || '#6366f1' }} />

                        <div className="flex justify-between items-start mb-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
                                style={{ backgroundColor: company.accentColor || '#6366f1' }}
                            >
                                {company.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEdit(company); }}
                                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, company }); }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1 truncate">{company.name}</h3>
                        <p className="text-xs text-slate-500 font-mono mb-4 flex items-center gap-1">
                            <Globe size={12} /> {company.cnpj || 'CNPJ não informado'}
                        </p>

                        <div className="space-y-2">
                            {company.city && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <MapPin size={14} className="text-slate-400" />
                                    {company.city}/{company.state}
                                </div>
                            )}
                            {company.contactName && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Phone size={14} className="text-slate-400" />
                                    {company.contactName}
                                </div>
                            )}
                            {company.segment && (
                                <div className="mt-3 inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                    {company.segment}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <button
                    onClick={openNew}
                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all duration-300 min-h-[260px] group"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white group-hover:shadow-lg flex items-center justify-center transition-all">
                        <Plus size={32} />
                    </div>
                    <span className="font-medium">Adicionar Nova Empresa</span>
                </button>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Editar Empresa" : "Nova Empresa"}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* CNPJ Search Section */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col gap-3">
                        <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                            <Globe size={14} /> Consulta Automática de CNPJ
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    required
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                                    placeholder="00.000.000/0000-00"
                                />
                                {isLoadingCnpj && (
                                    <div className="absolute right-4 top-3.5">
                                        <RefreshCw className="animate-spin text-indigo-500" size={18} />
                                    </div>
                                )}
                            </div>
                            <Button
                                type="button"
                                onClick={handleFetchCNPJ}
                                disabled={isLoadingCnpj}
                                className="!px-6 !rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-95 font-medium"
                            >
                                Buscar
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="group">
                            <label className="label">Nome Fantasia <span className="text-red-500">*</span></label>
                            <input
                                className="input"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Minha Empresa"
                            />
                        </div>
                        <div>
                            <label className="label">Razão Social</label>
                            <input
                                className="input bg-slate-50 text-slate-500"
                                value={formData.legalName}
                                onChange={e => setFormData({ ...formData, legalName: e.target.value })}
                                placeholder="Preenchimento automático"
                            />
                        </div>
                        <div>
                            <label className="label">Seguimento</label>
                            <input
                                className="input"
                                value={formData.segment}
                                onChange={e => setFormData({ ...formData, segment: e.target.value })}
                                placeholder="Ex: Tecnologia, Varejo..."
                            />
                        </div>

                        {/* Premium Color Picker */}
                        <div className="md:col-span-2">
                            <label className="label mb-3 block">Cor da Marca</label>
                            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 items-center">
                                {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#0ea5e9', '#64748b'].map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, accentColor: color })}
                                        className={`
                                    w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center
                                    hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900
                                    ${formData.accentColor === color ? 'ring-slate-400 scale-110 shadow-md' : 'ring-transparent hover:ring-slate-200'}
                                `}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    >
                                        {formData.accentColor === color && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />}
                                    </button>
                                ))}

                                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2" />

                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pr-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                    <div
                                        className="w-9 h-9 rounded-l-lg"
                                        style={{ backgroundColor: formData.accentColor }}
                                    />
                                    <input
                                        type="text"
                                        maxLength={7}
                                        value={formData.accentColor}
                                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                        className="w-20 py-1.5 text-sm font-mono text-slate-600 dark:text-slate-300 bg-transparent outline-none uppercase"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="label">Cidade</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input className="input pl-10" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Cidade" />
                            </div>
                        </div>
                        <div>
                            <label className="label">Estado</label>
                            <input className="input" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="UF" />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                <Phone size={16} />
                            </div>
                            Informações de Contato
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Nome</label>
                                <input className="input" placeholder="Responsável" value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Email</label>
                                <input className="input" placeholder="email@empresa.com" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Telefone</label>
                                <input className="input" placeholder="(00) 00000-0000" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="px-6">Cancelar</Button>
                        <Button type="submit" className="px-8 shadow-lg shadow-indigo-200 dark:shadow-none">Salvar Empresa</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationDialog
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, company: null })}
                onConfirm={handleDelete}
                title="Excluir Empresa"
                message={`Tem certeza que deseja excluir ${deleteConfirm.company?.name}? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                type="danger"
            />

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />

            <style jsx>{`
        .label {
            @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1;
        }
        .input {
            @apply w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all hover:border-slate-300 dark:hover:border-slate-600;
        }
      `}</style>
        </div >
    );
};

export default CompaniesTab;
