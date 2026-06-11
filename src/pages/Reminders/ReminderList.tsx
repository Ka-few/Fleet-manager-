import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createReminder, deleteReminder, fetchReminders, toggleReminderDone } from '../../features/reminders/remindersSlice';
import { fetchVehicles } from '../../features/vehicles/vehiclesSlice';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Reminder, ReminderType } from '../../types';
import { AlertTriangle, Bell, CalendarCheck, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const reminderTypes: { value: ReminderType; label: string }[] = [
  { value: 'service', label: 'Service' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'license', label: 'License' },
  { value: 'custom', label: 'Custom' },
];

const getDueState = (reminder: Reminder) => {
  const today = new Date().toISOString().split('T')[0];
  if (reminder.is_done) return 'done';
  if (reminder.due_date < today) return 'overdue';
  if (reminder.due_date === today) return 'today';
  return 'upcoming';
};

export const ReminderList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reminders, status } = useSelector((state: RootState) => state.reminders);
  const { items: vehicles, status: vehiclesStatus } = useSelector((state: RootState) => state.vehicles);
  const [showForm, setShowForm] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState<ReminderType>('service');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'open' | 'all' | 'done'>('open');

  useEffect(() => {
    if (status === 'idle') dispatch(fetchReminders());
    if (vehiclesStatus === 'idle') dispatch(fetchVehicles());
  }, [dispatch, status, vehiclesStatus]);

  const filtered = useMemo(() => {
    return reminders.filter((reminder) => {
      if (filter === 'open') return !reminder.is_done;
      if (filter === 'done') return reminder.is_done;
      return true;
    });
  }, [filter, reminders]);

  const summary = useMemo(() => {
    return reminders.reduce(
      (acc, reminder) => {
        const state = getDueState(reminder);
        if (state === 'overdue') acc.overdue += 1;
        if (state === 'today') acc.today += 1;
        if (!reminder.is_done) acc.open += 1;
        return acc;
      },
      { overdue: 0, today: 0, open: 0 }
    );
  }, [reminders]);

  const submitReminder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vehicleId || !title.trim() || !dueDate) return;

    await dispatch(createReminder({
      vehicle_id: vehicleId,
      type,
      title: title.trim(),
      due_date: dueDate,
      is_done: false,
    })).unwrap();

    setTitle('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header
        title="Reminders"
        showBack
        rightElement={
          <button
            className="p-2 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
            onClick={() => setShowForm(value => !value)}
            aria-label="Add reminder"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <p className="text-xs text-[var(--text-muted)]">Open</p>
            <p className="text-xl font-bold">{summary.open}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-[var(--text-muted)]">Due Today</p>
            <p className="text-xl font-bold text-[var(--warning)]">{summary.today}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-[var(--text-muted)]">Overdue</p>
            <p className="text-xl font-bold text-[var(--danger)]">{summary.overdue}</p>
          </Card>
        </div>

        {showForm && (
          <Card>
            <form onSubmit={submitReminder}>
              <Select
                label="Vehicle"
                value={vehicleId}
                onChange={(event) => setVehicleId(event.target.value)}
                options={[
                  { value: '', label: 'Select a vehicle' },
                  ...vehicles.map(v => ({ value: v.id, label: `${v.reg_number} - ${v.nickname || v.type}` })),
                ]}
              />
              <Select
                label="Reminder Type"
                value={type}
                onChange={(event) => setType(event.target.value as ReminderType)}
                options={reminderTypes}
              />
              <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Renew PSV insurance" />
              <Input label="Due Date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
              <Button type="submit" fullWidth disabled={!vehicleId || !title.trim() || !dueDate}>Save Reminder</Button>
            </form>
          </Card>
        )}

        <div className="flex gap-2">
          {(['open', 'all', 'done'] as const).map(option => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border ${filter === option ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
            >
              {option === 'open' ? 'Open' : option === 'done' ? 'Done' : 'All'}
            </button>
          ))}
        </div>

        {status === 'loading' ? (
          <div className="text-center p-8 text-[var(--text-muted)]">Loading reminders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
            <Bell size={44} className="mx-auto text-[var(--text-muted)] mb-3" />
            <h3 className="text-lg font-medium mb-2">No reminders here</h3>
            <p className="text-sm text-[var(--text-muted)]">In-app reminders stay on this device and work offline.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(reminder => {
              const dueState = getDueState(reminder);
              const tone = dueState === 'overdue' ? 'text-[var(--danger)]' : dueState === 'today' ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]';
              return (
                <Card key={reminder.id} className={`p-4 ${reminder.is_done ? 'opacity-70' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => dispatch(toggleReminderDone({ id: reminder.id, is_done: !reminder.is_done }))}
                      className={`mt-1 rounded-full ${reminder.is_done ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}
                      aria-label={reminder.is_done ? 'Mark open' : 'Mark done'}
                    >
                      {reminder.is_done ? <CheckCircle2 size={22} /> : <CalendarCheck size={22} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--text-main)]">{reminder.title}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">{reminder.vehicle?.reg_number || 'Unknown Vehicle'} · {reminder.type}</p>
                        </div>
                        <button
                          onClick={() => dispatch(deleteReminder(reminder.id))}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)]"
                          aria-label="Delete reminder"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className={`text-sm mt-3 flex items-center gap-1.5 ${tone}`}>
                        {dueState === 'overdue' && <AlertTriangle size={16} />}
                        Due {formatDate(reminder.due_date)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
