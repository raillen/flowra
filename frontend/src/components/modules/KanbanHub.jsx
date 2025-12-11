import React, { useEffect, useState } from 'react';
import { Plus, Folder, ArrowRightLeft, Layout } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';
import { useBoards } from '../../hooks/useBoards';
import { Button } from '../ui';
import BoardModal from './modals/BoardModal';

/**
 * Kanban hub component
 * Displays all boards organized by project
 * 
 * @module components/modules/KanbanHub
 */
const KanbanHub = () => {
  const { projects, fetchProjects } = useApp();
  const { goToBoard } = useNavigation();
  const { fetchBoards } = useBoards();
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [projectsWithBoards, setProjectsWithBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState({});
  const [selectedProjectIdForModal, setSelectedProjectIdForModal] = useState(null);

  /**
   * Opens the board creation modal
   * @param {string|null} projectId - Optional project ID to pre-select
   */
  const openBoardModal = (projectId = null) => {
    setSelectedProjectIdForModal(projectId);
    setIsBoardModalOpen(true);
  };

  // Load boards for all projects
  useEffect(() => {
    let cancelled = false;

    const loadAllBoards = async () => {
      const projectsData = await Promise.all(
        projects.map(async (proj) => {
          if (cancelled) return proj;

          // Always fetch fresh boards for each project
          try {
            setLoadingBoards((prev) => ({ ...prev, [proj.id]: true }));
            const boards = await fetchBoards(proj.id);
            if (cancelled) return proj;
            return { ...proj, boards: boards || [] };
          } catch (err) {
            // Silently handle errors for now
            return { ...proj, boards: [] };
          } finally {
            if (!cancelled) {
              setLoadingBoards((prev) => ({ ...prev, [proj.id]: false }));
            }
          }
        })
      );

      if (!cancelled) {
        setProjectsWithBoards(projectsData);
      }
    };

    if (projects.length > 0) {
      loadAllBoards();
    } else {
      setProjectsWithBoards([]);
    }

    return () => {
      cancelled = true;
    };
  }, [projects, fetchBoards]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 p-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Todos os Quadros</h2>
          <p className="text-slate-500">
            Visualização de Kanban segmentada por projetos.
          </p>
        </div>
        <Button onClick={openBoardModal} icon={Plus}>
          Novo Board
        </Button>
      </div>
      {projectsWithBoards.filter(proj => proj && proj.id).map((proj) => (
        <div key={proj.id} className="space-y-4">
          <div className="flex items-center gap-2">
            <Folder size={18} className="text-slate-400" />
            <h3 className="text-lg font-bold text-slate-700">{proj.name || 'Projeto sem nome'}</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {proj.boards?.length || 0}
            </span>
            {loadingBoards[proj.id] && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingBoards[proj.id] ? (
              <div className="col-span-4 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Carregando boards...</p>
              </div>
            ) : (
              <>
                {proj.boards?.map((board) => (
                  <div
                    key={board.id}
                    onClick={() => goToBoard(proj.id, board.id)}
                    className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
                  >
                    <div className="h-1 bg-indigo-500 w-full"></div>
                    <div className="p-4">
                      <h4 className="font-bold text-slate-800 mb-1 flex items-center justify-between">
                        {board.name}
                        <ArrowRightLeft
                          size={14}
                          className="opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity"
                        />
                      </h4>
                      <p className="text-xs text-slate-500">
                        {board.cards?.length || 0} atividades • {board.columns?.length || 0} colunas
                      </p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => openBoardModal(proj.id)}
                  className="rounded-lg border border-dashed border-slate-300 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all h-[86px]"
                >
                  <Plus size={16} /> Novo em {proj.name ? proj.name.split(' ')[0] : 'Projeto'}...
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      {projectsWithBoards.length === 0 && !projects.length && (
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">Você ainda não tem projetos.</p>
        </div>
      )}
      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => {
          setIsBoardModalOpen(false);
          setSelectedProjectIdForModal(null);
        }}
        projectId={selectedProjectIdForModal}
        onSuccess={async () => {
          // Reload boards for the specific project
          if (selectedProjectIdForModal) {
            const boards = await fetchBoards(selectedProjectIdForModal);
            setProjectsWithBoards(prev =>
              prev.map(p => p.id === selectedProjectIdForModal
                ? { ...p, boards: boards || [] }
                : p
              )
            );
          }
        }}
      />
    </div>
  );
};

export default KanbanHub;

