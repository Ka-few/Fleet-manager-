import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{label}</label>}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] 
              text-[var(--text-main)] rounded-lg px-4 py-3
              focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
              transition-shadow
              ${leftIcon ? 'pl-10' : ''}
              ${error ? 'border-[var(--danger)] focus:ring-[var(--danger)]' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
