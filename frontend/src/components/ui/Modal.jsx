import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Enhanced Modal component with animations and backdrop blur
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.maxWidth - Max width CSS class
 * @param {boolean} props.showCloseButton - Show/hide close button
 * @returns {JSX.Element|null}
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  showCloseButton = true,
}) => {
  // Close on escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative bg-surface rounded-2xl shadow-2xl w-full ${maxWidth}
          mx-4 overflow-hidden flex flex-col max-h-[90vh]
          animate-scale-in
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-surface-hover/50 shrink-0">
            {title && (
              <h3 className="font-bold text-lg text-text-primary">{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-border rounded-xl transition-all hover:rotate-90 text-text-secondary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-surface">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
