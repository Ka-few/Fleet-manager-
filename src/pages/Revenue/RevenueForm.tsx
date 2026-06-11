import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addRevenue } from '../../features/revenue/revenueSlice';
import { fetchVehicles } from '../../features/vehicles/vehiclesSlice';
import { revenueRepo } from '../../db/repositories/revenueRepo';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const revenueSchema = z.object({
  vehicle_id: z.string().min(1, 'Please select a vehicle'),
  revenue_type: z.enum(['daily_collection', 'trip']),
  amount: z.string().min(1, 'Amount is required'),
  route: z.string().optional(),
  driver_remittance: z.string().optional(),
  conductor_remittance: z.string().optional(),
  client: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  cargo_type: z.string().optional(),
  payment_status: z.enum(['paid', 'pending', 'partial']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type RevenueFormData = z.infer<typeof revenueSchema>;

export const RevenueForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: vehicles, status: vehiclesStatus } = useSelector((state: RootState) => state.vehicles);
  const existingLog = useSelector((state: RootState) =>
    state.revenue.items.find(r => r.id === id)
  );

  useEffect(() => {
    if (vehiclesStatus === 'idle') dispatch(fetchVehicles());
  }, [dispatch, vehiclesStatus]);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<RevenueFormData>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      revenue_type: 'daily_collection',
      payment_status: 'paid',
      date: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    if (isEditing && existingLog) {
      reset({
        vehicle_id: existingLog.vehicle_id,
        revenue_type: existingLog.revenue_type,
        amount: existingLog.amount.toString(),
        route: existingLog.route || '',
        driver_remittance: existingLog.driver_remittance?.toString() || '',
        conductor_remittance: existingLog.conductor_remittance?.toString() || '',
        client: existingLog.client || '',
        origin: existingLog.origin || '',
        destination: existingLog.destination || '',
        cargo_type: existingLog.cargo_type || '',
        payment_status: existingLog.payment_status,
        date: existingLog.date,
        notes: existingLog.notes || '',
      });
    }
  }, [isEditing, existingLog, reset]);

  const selectedType = watch('revenue_type');
  const activeVehicles = vehicles.filter(v => v.status === 'active' || v.status === 'in_service');

  const onSubmit = async (data: RevenueFormData) => {
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        driver_remittance: data.driver_remittance ? parseFloat(data.driver_remittance) : undefined,
        conductor_remittance: data.conductor_remittance ? parseFloat(data.conductor_remittance) : undefined,
      };

      if (isEditing && id && existingLog) {
        await revenueRepo.update(id, {
          ...payload,
          updated_at: new Date().toISOString(),
        } as any);
        // Refresh revenue in Redux by re-fetching
        dispatch({ type: 'revenue/fetchAll/pending' });
        const all = await revenueRepo.getAll();
        dispatch({ type: 'revenue/fetchAll/fulfilled', payload: all });
      } else {
        await dispatch(addRevenue(payload as any)).unwrap();
      }
      navigate('/revenue', { replace: true });
    } catch (error) {
      console.error('Failed to save revenue:', error);
      alert('Failed to save revenue log.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header title={isEditing ? 'Edit Income Log' : 'Log Income'} showBack />

      <div className="flex-1 overflow-y-auto p-4">
        <form id="revenue-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Vehicle *"
            {...register('vehicle_id')}
            error={errors.vehicle_id?.message}
            options={[
              { value: '', label: 'Select a vehicle' },
              ...vehicles.map(v => ({
                value: v.id,
                label: `${v.reg_number} - ${v.nickname || v.type}`
              }))
            ]}
          />

          <Select
            label="Income Type *"
            {...register('revenue_type')}
            error={errors.revenue_type?.message}
            options={[
              { value: 'daily_collection', label: 'Daily Collection (Matatu)' },
              { value: 'trip', label: 'Trip Payment (Truck/Pickup)' },
            ]}
          />

          <Input
            label="Total Amount (KES) *"
            type="number"
            step="0.01"
            placeholder="e.g. 5000"
            {...register('amount')}
            error={errors.amount?.message}
          />

          <Input
            label="Date *"
            type="date"
            {...register('date')}
            error={errors.date?.message}
          />

          {selectedType === 'daily_collection' && (
            <div className="space-y-4 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-surface-alt)]">
              <h3 className="text-sm font-medium text-[var(--primary)] mb-2">Matatu Details</h3>
              <Input label="Route" placeholder="e.g. CBD - Ngong" {...register('route')} error={errors.route?.message} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Driver Wage" type="number" placeholder="e.g. 1000" {...register('driver_remittance')} />
                <Input label="Conductor Wage" type="number" placeholder="e.g. 800" {...register('conductor_remittance')} />
              </div>
            </div>
          )}

          {selectedType === 'trip' && (
            <div className="space-y-4 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-surface-alt)]">
              <h3 className="text-sm font-medium text-blue-400 mb-2">Trip Details</h3>
              <Input label="Client Name" placeholder="e.g. ABC Logistics" {...register('client')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Origin" placeholder="e.g. Mombasa" {...register('origin')} />
                <Input label="Destination" placeholder="e.g. Nairobi" {...register('destination')} />
              </div>
              <Input label="Cargo Type" placeholder="e.g. Cement bags" {...register('cargo_type')} />
            </div>
          )}

          <Select
            label="Payment Status"
            {...register('payment_status')}
            error={errors.payment_status?.message}
            options={[
              { value: 'paid', label: 'Paid in Full' },
              { value: 'partial', label: 'Partial Payment' },
              { value: 'pending', label: 'Pending / Credit' },
            ]}
          />

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
        <Button type="submit" form="revenue-form" fullWidth isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Save Income Log'}
        </Button>
      </div>
    </div>
  );
};
