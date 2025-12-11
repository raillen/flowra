import React, { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Layout,
  Plus,
  Filter,
  Grid3x3,
  List,
  Calendar,
  AlertCircle,
  GripVertical,
  Edit2,
  Trash2,
  X,
  Check,
  User,
  MessageSquare,
  Paperclip,
  Settings,
  Clock,
  BarChart3,
  Layers,
  GitBranch,
} from 'lucide-react';
import CalendarView from './CalendarView';
import { TimelineView, GanttView, SwimlanesView, HierarchyView, ViewModeSelector, FilterPanel } from './views';
import KanbanCard from './cards/KanbanCard';
import { useNavigation } from '../../contexts/NavigationContext';
import { useBoards } from '../../hooks/useBoards';
import { Button, Badge, Modal, ConfirmationDialog } from '../ui';
import LoadingSpinner from '../common/LoadingSpinner';
import MemberAvatarGroup from '../common/MemberAvatarGroup';
import ErrorMessage from '../common/ErrorMessage';
import * as cardService from '../../services/cardService';
import * as columnService from '../../services/columnService';
import * as tagService from '../../services/tagService';
import CardModal from './modals/CardModal';
import BoardSettingsModal from './modals/BoardSettingsModal';
import { useBoardConfig } from '../../hooks/useBoardConfig';
import ExtendedCardFields from './cards/ExtendedCardFields';
import MemberManagementModal from './modals/MemberManagementModal';
import { UserPlus } from 'lucide-react';


/**
 * Sortable Card Component
 * Wraps KanbanCard for drag-and-drop functionality
 */
