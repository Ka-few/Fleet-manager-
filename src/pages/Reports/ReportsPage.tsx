import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchReports, ReportPeriod, setPeriod } from '../../features/reports/reportsSlice';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const ReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { chartData, period, status, totalExpenses, totalProfit, totalRevenue, vehicleProfitability } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    dispatch(fetchReports(period));
  }, [dispatch, period]);

  const changePeriod = (nextPeriod: ReportPeriod) => {
    dispatch(setPeriod(nextPeriod));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header title="Reports" showBack />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as ReportPeriod[]).map(option => (
            <button
              key={option}
              onClick={() => changePeriod(option)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border ${period === option ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
            >
              {option === '7d' ? '7 Days' : option === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-1.5 text-[var(--success)] mb-1">
              <TrendingUp size={14} />
              <p className="text-xs">Revenue</p>
            </div>
            <p className="text-sm font-bold">{formatCurrency(totalRevenue)}</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-1.5 text-[var(--danger)] mb-1">
              <TrendingDown size={14} />
              <p className="text-xs">Costs</p>
            </div>
            <p className="text-sm font-bold">{formatCurrency(totalExpenses)}</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-1.5 text-[var(--primary)] mb-1">
              <BarChart3 size={14} />
              <p className="text-xs">Profit</p>
            </div>
            <p className={`text-sm font-bold ${totalProfit >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{formatCurrency(totalProfit)}</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Profit Trend</h3>
            <p className="text-xs text-[var(--text-muted)]">Revenue minus expenses and maintenance</p>
          </div>
          <div className="h-64">
            {status === 'loading' ? (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)]">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -16, right: 4, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border)', borderRadius: 8 }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--success)" fill="rgba(16, 185, 129, 0.18)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="var(--danger)" fill="rgba(239, 68, 68, 0.14)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold mb-4">Vehicle Profitability</h3>
          <div className="space-y-3">
            {vehicleProfitability.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No vehicle data yet.</p>
            ) : vehicleProfitability.slice(0, 8).map(item => (
              <div key={item.vehicle_id} className="border-b border-[var(--border)] last:border-0 pb-3 last:pb-0">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.vehicle.reg_number}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatCurrency(item.totalRevenue)} revenue · {formatCurrency(item.totalExpenses)} costs</p>
                  </div>
                  <p className={`font-semibold ${item.profit >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{formatCurrency(item.profit)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
