import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden">
      {/* Main scrollable content area */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
        <Outlet />
      </main>
      
      {/* Fixed bottom navigation */}
      <BottomNav />
    </div>
  );
};