const SortableCard = ({ card, onEdit, onDelete, onClick, viewMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    alta: 'bg-red-400',
    media: 'bg-yellow-400',
    baixa: 'bg-green-400',
  };

  const handleListCardClick = (e) => {
    if (isDragging) return;
    if (e.target.closest('.drag-handle') || e.target.closest('button')) {
      return;
    }
    if (onClick) {
      onClick(card);
    }
  };

  // List view mode
  if (viewMode === 'list') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleListCardClick}
        className={`bg-surface p-4 rounded-lg border border-border hover:shadow-md transition-all flex items-center justify-between group cursor-pointer ${isDragging ? 'opacity-50 ring-2 ring-primary/50' : ''
          }`}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="drag-handle cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary z-10"
          >
            <GripVertical size={16} />
          </div>
          {card.priority && (
            <div className={`h-2 w-2 rounded-full ${priorityColors[card.priority] || 'bg-slate-300'}`}></div>
          )}
          <div className="flex-1">
            <h4 className="font-medium text-text-primary">{card.title}</h4>
            {card.dueDate && (
              <p className="text-xs text-text-secondary mt-1">
                {new Date(card.dueDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit(card);
            }}
            className="p-1 text-text-secondary hover:text-primary z-10"
            type="button"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(card.id);
            }}
            className="p-1 text-text-secondary hover:text-red-600 z-10"
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Kanban view mode - use KanbanCard component
  return (
    <div ref={setNodeRef} style={style}>
      <KanbanCard
        card={card}
        isDragging={isDragging}
        onClick={() => onClick && onClick(card)}
        onMenuClick={onEdit}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

/**
 * Sortable Column Component
 * Enhanced with better styling and drag feedback
 */
const SortableColumn = ({
  column,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onCardClick,
  onEditColumn,
  onDeleteColumn,
  viewMode,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const columnCards = cards.filter((c) => c.columnId === column.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        w-80 flex flex-col rounded-xl h-full transition-all duration-200
        ${isDragging ? 'opacity-50 ring-2 ring-primary/50' : ''}
        ${isOver ? 'ring-2 ring-primary/50 ring-offset-2' : ''}
        ${column.color || 'bg-background/80'}
        border border-border shadow-sm
      `}
    >
      {/* Column header */}
      <div className="p-4 border-b border-border flex items-center justify-between group">
        <div className="flex items-center gap-2.5 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary transition-colors"
          >
            <GripVertical size={16} />
          </div>
          <span className="font-semibold text-text-primary">{column.title}</span>
          <Badge color="bg-surface text-text-secondary">{columnCards.length}</Badge>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditColumn(column)}
            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="p-1.5 text-text-secondary hover:text-red-600 hover:bg-red-50/10 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Column content */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar min-h-[200px]">
        {columnCards.length > 0 ? (
          <SortableContext items={columnCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {columnCards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
                onClick={onCardClick}
                viewMode={viewMode}
              />
            ))}
          </SortableContext>
        ) : (
          <div className="text-center py-8 text-text-secondary">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-hover flex items-center justify-center">
              <Plus size={20} className="text-text-secondary" />
            </div>
            <p className="text-sm font-medium mb-1">Coluna vazia</p>
            <p className="text-xs">Arraste cards ou adicione novos</p>
          </div>
        )}
      </div>


      {/* Add card button */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => onAddCard(column.id)}
          className="w-full py-2.5 px-4 text-sm font-medium text-text-secondary hover:text-primary 
                     bg-background hover:bg-surface-hover rounded-lg border border-dashed border-border 
                     hover:border-primary/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Adicionar Card
        </button>
      </div>
    </div>
  );
};



/**
 * Kanban board view component
 * Complete Kanban implementation with drag and drop, filters, and view modes
 * 
 * @module components/modules/KanbanBoardView
 */
const KanbanBoardView = () => {
  const { activeProjectId, activeBoardId, setActiveBoardId } = useNavigation();
  const { fetchBoard, addMember, removeMember } = useBoards();
  const { fields: enabledFields, fetchConfig: fetchBoardConfig } = useBoardConfig(activeBoardId);
  const [activeBoard, setActiveBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list, calendar, timeline, gantt, swimlanes, hierarchy
  const [filters, setFilters] = useState({});
  const [boardUsers, setBoardUsers] = useState([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isCardDetailModalOpen, setIsCardDetailModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [boardTags, setBoardTags] = useState([]);
  const [deleteCardConfirm, setDeleteCardConfirm] = useState({ isOpen: false, cardId: null });
  const [deleteColumnConfirm, setDeleteColumnConfirm] = useState({ isOpen: false, columnId: null, columnName: '' });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch board data - only when IDs change, not when fetchBoard changes
  useEffect(() => {
    let cancelled = false;

    if (activeProjectId && activeBoardId) {
      setLoadingBoard(true);
      setError(null);

      fetchBoard(activeProjectId, activeBoardId)
        .then((board) => {
          if (cancelled) return;

          setActiveBoard(board);
          setColumns(board.columns || []);
          setCards(board.cards || []);
          setBoardTags(board.tags || []);
        })
        .catch((err) => {
          if (cancelled) return;

          const errorMessage = err.response?.data?.message || err.message || 'Erro ao carregar board';
          setError(errorMessage);
        })
        .finally(() => {
          if (!cancelled) {
            setLoadingBoard(false);
          }
        });
    } else {
      setLoadingBoard(false);
      setActiveBoard(null);
      setColumns([]);
      setCards([]);
      setBoardTags([]);
    }

    // Cleanup function to cancel request if component unmounts or IDs change
    return () => {
      cancelled = true;
    };
  }, [activeProjectId, activeBoardId]); // Removed fetchBoard from dependencies

  // Load tags
  useEffect(() => {
    if (activeProjectId && activeBoardId) {
      tagService
        .getTags(activeProjectId, activeBoardId)
        .then(setBoardTags)
        .catch(() => { /* Silently ignore tag loading errors */ });
    }
  }, [activeProjectId, activeBoardId]);


  // Filter cards
  const filteredCards = cards.filter((card) => {
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchTitle = card.title?.toLowerCase().includes(search);
      const matchDesc = card.description?.toLowerCase().includes(search);
      if (!matchTitle && !matchDesc) return false;
    }

    // Priority filter
    if (filters.priority && card.priority !== filters.priority) {
      return false;
    }

    // Status filter
    if (filters.status && card.status !== filters.status) {
      return false;
    }

    // Type filter
    if (filters.type && card.type !== filters.type) {
      return false;
    }

    // Due date preset filter
    if (filters.dueDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const dueDate = card.dueDate ? new Date(card.dueDate) : null;

      if (filters.dueDate === 'overdue') {
        if (!dueDate || dueDate >= now) return false;
      } else if (filters.dueDate === 'today') {
        if (!dueDate || dueDate.toDateString() !== now.toDateString()) return false;
      } else if (filters.dueDate === 'week') {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() + 7);
        if (!dueDate || dueDate < now || dueDate > weekEnd) return false;
      } else if (filters.dueDate === 'month') {
        const monthEnd = new Date(now);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        if (!dueDate || dueDate < now || dueDate > monthEnd) return false;
      } else if (filters.dueDate === 'no_date') {
        if (dueDate) return false;
      }
    }

    // Assignee filter
    if (filters.assignee) {
      const hasAssignee = card.assignedUserId === filters.assignee ||
        card.assignees?.some(a => a.userId === filters.assignee || a.id === filters.assignee);
      if (!hasAssignee) return false;
    }

    // Progress filter
    if (filters.progress) {
      const progress = card.progress || 0;
      const [min, max] = filters.progress.split('-').map(Number);
      if (progress < min || progress > max) return false;
    }

    // Tag filter
    if (filters.tag) {
      const hasTag = card.tags?.some(t => t.id === filters.tag || t.tagId === filters.tag);
      if (!hasTag) return false;
    }

    // Date range filters
    if (filters.startDate) {
      const filterDate = new Date(filters.startDate);
      const cardStart = card.startDate ? new Date(card.startDate) : null;
      if (!cardStart || cardStart < filterDate) return false;
    }
    if (filters.endDate) {
      const filterDate = new Date(filters.endDate);
      const cardDue = card.dueDate ? new Date(card.dueDate) : null;
      if (!cardDue || cardDue > filterDate) return false;
    }

    // Custom Fields filter
    if (enabledFields.customFields?.definitions) {
      for (const def of enabledFields.customFields.definitions) {
        const filterValue = filters[`custom_${def.id}`];
        if (filterValue) {
          const cardValue = card.customFields?.[def.id];

          // If card has no value for this field, it doesn't match
          if (cardValue === undefined || cardValue === null || cardValue === '') return false;

          // Type-specific comparison
          if (def.type === 'text') {
            if (!String(cardValue).toLowerCase().includes(filterValue.toLowerCase())) return false;
          } else if (def.type === 'boolean' || def.type === 'checkbox') {
            // filterValue is 'true' or 'false' string
            const boolCardValue = Boolean(cardValue);
            if (String(boolCardValue) !== filterValue) return false;
          } else {
            // Exact match for select, number, date (string comparison matches effectively for them)
            if (String(cardValue) !== filterValue) return false;
          }
        }
      }
    }

    return true;
  });

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Check if dragging a card
    const activeCard = cards.find((c) => c.id === active.id);
    if (activeCard) {
      // Check if dropped on a column
      const overColumn = columns.find((col) => col.id === over.id);
      if (overColumn) {
        // Moving card to different column
        if (activeCard.columnId !== overColumn.id) {
          try {
            await cardService.moveCard(activeProjectId, activeBoardId, activeCard.id, overColumn.id);
            setCards((prev) =>
              prev.map((c) => (c.id === activeCard.id ? { ...c, columnId: overColumn.id } : c))
            );
          } catch (err) {
            setError(err.response?.data?.message || 'Erro ao mover card');
          }
        }
        return;
      }

      // Check if dropped on another card
      const overCard = cards.find((c) => c.id === over.id);
      if (overCard) {
        const targetColumnId = overCard.columnId;

        // If moving to different column
        if (activeCard.columnId !== targetColumnId) {
          try {
            await cardService.moveCard(activeProjectId, activeBoardId, activeCard.id, targetColumnId);
            setCards((prev) =>
              prev.map((c) => (c.id === activeCard.id ? { ...c, columnId: targetColumnId } : c))
            );
          } catch (err) {
            setError(err.response?.data?.message || 'Erro ao mover card');
          }
        } else {
          // Reordering within same column
          const columnCards = cards.filter((c) => c.columnId === targetColumnId);
          const oldIndex = columnCards.findIndex((c) => c.id === activeCard.id);
          const newIndex = columnCards.findIndex((c) => c.id === overCard.id);

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const reorderedCards = arrayMove(columnCards, oldIndex, newIndex);
            // Update local state optimistically
            setCards((prev) => {
              const otherCards = prev.filter((c) => c.columnId !== targetColumnId);
              return [...otherCards, ...reorderedCards];
            });

            // TODO: Implement backend endpoint to update card order within column
            // For now, we just update the UI optimistically
          }
        }
        return;
      }
    }

    // Check if dragging a column
    const oldIndex = columns.findIndex((col) => col.id === active.id);
    const newIndex = columns.findIndex((col) => col.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      setColumns(newColumns);

      // Update order in backend
      try {
        const orderUpdates = newColumns.map((col, index) => ({
          id: col.id,
          order: index + 1, // Order should start from 1
        }));
        await columnService.updateColumnOrder(activeProjectId, activeBoardId, orderUpdates);
      } catch (err) {
        // Revert on error
        setColumns(columns);
        setError(err.response?.data?.message || 'Erro ao reordenar colunas');
      }
    }
  };

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Card operations
  const handleAddCard = (columnId) => {
    setSelectedColumnId(columnId);
    setEditingCard(null);
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setSelectedColumnId(card.columnId);
    setIsCardModalOpen(true);
  };

  const handleCardClick = (card) => {
    if (!card) {
      return;
    }
    setEditingCard(card);
    setSelectedColumnId(card.columnId); // Ensure column context
    setIsCardModalOpen(true);
  };

  const handleCardUpdate = (updatedCard) => {
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    setEditingCard(updatedCard); // Keep editing context updated
  };

  const handleSaveCard = async (cardData) => {
    try {
      setError(null);

      if (editingCard) {
        const updated = await cardService.updateCard(
          activeProjectId,
          activeBoardId,
          editingCard.id,
          cardData
        );
        setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const newCard = await cardService.createCard(
          activeProjectId,
          activeBoardId,
          selectedColumnId,
          cardData
        );
        setCards((prev) => [...prev, newCard]);
      }
      setIsCardModalOpen(false);
      setEditingCard(null);
      setSelectedColumnId(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.errors ||
        err.message ||
        'Erro ao salvar card';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  const handleDeleteCard = (cardId) => {
    setDeleteCardConfirm({ isOpen: true, cardId });
  };

  const confirmDeleteCard = async () => {
    if (!deleteCardConfirm.cardId) return;

    try {
      setError(null);
      await cardService.deleteCard(activeProjectId, activeBoardId, deleteCardConfirm.cardId);
      setCards((prev) => prev.filter((c) => c.id !== deleteCardConfirm.cardId));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir card');
    }
  };

  // Column operations
  const handleAddColumn = () => {
    setEditingColumn(null);
    setIsColumnModalOpen(true);
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = async (columnData) => {
    try {
      setError(null);
      if (editingColumn) {
        const updated = await columnService.updateColumn(
          activeProjectId,
          activeBoardId,
          editingColumn.id,
          columnData
        );
        setColumns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const newColumn = await columnService.createColumn(
          activeProjectId,
          activeBoardId,
          columnData
        );
        setColumns((prev) => [...prev, newColumn]);
      }
      setIsColumnModalOpen(false);
      setEditingColumn(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar coluna');
    }
  };

  const handleDeleteColumn = (columnId) => {
    const column = columns.find((c) => c.id === columnId);
    setDeleteColumnConfirm({ isOpen: true, columnId, columnName: column?.title });
  };

  const confirmDeleteColumn = async () => {
    if (!deleteColumnConfirm.columnId) return;

    try {
      setError(null);
      await columnService.deleteColumn(activeProjectId, activeBoardId, deleteColumnConfirm.columnId);
      setColumns((prev) => prev.filter((c) => c.id !== deleteColumnConfirm.columnId));
      setCards((prev) => prev.filter((c) => c.columnId !== deleteColumnConfirm.columnId));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir coluna');
    }
  };

  if (loadingBoard) {
    return <LoadingSpinner message="Carregando board..." />;
  }

  if (error && !activeBoard) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-2">Erro ao carregar board</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              if (activeProjectId && activeBoardId) {
                fetchBoard(activeProjectId, activeBoardId)
                  .then((board) => {
                    setActiveBoard(board);
                    setColumns(board.columns || []);
                    setCards(board.cards || []);
                    setBoardTags(board.tags || []);
                    setError(null);
                  })
                  .catch((err) => {
                    setError(err.response?.data?.message || 'Erro ao carregar board');
                  });
              }
            }}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!activeBoard && !loadingBoard) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-2">Board não encontrado</p>
          <p className="text-sm">
            Project ID: {activeProjectId || 'N/A'}, Board ID: {activeBoardId || 'N/A'}
          </p>
        </div>
      </div>
    );
  }

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  return (
    <div className="h-full flex flex-col animate-in fade-in p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Layout size={20} className="text-primary" /> {activeBoard.name}
          </h2>
          <Badge color="bg-primary/10 text-primary">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </Badge>
          <MemberAvatarGroup
            members={[
              ...(activeBoard.project?.user && !activeBoard.members?.some(m => m.user.id === activeBoard.project.user.id) ? [activeBoard.project.user] : []),
              ...(activeBoard.members?.map(m => m.user) || [])
            ]}
            limit={4}
            size="md"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsMemberModalOpen(true)}
            icon={UserPlus}
            className="mr-2"
          >
            Convidar / Membros
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsSettingsModalOpen(true)}
            icon={Settings}
            title="Configurar campos do board"
          >
            Configurar Campos
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setActiveBoardId(null);
              // Keep in kanban module to show KanbanHub
            }}
          >
            Voltar aos Boards
          </Button>
        </div>
      </div>

      {/* Toolbar with View Mode and Actions */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <ViewModeSelector
          currentMode={viewMode}
          onModeChange={setViewMode}
          size="md"
        />

        <div className="flex items-center gap-2">
          <Button onClick={handleAddColumn} icon={Plus} size="sm">
            Nova Coluna
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="mb-4">
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          users={boardUsers}
          tags={boardTags}
          totalCards={cards.length}
          filteredCount={filteredCards.length}
          customFieldDefinitions={enabledFields.customFields?.definitions || []}
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {/* Board Views */}
      {!activeBoard ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Carregando board...</p>
          </div>
        </div>
      ) : viewMode === 'calendar' ? (
        <CalendarView
          cards={filteredCards}
          onCardClick={handleCardClick}
          onCardUpdate={(cardId, updates) => {
            const card = cards.find(c => c.id === cardId);
            if (card) {
              handleSaveCard({ ...card, ...updates });
            }
          }}
        />
      ) : viewMode === 'timeline' ? (
        <TimelineView
          cards={filteredCards}
          columns={columns}
          onCardClick={handleCardClick}
          onCardUpdate={handleCardUpdate}
        />
      ) : viewMode === 'gantt' ? (
        <GanttView
          cards={filteredCards}
          columns={columns}
          onCardClick={handleCardClick}
          onCardUpdate={handleCardUpdate}
        />
      ) : viewMode === 'swimlanes' ? (
        <SwimlanesView
          cards={filteredCards}
          columns={columns}
          onCardClick={handleCardClick}
        />
      ) : viewMode === 'hierarchy' ? (
        <HierarchyView
          cards={filteredCards}
          columns={columns}
          onCardClick={handleCardClick}
        />
      ) : viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto">
          {columns.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-slate-500 mb-4">Este board não tem colunas ainda.</p>
                <Button onClick={handleAddColumn} icon={Plus}>
                  Criar Primeira Coluna
                </Button>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-6 h-full min-w-max pb-4">
                <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  {columns.map((column) => (
                    <SortableColumn
                      key={column.id}
                      column={column}
                      cards={filteredCards}
                      onAddCard={handleAddCard}
                      onEditCard={handleEditCard}
                      onDeleteCard={handleDeleteCard}
                      onCardClick={handleCardClick}
                      onEditColumn={handleEditColumn}
                      onDeleteColumn={handleDeleteColumn}
                      viewMode={viewMode}
                    />
                  ))}
                </SortableContext>
              </div>
              <DragOverlay dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
              }}>
                {activeCard ? (
                  <div className="w-80 animate-card-drag">
                    <KanbanCard card={activeCard} isDragging={true} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      ) : (
        // List View (default)
        <div className="flex-1 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-4 p-4">
              {columns.map((column) => {
                const columnCards = filteredCards.filter((c) => c.columnId === column.id);
                if (columnCards.length === 0 && !filters.search) return null; // Show empty cols if not searching?

                return (
                  <div key={column.id} className="bg-white rounded-lg border border-slate-200">
                    <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${column.color?.replace('bg-', 'bg-opacity-20 bg-') || 'bg-slate-50'}`}>
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${column.color || 'bg-slate-300'}`}></div>
                        {column.title}
                        <Badge color="bg-white/50 text-slate-600">{columnCards.length}</Badge>
                      </h3>
                      <button onClick={() => handleAddCard(column.id)} className="p-1 hover:bg-black/5 rounded"><Plus size={16} /></button>
                    </div>

                    <div className="p-2 space-y-2">
                      <SortableContext items={columnCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {columnCards.map((card) => (
                          <SortableCard
                            key={card.id}
                            card={card}
                            onEdit={handleEditCard}
                            onDelete={handleDeleteCard}
                            onClick={handleCardClick}
                            viewMode={viewMode}
                          />
                        ))}
                      </SortableContext>
                      {columnCards.length === 0 && (
                        <div className="py-4 text-center text-slate-400 text-sm italic">
                          Sem cards
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <DragOverlay>
              {activeCard ? (
                <div className="w-full">
                  <SortableCard card={activeCard} viewMode="list" />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Card Modal */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
          setSelectedColumnId(null);
        }}
        onSave={handleSaveCard}
        card={editingCard}
        columns={columns}
        selectedColumnId={selectedColumnId}
        enabledFields={enabledFields}
        customFieldDefinitions={enabledFields.customFields?.definitions || []}
        projectId={activeProjectId}
        boardId={activeBoardId}
        availableTags={boardTags}
      />

      {/* Column Modal */}
      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => {
          setIsColumnModalOpen(false);
          setEditingColumn(null);
        }}
        onSave={handleSaveColumn}
        column={editingColumn}
      />

      {/* Confirmation Dialogs */}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={deleteCardConfirm.isOpen}
        onClose={() => setDeleteCardConfirm({ isOpen: false, cardId: null })}
        onConfirm={confirmDeleteCard}
        title="Excluir Card"
        message="Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={deleteColumnConfirm.isOpen}
        onClose={() => setDeleteColumnConfirm({ isOpen: false, columnId: null, columnName: '' })}
        onConfirm={confirmDeleteColumn}
        title="Excluir Coluna"
        message={`Tem certeza que deseja excluir a coluna "${deleteColumnConfirm.columnName}"? Todos os cards desta coluna serão excluídos. Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Board Settings Modal */}
      <BoardSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        boardId={activeBoardId}
        projectId={activeProjectId}
        boardName={activeBoard?.name}
        onUpdate={fetchBoardConfig}
      />
    </div>
  );
};



