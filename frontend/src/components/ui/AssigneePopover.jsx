/**
 * AssigneePopover Component
 * Popover for assigning/removing users from a card
 * Planner-style quick assignment
 * 
 * @module components/ui/AssigneePopover
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, X, Users } from 'lucide-react';
import { Avatar, getInitials } from './AvatarStack';

/**
 * AssigneePopover Component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether popover is open
 * @param {Function} props.onClose - Close handler
 * @param {Array} props.currentAssignees - Currently assigned users [{userId, user: {id, name, avatar}}]
 * @param {Array} props.availableUsers - All available users [{id, name, avatar}]
 * @param {Function} props.onAssign - Called when user is assigned (userId)
 * @param {Function} props.onRemove - Called when user is removed (userId)
 * @param {Object} props.anchorRef - Ref to anchor element for positioning
 */
const AssigneePopover = ({
    isOpen,
    onClose,
    currentAssignees = [],
    availableUsers = [],
    onAssign,
    onRemove,
    anchorRef,
    position = 'bottom-start', // bottom-start, bottom-end, top-start, top-end
    loading = false
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const popoverRef = useRef(null);
    const inputRef = useRef(null);

    // Get assigned user IDs for quick lookup
    const assignedIds = new Set(
        currentAssignees.map(a => a.userId || a.user?.id || a.id)
    );

    // Filter users based on search
    const filteredUsers = availableUsers.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort: assigned first, then alphabetically
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const aAssigned = assignedIds.has(a.id);
        const bAssigned = assignedIds.has(b.id);
        if (aAssigned && !bAssigned) return -1;
        if (!aAssigned && bAssigned) return 1;
        return (a.name || '').localeCompare(b.name || '');
    });

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target) &&
                (!anchorRef?.current || !anchorRef.current.contains(e.target))) {
                onClose?.();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose, anchorRef]);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    const handleToggleUser = (user) => {
        if (assignedIds.has(user.id)) {
            onRemove?.(user.id);
        } else {
            onAssign?.(user.id);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={popoverRef}
            className="absolute z-50 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
                top: '100%',
                left: position.endsWith('end') ? 'auto' : 0,
                right: position.endsWith('end') ? 0 : 'auto',
            }}
        >
            {/* Header */}
            <div className="p-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Users size={16} />
                        Atribuir Responsáveis
                    </h4>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* User List */}
            <div className="max-h-64 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-400">
                        <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
                        Carregando...
                    </div>
                ) : sortedUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
                    </div>
                ) : (
                    <ul className="py-1">
                        {sortedUsers.map(user => {
                            const isAssigned = assignedIds.has(user.id);
                            return (
                                <li key={user.id}>
                                    <button
                                        onClick={() => handleToggleUser(user)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${isAssigned ? 'bg-indigo-50' : ''
                                            }`}
                                    >
                                        <Avatar user={user} size="sm" showTooltip={false} />

                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-800 truncate">
                                                {user.name || 'Sem nome'}
                                            </div>
                                            {user.email && (
                                                <div className="text-xs text-gray-400 truncate">
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>

                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isAssigned
                                                ? 'bg-indigo-500 text-white'
                                                : 'border-2 border-gray-300'
                                            }`}>
                                            {isAssigned && <Check size={12} />}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Footer - Current count */}
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                {currentAssignees.length === 0
                    ? 'Nenhum responsável atribuído'
                    : `${currentAssignees.length} responsável(is) atribuído(s)`
                }
            </div>
        </div>
    );
};

export default AssigneePopover;
