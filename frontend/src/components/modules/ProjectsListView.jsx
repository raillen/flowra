import React, { useState, useEffect } from 'react';
import { Plus, Folder, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { Button, Badge, ConfirmationDialog } from '../ui';
import MemberAvatarGroup from '../common/MemberAvatarGroup';
import ProjectModal from './modals/ProjectModal';
import { RefreshCw } from 'lucide-react';

/**
 * Projects list view component
 * Displays all projects in a grid layout
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

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Meus Projetos</h1>
          <p className="text-slate-500 mt-1">
            Selecione um projeto para gerenciar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={fetchProjects}
            icon={RefreshCw}
            disabled={projectsLoading}
          >
            Atualizar
          </Button>
          <Button onClick={() => setIsProjectModalOpen(true)} icon={Plus}>
            Novo Projeto
          </Button>
        </div>
      </div>
      {projectsError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {projectsError}
        </div>
      )}
      {projectsLoading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Carregando projetos...</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.filter(proj => proj && proj.id).map((proj) => {
          const compName = companies.find((c) => c.id === proj.companyId)?.name;
          console.log('[ProjectsListView] Project:', proj.name, 'Members:', proj.members); // DEBUG
          return (
            <div
              key={proj.id}
              className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-48 relative overflow-hidden"
            >
              {activeProjectId === proj.id && (
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div
                  onClick={() => selectProject(proj.id)}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors cursor-pointer"
                >
                  <Folder size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <Badge>{proj.department}</Badge>
                    {compName && (
                      <span className="text-[10px] text-slate-400 mt-1">
                        {compName}
                      </span>
                    )}
                  </div>
                  <div className="relative project-menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu({ ...showMenu, [proj.id]: !showMenu[proj.id] });
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {showMenu[proj.id] && (
                      <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProject(proj);
                            setIsProjectModalOpen(true);
                            setShowMenu({ ...showMenu, [proj.id]: false });
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
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
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div onClick={() => selectProject(proj.id)} className="cursor-pointer flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {proj.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {proj.description || 'Sem descrição.'}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-xs font-medium text-slate-400">
                  {proj.boards?.length || 0} boards
                </span>
                <MemberAvatarGroup
                  members={[
                    ...(proj.user && !proj.members?.some(m => m.user.id === proj.user.id) ? [proj.user] : []),
                    ...(proj.members?.map(m => m.user) || [])
                  ]}
                  limit={3}
                  size="sm"
                />
              </div>
            </div>
          );
        })}
        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="h-48 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all gap-2"
        >
          <Plus size={32} />
          <span className="font-medium">Criar Novo Projeto</span>
        </button>
      </div>
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
  );
};

export default ProjectsListView;