/**
 * Column Modal Component
 */
const ColumnModal = ({ isOpen, onClose, onSave, column }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('bg-slate-100');

  const colorOptions = [
    { value: 'bg-slate-100', label: 'Cinza' },
    { value: 'bg-blue-50', label: 'Azul' },
    { value: 'bg-green-50', label: 'Verde' },
    { value: 'bg-yellow-50', label: 'Amarelo' },
    { value: 'bg-red-50', label: 'Vermelho' },
    { value: 'bg-purple-50', label: 'Roxo' },
    { value: 'bg-indigo-50', label: 'Índigo' },
  ];

  useEffect(() => {
    if (column) {
      setTitle(column.title || '');
      setColor(column.color || 'bg-slate-100');
    } else {
      setTitle('');
      setColor('bg-slate-100');
    }
  }, [column, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      color,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={column ? 'Editar Coluna' : 'Nova Coluna'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Título da coluna"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cor</label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColor(opt.value)}
                className={`p-3 rounded-lg border-2 ${color === opt.value ? 'border-indigo-500' : 'border-slate-200'
                  } ${opt.value} hover:border-indigo-300 transition-colors`}
                title={opt.label}
              >
                <div className={`w-full h-4 rounded ${opt.value}`}></div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={Check}>
            {column ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default KanbanBoardView;
