import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addExpense } from '../../features/expenses/expensesSlice';
import { fetchVehicles } from '../../features/vehicles/vehiclesSlice';
import { expenseRepo } from '../../db/repositories/expenseRepo';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

const expenseSchema = z.object({
  vehicle_id: z.string().optional(),
  category: z.enum(['fuel', 'repairs', 'maintenance', 'salaries', 'insurance', 'parking', 'fines', 'licenses', 'route_fees', 'misc']),
  amount: z.string().min(1, 'Amount is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export const ExpenseForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: vehicles, status: vehiclesStatus } = useSelector((state: RootState) => state.vehicles);
  const existingLog = useSelector((state: RootState) =>
    state.expenses.items.find(e => e.id === id)
  );

  useEffect(() => {
    if (vehiclesStatus === 'idle') dispatch(fetchVehicles());
  }, [dispatch, vehiclesStatus]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'fuel',
      date: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    if (isEditing && existingLog) {
      reset({
        vehicle_id: existingLog.vehicle_id || '',
        category: existingLog.category,
        amount: existingLog.amount.toString(),
        date: existingLog.date,
        notes: existingLog.notes || '',
      });
    }
  }, [isEditing, existingLog, reset]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      const payload = {
        ...data,
        vehicle_id: data.vehicle_id || undefined,
        amount: parseFloat(data.amount),
      };

      if (isEditing && id && existingLog) {
        await expenseRepo.update(id, {
          ...payload,
          updated_at: new Date().toISOString(),
        } as any);
        // Refresh expenses in Redux
        dispatch({ type: 'expenses/fetchAll/pending' });
        const all = await expenseRepo.getAll();
        dispatch({ type: 'expenses/fetchAll/fulfilled', payload: all });
      } else {
        await dispatch(addExpense(payload as any)).unwrap();
      }
      navigate('/expenses', { replace: true });
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Failed to save expense log.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header title={isEditing ? 'Edit Expense' : 'Log Expense'} showBack />

      <div className="flex-1 overflow-y-auto p-4">
        <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Category *"
            {...register('category')}
            error={errors.category?.message}
            options={[
              { value: 'fuel', label: 'Fuel' },
              { value: 'repairs', label: 'Repairs' },
              { value: 'maintenance', label: 'Maintenance / Servicing' },
              { value: 'salaries', label: 'Salaries & Wages' },
              { value: 'insurance', label: 'Insurance' },
              { value: 'parking', label: 'Parking Fees' },
              { value: 'fines', label: 'Police / County Fines' },
              { value: 'licenses', label: 'Licenses & Permits' },
              { value: 'route_fees', label: 'Sacco / Route Fees' },
              { value: 'misc', label: 'Miscellaneous' },
            ]}
          />

          <Select
            label="Vehicle (Optional)"
            {...register('vehicle_id')}
            options={[
              { value: '', label: 'General / No Vehicle' },
              ...vehicles.map(v => ({
                value: v.id,
                label: `${v.reg_number} - ${v.nickname || v.type}`
              }))
            ]}
          />

          <Input
            label="Total Amount (KES) *"
            type="number"
            step="0.01"
            placeholder="e.g. 1500"
            {...register('amount')}
            error={errors.amount?.message}
          />

          <Input
            label="Date *"
            type="date"
            {...register('date')}
            error={errors.date?.message}
          />

          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Notes</label>
            <textarea
              className="w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-main)] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow"
              rows={3}
              placeholder="e.g. Replaced front brake pads"
              {...register('notes')}
            ></textarea>
          </div>
        </form>
      </div>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-main)]">
        <Button type="submit" form="expense-form" variant="danger" fullWidth isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Save Expense'}
        </Button>
      </div>
    </div>
  );
};
