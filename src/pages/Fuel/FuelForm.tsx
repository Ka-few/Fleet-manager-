import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addFuelLog } from '../../features/fuel/fuelSlice';
import { fetchVehicles } from '../../features/vehicles/vehiclesSlice';
import { fuelRepo } from '../../db/repositories/fuelRepo';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const fuelSchema = z.object({
  vehicle_id: z.string().min(1, 'Please select a vehicle'),
  liters: z.string().min(1, 'Liters is required'),
  cost_per_liter: z.string().optional(),
  total_cost: z.string().min(1, 'Total cost is required'),
  fuel_station: z.string().optional(),
  odometer: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type FuelFormData = z.infer<typeof fuelSchema>;

export const FuelForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const queryParams = new URLSearchParams(location.search);
  const defaultVehicleId = queryParams.get('vehicle_id') || '';

  const { items: vehicles, status: vehiclesStatus } = useSelector((state: RootState) => state.vehicles);
  const existingLog = useSelector((state: RootState) =>
    state.fuel.items.find(f => f.id === id)
  );

  useEffect(() => {
    if (vehiclesStatus === 'idle') dispatch(fetchVehicles());
  }, [dispatch, vehiclesStatus]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FuelFormData>({
    resolver: zodResolver(fuelSchema),
    defaultValues: {
      vehicle_id: defaultVehicleId,
      date: new Date().toISOString().split('T')[0],
    }
  });

  // Auto-calculate total cost if liters and cost_per_liter change
  const liters = watch('liters');
  const costPerLiter = watch('cost_per_liter');
  
  useEffect(() => {
    if (liters && costPerLiter && !isEditing) {
      const total = parseFloat(liters) * parseFloat(costPerLiter);
      if (!isNaN(total)) {
        setValue('total_cost', total.toFixed(2));
      }
    }
  }, [liters, costPerLiter, setValue, isEditing]);

  useEffect(() => {
    if (isEditing && existingLog) {
      reset({
        vehicle_id: existingLog.vehicle_id,
        liters: existingLog.liters.toString(),
        cost_per_liter: existingLog.cost_per_liter?.toString() || '',
        total_cost: existingLog.total_cost.toString(),
        fuel_station: existingLog.fuel_station || '',
        odometer: existingLog.odometer?.toString() || '',
        date: existingLog.date,
        notes: existingLog.notes || '',
      });
    }
  }, [isEditing, existingLog, reset]);

  const onSubmit = async (data: FuelFormData) => {
    try {
      const payload = {
        ...data,
        liters: parseFloat(data.liters),
        cost_per_liter: data.cost_per_liter ? parseFloat(data.cost_per_liter) : undefined,
        total_cost: parseFloat(data.total_cost),
        odometer: data.odometer ? parseFloat(data.odometer) : undefined,
      };

      if (isEditing && id && existingLog) {
        await fuelRepo.update(id, {
          ...payload,
          updated_at: new Date().toISOString(),
        } as any);
        dispatch({ type: 'fuel/fetchAll/pending' });
        const all = await fuelRepo.getAll();
        dispatch({ type: 'fuel/fetchAll/fulfilled', payload: all });
      } else {
        await dispatch(addFuelLog(payload as any)).unwrap();
      }
      navigate('/fuel', { replace: true });
    } catch (error) {
      console.error('Failed to save fuel log:', error);
      alert('Failed to save fuel log.');
    }
  };

  const activeVehicles = useMemo(() => vehicles.filter(v => v.status === 'active' || v.status === 'in_service'), [vehicles]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header title={isEditing ? 'Edit Fuel Log' : 'Log Fuel'} showBack />

      <div className="flex-1 overflow-y-auto p-4">
        <form id="fuel-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Vehicle *"
            {...register('vehicle_id')}
            error={errors.vehicle_id?.message}
            options={[
              { value: '', label: 'Select a vehicle' },
              ...activeVehicles.map(v => ({
                value: v.id,
                label: `${v.reg_number} - ${v.nickname || v.type}`
              }))
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Liters *"
              type="number"
              step="0.01"
              placeholder="e.g. 40"
              {...register('liters')}
              error={errors.liters?.message}
            />
            <Input
              label="Cost/Liter (KES)"
              type="number"
              step="0.01"
              placeholder="e.g. 210"
              {...register('cost_per_liter')}
            />
          </div>

          <Input
            label="Total Cost (KES) *"
            type="number"
            step="0.01"
            placeholder="e.g. 8400"
            {...register('total_cost')}
            error={errors.total_cost?.message}
          />

          <Input
            label="Fuel Station"
            placeholder="e.g. Shell, Rubis"
            {...register('fuel_station')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Odometer (KM)"
              type="number"
              placeholder="Current mileage"
              {...register('odometer')}
            />
            <Input
              label="Date *"
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
          </div>

          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Notes</label>
            <textarea
              className="w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-main)] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow"
              rows={3}
              {...register('notes')}
            ></textarea>
          </div>
        </form>
      </div>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-main)]">
        <Button type="submit" form="fuel-form" fullWidth isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Save Fuel Log'}
        </Button>
      </div>
    </div>
  );
};
