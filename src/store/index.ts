import { configureStore } from '@reduxjs/toolkit';
import vehiclesReducer from '../features/vehicles/vehiclesSlice';
import revenueReducer from '../features/revenue/revenueSlice';
import expensesReducer from '../features/expenses/expensesSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import fuelReducer from '../features/fuel/fuelSlice';
import maintenanceReducer from '../features/maintenance/maintenanceSlice';
import reportsReducer from '../features/reports/reportsSlice';
import remindersReducer from '../features/reminders/remindersSlice';

export const store = configureStore({
  reducer: {
    vehicles: vehiclesReducer,
    revenue: revenueReducer,
    expenses: expensesReducer,
    fuel: fuelReducer,
    maintenance: maintenanceReducer,
    dashboard: dashboardReducer,
    reports: reportsReducer,
    reminders: remindersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
