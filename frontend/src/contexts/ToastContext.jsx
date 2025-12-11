import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    CheckCircle, XCircle, AlertTriangle, Info, X
} from 'lucide-react';

/**
 * Toast Context
 * Provides global toast notifications and confirm dialogs
 */

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState(null);

    // Add toast
    const toast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    // Remove toast
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Shorthand methods
    const success = useCallback((message, title = 'Sucesso') => {
        return toast({ type: 'success', title, message });
    }, [toast]);

    const error = useCallback((message, title = 'Erro') => {
        return toast({ type: 'error', title, message });
    }, [toast]);

    const warning = useCallback((message, title = 'Atenção') => {
        return toast({ type: 'warning', title, message });
    }, [toast]);

    const info = useCallback((message, title = 'Informação') => {
        return toast({ type: 'info', title, message });
    }, [toast]);

    // Confirm dialog
    const confirm = useCallback(({
        title = 'Confirmar',
        message,
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        variant = 'danger' // 'danger' | 'warning' | 'primary'
    }) => {
        return new Promise((resolve) => {
            setConfirmDialog({
                title,
                message,
                confirmText,
                cancelText,
                variant,
                onConfirm: () => {
                    setConfirmDialog(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmDialog(null);
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <ToastContext.Provider value={{ toast, removeToast, success, error, warning, info, confirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
                ))}
            </div>

            {/* Confirm Dialog */}
            {confirmDialog && (
                <ConfirmDialog {...confirmDialog} />
            )}
        </ToastContext.Provider>
    );
};

/**
 * Toast Component
 */
const Toast = ({ toast, onClose }) => {
    const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-amber-500',
        info: 'text-blue-500'
    };

    const Icon = icons[toast.type] || Info;

    return (
        <div
            className={`
                pointer-events-auto min-w-[320px] max-w-md p-4 rounded-xl border shadow-lg
                animate-in slide-in-from-right-5 fade-in duration-300
                ${colors[toast.type]}
            `}
        >
            <div className="flex items-start gap-3">
                <Icon size={20} className={`shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <h4 className="font-semibold text-sm">{toast.title}</h4>
                    )}
                    {toast.message && (
                        <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

/**
 * Confirm Dialog Component
 */
const ConfirmDialog = ({ title, message, confirmText, cancelText, variant, onConfirm, onCancel }) => {
    const variantStyles = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
    };

    const variantIcons = {
        danger: <XCircle className="text-red-500" size={48} />,
        warning: <AlertTriangle className="text-amber-500" size={48} />,
        primary: <Info className="text-indigo-500" size={48} />
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 fade-in duration-200">
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gray-50 rounded-full">
                            {variantIcons[variant]}
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-5 py-2.5 rounded-xl font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles[variant]}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToastProvider;
