import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = false, rightElement }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-main)]/90 backdrop-blur-md border-b border-[var(--border)] pt-safe">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          {showBack && (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 mr-2 -ml-2 rounded-full hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div>
          {rightElement}
        </div>
      </div>
    </header>
  );
};
