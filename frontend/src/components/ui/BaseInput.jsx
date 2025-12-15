import React, { forwardRef } from 'react';

/**
 * BaseInput Component
 * 
 * Standardized input component that supports:
 * - Clean "flat" design using CSS variables for theming
 * - Dark mode compatibility via --input-bg and --input-border
 * - Label, Helper Text, and Error Message support
 * - Left/Right Icons
 */
const BaseInput = forwardRef(({
    label,
    helperText,
    error,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    id,
    type = 'text',
    fullWidth, // Consumed but not passed to DOM
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="w-full space-y-1.5 font-sans">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-[rgb(var(--text-secondary))]"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {LeftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))] pointer-events-none">
                        <LeftIcon size={18} />
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={`
            w-full
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
            ${RightIcon ? 'pr-10' : 'pr-3'}
            py-2
            ${error ? '!border-[rgb(var(--error))] focus:!ring-[rgb(var(--error))]/20' : ''}
            ${className}
          `}
                    {...props}
                />

                {RightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))] pointer-events-none">
                        <RightIcon size={18} />
                    </div>
                )}
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

BaseInput.displayName = 'BaseInput';

export default BaseInput;
