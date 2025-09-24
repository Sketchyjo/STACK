import React from 'react';

export interface TailwindButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const TailwindButton: React.FC<TailwindButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    accent: 'bg-accent hover:bg-accent/90 text-black focus:ring-accent',
    tertiary: 'bg-transparent border border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-gray-200'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-caption',
    md: 'px-4 py-2 text-label',
    lg: 'px-6 py-3 text-body'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const finalClassName = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className
  ].filter(Boolean).join(' ');
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      className={finalClassName}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};