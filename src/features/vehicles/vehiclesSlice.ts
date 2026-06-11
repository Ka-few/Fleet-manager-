import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Vehicle } from '../../types';
import { vehicleRepo } from '../../db/repositories/vehicleRepo';
import { v4 as uuidv4 } from 'uuid';

interface VehiclesState {
  items: Vehicle[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: VehiclesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchVehicles = createAsyncThunk('vehicles/fetchAll', async () => {
  return await vehicleRepo.getAll();
});

export const addVehicle = createAsyncThunk(
  'vehicles/add',
  async (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await vehicleRepo.create(newVehicle);
    return newVehicle;
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicles/update',
  async ({ id, changes }: { id: string; changes: Partial<Vehicle> }) => {
    await vehicleRepo.update(id, changes);
    const updated = await vehicleRepo.getById(id);
    if (!updated) throw new Error('Vehicle not found after update');
    return updated;
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/delete',
  async (id: string) => {
    await vehicleRepo.delete(id);
    return id;
  }
);

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch vehicles';
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.items.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.items = state.items.filter(v => v.id !== action.payload);
      });
  },
});

export default vehiclesSlice.reducer;
