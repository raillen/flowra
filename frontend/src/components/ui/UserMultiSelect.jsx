/**
 * UserMultiSelect Component
 * Multi-select with avatars and user names
 * 
 * @module components/ui/UserMultiSelect
 */

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search, User } from 'lucide-react';

/**
 * Get initials from a name
 */
const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a consistent color from a string
 */
const getAvatarColor = (str) => {
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

/**
 * Small Avatar Component
 */
const MiniAvatar = ({ user, size = 'sm' }) => {
    const sizes = {
        xs: 'w-5 h-5 text-[8px]',
        sm: 'w-6 h-6 text-[9px]',
        md: 'w-7 h-7 text-[10px]',
    };
    const sizeClass = sizes[size] || sizes.sm;
    const colorClass = getAvatarColor(user?.id || user?.name);

    if (user?.avatar) {
        return (
            <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0`}>
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`}>
            {user?.name ? getInitials(user.name) : <User size={10} />}
        </div>
    );
};

/**
 * Selected User Tag
 */
const SelectedUserTag = ({ user, onRemove }) => (
    <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full pl-1 pr-2 py-0.5 text-xs">
        <MiniAvatar user={user} size="xs" />
        <span className="truncate max-w-[80px]">{user.name}</span>
        <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(user.id); }}
            className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
        >
            <X size={10} />
        </button>
    </div>
);

/**
 * UserMultiSelect Component
 * 
 * @param {Object} props
 * @param {Array} props.users - Available users [{id, name, avatar?, email?}]
 * @param {Array} props.selectedIds - Array of selected user IDs
 * @param {Function} props.onChange - Called with new array of IDs
 * @param {string} props.placeholder - Placeholder text
 */
const UserMultiSelect = ({
    users = [],
    selectedIds = [],
    onChange,
    placeholder = "Selecionar responsáveis..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Get selected users objects
    const selectedUsers = users.filter(u => selectedIds.includes(u.id));

    // Filter available users
    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    // Sort: selected first
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const aSelected = selectedIds.includes(a.id);
        const bSelected = selectedIds.includes(b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return (a.name || '').localeCompare(b.name || '');
    });

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleUser = (userId) => {
        const newIds = selectedIds.includes(userId)
            ? selectedIds.filter(id => id !== userId)
            : [...selectedIds, userId];
        onChange(newIds);
    };

    const removeUser = (userId) => {
        onChange(selectedIds.filter(id => id !== userId));
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <div
                onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 100); }}
                className={`
                    min-h-[38px] w-full p-2 bg-white border rounded-lg cursor-pointer transition-all
                    ${isOpen ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-200 hover:border-gray-300'}
                `}
            >
                {selectedUsers.length === 0 ? (
                    <span className="text-gray-400 text-sm">{placeholder}</span>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {selectedUsers.map(user => (
                            <SelectedUserTag key={user.id} user={user} onRemove={removeUser} />
                        ))}
                    </div>
                )}
                <ChevronDown
                    size={14}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="max-h-48 overflow-y-auto">
                        {sortedUsers.length === 0 ? (
                            <div className="p-3 text-center text-gray-400 text-sm">
                                Nenhum usuário encontrado
                            </div>
                        ) : (
                            sortedUsers.map(user => {
                                const isSelected = selectedIds.includes(user.id);
                                return (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => toggleUser(user.id)}
                                        className={`
                                            w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors
                                            ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                                        `}
                                    >
                                        <MiniAvatar user={user} />
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
                                        <div className={`
                                            w-4 h-4 rounded flex items-center justify-center flex-shrink-0
                                            ${isSelected ? 'bg-indigo-500 text-white' : 'border border-gray-300'}
                                        `}>
                                            {isSelected && <Check size={10} />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
                        {selectedIds.length} selecionado(s)
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMultiSelect;
