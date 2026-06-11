import { getDB, isWeb, webStore } from '../database';
import { Reminder } from '../../types';

export const reminderRepo = {
  async getAll(): Promise<Reminder[]> {
    if (isWeb) {
      const rows = webStore.getReminders() as any[];
      const vehicles = webStore.getVehicles() as any[];
      return rows.map(r => {
        const v = vehicles.find(v => v.id === r.vehicle_id);
        return { ...r, vehicle: v ? { id: v.id, type: v.type, reg_number: v.reg_number, nickname: v.nickname } : undefined };
      }).sort((a, b) => a.due_date.localeCompare(b.due_date)) as Reminder[];
    }
    const db = getDB();
    const res = await db.query(`
      SELECT r.*, v.type as vehicle_type, v.reg_number, v.nickname
      FROM reminders r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      ORDER BY r.due_date ASC
    `);
    return (res.values || []).map(row => {
      const { vehicle_type, reg_number, nickname, ...reminder } = row;
      return { ...reminder, vehicle: { id: reminder.vehicle_id, type: vehicle_type, reg_number, nickname } } as Reminder;
    });
  },

  async getByVehicle(vehicleId: string): Promise<Reminder[]> {
    if (isWeb) return (webStore.getReminders() as any[]).filter(r => r.vehicle_id === vehicleId) as Reminder[];
    const db = getDB();
    const res = await db.query('SELECT * FROM reminders WHERE vehicle_id = ? ORDER BY due_date ASC', [vehicleId]);
    return (res.values || []) as Reminder[];
  },

  async create(reminder: Reminder): Promise<void> {
    if (isWeb) { webStore.insertReminder(reminder); return; }
    const db = getDB();
    await db.run(
      `INSERT INTO reminders (id, vehicle_id, type, title, due_date, is_done, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reminder.id, reminder.vehicle_id, reminder.type, reminder.title,
       reminder.due_date, reminder.is_done ? 1 : 0, reminder.created_at, reminder.updated_at]
    );
  },

  async update(id: string, updates: Partial<Reminder>): Promise<void> {
    if (isWeb) { webStore.updateReminder(id, updates); return; }
    const db = getDB();
    const sets: string[] = [];
    const values: any[] = [];
    (updates as any).updated_at = new Date().toISOString();
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'vehicle') {
        sets.push(`${key} = ?`);
        values.push(key === 'is_done' ? (value ? 1 : 0) : value);
      }
    });
    if (sets.length === 0) return;
    values.push(id);
    await db.run(`UPDATE reminders SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    if (isWeb) { webStore.deleteReminder(id); return; }
    const db = getDB();
    await db.run('DELETE FROM reminders WHERE id = ?', [id]);
  },

  async countOverdue(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    if (isWeb) {
      return (webStore.getReminders() as any[])
        .filter(r => !r.is_done && r.due_date < today)
        .length;
    }
    const db = getDB();
    const res = await db.query(
      "SELECT COUNT(*) as count FROM reminders WHERE is_done = 0 AND due_date < ?",
      [today]
    );
    return res.values?.[0]?.count || 0;
  },

  async getDueWithin(days: number): Promise<Reminder[]> {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + days);
    const todayStr = today.toISOString().split('T')[0];
    const futureStr = future.toISOString().split('T')[0];
    if (isWeb) {
      return (webStore.getReminders() as any[])
        .filter(r => !r.is_done && r.due_date >= todayStr && r.due_date <= futureStr) as Reminder[];
    }
    const db = getDB();
    const res = await db.query(
      "SELECT * FROM reminders WHERE is_done = 0 AND due_date >= ? AND due_date <= ? ORDER BY due_date ASC",
      [todayStr, futureStr]
    );
    return (res.values || []) as Reminder[];
  }
};
