import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ExpenseLog } from '../../types';
import { expenseRepo } from '../../db/repositories/expenseRepo';
import { v4 as uuidv4 } from 'uuid';

interface ExpensesState {
  items: ExpenseLog[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ExpensesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async () => {
  return await expenseRepo.getAll();
});

export const addExpense = createAsyncThunk(
  'expenses/add',
  async (log: Omit<ExpenseLog, 'id' | 'created_at' | 'updated_at' | 'vehicle'>) => {
    const newLog: ExpenseLog = {
      ...log,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await expenseRepo.create(newLog);
    return await expenseRepo.getAll();
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (id: string) => {
    await expenseRepo.delete(id);
    return id;
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.items = state.items.filter(e => e.id !== action.payload);
      });
  },
});

export default expensesSlice.reducer;
