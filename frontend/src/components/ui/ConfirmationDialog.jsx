import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

/**
 * Confirmation Dialog component
 * Custom confirmation dialog following project design
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {Function} props.onClose - Close handler (called on cancel)
 * @param {Function} props.onConfirm - Confirm handler
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} props.confirmText - Confirm button text (default: "Confirmar")
 * @param {string} props.cancelText - Cancel button text (default: "Cancelar")
 * @param {string} props.variant - Dialog variant: "danger" | "warning" | "info" (default: "danger")
 * @param {React.ReactNode} props.children - Optional custom content
 * @returns {JSX.Element|null}
 */
export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  children,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-600',
      iconBg: 'bg-red-50',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
      title: 'text-red-800',
    },
    warning: {
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-50',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      title: 'text-yellow-800',
    },
    info: {
      icon: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      title: 'text-indigo-800',
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`${styles.iconBg} p-3 rounded-full shrink-0`}>
              <AlertTriangle size={24} className={styles.icon} />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg mb-2 ${styles.title}`}>
                {title || 'Confirmar ação'}
              </h3>
              {message && (
                <p className="text-text-secondary text-sm mb-4">{message}</p>
              )}
              {children && <div className="mb-4">{children}</div>}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-surface-hover rounded-full transition-colors shrink-0"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose}>
              {cancelText}
            </Button>
            <Button onClick={handleConfirm} className={styles.confirmButton}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

