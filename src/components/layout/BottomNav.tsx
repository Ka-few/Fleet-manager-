import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Wallet, FileText, Menu } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={24} />, label: 'Home' },
    { to: '/vehicles', icon: <Truck size={24} />, label: 'Fleet' },
    { to: '/revenue', icon: <Wallet size={24} />, label: 'Income' },
    { to: '/expenses', icon: <FileText size={24} />, label: 'Expenses' },
    { to: '/more', icon: <Menu size={24} />, label: 'More' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border)] pb-safe pt-2 px-2 flex justify-around items-center z-40">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex flex-col items-center p-2 rounded-lg min-w-[64px]
            transition-colors
            ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-white'}
          `}
        >
          {item.icon}
          <span className="text-[10px] mt-1 font-medium">{item.label}</span>
        </NavLink>
      ))}
      <div className="h-[env(safe-area-inset-bottom)] w-full absolute bottom-0 bg-[var(--bg-surface)]"></div>
    </div>
  );
};
