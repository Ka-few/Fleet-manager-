import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DashboardKPIs } from '../../types';
import { vehicleRepo } from '../../db/repositories/vehicleRepo';
import { revenueRepo } from '../../db/repositories/revenueRepo';
import { expenseRepo } from '../../db/repositories/expenseRepo';
import { reminderRepo } from '../../db/repositories/reminderRepo';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns';

interface DashboardState {
  kpis: DashboardKPIs;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialKPIs: DashboardKPIs = {
  todayRevenue: 0,
  weekRevenue: 0,
  monthRevenue: 0,
  todayExpenses: 0,
  weekExpenses: 0,
  monthExpenses: 0,
  estimatedProfit: 0,
  totalVehicles: 0,
  activeVehicles: 0,
  inServiceVehicles: 0,
  monthFuelCost: 0,
  overdueReminders: 0,
};

const initialState: DashboardState = {
  kpis: initialKPIs,
  status: 'idle',
  error: null,
};

export const fetchDashboardKPIs = createAsyncThunk('dashboard/fetchKPIs', async () => {
  const now = new Date();
  
  // Date ranges
  const tStart = startOfDay(now).toISOString();
  const tEnd = endOfDay(now).toISOString();
  
  const wStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString(); // Monday start
  const wEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
  
  const mStart = startOfMonth(now).toISOString();
  const mEnd = endOfMonth(now).toISOString();

  // Parallel fetches for speed
  const [
    todayRev, weekRev, monthRev,
    todayExp, weekExp, monthExp,
    totalVehicles, activeVehicles, inServiceVehicles, overdueReminders
  ] = await Promise.all([
    revenueRepo.getRevenueByDateRange(tStart, tEnd),
    revenueRepo.getRevenueByDateRange(wStart, wEnd),
    revenueRepo.getRevenueByDateRange(mStart, mEnd),
    expenseRepo.getExpensesByDateRange(tStart, tEnd),
    expenseRepo.getExpensesByDateRange(wStart, wEnd),
    expenseRepo.getExpensesByDateRange(mStart, mEnd),
    vehicleRepo.countAll(),
    vehicleRepo.countActive(),
    vehicleRepo.countInService(),
    reminderRepo.countOverdue()
  ]);

  return {
    todayRevenue: todayRev,
    weekRevenue: weekRev,
    monthRevenue: monthRev,
    todayExpenses: todayExp,
    weekExpenses: weekExp,
    monthExpenses: monthExp,
    estimatedProfit: monthRev - monthExp,
    totalVehicles,
    activeVehicles,
    inServiceVehicles,
    monthFuelCost: 0,
    overdueReminders
  };
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardKPIs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardKPIs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kpis = action.payload;
      })
      .addCase(fetchDashboardKPIs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch dashboard KPIs';
      });
  },
});

export default dashboardSlice.reducer;
