import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchFuelLogs, deleteFuelLog } from '../../features/fuel/fuelSlice';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Search, Edit, Trash2, Droplet } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { FuelLog } from '../../types';

export const FuelList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: fuel, status } = useSelector((state: RootState) => state.fuel);

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<FuelLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchFuelLogs());
  }, [dispatch, status]);

  const filtered = fuel.filter(log =>
    log.vehicle?.reg_number?.toLowerCase().includes(search.toLowerCase()) ||
    log.fuel_station?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteFuelLog(deleteTarget.id)).unwrap();
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[var(--bg-main)]">
        <Header
          title="Fuel Logs"
          showBack
          rightElement={
            <button
              className="p-2 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
              onClick={() => navigate('/fuel/add')}
            >
              <Plus size={20} />
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-main)] rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              placeholder="Search by vehicle or station..."
            />
          </div>

          {status === 'loading' ? (
            <div className="text-center p-8 text-[var(--text-muted)]">Loading records...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-12 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] mt-8">
              <Droplet size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
              <h3 className="text-lg font-medium mb-2">No fuel logged</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">Record your first fuel up to track consumption.</p>
              <button
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium"
                onClick={() => navigate('/fuel/add')}
              >
                Log Fuel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((log) => (
                <Card key={log.id} className="p-4 border-l-4 border-l-[var(--warning)]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-[var(--text-main)]">{formatCurrency(log.total_cost)}</span>
                      <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(log.date)}</span>
                    </div>
                    <div className="bg-[var(--bg-surface-alt)] px-2 py-1 rounded text-xs font-medium uppercase tracking-wider text-[var(--warning)]">
                      {log.liters} L
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-[var(--bg-surface-alt)] px-2 py-1 rounded text-xs font-medium border border-[var(--border)]">
                      {log.vehicle?.reg_number || 'Unknown Vehicle'}
                    </div>
                    {log.fuel_station && (
                      <div className="text-xs text-[var(--text-muted)] flex-1 truncate">@ {log.fuel_station}</div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    <button
                      onClick={() => navigate(`/fuel/edit/${log.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(log)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--danger)] hover:text-[var(--danger)] transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Fuel Log"
        message={`Delete this fuel log of ${deleteTarget ? formatCurrency(deleteTarget.total_cost) : ''}? This cannot be undone.`}
        confirmLabel="Delete Log"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </>
  );
};
