/**
 * AvatarStack Component
 * Displays stacked user avatars with overflow indicator
 * Planner-style visual representation
 * 
 * @module components/ui/AvatarStack
 */

import React from 'react';
import { User } from 'lucide-react';

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 chars)
 */
const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a consistent color from a string (for avatars without images)
 * @param {string} str - String to hash
 * @returns {string} Tailwind color class
 */
const getAvatarColor = (str) => {
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
        'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'
    ];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

/**
 * Single Avatar Component
 */
const Avatar = ({ user, size = 'md', showTooltip = true, className = '' }) => {
    const sizes = {
        xs: 'w-5 h-5 text-[8px]',
        sm: 'w-6 h-6 text-[9px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
        xl: 'w-12 h-12 text-base'
    };

    const sizeClass = sizes[size] || sizes.md;
    const colorClass = getAvatarColor(user?.id || user?.name);

    if (user?.avatar) {
        return (
            <div
                className={`relative ${sizeClass} rounded-full border-2 border-white shadow-sm overflow-hidden ${className}`}
                title={showTooltip ? user.name : undefined}
            >
                <img
                    src={user.avatar}
                    alt={user.name || 'Avatar'}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className={`relative ${sizeClass} ${colorClass} rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-medium ${className}`}
            title={showTooltip ? user?.name : undefined}
        >
            {user?.name ? getInitials(user.name) : <User size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} />}
        </div>
    );
};

/**
 * AvatarStack Component
 * Displays multiple avatars stacked with overlap
 * 
 * @param {Object} props
 * @param {Array} props.users - Array of user objects with { id, name, avatar? }
 * @param {number} props.max - Maximum avatars to show before +N
 * @param {string} props.size - Avatar size (xs, sm, md, lg, xl)
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.showAdd - Show add button
 */
const AvatarStack = ({
    users = [],
    max = 3,
    size = 'md',
    onClick,
    showAdd = false,
    className = ''
}) => {
    const visibleUsers = users.slice(0, max);
    const overflowCount = users.length - max;

    const overlapMargins = {
        xs: '-ml-1.5',
        sm: '-ml-2',
        md: '-ml-2.5',
        lg: '-ml-3',
        xl: '-ml-4'
    };

    const addButtonSizes = {
        xs: 'w-5 h-5 text-[10px]',
        sm: 'w-6 h-6 text-[11px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
        xl: 'w-12 h-12 text-base'
    };

    return (
        <div
            className={`flex items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {users.length === 0 && !showAdd ? (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <User size={14} />
                    <span>Ninguém atribuído</span>
                </div>
            ) : (
                <>
                    {visibleUsers.map((user, index) => (
                        <Avatar
                            key={user.id || index}
                            user={user}
                            size={size}
                            className={index > 0 ? overlapMargins[size] : ''}
                        />
                    ))}

                    {overflowCount > 0 && (
                        <div
                            className={`${addButtonSizes[size]} ${overlapMargins[size]} rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-gray-600 font-medium`}
                            title={`+${overflowCount} mais`}
                        >
                            +{overflowCount}
                        </div>
                    )}

                    {showAdd && (
                        <div
                            className={`${addButtonSizes[size]} ${users.length > 0 ? overlapMargins[size] : ''} rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:border-gray-400 hover:text-gray-600 transition-colors`}
                            title="Adicionar responsável"
                        >
                            +
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export { Avatar, AvatarStack, getInitials, getAvatarColor };
export default AvatarStack;
