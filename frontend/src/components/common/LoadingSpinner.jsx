import React from 'react';

/**
 * Loading spinner component
 * 
 * @param {Object} props
 * @param {string} props.message - Optional loading message
 * @returns {JSX.Element}
 */
const LoadingSpinner = ({ message = 'Carregando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-slate-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

