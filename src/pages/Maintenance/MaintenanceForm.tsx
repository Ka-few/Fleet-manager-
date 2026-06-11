import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addMaintenanceLog } from '../../features/maintenance/maintenanceSlice';
import { fetchVehicles } from '../../features/vehicles/vehiclesSlice';
import { maintenanceRepo } from '../../db/repositories/maintenanceRepo';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const maintenanceSchema = z.object({
  vehicle_id: z.string().min(1, 'Please select a vehicle'),
  service_type: z.enum(['oil_change', 'tyres', 'brakes', 'engine', 'suspension', 'insurance', 'inspection', 'other']),
  garage: z.string().optional(),
  cost: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  next_service_date: z.string().optional(),
  odometer: z.string().optional(),
  notes: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export const MaintenanceForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const queryParams = new URLSearchParams(location.search);
  const defaultVehicleId = queryParams.get('vehicle_id') || '';

  const { items: vehicles, status: vehiclesStatus } = useSelector((state: RootState) => state.vehicles);
  const existingLog = useSelector((state: RootState) =>
    state.maintenance.items.find(m => m.id === id)
  );

  useEffect(() => {
    if (vehiclesStatus === 'idle') dispatch(fetchVehicles());
  }, [dispatch, vehiclesStatus]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicle_id: defaultVehicleId,
      service_type: 'oil_change',
      date: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    if (isEditing && existingLog) {
      reset({
        vehicle_id: existingLog.vehicle_id,
        service_type: existingLog.service_type,
        garage: existingLog.garage || '',
        cost: existingLog.cost?.toString() || '',
        date: existingLog.date,
        next_service_date: existingLog.next_service_date || '',
        odometer: existingLog.odometer?.toString() || '',
        notes: existingLog.notes || '',
      });
    }
  }, [isEditing, existingLog, reset]);

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      const payload = {
        ...data,
        cost: data.cost ? parseFloat(data.cost) : undefined,
        odometer: data.odometer ? parseFloat(data.odometer) : undefined,
      };

      if (isEditing && id && existingLog) {
        await maintenanceRepo.update(id, {
          ...payload,
          updated_at: new Date().toISOString(),
        } as any);
        dispatch({ type: 'maintenance/fetchAll/pending' });
        const all = await maintenanceRepo.getAll();
        dispatch({ type: 'maintenance/fetchAll/fulfilled', payload: all });
      } else {
        await dispatch(addMaintenanceLog(payload as any)).unwrap();
      }
      navigate('/maintenance', { replace: true });
    } catch (error) {
      console.error('Failed to save maintenance log:', error);
      alert('Failed to save maintenance log.');
    }
  };

  const activeVehicles = useMemo(() => vehicles.filter(v => v.status === 'active' || v.status === 'in_service'), [vehicles]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header title={isEditing ? 'Edit Maintenance' : 'Log Maintenance'} showBack />

      <div className="flex-1 overflow-y-auto p-4">
        <form id="maintenance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Select
            label="Service Type *"
            {...register('service_type')}
            error={errors.service_type?.message}
            options={[
              { value: 'oil_change', label: 'Oil Change / General Service' },
              { value: 'tyres', label: 'Tyres' },
              { value: 'brakes', label: 'Brakes' },
              { value: 'engine', label: 'Engine Repair' },
              { value: 'suspension', label: 'Suspension' },
              { value: 'insurance', label: 'Insurance' },
              { value: 'inspection', label: 'NTSA Inspection' },
              { value: 'other', label: 'Other' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Garage / Mechanic"
              placeholder="e.g. Kamau Garage"
              {...register('garage')}
            />
            <Input
              label="Total Cost (KES)"
              type="number"
              step="0.01"
              placeholder="e.g. 3500"
              {...register('cost')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
            <Input
              label="Next Service Date"
              type="date"
              {...register('next_service_date')}
            />
          </div>

          <Input
            label="Odometer (KM)"
            type="number"
            placeholder="Current mileage"
            {...register('odometer')}
          />

          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Service Notes & Parts</label>
            <textarea
              className="w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-main)] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow"
              rows={3}
              {...register('notes')}
            ></textarea>
          </div>
        </form>
      </div>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-main)]">
        <Button type="submit" form="maintenance-form" fullWidth isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Save Maintenance Log'}
        </Button>
      </div>
    </div>
  );
};
