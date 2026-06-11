import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Reminder } from '../../types';
import { reminderRepo } from '../../db/repositories/reminderRepo';
import { v4 as uuidv4 } from 'uuid';

interface RemindersState {
  reminders: Reminder[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RemindersState = {
  reminders: [],
  status: 'idle',
  error: null,
};

export const fetchReminders = createAsyncThunk('reminders/fetchAll', async () => {
  return await reminderRepo.getAll();
});

export const createReminder = createAsyncThunk(
  'reminders/create',
  async (data: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const reminder: Reminder = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };
    await reminderRepo.create(reminder);
    return reminder;
  }
);

export const toggleReminderDone = createAsyncThunk(
  'reminders/toggleDone',
  async ({ id, is_done }: { id: string; is_done: boolean }) => {
    await reminderRepo.update(id, { is_done, updated_at: new Date().toISOString() });
    return { id, is_done };
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/delete',
  async (id: string) => {
    await reminderRepo.delete(id);
    return id;
  }
);

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reminders = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load reminders';
      })
      .addCase(createReminder.fulfilled, (state, action) => {
        state.reminders.push(action.payload);
        state.reminders.sort((a, b) => a.due_date.localeCompare(b.due_date));
      })
      .addCase(toggleReminderDone.fulfilled, (state, action) => {
        const r = state.reminders.find(r => r.id === action.payload.id);
        if (r) r.is_done = action.payload.is_done;
      })
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.reminders = state.reminders.filter(r => r.id !== action.payload);
      });
  },
});

export default remindersSlice.reducer;
