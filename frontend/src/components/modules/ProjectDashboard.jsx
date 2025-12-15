import React, { useEffect, useState } from 'react';
import { Plus, Layout, ChevronRight, Edit2, Trash2, MoreVertical, ArrowLeft, Folder } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { useBoards } from '../../hooks/useBoards';
import { Button, ConfirmationDialog, Toast } from '../ui';
import ProjectsListView from './ProjectsListView';
import MemberAvatarGroup from '../common/MemberAvatarGroup';
import BoardModal from './modals/BoardModal';

/**
 * Project dashboard component
 * Displays project overview and boards
 * 
 * @module components/modules/ProjectDashboard
 */
const ProjectDashboard = () => {
  const { activeProjectId, goToBoard, exitProject } = useNavigation();
  const { projects, fetchProjects } = useApp();
  const { fetchBoards, addBoard, updateBoard, deleteBoard } = useBoards();
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [showMenu, setShowMenu] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, board: null });
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.board-menu-container')) {
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

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Fetch boards when project changes
  useEffect(() => {
    if (activeProjectId) {
      setLoadingBoards(true);
      fetchBoards(activeProjectId)
        .then((data) => {
          setBoards(data);
          // Update project with boards
          const updatedProjects = projects.map((p) =>
            p.id === activeProjectId ? { ...p, boards: data } : p
          );
          // Note: This is a workaround. Ideally, projects should be refetched
        })
        .catch((err) => {
          console.error('Error fetching boards:', err);
        })
        .finally(() => {
          setLoadingBoards(false);
        });
    }
  }, [activeProjectId]);

  if (!activeProject) {
    return <ProjectsListView />;
  }

  const projectBoards = activeProject?.boards || boards;
  const totalBoards = projectBoards.length;
  const totalCards = projectBoards.reduce(
    (acc, b) => acc + (b.cards?.length || 0),
    0
  );

  const openBoardModal = (board = null) => {
    setEditingBoard(board);
    setIsBoardModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 p-8 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={exitProject}
            className="p-2 h-10 w-10 rounded-lg hover:bg-gray-100 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{activeProject.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500">Visualização do Projeto</span>
              {activeProject.department && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm font-medium text-gray-700">{activeProject.department}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div>
          <Button
            onClick={() => openBoardModal(null)}
            icon={Plus}
            className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-sm"
          >
            Novo Quadro
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Quadros</span>
            <Layout className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{totalBoards}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Total de Cards</span>
            <div className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-500">#</div>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{totalCards}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Equipe do Projeto</span>
            <div className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">{activeProject.members?.length || 0} membros</div>
          </div>
          <div className="flex items-center gap-2">
            <MemberAvatarGroup
              members={[
                ...(activeProject.user && !activeProject.members?.some(m => m.user.id === activeProject.user.id) ? [activeProject.user] : []),
                ...(activeProject.members?.map(m => m.user) || [])
              ]}
              limit={5}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          Quadros
          <span className="text-xs font-normal text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">{totalBoards}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loadingBoards && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
              <p className="text-sm">Carregando quadros...</p>
            </div>
          )}

          {!loadingBoards && projectBoards.map((board) => (
            <div
              key={board.id}
              className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 flex flex-col h-44 relative cursor-pointer"
              onClick={() => goToBoard(activeProjectId, board.id)}
            >
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1 pr-8">
                    {board.name}
                  </h3>

                  <div className="absolute top-4 right-3 board-menu-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu({ ...showMenu, [board.id]: !showMenu[board.id] });
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {showMenu[board.id] && (
                      <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-10 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu({});
                            openBoardModal(board);
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu({});
                            setDeleteConfirm({ isOpen: true, board });
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                  {board.description || <span className="italic opacity-50">Sem descrição</span>}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-gray-400 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <Layout size={12} />
                    {board.columns?.length || 0} colunas
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    {board._count?.cards || board.cards?.length || 0} cards
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loadingBoards && (
            <button
              onClick={() => openBoardModal(null)}
              className="h-44 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 group text-gray-400"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                <Plus size={20} className="text-gray-400 group-hover:text-gray-600" />
              </div>
              <span className="text-sm font-medium group-hover:text-gray-600">Criar Novo Quadro</span>
            </button>
          )}
        </div>
      </div>
      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => {
          setIsBoardModalOpen(false);
          setEditingBoard(null);
        }}
        projectId={activeProjectId}
        board={editingBoard}
        onSuccess={() => fetchBoards(activeProjectId).then(setBoards)}
      />
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, board: null })}
        onConfirm={() => {
          if (deleteConfirm.board) {
            deleteBoard(activeProjectId, deleteConfirm.board.id).then(() => {
              fetchBoards(activeProjectId).then(setBoards);
              fetchProjects();
            });
          }
        }}
        title="Excluir Board"
        message={`Tem certeza que deseja excluir o board "${deleteConfirm.board?.name}"? Esta ação não pode ser desfeita e todos os cards serão excluídos.`}
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

export default ProjectDashboard;

