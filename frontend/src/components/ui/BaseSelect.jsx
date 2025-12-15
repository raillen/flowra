import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * BaseSelect Component
 * 
 * Standardized select component that supports:
 * - Clean "flat" design using CSS variables
 * - Dark mode compatibility via --input-bg and --input-border
 * - Custom chevron icon
 */
const BaseSelect = forwardRef(({
    label,
    helperText,
    error,
    leftIcon: LeftIcon,
    className = '',
    id,
    children,
    readOnly,
    ...props
}, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="w-full space-y-1.5 font-sans">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-[rgb(var(--text-secondary))]"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {LeftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))] pointer-events-none z-10">
                        <LeftIcon size={18} />
                    </div>
                )}

                {/* Custom Chevron for better styling */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))] pointer-events-none z-10">
                    <ChevronDown size={16} />
                </div>

                <select
                    ref={ref}
                    id={selectId}
                    disabled={readOnly}
                    className={`
            w-full
            appearance-none
            bg-[rgb(var(--input-bg))] 
            border border-[rgb(var(--input-border))]
            text-[rgb(var(--text-primary))]
            rounded-lg shadow-sm
            text-sm
            placeholder:text-[rgb(var(--text-secondary))]/60
            focus:outline-none focus:ring-2 focus:ring-[rgb(var(--input-ring))]/20 focus:border-[rgb(var(--input-ring))]
            transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed
            ${LeftIcon ? 'pl-10' : 'pl-3'}
            pr-10
            py-2
            ${error ? '!border-[rgb(var(--error))] focus:!ring-[rgb(var(--error))]/20' : ''}
            ${className}
          `}
                    {...props}
                >
                    {children}
                </select>

            </div>

            {helperText && !error && (
                <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">{helperText}</p>
            )}

            {error && (
                <p className="text-xs text-[rgb(var(--error))] mt-1">{error}</p>
            )}
        </div>
    );
});

BaseSelect.displayName = 'BaseSelect';

export default BaseSelect;
