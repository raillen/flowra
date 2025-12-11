import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Error message component
 * 
 * @param {Object} props
 * @param {string} props.message - Error message
 * @param {Function} props.onDismiss - Optional dismiss handler
 * @returns {JSX.Element}
 */
const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle size={18} />
        <span className="text-sm">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-700 hover:text-red-900"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

