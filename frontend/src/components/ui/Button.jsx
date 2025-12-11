import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enhanced Button component with multiple variants and loading state
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.variant - Button style variant (primary|secondary|ghost|danger|success)
 * @param {string} props.size - Button size (sm|md|lg)
 * @param {string} props.className - Additional CSS classes
 * @param {React.ComponentType} props.icon - Icon component from lucide-react
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.type - Button type
 * @returns {JSX.Element}
 */
export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  disabled = false,
  loading = false,
  type = 'button',
}) => {
  const baseStyle = `
    relative overflow-hidden font-medium
    transition-all duration-200 ease-smooth
    flex items-center justify-center gap-2
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
  `;

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-500 text-white
      hover:from-primary-700 hover:to-primary-600
      hover:shadow-lg hover:shadow-primary-500/25
      hover:-translate-y-0.5
    `,
    secondary: `
      bg-white text-secondary-700 
      border-2 border-secondary-200
      hover:bg-secondary-50 hover:border-secondary-300
    `,
    ghost: `
      text-secondary-600 
      hover:bg-secondary-100 hover:text-secondary-800
    `,
    danger: `
      bg-red-50 text-red-600 border border-red-200
      hover:bg-red-100 hover:border-red-300
    `,
    success: `
      bg-emerald-50 text-emerald-600 border border-emerald-200
      hover:bg-emerald-100 hover:border-emerald-300
    `,
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Aguarde...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
