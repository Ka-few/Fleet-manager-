import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth, isLoading, leftIcon, children, disabled, ...props }, ref) => {
    
    let baseStyles = 'inline-flex items-center justify-center font-medium transition-colors border border-transparent rounded-lg ';
    
    // Size variants
    if (size === 'sm') baseStyles += 'px-3 py-1.5 text-sm ';
    if (size === 'md') baseStyles += 'px-4 py-3 text-base ';
    if (size === 'lg') baseStyles += 'px-6 py-4 text-lg ';
    
    // Full width
    if (fullWidth) baseStyles += 'w-full ';

    // Color variants
    if (variant === 'primary') {
      baseStyles += 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] ';
    } else if (variant === 'secondary') {
      baseStyles += 'bg-[var(--bg-surface-alt)] text-white hover:bg-[var(--bg-surface-hover)] ';
    } else if (variant === 'danger') {
      baseStyles += 'bg-[var(--danger)] text-white hover:bg-[#DC2626] ';
    } else if (variant === 'ghost') {
      baseStyles += 'bg-transparent text-[var(--primary)] hover:bg-[var(--primary-light)] ';
    }

    // Disabled/Loading states
    if (disabled || isLoading) {
      baseStyles += 'opacity-50 cursor-not-allowed ';
    }

    return (
      <button ref={ref} className={`${baseStyles} ${className}`} disabled={disabled || isLoading} {...props}>
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
