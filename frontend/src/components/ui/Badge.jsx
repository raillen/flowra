import React from 'react';

/**
 * Badge component for displaying labels and tags
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display
 * @param {string} props.color - Tailwind CSS classes for color
 * @returns {JSX.Element}
 */
export const Badge = ({ children, color = 'bg-slate-100 text-slate-600' }) => {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${color} border border-black/5`}
    >
      {children}
    </span>
  );
};

export default Badge;

