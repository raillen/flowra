
import React from 'react';

/**
 * MemberAvatarGroup
 * Displays a stack of user avatars with a limit and overflow count.
 * 
 * @param {Object} props
 * @param {Array} props.members - Array of user objects { id, name, avatar, email }
 * @param {number} props.limit - Max avatars to show before +N
 * @param {string} props.size - 'sm', 'md', 'lg'
 */
const MemberAvatarGroup = ({ members = [], limit = 4, size = 'sm' }) => {
    if (!members || members.length === 0) return null;

    const visibleMembers = members.slice(0, limit);
    const overflowCount = members.length - limit;

    const sizeClasses = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm'
    };

    const dimension = sizeClasses[size] || sizeClasses.sm;

    return (
        <div className="flex -space-x-2 overflow-hidden items-center">
            {visibleMembers.map((member) => (
                <div
                    key={member.id}
                    className={`relative inline-block ${dimension} rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-gray-600 font-bold uppercase transition-transform hover:z-10 hover:scale-110`}
                    title={member.name || member.email}
                >
                    {member.avatar ? (
                        <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <span>{(member.name || 'U').substring(0, 2)}</span>
                    )}
                </div>
            ))}

            {overflowCount > 0 && (
                <div className={`relative inline-block ${dimension} rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-gray-500 font-medium z-0`}>
                    +{overflowCount}
                </div>
            )}
        </div>
    );
};

export default MemberAvatarGroup;
