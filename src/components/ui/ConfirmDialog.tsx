import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-[var(--bg-surface)] rounded-t-2xl p-6 pb-10 animate-[slideUp_0.2s_ease-out]">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-[var(--danger-light)] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-[var(--danger)]" />
        </div>

        <h3 className="text-lg font-bold text-center mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-muted)] text-center mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-main)] font-medium hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-[var(--danger)] text-white font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
