import React, { useState, useEffect } from 'react';
import { Plus, Folder, Edit2, Trash2, MoreVertical, Users, Layout, Clock, Search, Grid, List, Star, ChevronRight } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { Button, Badge, ConfirmationDialog } from '../ui';
import MemberAvatarGroup from '../common/MemberAvatarGroup';
import ProjectModal from './modals/ProjectModal';
import { RefreshCw } from 'lucide-react';

/**
 * Projects list view component
 * Redesigned with modern cards and gradients
 * 
 * @module components/modules/ProjectsListView
 */
const ProjectsListView = () => {
  const { selectProject, activeProjectId } = useNavigation();
  const { projects, companies, projectsLoading, projectsError, fetchProjects, deleteProject } = useApp();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showMenu, setShowMenu] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, project: null });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects by search
  const filteredProjects = projects.filter(proj =>
    proj?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proj?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.project-menu-container')) {
        setShowMenu({});
      }
    };

    if (Object.keys(showMenu).length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const getProjectGradient = (index) => {
    const gradients = [
      'from-blue-500 to-cyan-400',
      'from-violet-500 to-purple-400',
      'from-emerald-500 to-teal-400',
      'from-rose-500 to-pink-400',
      'from-amber-500 to-orange-400',
      'from-indigo-500 to-blue-400',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Meus Projetos</h1>
            <p className="text-slate-500 mt-1">
              {projects.length} projetos • Selecione para gerenciar
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={fetchProjects}
              icon={RefreshCw}
              disabled={projectsLoading}
            >
              {projectsLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
            <Button
              onClick={() => setIsProjectModalOpen(true)}
              icon={Plus}
              className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-lg shadow-primary-600/25"
            >
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {projectsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 size={18} />
            </div>
            <div>
              <p className="font-medium">Erro ao carregar projetos</p>
              <p className="text-sm text-red-600">{projectsError}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {projectsLoading && projects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Carregando projetos...</p>
          </div>
        )}

        {/* Empty State */}
        {!projectsLoading && filteredProjects.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Folder size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {searchQuery ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {searchQuery ? `Não encontramos projetos com "${searchQuery}"` : 'Crie seu primeiro projeto para começar a organizar suas tarefas'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsProjectModalOpen(true)} icon={Plus}>
                Criar Primeiro Projeto
              </Button>
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.filter(proj => proj && proj.id).map((proj, idx) => {
              const compName = companies.find((c) => c.id === proj.companyId)?.name;
              const gradient = getProjectGradient(idx);
              const isActive = activeProjectId === proj.id;

              return (
                <div
                  key={proj.id}
                  className={`group bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden hover:shadow-xl ${isActive ? 'border-primary-400 shadow-lg shadow-primary-500/10' : 'border-slate-100 hover:border-slate-200'
                    }`}
                >
                  {/* Gradient Header */}
                  <div
                    className={`h-2 bg-gradient-to-r ${gradient}`}
                  />

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div
                        onClick={() => selectProject(proj.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all bg-gradient-to-br ${gradient} text-white shadow-lg`}
                      >
                        <Folder size={22} />
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                            Ativo
                          </span>
                        )}
                        <div className="relative project-menu-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu({ ...showMenu, [proj.id]: !showMenu[proj.id] });
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {showMenu[proj.id] && (
                            <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-xl z-50 min-w-[140px] overflow-hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProject(proj);
                                  setIsProjectModalOpen(true);
                                  setShowMenu({ ...showMenu, [proj.id]: false });
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit2 size={14} />
                                Editar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm({ isOpen: true, project: proj });
                                  setShowMenu({ ...showMenu, [proj.id]: false });
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div onClick={() => selectProject(proj.id)} className="cursor-pointer">
                      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">
                        {proj.name}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[40px]">
                        {proj.description || 'Sem descrição.'}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Layout size={14} />
                        {proj.boards?.length || 0} boards
                      </span>
                      {compName && (
                        <span className="flex items-center gap-1 text-slate-400">
                          •
                          {compName}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <MemberAvatarGroup
                        members={[
                          ...(proj.user && !proj.members?.some(m => m.user.id === proj.user.id) ? [proj.user] : []),
                          ...(proj.members?.map(m => m.user) || [])
                        ]}
                        limit={4}
                        size="sm"
                      />
                      <button
                        onClick={() => selectProject(proj.id)}
                        className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Abrir <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create New Project Card */}
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="min-h-[260px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50/30 transition-all gap-3 group"
            >
              <div className="p-4 bg-slate-100 rounded-2xl group-hover:bg-primary-100 transition-colors">
                <Plus size={28} />
              </div>
              <span className="font-medium">Criar Novo Projeto</span>
            </button>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase">
              <div className="col-span-5">Projeto</div>
              <div className="col-span-2">Departamento</div>
              <div className="col-span-2">Boards</div>
              <div className="col-span-2">Membros</div>
              <div className="col-span-1"></div>
            </div>
            {filteredProjects.filter(proj => proj && proj.id).map((proj, idx) => {
              const compName = companies.find((c) => c.id === proj.companyId)?.name;
              const gradient = getProjectGradient(idx);
              const isActive = activeProjectId === proj.id;

              return (
                <div
                  key={proj.id}
                  onClick={() => selectProject(proj.id)}
                  className={`grid grid-cols-12 gap-4 p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${isActive ? 'bg-primary-50/50' : ''}`}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white`}>
                      <Folder size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{proj.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{proj.description || 'Sem descrição'}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge>{proj.department || '—'}</Badge>
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-slate-600">
                    {proj.boards?.length || 0} boards
                  </div>
                  <div className="col-span-2 flex items-center">
                    <MemberAvatarGroup
                      members={[
                        ...(proj.user && !proj.members?.some(m => m.user.id === proj.user.id) ? [proj.user] : []),
                        ...(proj.members?.map(m => m.user) || [])
                      ]}
                      limit={3}
                      size="xs"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
          project={editingProject}
          onSuccess={fetchProjects}
        />
        <ConfirmationDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, project: null })}
          onConfirm={() => {
            if (deleteConfirm.project) {
              deleteProject(deleteConfirm.project.id);
            }
          }}
          title="Excluir Projeto"
          message={`Tem certeza que deseja excluir o projeto "${deleteConfirm.project?.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default ProjectsListView;
