import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addVehicle, updateVehicle } from '../../features/vehicles/vehiclesSlice';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const vehicleSchema = z.object({
  type: z.enum(['matatu', 'truck', 'pickup', 'bus']),
  reg_number: z.string().min(1, 'Registration number is required').toUpperCase(),
  nickname: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  capacity: z.string().optional(),
  status: z.enum(['active', 'in_service', 'sold', 'suspended']),
  insurance_expiry: z.string().optional(),
  license_expiry: z.string().optional(),
  notes: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export const VehicleForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const vehicle = useSelector((state: RootState) => 
    state.vehicles.items.find(v => v.id === id)
  );

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: 'matatu',
      status: 'active',
      reg_number: '',
    }
  });

  useEffect(() => {
    if (isEditing && vehicle) {
      reset({
        type: vehicle.type,
        reg_number: vehicle.reg_number,
        nickname: vehicle.nickname || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year?.toString() || '',
        capacity: vehicle.capacity?.toString() || '',
        status: vehicle.status,
        insurance_expiry: vehicle.insurance_expiry || '',
        license_expiry: vehicle.license_expiry || '',
        notes: vehicle.notes || '',
      });
    }
  }, [isEditing, vehicle, reset]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      const payload = {
        ...data,
        year: data.year ? parseInt(data.year, 10) : undefined,
        capacity: data.capacity ? parseInt(data.capacity, 10) : undefined,
      };

      if (isEditing && id) {
        await dispatch(updateVehicle({ id, changes: payload as any })).unwrap();
        navigate(`/vehicles/${id}`, { replace: true });
      } else {
        await dispatch(addVehicle(payload as any)).unwrap();
        navigate('/vehicles', { replace: true });
      }
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      alert('Failed to save vehicle. Registration number might already exist.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header title={isEditing ? 'Edit Vehicle' : 'Add Vehicle'} showBack />
      
      <div className="flex-1 overflow-y-auto p-4">
        <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Vehicle Type *"
            {...register('type')}
            error={errors.type?.message}
            options={[
              { value: 'matatu', label: 'Matatu' },
              { value: 'truck', label: 'Truck' },
              { value: 'pickup', label: 'Pickup' },
              { value: 'bus', label: 'Bus' },
            ]}
          />

          <Input
            label="Registration Number *"
            placeholder="e.g. KCA 123A"
            {...register('reg_number')}
            error={errors.reg_number?.message}
          />

          <Input
            label="Nickname"
            placeholder="e.g. The Beast"
            {...register('nickname')}
            error={errors.nickname?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Make"
              placeholder="e.g. Isuzu"
              {...register('make')}
              error={errors.make?.message}
            />
            <Input
              label="Model"
              placeholder="e.g. NQR"
              {...register('model')}
              error={errors.model?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Year"
              type="number"
              placeholder="e.g. 2018"
              {...register('year')}
              error={errors.year?.message}
            />
            <Input
              label="Capacity"
              type="number"
              placeholder="e.g. 33"
              {...register('capacity')}
              error={errors.capacity?.message}
            />
          </div>

          <Select
            label="Status"
            {...register('status')}
            error={errors.status?.message}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'in_service', label: 'In Service' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'sold', label: 'Sold' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Insurance Expiry"
              type="date"
              {...register('insurance_expiry')}
              error={errors.insurance_expiry?.message}
            />
            <Input
              label="License Expiry"
              type="date"
              {...register('license_expiry')}
              error={errors.license_expiry?.message}
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
        <Button 
          type="submit" 
          form="vehicle-form" 
          fullWidth 
          isLoading={isSubmitting}
        >
          {isEditing ? 'Save Changes' : 'Add Vehicle'}
        </Button>
      </div>
    </div>
  );
};
