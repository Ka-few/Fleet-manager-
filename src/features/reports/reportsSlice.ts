import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ChartDataPoint, VehicleProfitability } from '../../types';
import { revenueRepo } from '../../db/repositories/revenueRepo';
import { expenseRepo } from '../../db/repositories/expenseRepo';
import { vehicleRepo } from '../../db/repositories/vehicleRepo';
import { maintenanceRepo } from '../../db/repositories/maintenanceRepo';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export type ReportPeriod = '7d' | '30d' | '90d';

interface ReportsState {
  chartData: ChartDataPoint[];
  vehicleProfitability: VehicleProfitability[];
  period: ReportPeriod;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReportsState = {
  chartData: [],
  vehicleProfitability: [],
  period: '30d',
  totalRevenue: 0,
  totalExpenses: 0,
  totalProfit: 0,
  status: 'idle',
  error: null,
};

export const fetchReports = createAsyncThunk(
  'reports/fetch',
  async (period: ReportPeriod) => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    // Build daily chart data
    const chartData: ChartDataPoint[] = [];
    const allRevenue = await revenueRepo.getAll();
    const allExpenses = await expenseRepo.getAll();
    const allMaintenance = await maintenanceRepo.getAll();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const startStr = startOfDay(date).toISOString();
      const endStr = endOfDay(date).toISOString();

      const revenue = allRevenue
        .filter(r => r.date >= startStr.split('T')[0] && r.date <= endStr.split('T')[0])
        .reduce((sum, r) => sum + r.amount, 0);

      const expenses = allExpenses
        .filter(e => e.date >= startStr.split('T')[0] && e.date <= endStr.split('T')[0])
        .reduce((sum, e) => sum + e.amount, 0);

      const maintenance = allMaintenance
        .filter(m => m.date >= startStr.split('T')[0] && m.date <= endStr.split('T')[0])
        .reduce((sum, m) => sum + (m.cost || 0), 0);

      chartData.push({
        date: period === '7d' ? format(date, 'EEE') : format(date, 'MMM d'),
        revenue,
        expenses: expenses + maintenance,
        profit: revenue - expenses - maintenance,
      });
    }

    // Vehicle profitability
    const vehicles = await vehicleRepo.getAll();
    const vehicleProfitability: VehicleProfitability[] = await Promise.all(
      vehicles.map(async (vehicle) => {
        const vRevenue = allRevenue
          .filter(r => r.vehicle_id === vehicle.id)
          .reduce((sum, r) => sum + r.amount, 0);
        const vExpenses = allExpenses
          .filter(e => e.vehicle_id === vehicle.id)
          .reduce((sum, e) => sum + e.amount, 0);
        const vMaintenance = allMaintenance
          .filter(m => m.vehicle_id === vehicle.id)
          .reduce((sum, m) => sum + (m.cost || 0), 0);
        return {
          vehicle_id: vehicle.id,
          vehicle,
          totalRevenue: vRevenue,
          totalExpenses: vExpenses + vMaintenance,
          profit: vRevenue - vExpenses - vMaintenance,
        };
      })
    );

    // Sort by profit descending
    vehicleProfitability.sort((a, b) => b.profit - a.profit);

    const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
    const totalExpenses = chartData.reduce((s, d) => s + d.expenses, 0);

    return {
      chartData,
      vehicleProfitability,
      totalRevenue,
      totalExpenses,
      totalProfit: totalRevenue - totalExpenses,
    };
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setPeriod(state, action) {
      state.period = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.chartData = action.payload.chartData;
        state.vehicleProfitability = action.payload.vehicleProfitability;
        state.totalRevenue = action.payload.totalRevenue;
        state.totalExpenses = action.payload.totalExpenses;
        state.totalProfit = action.payload.totalProfit;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load reports';
      });
  },
});

export const { setPeriod } = reportsSlice.actions;
export default reportsSlice.reducer;
