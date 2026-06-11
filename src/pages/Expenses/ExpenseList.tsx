import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchExpenses, deleteExpense } from '../../features/expenses/expensesSlice';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, FileText, Search, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { ExpenseLog } from '../../types';

export const ExpenseList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: expenses, status } = useSelector((state: RootState) => state.expenses);

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ExpenseLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchExpenses());
  }, [dispatch, status]);

  const filtered = expenses.filter(log =>
    log.category.toLowerCase().includes(search.toLowerCase()) ||
    log.vehicle?.reg_number?.toLowerCase().includes(search.toLowerCase()) ||
    log.notes?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteExpense(deleteTarget.id)).unwrap();
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[var(--bg-main)]">
        <Header
          title="Expense Logs"
          rightElement={
            <button
              className="p-2 rounded-full bg-[var(--danger)] text-white hover:bg-red-700 transition-colors"
              onClick={() => navigate('/expenses/add')}
            >
              <Plus size={20} />
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-surface-alt)] border border-[var(--border)] text-[var(--text-main)] rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              placeholder="Search by category, vehicle or notes..."
            />
          </div>

          {/* List */}
          {status === 'loading' ? (
            <div className="text-center p-8 text-[var(--text-muted)]">Loading records...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-12 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] mt-8">
              <FileText size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
              <h3 className="text-lg font-medium mb-2">No expenses logged</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">Record your first expense to track costs.</p>
              <button
                className="px-4 py-2 bg-[var(--danger)] text-white rounded-lg font-medium"
                onClick={() => navigate('/expenses/add')}
              >
                Log Expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((log) => (
                <Card key={log.id} className="p-4 border-l-4 border-l-[var(--danger)]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-[var(--danger)]">-{formatCurrency(log.amount)}</span>
                      <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(log.date)}</span>
                    </div>
                    <div className="bg-[var(--bg-surface-alt)] px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
                      {log.category.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {log.vehicle && (
                      <div className="bg-[var(--bg-surface-alt)] px-2 py-1 rounded text-xs font-medium border border-[var(--border)]">
                        {log.vehicle.reg_number}
                      </div>
                    )}
                    {log.notes && (
                      <div className="text-xs text-[var(--text-muted)] flex-1 truncate">{log.notes}</div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    <button
                      onClick={() => navigate(`/expenses/edit/${log.id}`)}
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
        title="Delete Expense"
        message={`Delete this ${deleteTarget?.category.replace('_', ' ')} expense of ${deleteTarget ? formatCurrency(deleteTarget.amount) : ''}? This cannot be undone.`}
        confirmLabel="Delete Expense"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </>
  );
};
