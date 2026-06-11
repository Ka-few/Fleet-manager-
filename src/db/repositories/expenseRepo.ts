import { getDB, isWeb, webStore } from '../database';
import { ExpenseLog } from '../../types';

export const expenseRepo = {
  async getAll(): Promise<ExpenseLog[]> {
    if (isWeb) {
      const logs = webStore.getExpenses() as any[];
      const vehicles = webStore.getVehicles() as any[];
      return logs.map(log => {
        const v = vehicles.find(v => v.id === log.vehicle_id);
        const vehicle = v ? { id: v.id, type: v.type, reg_number: v.reg_number, nickname: v.nickname } : undefined;
        return { ...log, vehicle };
      }).reverse() as ExpenseLog[];
    }
    const db = getDB();
    const res = await db.query(`
      SELECT e.*, v.type as vehicle_type, v.reg_number, v.nickname 
      FROM expense_logs e
      LEFT JOIN vehicles v ON e.vehicle_id = v.id
      ORDER BY e.date DESC, e.created_at DESC
    `);
    return (res.values || []).map(row => {
      const { vehicle_type, reg_number, nickname, ...log } = row;
      const vehicle = log.vehicle_id ? { id: log.vehicle_id, type: vehicle_type, reg_number, nickname } : undefined;
      return { ...log, vehicle } as ExpenseLog;
    });
  },

  async getByVehicle(vehicleId: string): Promise<ExpenseLog[]> {
    if (isWeb) return (webStore.getExpenses() as any[]).filter(e => e.vehicle_id === vehicleId) as ExpenseLog[];
    const db = getDB();
    const res = await db.query('SELECT * FROM expense_logs WHERE vehicle_id = ? ORDER BY date DESC', [vehicleId]);
    return (res.values || []) as ExpenseLog[];
  },

  async create(log: ExpenseLog): Promise<void> {
    if (isWeb) { webStore.insertExpense(log); return; }
    const db = getDB();
    await db.run(
      `INSERT INTO expense_logs (id, vehicle_id, category, amount, date, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [log.id, log.vehicle_id || null, log.category, log.amount, log.date, log.notes || null, log.created_at, log.updated_at]
    );
  },

  async update(id: string, updates: Partial<ExpenseLog>): Promise<void> {
    if (isWeb) { webStore.updateExpense(id, updates); return; }
    const db = getDB();
    const sets: string[] = [];
    const values: any[] = [];
    updates.updated_at = new Date().toISOString();
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'vehicle') { sets.push(`${key} = ?`); values.push(value); }
    });
    if (sets.length === 0) return;
    values.push(id);
    await db.run(`UPDATE expense_logs SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    if (isWeb) { webStore.deleteExpense(id); return; }
    const db = getDB();
    await db.run('DELETE FROM expense_logs WHERE id = ?', [id]);
  },

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<number> {
    if (isWeb) {
      return (webStore.getExpenses() as any[])
        .filter(e => e.date >= startDate && e.date <= endDate)
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    }
    const db = getDB();
    const res = await db.query(
      'SELECT SUM(amount) as total FROM expense_logs WHERE date >= ? AND date <= ?',
      [startDate, endDate]
    );
    return res.values?.[0]?.total || 0;
  }
};
