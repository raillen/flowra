import React from 'react';

/**
 * Placeholder view component for modules under development
 * 
 * @param {Object} props
 * @param {string} props.title - Title to display
 * @param {React.ComponentType} props.icon - Icon component
 * @param {string} props.description - Description text
 * @returns {JSX.Element}
 */
const PlaceholderView = ({ title, icon: Icon, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-300">
      <div className="p-4 bg-slate-100 rounded-full mb-4">
        <Icon size={48} className="text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md">
        {description || 'Este módulo está em desenvolvimento.'}
      </p>
    </div>
  );
};

export default PlaceholderView;

