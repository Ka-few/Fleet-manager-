import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] 
              text-[var(--text-main)] rounded-lg px-4 py-3 appearance-none
              focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
              transition-shadow
              ${error ? 'border-[var(--danger)] focus:ring-[var(--danger)]' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-muted)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
