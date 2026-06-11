import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { maintenanceRepo } from '../../db/repositories/maintenanceRepo';
import { MaintenanceLog } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface MaintenanceState {
  items: MaintenanceLog[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MaintenanceState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchMaintenanceLogs = createAsyncThunk('maintenance/fetchAll', async () => {
  return await maintenanceRepo.getAll();
});

export const addMaintenanceLog = createAsyncThunk(
  'maintenance/add',
  async (log: Omit<MaintenanceLog, 'id' | 'created_at' | 'updated_at' | 'vehicle'>) => {
    const newLog: MaintenanceLog = {
      ...log,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await maintenanceRepo.create(newLog);
    return await maintenanceRepo.getAll();
  }
);

export const updateMaintenanceLog = createAsyncThunk(
  'maintenance/update',
  async ({ id, changes }: { id: string; changes: Partial<MaintenanceLog> }) => {
    await maintenanceRepo.update(id, changes);
    return id;
  }
);

export const deleteMaintenanceLog = createAsyncThunk(
  'maintenance/delete',
  async (id: string) => {
    await maintenanceRepo.delete(id);
    return id;
  }
);

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceLogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMaintenanceLogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMaintenanceLogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch maintenance logs';
      })
      .addCase(addMaintenanceLog.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deleteMaintenanceLog.fulfilled, (state, action) => {
        state.items = state.items.filter(m => m.id !== action.payload);
      });
  },
});

export default maintenanceSlice.reducer;
