
import React, { useState, useEffect } from 'react';
import { X, Search, User, Trash2 } from 'lucide-react';
import { searchUsers } from '../../../services/authService';
import { useToast } from '../../../contexts/ToastContext';

/**
 * Modal to manage members of a Project or Board
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.entityType - 'project' or 'board'
 * @param {string} props.entityId - ID of the entity
 * @param {string} [props.projectId] - Project ID (required for board operations)
 * @param {Array} props.currentMembers - List of current members { user: { id, name, email, avatar } }
 * @param {Function} props.onAddMember - Handler(userId)
 * @param {Function} props.onRemoveMember - Handler(userId)
 * @param {string} props.title - Modal title
 */
const MemberManagementModal = ({
    isOpen,
    onClose,
    entityType, // 'project' or 'board'
    entityId,
    projectId,
    currentMembers = [],
    onAddMember,
    onRemoveMember,
    title
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const { error: showError, success } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [isOpen]);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const results = await searchUsers(query);
            // Filter out users who are already members
            const memberIds = new Set(currentMembers.map(m => m.user.id));
            setSearchResults(results.filter(u => !memberIds.has(u.id)));
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async (userId) => {
        setIsAdding(true);
        try {
            await onAddMember(userId);
            // Remove from search results
            setSearchResults(prev => prev.filter(u => u.id !== userId));
            setSearchQuery(''); // Clear search to encourage fresh search or done
            success('Membro adicionado com sucesso');
        } catch (error) {
            console.error('Add failed', error);
            showError('Não foi possível adicionar o membro');
        } finally {
            setIsAdding(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${entityType === 'project' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                            <User className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">{title || `Gerenciar Membros`}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto space-y-6">

                    {/* Search Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Adicionar Membro</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Buscar por nome ou email..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="border rounded-lg divide-y bg-gray-50 max-h-48 overflow-y-auto">
                                {searchResults.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-100">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                                                {user.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAdd(user.id)}
                                            disabled={isAdding}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors disabled:opacity-50"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchQuery.length >= 2 && searchResults.length === 0 && !isLoading && (
                            <p className="text-center text-sm text-gray-500 py-2">Nenhum usuário encontrado.</p>
                        )}
                    </div>

                    <hr />

                    {/* Current Members Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Membros Atuais ({currentMembers.length})</label>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {currentMembers.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed">
                                    Nenhum membro participante.
                                </p>
                            ) : (
                                currentMembers.map(member => {
                                    const user = member.user;
                                    return (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                                                        {user.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="truncate">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onRemoveMember(user.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remover membro"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberManagementModal;
