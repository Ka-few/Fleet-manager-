import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fuelRepo } from '../../db/repositories/fuelRepo';
import { FuelLog } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface FuelState {
  items: FuelLog[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FuelState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchFuelLogs = createAsyncThunk('fuel/fetchAll', async () => {
  return await fuelRepo.getAll();
});

export const addFuelLog = createAsyncThunk(
  'fuel/add',
  async (log: Omit<FuelLog, 'id' | 'created_at' | 'updated_at' | 'vehicle'>) => {
    const newLog: FuelLog = {
      ...log,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await fuelRepo.create(newLog);
    return await fuelRepo.getAll();
  }
);

export const updateFuelLog = createAsyncThunk(
  'fuel/update',
  async ({ id, changes }: { id: string; changes: Partial<FuelLog> }) => {
    await fuelRepo.update(id, changes);
    return id; // Note: We don't return the full object here, we rely on a refetch if needed, but since we usually refetch entirely, we can just trigger a refetch in the component. For now, let's just do a basic update.
  }
);

export const deleteFuelLog = createAsyncThunk(
  'fuel/delete',
  async (id: string) => {
    await fuelRepo.delete(id);
    return id;
  }
);

const fuelSlice = createSlice({
  name: 'fuel',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFuelLogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFuelLogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFuelLogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch fuel logs';
      })
      .addCase(addFuelLog.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deleteFuelLog.fulfilled, (state, action) => {
        state.items = state.items.filter(f => f.id !== action.payload);
      });
  },
});

export default fuelSlice.reducer;
