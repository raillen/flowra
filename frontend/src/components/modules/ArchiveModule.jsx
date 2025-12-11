import React, { useState, useEffect, useCallback } from 'react';
import {
    Archive,
    Trash2,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Folder,
    LayoutGrid,
    Calendar,
    User,
    Tag,
    AlertCircle,
    CheckCircle2,
    Search
} from 'lucide-react';
import api from '../../config/api';
import { Button, Modal, Badge } from '../ui';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Archive Module Component
 * Displays all archived cards grouped by project and board
 */
const ArchiveModule = () => {
    const [archiveData, setArchiveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedProjects, setExpandedProjects] = useState({});
    const [expandedBoards, setExpandedBoards] = useState({});
    const [selectedCards, setSelectedCards] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, cardId: null, cardTitle: '' });
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [totalArchived, setTotalArchived] = useState(0);

    // Fetch archived cards
    const fetchArchive = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/archive/cards');
            setArchiveData(response.data.data || []);
            setTotalArchived(response.data.totalArchived || 0);

            // Auto-expand first project
            if (response.data.data?.length > 0) {
                setExpandedProjects({ [response.data.data[0].id]: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao carregar arquivo');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArchive();
    }, [fetchArchive]);

    // Toggle project expansion
    const toggleProject = (projectId) => {
        setExpandedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    };

    // Toggle board expansion
    const toggleBoard = (boardId) => {
        setExpandedBoards(prev => ({
            ...prev,
            [boardId]: !prev[boardId]
        }));
    };

    // Restore a card
    const handleRestore = async (cardId) => {
        try {
            await api.post(`/archive/cards/${cardId}/restore`);
            fetchArchive();
        } catch (err) {
            console.error('Erro ao restaurar:', err);
        }
    };

    // Delete a card
    const handleDelete = async () => {
        if (!deleteConfirm.cardId) return;
        try {
            await api.delete(`/archive/cards/${deleteConfirm.cardId}`);
            setDeleteConfirm({ isOpen: false, cardId: null, cardTitle: '' });
            fetchArchive();
        } catch (err) {
            console.error('Erro ao deletar:', err);
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedCards.length === 0) return;
        try {
            await api.delete('/archive/cards/bulk', { data: { cardIds: selectedCards } });
            setSelectedCards([]);
            setBulkDeleteConfirm(false);
            fetchArchive();
        } catch (err) {
            console.error('Erro ao deletar em massa:', err);
        }
    };

    // Toggle card selection
    const toggleCardSelection = (cardId) => {
        setSelectedCards(prev =>
            prev.includes(cardId)
                ? prev.filter(id => id !== cardId)
                : [...prev, cardId]
        );
    };

    // Filter cards by search
    const filterCards = (cards) => {
        if (!searchQuery) return cards;
        const query = searchQuery.toLowerCase();
        return cards.filter(card =>
            card.title.toLowerCase().includes(query) ||
            card.description?.toLowerCase().includes(query)
        );
    };

    // Priority colors
    const priorityColors = {
        urgente: 'bg-red-500',
        alta: 'bg-orange-500',
        media: 'bg-yellow-500',
        baixa: 'bg-green-500'
    };

    if (loading) {
        return <LoadingSpinner message="Carregando arquivo..." />;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <Archive className="text-amber-600 dark:text-amber-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">Arquivo</h1>
                            <p className="text-sm text-text-secondary">
                                {totalArchived} cards arquivados
                            </p>
                        </div>
                    </div>

                    {selectedCards.length > 0 && (
                        <Button
                            variant="danger"
                            icon={Trash2}
                            onClick={() => setBulkDeleteConfirm(true)}
                        >
                            Deletar {selectedCards.length} selecionados
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar nos cards arquivados..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-4">
                    <AlertCircle className="inline mr-2" size={18} />
                    {error}
                </div>
            )}

            {/* Empty state */}
            {!loading && archiveData.length === 0 && (
                <div className="text-center py-16 bg-surface-hover rounded-2xl">
                    <Archive size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Nenhum card arquivado</h3>
                    <p className="text-text-secondary">
                        Cards finalizados aparecerão aqui quando arquivados
                    </p>
                </div>
            )}

            {/* Projects list */}
            <div className="space-y-4">
                {archiveData.map(project => (
                    <div key={project.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                        {/* Project header */}
                        <button
                            onClick={() => toggleProject(project.id)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-surface-hover transition-colors"
                        >
                            {expandedProjects[project.id] ? (
                                <ChevronDown size={20} className="text-text-secondary" />
                            ) : (
                                <ChevronRight size={20} className="text-text-secondary" />
                            )}
                            <Folder size={20} className="text-primary" />
                            <span className="font-semibold text-text-primary">{project.name}</span>
                            <Badge className="ml-auto">
                                {project.boards.reduce((acc, b) => acc + b.cards.length, 0)} cards
                            </Badge>
                        </button>

                        {/* Boards */}
                        {expandedProjects[project.id] && (
                            <div className="border-t border-border">
                                {project.boards.map(board => (
                                    <div key={board.id} className="border-b border-border last:border-0">
                                        {/* Board header */}
                                        <button
                                            onClick={() => toggleBoard(board.id)}
                                            className="w-full flex items-center gap-3 px-8 py-3 hover:bg-surface-hover transition-colors"
                                        >
                                            {expandedBoards[board.id] ? (
                                                <ChevronDown size={16} className="text-text-secondary" />
                                            ) : (
                                                <ChevronRight size={16} className="text-text-secondary" />
                                            )}
                                            <LayoutGrid size={16} className="text-text-secondary" />
                                            <span className="text-sm font-medium text-text-primary">{board.name}</span>
                                            <span className="text-xs text-text-secondary ml-auto">
                                                {board.cards.length} cards
                                            </span>
                                        </button>

                                        {/* Cards */}
                                        {expandedBoards[board.id] && (
                                            <div className="bg-background px-8 py-4 space-y-2">
                                                {filterCards(board.cards).map(card => (
                                                    <div
                                                        key={card.id}
                                                        className={`flex items-center gap-3 p-3 bg-surface rounded-lg border transition-all ${selectedCards.includes(card.id)
                                                                ? 'border-primary ring-2 ring-primary/20'
                                                                : 'border-border hover:border-primary/50'
                                                            }`}
                                                    >
                                                        {/* Checkbox */}
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCards.includes(card.id)}
                                                            onChange={() => toggleCardSelection(card.id)}
                                                            className="w-4 h-4 rounded text-primary"
                                                        />

                                                        {/* Priority indicator */}
                                                        {card.priority && (
                                                            <div className={`w-2 h-2 rounded-full ${priorityColors[card.priority] || 'bg-slate-400'}`} />
                                                        )}

                                                        {/* Card info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-text-primary truncate">{card.title}</p>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                                                                {card.archivedAt && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar size={12} />
                                                                        {new Date(card.archivedAt).toLocaleDateString('pt-BR')}
                                                                    </span>
                                                                )}
                                                                {card.assignedUser && (
                                                                    <span className="flex items-center gap-1">
                                                                        <User size={12} />
                                                                        {card.assignedUser.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Tags */}
                                                        {card.tags?.length > 0 && (
                                                            <div className="flex gap-1">
                                                                {card.tags.slice(0, 2).map(tag => (
                                                                    <span
                                                                        key={tag.id}
                                                                        className="px-2 py-0.5 text-xs rounded-full"
                                                                        style={{ backgroundColor: tag.color || '#6366f1', color: 'white' }}
                                                                    >
                                                                        {tag.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleRestore(card.id)}
                                                                className="p-2 text-text-secondary hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                                title="Restaurar"
                                                            >
                                                                <RotateCcw size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm({ isOpen: true, cardId: card.id, cardTitle: card.title })}
                                                                className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                title="Deletar permanentemente"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {filterCards(board.cards).length === 0 && searchQuery && (
                                                    <p className="text-center text-text-secondary py-4">
                                                        Nenhum card encontrado para "{searchQuery}"
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Delete confirmation modal */}
            <Modal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, cardId: null, cardTitle: '' })}
                title="Deletar permanentemente"
            >
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                        <AlertCircle size={24} />
                        <p>Esta ação não pode ser desfeita!</p>
                    </div>
                    <p className="text-text-secondary mb-6">
                        Você está prestes a deletar permanentemente o card:
                        <br />
                        <strong className="text-text-primary">{deleteConfirm.cardTitle}</strong>
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setDeleteConfirm({ isOpen: false, cardId: null, cardTitle: '' })}>
                            Cancelar
                        </Button>
                        <Button variant="danger" icon={Trash2} onClick={handleDelete}>
                            Deletar Permanentemente
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Bulk delete confirmation modal */}
            <Modal
                isOpen={bulkDeleteConfirm}
                onClose={() => setBulkDeleteConfirm(false)}
                title="Deletar em massa"
            >
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                        <AlertCircle size={24} />
                        <p>Esta ação não pode ser desfeita!</p>
                    </div>
                    <p className="text-text-secondary mb-6">
                        Você está prestes a deletar permanentemente{' '}
                        <strong className="text-text-primary">{selectedCards.length} cards</strong>.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setBulkDeleteConfirm(false)}>
                            Cancelar
                        </Button>
                        <Button variant="danger" icon={Trash2} onClick={handleBulkDelete}>
                            Deletar {selectedCards.length} Cards
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ArchiveModule;
