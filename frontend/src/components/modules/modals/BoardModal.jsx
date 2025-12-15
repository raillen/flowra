import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../../ui';
import { useApp } from '../../../contexts/AppContext';
import { useBoards } from '../../../hooks/useBoards';

/**
 * Board creation/edition modal component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.projectId - Project ID for the board
 * @param {Object|null} props.board - Board to edit (null for new board)
 * @param {Function} props.onSuccess - Optional callback called after successful creation/update
 */
const BoardModal = ({ isOpen, onClose, projectId, board = null, onSuccess }) => {
  const { projects, fetchProjects } = useApp();
  const { addBoard, updateBoard } = useBoards();
  const [boardName, setBoardName] = useState('');
  const [selectedProjectForBoard, setSelectedProjectForBoard] = useState(
    projectId || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or board/projectId changes
  useEffect(() => {
    if (isOpen) {
      // Debug logging - only log essential fields to avoid circular references
      if (board) {
        /** 
         * Debug logging removed
         */
      }

      if (board && board.id) {
        // Edit mode - ensure we have valid board data
        setBoardName(board.name || '');
        // For editing, use the projectId from the board or from props
        // If board doesn't have projectId, use the prop projectId
        setSelectedProjectForBoard(board.projectId || projectId || '');
      } else {
        // Create mode
        setBoardName('');
        setSelectedProjectForBoard(projectId || '');
      }
      setError('');
    }
  }, [isOpen, board, projectId]);

  const handleSaveBoard = async () => {
    if (!boardName.trim() || !selectedProjectForBoard) {
      setError('Nome do board e projeto são obrigatórios');
      return;
    }

    // Validate board ID when editing
    if (board && !board.id) {
      setError('Erro: ID do board não encontrado. Por favor, recarregue a página.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (board && board.id) {
        // Update existing board
        // Use selectedProjectForBoard (which should be board.projectId or projectId prop)
        const projectIdToUse = selectedProjectForBoard || board.projectId || projectId;
        if (!projectIdToUse) {
          setError('Erro: ID do projeto não encontrado.');
          setLoading(false);
          return;
        }
        await updateBoard(projectIdToUse, board.id, { name: boardName.trim() });
      } else {
        // Create new board
        await addBoard(selectedProjectForBoard, { name: boardName.trim() });
      }

      // Refresh projects to get updated boards
      await fetchProjects();

      // Call success callback if provided to refresh boards list
      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Erro ao ${board ? 'atualizar' : 'criar'} board`;
      setError(errorMessage);
      console.error('Error saving board:', {
        board,
        projectId: selectedProjectForBoard,
        error: err.response?.data || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={board ? 'Editar Quadro Kanban' : 'Novo Quadro Kanban'}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nome *
          </label>
          <input
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ex: Sprint 10..."
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Projeto Relacionado *
          </label>
          {projects.length > 0 ? (
            <select
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={selectedProjectForBoard}
              onChange={(e) => setSelectedProjectForBoard(e.target.value)}
              disabled={!!board} // Disable project selection when editing
            >
              <option value="" disabled>
                Selecione...
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200 mb-2">
              Crie um projeto antes.
            </div>
          )}
        </div>
        <Button
          onClick={handleSaveBoard}
          className="w-full"
          disabled={!selectedProjectForBoard || !boardName.trim() || loading}
        >
          {loading ? (board ? 'Salvando...' : 'Criando...') : (board ? 'Salvar Alterações' : 'Criar Board')}
        </Button>
      </div>
    </Modal>
  );
};

export default BoardModal;

