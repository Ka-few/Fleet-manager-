import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', noPadding = false, children, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] shadow-sm ${noPadding ? '' : 'p-4'} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
