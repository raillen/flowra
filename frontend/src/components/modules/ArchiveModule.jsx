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
    Search,
    Paperclip,
    Image,
    FileText,
    Download,
    Eye,
    X,
    ZoomIn,
    ExternalLink
} from 'lucide-react';
import api from '../../config/api';
import { Button, Modal, Badge } from '../ui';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Archive Module Component
 * Enhanced with attachment previews, thumbnails, and download functionality
 * Designed to work as a real file archive for design assets
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
    const [selectedCard, setSelectedCard] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

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
                if (response.data.data[0].boards?.length > 0) {
                    setExpandedBoards({ [response.data.data[0].boards[0].id]: true });
                }
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
    const handleRestore = async (cardId, e) => {
        e?.stopPropagation();
        try {
            await api.post(`/archive/cards/${cardId}/restore`);
            setSelectedCard(null);
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
            setSelectedCard(null);
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
    const toggleCardSelection = (cardId, e) => {
        e?.stopPropagation();
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

    // Check if file is an image
    const isImageFile = (filename) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
        return imageExtensions.some(ext => filename?.toLowerCase().endsWith(ext));
    };

    // Get attachment icon
    const getAttachmentIcon = (filename) => {
        if (isImageFile(filename)) return Image;
        return FileText;
    };

    // Download attachment
    const downloadAttachment = async (attachment, e) => {
        e?.stopPropagation();
        try {
            const link = document.createElement('a');
            link.href = attachment.url;
            link.download = attachment.filename || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Erro ao baixar:', err);
        }
    };

    // Priority colors
    const priorityColors = {
        urgente: 'bg-red-500',
        alta: 'bg-orange-500',
        media: 'bg-yellow-500',
        baixa: 'bg-green-500'
    };

    // Render attachment thumbnail
    const renderAttachmentThumbnail = (attachment, size = 'small') => {
        const sizeClass = size === 'small' ? 'w-10 h-10' : 'w-20 h-20';

        if (isImageFile(attachment.filename)) {
            return (
                <div
                    className={`${sizeClass} rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all bg-gray-100`}
                    onClick={(e) => { e.stopPropagation(); setPreviewImage(attachment); }}
                >
                    <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            );
        }

        const Icon = getAttachmentIcon(attachment.filename);
        return (
            <div className={`${sizeClass} rounded-lg bg-gray-100 flex items-center justify-center`}>
                <Icon size={size === 'small' ? 16 : 24} className="text-gray-400" />
            </div>
        );
    };

    // Render card with attachments
    const renderCard = (card, projectId, boardId) => {
        const imageAttachments = card.attachments?.filter(a => isImageFile(a.filename)) || [];
        const otherAttachments = card.attachments?.filter(a => !isImageFile(a.filename)) || [];
        const totalAttachments = (card.attachments?.length || 0) + (card._count?.attachments || 0);

        return (
            <div
                key={card.id}
                onClick={() => setSelectedCard({ ...card, projectId, boardId })}
                className={`group p-4 bg-surface rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedCards.includes(card.id)
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
            >
                <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={(e) => toggleCardSelection(card.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded text-primary mt-1"
                    />

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {/* Title and priority */}
                        <div className="flex items-center gap-2 mb-2">
                            {card.priority && (
                                <div className={`w-2 h-2 rounded-full ${priorityColors[card.priority] || 'bg-slate-400'}`} />
                            )}
                            <h4 className="font-semibold text-text-primary truncate">{card.title}</h4>
                        </div>

                        {/* Description preview */}
                        {card.description && (
                            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                                {card.description}
                            </p>
                        )}

                        {/* Image attachments preview */}
                        {imageAttachments.length > 0 && (
                            <div className="flex gap-2 mb-3 flex-wrap">
                                {imageAttachments.slice(0, 4).map((att, i) => (
                                    <div key={att.id || i} className="relative">
                                        {renderAttachmentThumbnail(att, 'small')}
                                        {i === 3 && imageAttachments.length > 4 && (
                                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                                +{imageAttachments.length - 4}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
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
                            {totalAttachments > 0 && (
                                <span className="flex items-center gap-1 text-primary font-medium">
                                    <Paperclip size={12} />
                                    {totalAttachments} anexos
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => handleRestore(card.id, e)}
                            className="p-2 text-text-secondary hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Restaurar"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, cardId: card.id, cardTitle: card.title }); }}
                            className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deletar permanentemente"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <LoadingSpinner message="Carregando arquivo..." />;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
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
                                {totalArchived} cards arquivados com seus anexos
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedCards.length > 0 && (
                            <Button
                                variant="danger"
                                icon={Trash2}
                                onClick={() => setBulkDeleteConfirm(true)}
                            >
                                Deletar {selectedCards.length}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar cards, anexos, designs..."
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
                        Cards finalizados aparecerão aqui com seus anexos para consulta futura
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

                                        {/* Cards grid/list */}
                                        {expandedBoards[board.id] && (
                                            <div className="bg-background px-8 py-4">
                                                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                                                    {filterCards(board.cards).map(card => renderCard(card, project.id, board.id))}
                                                </div>

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

            {/* Card Detail Modal */}
            <Modal
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                title={selectedCard?.title}
                maxWidth="max-w-4xl"
            >
                {selectedCard && (
                    <div className="p-6">
                        {/* Header with actions */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b">
                            <div className="flex items-center gap-2">
                                {selectedCard.priority && (
                                    <span className={`px-2 py-1 text-xs rounded-full text-white ${priorityColors[selectedCard.priority]}`}>
                                        {selectedCard.priority}
                                    </span>
                                )}
                                <span className="text-sm text-text-secondary">
                                    Arquivado em {new Date(selectedCard.archivedAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    icon={RotateCcw}
                                    onClick={(e) => handleRestore(selectedCard.id, e)}
                                >
                                    Restaurar
                                </Button>
                                <Button
                                    variant="danger"
                                    icon={Trash2}
                                    onClick={() => setDeleteConfirm({ isOpen: true, cardId: selectedCard.id, cardTitle: selectedCard.title })}
                                >
                                    Deletar
                                </Button>
                            </div>
                        </div>

                        {/* Description */}
                        {selectedCard.description && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-text-secondary mb-2">Descrição</h4>
                                <p className="text-text-primary whitespace-pre-wrap">{selectedCard.description}</p>
                            </div>
                        )}

                        {/* Attachments Gallery */}
                        {selectedCard.attachments?.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                                    <Paperclip size={16} />
                                    Anexos ({selectedCard.attachments.length})
                                </h4>

                                {/* Image grid */}
                                {selectedCard.attachments.filter(a => isImageFile(a.filename)).length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                        {selectedCard.attachments.filter(a => isImageFile(a.filename)).map((att, i) => (
                                            <div key={att.id || i} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-video">
                                                <img
                                                    src={att.url}
                                                    alt={att.filename}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                    <button
                                                        onClick={() => setPreviewImage(att)}
                                                        className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                                        title="Visualizar"
                                                    >
                                                        <ZoomIn size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => downloadAttachment(att, e)}
                                                        className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                                        title="Baixar"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                                    <p className="text-white text-xs truncate">{att.filename}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Other files list */}
                                {selectedCard.attachments.filter(a => !isImageFile(a.filename)).length > 0 && (
                                    <div className="space-y-2">
                                        {selectedCard.attachments.filter(a => !isImageFile(a.filename)).map((att, i) => (
                                            <div key={att.id || i} className="flex items-center gap-3 p-3 bg-surface-hover rounded-lg">
                                                <FileText size={20} className="text-text-secondary" />
                                                <span className="flex-1 text-sm truncate">{att.filename}</span>
                                                <button
                                                    onClick={(e) => downloadAttachment(att, e)}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Baixar"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tags */}
                        {selectedCard.tags?.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-text-secondary mb-2">Tags</h4>
                                <div className="flex gap-2 flex-wrap">
                                    {selectedCard.tags.map(tag => (
                                        <span
                                            key={tag.id}
                                            className="px-3 py-1 text-sm rounded-full text-white"
                                            style={{ backgroundColor: tag.color || '#6366f1' }}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Meta info */}
                        <div className="pt-4 border-t text-sm text-text-secondary grid grid-cols-2 gap-4">
                            {selectedCard.assignedUser && (
                                <div className="flex items-center gap-2">
                                    <User size={14} />
                                    <span>Responsável: {selectedCard.assignedUser.name}</span>
                                </div>
                            )}
                            {selectedCard.dueDate && (
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    <span>Prazo: {new Date(selectedCard.dueDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        onClick={() => setPreviewImage(null)}
                    >
                        <X size={24} />
                    </button>
                    <button
                        className="absolute top-4 left-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors flex items-center gap-2"
                        onClick={(e) => { e.stopPropagation(); downloadAttachment(previewImage, e); }}
                    >
                        <Download size={20} />
                        <span className="text-sm">Baixar</span>
                    </button>
                    <img
                        src={previewImage.url}
                        alt={previewImage.filename}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                        {previewImage.filename}
                    </div>
                </div>
            )}

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
                        Você está prestes a deletar permanentemente o card e todos os seus anexos:
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
                        <strong className="text-text-primary">{selectedCards.length} cards</strong> e todos os seus anexos.
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
