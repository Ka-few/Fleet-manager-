import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Droplet, Wrench, Bell, BarChart3, Settings, ShieldAlert } from 'lucide-react';

export const MoreMenu: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Fuel Logs',
      description: 'Track fuel consumption and costs',
      icon: <Droplet size={24} className="text-[var(--warning)]" />,
      onClick: () => navigate('/fuel'),
    },
    {
      title: 'Maintenance',
      description: 'Service records and garage costs',
      icon: <Wrench size={24} className="text-[var(--primary)]" />,
      onClick: () => navigate('/maintenance'),
    },
    {
      title: 'Reminders',
      description: 'Insurance, inspection, licenses',
      icon: <Bell size={24} className="text-[var(--danger)]" />,
      onClick: () => navigate('/reminders'),
    },
    {
      title: 'Reports & Analytics',
      description: 'Deep dive into your profit margins',
      icon: <BarChart3 size={24} className="text-purple-400" />,
      onClick: () => navigate('/reports'),
    },
    {
      title: 'Settings',
      description: 'App preferences and data backup',
      icon: <Settings size={24} className="text-[var(--text-muted)]" />,
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header title="More Features" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors"
              onClick={item.onClick}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-alt)] flex items-center justify-center">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-main)]">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">Support</h3>
          <Card className="p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[var(--danger-light)] flex items-center justify-center text-[var(--danger)]">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-main)]">Help & Support</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Contact us or read FAQs</p>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
