import React, { useState, useEffect } from 'react';
import { useCompanies } from '../../hooks/useCompanies';
import { useGroups } from '../../hooks/useGroups';
import { useCollaborators } from '../../hooks/useCollaborators';
import { useAuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccentColor } from '../../contexts/AccentColorContext';
import api from '../../services/api';
import { Building, Layers, Users, Database, RefreshCw, Globe, Search, Plus, X, Edit2, Save, Trash2, Upload, FileSpreadsheet, Palette, Settings, Download, HardDrive, BarChart3, Info, Moon, Sun, Monitor } from 'lucide-react';
import { Button, Badge, Modal, ConfirmationDialog, Toast } from '../ui';
import { formatCNPJ } from '../../utils/formatters';
import { fetchCompanyByCNPJ } from '../../services/companyService';

/**
 * Settings module component
 * Complete settings interface with companies, groups, and collaborators management
 * 
 * @module components/modules/SettingsModule
 */
const SettingsModule = () => {
  const [activeTab, setActiveTab] = useState('general');
  // Use hooks directly instead of useApp to avoid provider issues
  const { companies, addCompany, updateCompany, deleteCompany } = useCompanies();
  const { groups, addGroup, deleteGroup } = useGroups();
  const { collaborators, addCollaborator, updateCollaborator, deleteCollaborator } = useCollaborators();
  const { user } = useAuthContext();
  const { theme, setTheme, themes } = useTheme();
  const { accentColor, setAccentColor } = useAccentColor();

  // Database stats state
  const [dbStats, setDbStats] = useState(null);
  const [dbStatsLoading, setDbStatsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(null);

  // Fetch database stats
  const fetchDbStats = async () => {
    setDbStatsLoading(true);
    try {
      const response = await api.get('/stats/database');
      setDbStats(response.data.data);
    } catch (error) {
      console.error('Error fetching db stats:', error);
      setToast({ isOpen: true, message: 'Erro ao carregar estatísticas', type: 'error' });
    } finally {
      setDbStatsLoading(false);
    }
  };

  // Export entity data
  const handleExport = async (entity) => {
    setExportLoading(entity);
    try {
      const response = await api.get(`/stats/export/${entity}`);
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity}_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ isOpen: true, message: `${entity} exportado com sucesso!`, type: 'success' });
    } catch (error) {
      console.error('Error exporting:', error);
      setToast({ isOpen: true, message: 'Erro ao exportar dados', type: 'error' });
    } finally {
      setExportLoading(null);
    }
  };

  // Load db stats when tab changes to database
  useEffect(() => {
    if (activeTab === 'database' && !dbStats && user?.role === 'admin') {
      fetchDbStats();
    }
  }, [activeTab, dbStats, user?.role]);

  // Company state
  const [companyForm, setCompanyForm] = useState({
    name: '', legalName: '', cnpj: '', city: '', state: '',
    segment: '', contactName: '', contactEmail: '', contactPhone: '', accentColor: '#6366f1'
  });
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [viewCompany, setViewCompany] = useState(null);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editingCompanyData, setEditingCompanyData] = useState({
    id: '',
    name: '',
    legalName: '',
    cnpj: '',
    city: '',
    state: '',
    segment: '',
    accentColor: '#6366f1',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  // Group state
  const [newGroupName, setNewGroupName] = useState('');

  // Collaborator state
  const [newCollaborator, setNewCollaborator] = useState({
    name: '', email: '', employeeId: '', pis: '', status: 'Ativo',
    companyIds: [], groupIds: []
  });
  const [viewCollaborator, setViewCollaborator] = useState(null);
  const [isEditingCollaborator, setIsEditingCollaborator] = useState(false);
  const [editingCollaboratorData, setEditingCollaboratorData] = useState({
    id: '',
    name: '',
    email: '',
    employeeId: '',
    pis: '',
    status: 'Ativo',
    companyIds: [],
    groupIds: [],
  });

  // Confirmation dialogs state
  const [deleteCompanyConfirm, setDeleteCompanyConfirm] = useState({ isOpen: false, company: null });
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState({ isOpen: false, group: null });
  const [deleteCollaboratorConfirm, setDeleteCollaboratorConfirm] = useState({ isOpen: false, collaborator: null });

  // Toast state
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

  // Company handlers
  const handleCnpjChange = (e) => {
    const masked = formatCNPJ(e.target.value);
    setCompanyForm({ ...companyForm, cnpj: masked });
  };

  const handleFetchCNPJ = async () => {
    const cleanCnpj = companyForm.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    setIsLoadingCnpj(true);
    try {
      const data = await fetchCompanyByCNPJ(cleanCnpj);
      setCompanyForm({
        ...companyForm,
        legalName: data.razao_social,
        name: data.nome_fantasia || data.razao_social,
        city: data.municipio,
        state: data.uf,
        segment: data.cnae_fiscal_descricao,
        contactPhone: data.ddd_telefone_1,
        contactEmail: data.email
      });
    } catch (error) {
      setToast({ isOpen: true, message: 'CNPJ não encontrado ou erro na busca.', type: 'error' });
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const handleAddCompany = async () => {
    if (!companyForm.name.trim()) return;
    try {
      await addCompany(companyForm);
      setCompanyForm({
        name: '', legalName: '', cnpj: '', city: '', state: '',
        segment: '', contactName: '', contactEmail: '', contactPhone: '', accentColor: '#6366f1'
      });
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || 'Erro ao criar empresa', type: 'error' });
    }
  };

  const handleUpdateCompany = async () => {
    try {
      await updateCompany(editingCompanyData.id, editingCompanyData);
      setViewCompany(editingCompanyData);
      setIsEditingCompany(false);
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || 'Erro ao atualizar empresa', type: 'error' });
    }
  };

  // Group handlers
  const handleAddGroup = async () => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) {
      setToast({ isOpen: true, message: 'Por favor, informe o nome do grupo', type: 'warning' });
      return;
    }
    if (trimmedName.length < 3) {
      setToast({ isOpen: true, message: 'O nome do grupo deve ter pelo menos 3 caracteres', type: 'warning' });
      return;
    }
    try {
      await addGroup({ name: trimmedName });
      setNewGroupName('');
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors?.name ||
        error.message ||
        'Erro ao criar grupo';
      setToast({ isOpen: true, message: errorMessage, type: 'error' });
      console.error('Erro ao criar grupo:', error);
    }
  };

  // Collaborator handlers
  const handleAddCollaborator = async () => {
    if (!newCollaborator.name.trim() || !newCollaborator.email.trim()) return;
    try {
      await addCollaborator(newCollaborator);
      setNewCollaborator({
        name: '', email: '', employeeId: '', pis: '', status: 'Ativo',
        companyIds: [], groupIds: []
      });
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || 'Erro ao criar colaborador', type: 'error' });
    }
  };

  const handleUpdateCollaborator = async () => {
    try {
      await updateCollaborator(editingCollaboratorData.id, editingCollaboratorData);
      setViewCollaborator(editingCollaboratorData);
      setIsEditingCollaborator(false);
    } catch (error) {
      setToast({ isOpen: true, message: error.response?.data?.message || 'Erro ao atualizar colaborador', type: 'error' });
    }
  };

  return (
    <div className="flex h-full bg-surface rounded-xl border border-border overflow-hidden animate-in fade-in m-6 shadow-sm">
      {/* Sidebar */}
      <div className="w-64 bg-surface-hover border-r border-border flex flex-col p-4 space-y-1">
        <h3 className="font-bold text-text-primary mb-4 px-2 flex items-center gap-2">
          <Settings size={18} className="text-text-secondary" />
          Configurações
        </h3>

        {/* General */}
        <button
          onClick={() => setActiveTab('general')}
          className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'general'
              ? 'text-white shadow-md'
              : 'text-text-secondary hover:bg-border hover:text-text-primary'
            }`}
          style={activeTab === 'general' ? { backgroundColor: accentColor } : {}}
        >
          <Info size={16} /> Geral
        </button>

        {/* Appearance */}
        <button
          onClick={() => setActiveTab('appearance')}
          className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'appearance'
              ? 'text-white shadow-md'
              : 'text-text-secondary hover:bg-border hover:text-text-primary'
            }`}
          style={activeTab === 'appearance' ? { backgroundColor: accentColor } : {}}
        >
          <Palette size={16} /> Aparência
        </button>

        <div className="!my-3 border-t border-border" />
        <span className="text-xs font-semibold text-text-secondary uppercase px-2 mb-1">Cadastros</span>

        {/* Companies */}
        <button
          onClick={() => setActiveTab('companies')}
          className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'companies'
              ? 'text-white shadow-md'
              : 'text-text-secondary hover:bg-border hover:text-text-primary'
            }`}
          style={activeTab === 'companies' ? { backgroundColor: accentColor } : {}}
        >
          <Building size={16} /> Empresas
        </button>

        {/* Groups */}
        <button
          onClick={() => setActiveTab('groups')}
          className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'groups'
              ? 'text-white shadow-md'
              : 'text-text-secondary hover:bg-border hover:text-text-primary'
            }`}
          style={activeTab === 'groups' ? { backgroundColor: accentColor } : {}}
        >
          <Layers size={16} /> Grupos
        </button>

        {/* Collaborators */}
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'collaborators'
              ? 'text-white shadow-md'
              : 'text-text-secondary hover:bg-border hover:text-text-primary'
            }`}
          style={activeTab === 'collaborators' ? { backgroundColor: accentColor } : {}}
        >
          <Users size={16} /> Colaboradores
        </button>

        {/* Database - Admin only */}
        {user?.role === 'admin' && (
          <>
            <div className="!my-3 border-t border-border" />
            <span className="text-xs font-semibold text-text-secondary uppercase px-2 mb-1">Administração</span>
            <button
              onClick={() => setActiveTab('database')}
              className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'database'
                  ? 'text-white shadow-md'
                  : 'text-text-secondary hover:bg-border hover:text-text-primary'
                }`}
              style={activeTab === 'database' ? { backgroundColor: accentColor } : {}}
            >
              <Database size={16} /> Banco de Dados
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-background">

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Info size={24} style={{ color: accentColor }} />
              Configurações Gerais
            </h2>
            <p className="text-text-secondary mb-6">Informações e ajustes globais do sistema.</p>

            <div className="space-y-4">
              {/* System Info */}
              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="font-bold text-text-primary mb-4">Informações do Sistema</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-secondary uppercase mb-1">Versão</p>
                    <p className="font-mono font-bold text-text-primary">KBSys v1.0.0</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase mb-1">Ambiente</p>
                    <Badge color="bg-emerald-100 text-emerald-700">Produção</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase mb-1">Usuário Atual</p>
                    <p className="font-medium text-text-primary">{user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase mb-1">Permissão</p>
                    <Badge color={user?.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'}>
                      {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="font-bold text-text-primary mb-4">Resumo Rápido</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-surface-hover rounded-lg">
                    <p className="text-2xl font-bold" style={{ color: accentColor }}>{companies.length}</p>
                    <p className="text-xs text-text-secondary">Empresas</p>
                  </div>
                  <div className="text-center p-3 bg-surface-hover rounded-lg">
                    <p className="text-2xl font-bold" style={{ color: accentColor }}>{groups.length}</p>
                    <p className="text-xs text-text-secondary">Grupos</p>
                  </div>
                  <div className="text-center p-3 bg-surface-hover rounded-lg">
                    <p className="text-2xl font-bold" style={{ color: accentColor }}>{collaborators.length}</p>
                    <p className="text-xs text-text-secondary">Colaboradores</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Palette size={24} style={{ color: accentColor }} />
              Aparência
            </h2>
            <p className="text-text-secondary mb-6">Personalize a interface do sistema.</p>

            <div className="space-y-6">
              {/* Theme Selector */}
              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Moon size={18} />
                  Tema do Sistema
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${theme === t.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-border hover:border-primary-300'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {t.id === 'light' && <Sun size={18} className="text-amber-500" />}
                        {t.id === 'dark' && <Moon size={18} className="text-indigo-400" />}
                        {t.id === 'system' && <Monitor size={18} className="text-text-secondary" />}
                        {!['light', 'dark', 'system'].includes(t.id) && (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: t.preview || accentColor }}
                          />
                        )}
                        <span className="font-medium text-text-primary">{t.name}</span>
                      </div>
                      {theme === t.id && (
                        <Badge color="bg-primary-100 text-primary-700">Ativo</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="font-bold text-text-primary mb-4">Cor de Destaque Pessoal</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Esta cor é sobrescrita pela cor da empresa quando você seleciona um projeto.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      className={`w-10 h-10 rounded-xl transition-all ${accentColor === color ? 'ring-2 ring-offset-2 ring-text-secondary scale-110' : 'hover:scale-105'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0"
                    title="Cor personalizada"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && user?.role === 'admin' && (
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Database size={24} style={{ color: accentColor }} />
              Database Explorer
            </h2>
            <p className="text-text-secondary mb-6">Visualização e estatísticas do banco de dados (somente leitura).</p>

            {dbStatsLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="animate-spin text-text-secondary" size={32} />
              </div>
            ) : dbStats ? (
              <div className="space-y-6">
                {/* Storage Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <HardDrive size={20} style={{ color: accentColor }} />
                      <h3 className="font-bold text-text-primary">Armazenamento</h3>
                    </div>
                    <p className="text-3xl font-bold text-text-primary">{dbStats.storage.databaseMB} MB</p>
                    <p className="text-xs text-text-secondary">Tamanho do banco</p>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 size={20} style={{ color: accentColor }} />
                      <h3 className="font-bold text-text-primary">Total de Registros</h3>
                    </div>
                    <p className="text-3xl font-bold text-text-primary">{dbStats.totals.entities.toLocaleString()}</p>
                    <p className="text-xs text-text-secondary">Entidades no sistema</p>
                  </div>
                </div>

                {/* Entity Counts */}
                <div className="bg-surface p-5 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-primary">Contadores por Entidade</h3>
                    <Button variant="ghost" onClick={fetchDbStats} className="!p-2">
                      <RefreshCw size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(dbStats.entities).map(([key, value]) => (
                      <div key={key} className="p-3 bg-surface-hover rounded-lg text-center">
                        <p className="text-lg font-bold text-text-primary">{value}</p>
                        <p className="text-xs text-text-secondary capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Section */}
                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Download size={18} />
                    Exportar Dados
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['users', 'companies', 'projects', 'boards', 'cards', 'notes', 'collaborators', 'tags'].map((entity) => (
                      <Button
                        key={entity}
                        variant="secondary"
                        onClick={() => handleExport(entity)}
                        loading={exportLoading === entity}
                        className="!py-2 !px-3 !text-sm"
                      >
                        <Download size={14} className="mr-1" />
                        {entity}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-text-secondary">
                <Database size={48} className="mx-auto mb-4 opacity-50" />
                <p>Erro ao carregar estatísticas</p>
                <Button onClick={fetchDbStats} className="mt-4">Tentar Novamente</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building className="text-indigo-600" /> Empresas
            </h2>

            {/* Company Form */}
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl mb-6">
              <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                {isLoadingCnpj ? <RefreshCw className="animate-spin" size={16} /> : <Globe size={16} />}
                Consulta Automática (Receita Federal)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">CNPJ</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 p-2 border border-indigo-200 rounded bg-white font-mono text-sm"
                      placeholder="00.000.000/0000-00"
                      value={companyForm.cnpj}
                      onChange={handleCnpjChange}
                      onBlur={handleFetchCNPJ}
                    />
                    <Button onClick={handleFetchCNPJ} className="!px-3" disabled={isLoadingCnpj}>
                      <Search size={16} />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Nome Fantasia</label>
                  <input
                    className="w-full p-2 border border-indigo-200 rounded bg-white text-sm"
                    placeholder="Preenchido automaticamente..."
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Razão Social</label>
                  <input
                    className="w-full p-2 border border-indigo-200 rounded bg-slate-50 text-sm text-slate-600"
                    readOnly
                    value={companyForm.legalName}
                    placeholder="..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Seguimento</label>
                  <input
                    className="w-full p-2 border border-indigo-200 rounded bg-white text-sm"
                    value={companyForm.segment}
                    onChange={(e) => setCompanyForm({ ...companyForm, segment: e.target.value })}
                    placeholder="Ex: Tecnologia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Cidade</label>
                  <input
                    className="w-full p-2 border border-indigo-200 rounded bg-slate-50 text-sm text-slate-600"
                    readOnly
                    value={companyForm.city}
                    placeholder="..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Estado</label>
                  <input
                    className="w-full p-2 border border-indigo-200 rounded bg-slate-50 text-sm text-slate-600"
                    readOnly
                    value={companyForm.state}
                    placeholder="..."
                  />
                </div>
              </div>

              <h5 className="font-bold text-indigo-900 text-xs uppercase mb-3 border-b border-indigo-200 pb-1 mt-4">
                Contato Principal
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  className="w-full p-2 border border-indigo-200 rounded bg-white text-sm"
                  placeholder="Nome do Contato"
                  value={companyForm.contactName}
                  onChange={(e) => setCompanyForm({ ...companyForm, contactName: e.target.value })}
                />
                <input
                  className="w-full p-2 border border-indigo-200 rounded bg-white text-sm"
                  placeholder="Email"
                  value={companyForm.contactEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                />
                <input
                  className="w-full p-2 border border-indigo-200 rounded bg-white text-sm"
                  placeholder="Telefone"
                  value={companyForm.contactPhone}
                  onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                />
              </div>

              {/* Accent Color Picker */}
              <h5 className="font-bold text-indigo-900 text-xs uppercase mb-3 border-b border-indigo-200 pb-1 mt-4">
                Cor de Destaque
              </h5>
              <div className="mb-4">
                <p className="text-xs text-indigo-600 mb-2">Esta cor será usada nos menus e destaques do painel</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCompanyForm({ ...companyForm, accentColor: color })}
                      className={`w-8 h-8 rounded-lg transition-all ${companyForm.accentColor === color ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  <input
                    type="color"
                    value={companyForm.accentColor}
                    onChange={(e) => setCompanyForm({ ...companyForm, accentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    title="Cor personalizada"
                  />
                </div>
              </div>

              <Button onClick={handleAddCompany} icon={Plus} className="w-full">
                Adicionar Empresa
              </Button>
            </div>

            {/* Companies List */}
            <div className="space-y-3">
              {companies.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setViewCompany(c);
                    setIsEditingCompany(false);
                    setEditingCompanyData({
                      id: c.id || '',
                      name: c.name || '',
                      legalName: c.legalName || '',
                      cnpj: c.cnpj || '',
                      city: c.city || '',
                      state: c.state || '',
                      segment: c.segment || '',
                      accentColor: c.accentColor || '#6366f1',
                      contactName: c.contactName || '',
                      contactEmail: c.contactEmail || '',
                      contactPhone: c.contactPhone || '',
                    });
                  }}
                  className="p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-center shadow-sm cursor-pointer hover:border-indigo-400 transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.accentColor || '#6366f1' }}
                      />
                      <span className="font-bold text-slate-700 group-hover:text-indigo-700">
                        {c.name}
                      </span>
                      {c.state && (
                        <Badge color="bg-slate-100 text-slate-500">
                          {c.city}/{c.state}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex gap-3">
                      {c.cnpj && <span>CNPJ: {c.cnpj}</span>}
                      {c.segment && <span>Seguimento: {c.segment}</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteCompanyConfirm({ isOpen: true, company: c });
                    }}
                    className="text-slate-400 hover:text-red-500 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Company Detail Modal */}
            <Modal
              isOpen={!!viewCompany}
              onClose={() => setViewCompany(null)}
              title={isEditingCompany ? 'Editar Empresa' : 'Detalhes da Empresa'}
              maxWidth="max-w-2xl"
            >
              {viewCompany && (
                <div className="space-y-6">
                  {!isEditingCompany ? (
                    <>
                      <div className="text-center pb-4 border-b border-slate-100">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                          <Building size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{viewCompany.name}</h3>
                        <p className="text-sm text-slate-500 font-mono">{viewCompany.cnpj}</p>
                        {viewCompany.segment && (
                          <p className="text-xs text-indigo-600 font-bold mt-1 uppercase tracking-wider">
                            {viewCompany.segment}
                          </p>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                            Razão Social
                          </label>
                          <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">
                            {viewCompany.legalName || '-'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cidade</label>
                            <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">
                              {viewCompany.city || '-'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estado</label>
                            <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded">
                              {viewCompany.state || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => setViewCompany(null)}>
                          Fechar
                        </Button>
                        <Button onClick={() => setIsEditingCompany(true)} icon={Edit2}>
                          Editar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ</label>
                            <input
                              className="w-full p-2 border rounded"
                              value={editingCompanyData.cnpj || ''}
                              onChange={(e) => setEditingCompanyData({ ...editingCompanyData, cnpj: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Fantasia</label>
                            <input
                              className="w-full p-2 border rounded"
                              value={editingCompanyData.name || ''}
                              onChange={(e) => setEditingCompanyData({ ...editingCompanyData, name: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Razão Social</label>
                          <input
                            className="w-full p-2 border rounded"
                            value={editingCompanyData.legalName || ''}
                            onChange={(e) => setEditingCompanyData({ ...editingCompanyData, legalName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => setIsEditingCompany(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdateCompany} icon={Save}>
                          Salvar Alterações
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Modal>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layers className="text-indigo-600" /> Grupos de Atividades
            </h2>
            <div className="flex gap-2 mb-6">
              <input
                className="flex-1 p-2 border rounded-lg"
                placeholder="Nome do Grupo (ex: Marketing)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Button onClick={handleAddGroup} icon={Plus}>
                Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <span className="font-medium text-slate-700">{g.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteGroupConfirm({ isOpen: true, group: g });
                    }}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collaborators' && (
          <div className="max-w-5xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="text-indigo-600" /> Cadastro de Colaboradores
            </h2>

            {/* Collaborator Form */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
              <h4 className="font-bold text-sm text-slate-700 mb-3 border-b border-slate-200 pb-2">
                Novo Colaborador (Manual)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  className="w-full p-2 border rounded bg-white text-sm"
                  placeholder="Nome Completo"
                  value={newCollaborator.name}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, name: e.target.value })}
                />
                <input
                  className="w-full p-2 border rounded bg-white text-sm"
                  placeholder="Email Corporativo"
                  value={newCollaborator.email}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, email: e.target.value })}
                />
                <select
                  className="w-full p-2 border rounded bg-white text-sm"
                  value={newCollaborator.status}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, status: e.target.value })}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Férias">Férias</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  className="w-full p-2 border rounded bg-white text-sm"
                  placeholder="Matrícula (employeeId)"
                  value={newCollaborator.employeeId}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, employeeId: e.target.value })}
                />
                <input
                  className="w-full p-2 border rounded bg-white text-sm"
                  placeholder="PIS"
                  value={newCollaborator.pis}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, pis: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vincular Empresas</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar bg-white p-2 border rounded">
                    {companies.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={newCollaborator.companyIds.includes(c.id)}
                          onChange={() => {
                            const ids = newCollaborator.companyIds.includes(c.id)
                              ? newCollaborator.companyIds.filter((id) => id !== c.id)
                              : [...newCollaborator.companyIds, c.id];
                            setNewCollaborator({ ...newCollaborator, companyIds: ids });
                          }}
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vincular Grupos</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar bg-white p-2 border rounded">
                    {groups.map((g) => (
                      <label
                        key={g.id}
                        className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={newCollaborator.groupIds.includes(g.id)}
                          onChange={() => {
                            const ids = newCollaborator.groupIds.includes(g.id)
                              ? newCollaborator.groupIds.filter((id) => id !== g.id)
                              : [...newCollaborator.groupIds, g.id];
                            setNewCollaborator({ ...newCollaborator, groupIds: ids });
                          }}
                        />
                        {g.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={handleAddCollaborator} icon={Plus} className="w-full">
                Salvar Colaborador
              </Button>
            </div>

            {/* Collaborators List */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-400 px-4 uppercase">
                <span className="w-1/4">Nome / Email</span>
                <span className="w-1/6">Matrícula / PIS</span>
                <span className="w-1/6">Status</span>
                <span className="w-1/3">Vínculos</span>
                <span className="w-10"></span>
              </div>
              {collaborators.map((col) => {
                const colCompanies = companies.filter((c) =>
                  col.companies?.some((cc) => cc.companyId === c.id) || col.companyIds?.includes(c.id)
                ).map((c) => c.name);
                const colGroups = groups.filter((g) =>
                  col.groups?.some((cg) => cg.groupId === g.id) || col.groupIds?.includes(g.id)
                ).map((g) => g.name);

                return (
                  <div
                    key={col.id}
                    onClick={() => {
                      setViewCollaborator(col);
                      setIsEditingCollaborator(false);
                      setEditingCollaboratorData({
                        id: col.id || '',
                        name: col.name || '',
                        email: col.email || '',
                        employeeId: col.employeeId || '',
                        pis: col.pis || '',
                        status: col.status || 'Ativo',
                        companyIds: col.companyIds || col.companies?.map(cc => cc.companyId) || [],
                        groupIds: col.groupIds || col.groups?.map(cg => cg.groupId) || [],
                      });
                    }}
                    className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="w-1/4">
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700">{col.name}</h4>
                      <p className="text-xs text-slate-500">{col.email}</p>
                    </div>
                    <div className="w-1/6">
                      <p className="text-xs font-mono text-slate-600">{col.employeeId || '-'}</p>
                      <p className="text-[10px] text-slate-400">{col.pis || '-'}</p>
                    </div>
                    <div className="w-1/6">
                      <Badge
                        color={col.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}
                      >
                        {col.status}
                      </Badge>
                    </div>
                    <div className="w-1/3 flex flex-wrap gap-1">
                      {colCompanies.map((c, i) => (
                        <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                      {colGroups.map((g, i) => (
                        <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                    <div className="w-10 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCollaboratorConfirm({ isOpen: true, collaborator: col });
                        }}
                        className="text-slate-300 hover:text-red-500 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Collaborator Detail Modal */}
            <Modal
              isOpen={!!viewCollaborator}
              onClose={() => setViewCollaborator(null)}
              title={isEditingCollaborator ? 'Editar Colaborador' : 'Detalhes do Colaborador'}
              maxWidth="max-w-2xl"
            >
              {viewCollaborator && (
                <div className="space-y-6">
                  {!isEditingCollaborator ? (
                    <>
                      <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold">
                          {viewCollaborator.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{viewCollaborator.name}</h3>
                          <p className="text-sm text-slate-500">{viewCollaborator.email}</p>
                          <div className="mt-1">
                            <Badge
                              color={
                                viewCollaborator.status === 'Ativo'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-slate-100 text-slate-500'
                              }
                            >
                              {viewCollaborator.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Matrícula</label>
                            <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded font-mono">
                              {viewCollaborator.employeeId || '-'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">PIS</label>
                            <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded font-mono">
                              {viewCollaborator.pis || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => setViewCollaborator(null)}>
                          Fechar
                        </Button>
                        <Button onClick={() => setIsEditingCollaborator(true)} icon={Edit2}>
                          Editar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                          <input
                            className="w-full p-2 border rounded"
                            value={editingCollaboratorData.name || ''}
                            onChange={(e) =>
                              setEditingCollaboratorData({ ...editingCollaboratorData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input
                              className="w-full p-2 border rounded"
                              value={editingCollaboratorData.email || ''}
                              onChange={(e) =>
                                setEditingCollaboratorData({ ...editingCollaboratorData, email: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                            <select
                              className="w-full p-2 border rounded"
                              value={editingCollaboratorData.status || 'Ativo'}
                              onChange={(e) =>
                                setEditingCollaboratorData({ ...editingCollaboratorData, status: e.target.value })
                              }
                            >
                              <option value="Ativo">Ativo</option>
                              <option value="Férias">Férias</option>
                              <option value="Inativo">Inativo</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => setIsEditingCollaborator(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdateCollaborator} icon={Save}>
                          Salvar Alterações
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Modal>
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={deleteCompanyConfirm.isOpen}
        onClose={() => setDeleteCompanyConfirm({ isOpen: false, company: null })}
        onConfirm={() => {
          if (deleteCompanyConfirm.company) {
            deleteCompany(deleteCompanyConfirm.company.id);
          }
        }}
        title="Excluir Empresa"
        message={`Tem certeza que deseja excluir a empresa "${deleteCompanyConfirm.company?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={deleteGroupConfirm.isOpen}
        onClose={() => setDeleteGroupConfirm({ isOpen: false, group: null })}
        onConfirm={() => {
          if (deleteGroupConfirm.group) {
            deleteGroup(deleteGroupConfirm.group.id);
          }
        }}
        title="Excluir Grupo"
        message={`Tem certeza que deseja excluir o grupo "${deleteGroupConfirm.group?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={deleteCollaboratorConfirm.isOpen}
        onClose={() => setDeleteCollaboratorConfirm({ isOpen: false, collaborator: null })}
        onConfirm={() => {
          if (deleteCollaboratorConfirm.collaborator) {
            deleteCollaborator(deleteCollaboratorConfirm.collaborator.id);
          }
        }}
        title="Excluir Colaborador"
        message={`Tem certeza que deseja excluir o colaborador "${deleteCollaboratorConfirm.collaborator?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ isOpen: false, message: '', type: 'info' })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default SettingsModule;


