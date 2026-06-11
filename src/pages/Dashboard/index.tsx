import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboardKPIs } from '../../features/dashboard/dashboardSlice';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Truck, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { kpis, status } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardKPIs());
  }, [dispatch]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header 
        title="Fleet Overview" 
        rightElement={
          <button 
            onClick={() => navigate('/revenue')}
            className="p-2 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Plus size={20} />
          </button>
        }
      />
      
      <div className="p-4 space-y-6">
        {status === 'loading' ? (
          <div className="flex justify-center p-8"><p className="text-[var(--text-muted)]">Loading metrics...</p></div>
        ) : (
          <>
            {/* Main Financial KPI */}
            <Card className="bg-gradient-to-br from-[var(--bg-surface-alt)] to-[var(--bg-surface)] border-[var(--primary-light)]">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-[var(--text-muted)]">Estimated Profit (This Month)</p>
                <TrendingUp size={20} className={kpis.estimatedProfit >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"} />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {formatCurrency(kpis.estimatedProfit)}
              </h2>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Revenue</p>
                  <p className="text-sm font-semibold text-[var(--success)]">+{formatCurrency(kpis.monthRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Expenses</p>
                  <p className="text-sm font-semibold text-[var(--danger)]">-{formatCurrency(kpis.monthExpenses)}</p>
                </div>
              </div>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-[var(--primary-light)] text-[var(--primary)]">
                    <TrendingUp size={16} />
                  </div>
                  <h3 className="text-xs font-medium text-[var(--text-muted)]">Today's Revenue</h3>
                </div>
                <p className="text-lg font-bold">{formatCurrency(kpis.todayRevenue)}</p>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-[var(--danger-light)] text-[var(--danger)]">
                    <TrendingDown size={16} />
                  </div>
                  <h3 className="text-xs font-medium text-[var(--text-muted)]">Today's Expenses</h3>
                </div>
                <p className="text-lg font-bold">{formatCurrency(kpis.todayExpenses)}</p>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-[var(--bg-surface-hover)] text-blue-400">
                    <Truck size={16} />
                  </div>
                  <h3 className="text-xs font-medium text-[var(--text-muted)]">Active Vehicles</h3>
                </div>
                <p className="text-lg font-bold">{kpis.activeVehicles} <span className="text-xs font-normal text-[var(--text-muted)]">/ {kpis.totalVehicles}</span></p>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-[var(--warning-light)] text-[var(--warning)]">
                    <AlertCircle size={16} />
                  </div>
                  <h3 className="text-xs font-medium text-[var(--text-muted)]">In Service</h3>
                </div>
                <p className="text-lg font-bold">{kpis.inServiceVehicles}</p>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-[var(--danger-light)] text-[var(--danger)]">
                    <AlertCircle size={16} />
                  </div>
                  <h3 className="text-xs font-medium text-[var(--text-muted)]">Overdue Reminders</h3>
                </div>
                <p className="text-lg font-bold">{kpis.overdueReminders}</p>
              </Card>
            </div>

            {/* Charts Section Placeholder */}
            <Card className="mt-6">
              <h3 className="font-semibold mb-4">Revenue Trend (Mockup)</h3>
              <div className="h-40 flex items-center justify-center border border-dashed border-[var(--border)] rounded-lg">
                <p className="text-sm text-[var(--text-muted)]">Recharts integration coming soon</p>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
