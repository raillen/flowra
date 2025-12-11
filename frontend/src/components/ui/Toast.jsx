import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Enhanced Toast notification component with animations and progress bar
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls toast visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.message - Toast message
 * @param {string} props.title - Optional title
 * @param {string} props.type - Toast type: "success" | "error" | "warning" | "info"
 * @param {number} props.duration - Auto-close duration in ms (default: 5000, 0 = no auto-close)
 * @param {string} props.position - Position: "top-right" | "top-left" | "bottom-right" | "bottom-left"
 * @returns {JSX.Element|null}
 */
export const Toast = ({
  isOpen,
  onClose,
  message,
  title,
  type = 'info',
  duration = 5000,
  position = 'top-right',
}) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setProgress(100);

      if (duration > 0) {
        const interval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev - (100 / (duration / 50));
            if (newProgress <= 0) {
              clearInterval(interval);
              setTimeout(() => {
                setIsVisible(false);
                onClose();
              }, 200);
              return 0;
            }
            return newProgress;
          });
        }, 50);

        return () => clearInterval(interval);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen && !isVisible) return null;

  const typeStyles = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      progressBg: 'bg-emerald-500',
      Icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      progressBg: 'bg-red-500',
      Icon: AlertCircle,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-600',
      iconBg: 'bg-amber-100',
      progressBg: 'bg-amber-500',
      Icon: AlertTriangle,
    },
    info: {
      bg: 'bg-primary-50',
      border: 'border-primary-200',
      text: 'text-primary-800',
      icon: 'text-primary-600',
      iconBg: 'bg-primary-100',
      progressBg: 'bg-primary-500',
      Icon: Info,
    },
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const styles = typeStyles[type] || typeStyles.info;
  const Icon = styles.Icon;

  return (
    <div className={`fixed ${positions[position]} z-50`}>
      <div
        className={`
          ${styles.bg} ${styles.border} border rounded-2xl shadow-xl
          min-w-[320px] max-w-[420px] overflow-hidden
          ${isVisible ? 'animate-slide-in-right' : 'animate-slide-out-right'}
        `}
      >
        <div className="p-4 flex items-start gap-3">
          {/* Icon */}
          <div className={`${styles.iconBg} p-2 rounded-xl shrink-0`}>
            <Icon size={20} className={styles.icon} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className={`${styles.text} font-semibold text-sm mb-0.5`}>
                {title}
              </p>
            )}
            <p className={`${styles.text} text-sm ${title ? 'opacity-80' : 'font-medium'}`}>
              {message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 200);
            }}
            className={`${styles.text} hover:opacity-70 transition-opacity shrink-0 p-1 rounded-lg hover:bg-black/5`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <div className="h-1 bg-black/5">
            <div
              className={`h-full ${styles.progressBg} transition-all duration-50 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;
