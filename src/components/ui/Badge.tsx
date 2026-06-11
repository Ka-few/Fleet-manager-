import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    let styles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ';
    
    switch (variant) {
      case 'success':
        styles += 'bg-[var(--primary-light)] text-[var(--success)]';
        break;
      case 'warning':
        styles += 'bg-[var(--warning-light)] text-[var(--warning)]';
        break;
      case 'danger':
        styles += 'bg-[var(--danger-light)] text-[var(--danger)]';
        break;
      case 'info':
        styles += 'bg-[var(--bg-surface-hover)] text-blue-400';
        break;
      default:
        styles += 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)]';
    }

    return (
      <span ref={ref} className={`${styles} ${className}`} {...props}>
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
