import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full sm:w-full sm:max-w-md bg-[var(--bg-main)] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col"
        style={{ maxHeight: '90vh', animation: 'slideUp 0.3s ease-out' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-[var(--bg-surface-alt)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
