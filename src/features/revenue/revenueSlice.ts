import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RevenueLog } from '../../types';
import { revenueRepo } from '../../db/repositories/revenueRepo';
import { v4 as uuidv4 } from 'uuid';

interface RevenueState {
  items: RevenueLog[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RevenueState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchRevenue = createAsyncThunk('revenue/fetchAll', async () => {
  return await revenueRepo.getAll();
});

export const addRevenue = createAsyncThunk(
  'revenue/add',
  async (log: Omit<RevenueLog, 'id' | 'created_at' | 'updated_at' | 'vehicle'>) => {
    const newLog: RevenueLog = {
      ...log,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await revenueRepo.create(newLog);
    return await revenueRepo.getAll();
  }
);

export const deleteRevenue = createAsyncThunk(
  'revenue/delete',
  async (id: string) => {
    await revenueRepo.delete(id);
    return id;
  }
);

const revenueSlice = createSlice({
  name: 'revenue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenue.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch revenue';
      })
      .addCase(addRevenue.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deleteRevenue.fulfilled, (state, action) => {
        state.items = state.items.filter(r => r.id !== action.payload);
      });
  },
});

export default revenueSlice.reducer;
