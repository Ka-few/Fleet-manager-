import { getDB, isWeb, webStore } from '../database';
import { RevenueLog } from '../../types';

export const revenueRepo = {
  async getAll(): Promise<RevenueLog[]> {
    if (isWeb) {
      const logs = webStore.getRevenue() as any[];
      const vehicles = webStore.getVehicles() as any[];
      return logs.map(log => {
        const v = vehicles.find(v => v.id === log.vehicle_id);
        return { ...log, vehicle: v ? { id: v.id, type: v.type, reg_number: v.reg_number, nickname: v.nickname } : undefined };
      }).reverse() as RevenueLog[];
    }
    const db = getDB();
    const res = await db.query(`
      SELECT r.*, v.type as vehicle_type, v.reg_number, v.nickname 
      FROM revenue_logs r
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      ORDER BY r.date DESC, r.created_at DESC
    `);
    return (res.values || []).map(row => {
      const { vehicle_type, reg_number, nickname, ...log } = row;
      return { ...log, vehicle: { id: log.vehicle_id, type: vehicle_type, reg_number, nickname } } as RevenueLog;
    });
  },

  async getByVehicle(vehicleId: string): Promise<RevenueLog[]> {
    if (isWeb) return (webStore.getRevenue() as any[]).filter(r => r.vehicle_id === vehicleId) as RevenueLog[];
    const db = getDB();
    const res = await db.query('SELECT * FROM revenue_logs WHERE vehicle_id = ? ORDER BY date DESC', [vehicleId]);
    return (res.values || []) as RevenueLog[];
  },

  async create(log: RevenueLog): Promise<void> {
    if (isWeb) { webStore.insertRevenue(log); return; }
    const db = getDB();
    await db.run(
      `INSERT INTO revenue_logs (
        id, vehicle_id, revenue_type, amount, route, driver_remittance, 
        conductor_remittance, client, origin, destination, cargo_type, 
        payment_status, date, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        log.id, log.vehicle_id, log.revenue_type, log.amount, log.route || null,
        log.driver_remittance || null, log.conductor_remittance || null,
        log.client || null, log.origin || null, log.destination || null,
        log.cargo_type || null, log.payment_status, log.date, log.notes || null,
        log.created_at, log.updated_at
      ]
    );
  },

  async update(id: string, updates: Partial<RevenueLog>): Promise<void> {
    if (isWeb) { webStore.updateRevenue(id, updates); return; }
    const db = getDB();
    const sets: string[] = [];
    const values: any[] = [];
    updates.updated_at = new Date().toISOString();
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'vehicle') { sets.push(`${key} = ?`); values.push(value); }
    });
    if (sets.length === 0) return;
    values.push(id);
    await db.run(`UPDATE revenue_logs SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    if (isWeb) { webStore.deleteRevenue(id); return; }
    const db = getDB();
    await db.run('DELETE FROM revenue_logs WHERE id = ?', [id]);
  },

  async getRevenueByDateRange(startDate: string, endDate: string): Promise<number> {
    if (isWeb) {
      return (webStore.getRevenue() as any[])
        .filter(r => r.date >= startDate && r.date <= endDate)
        .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
    }
    const db = getDB();
    const res = await db.query(
      'SELECT SUM(amount) as total FROM revenue_logs WHERE date >= ? AND date <= ?',
      [startDate, endDate]
    );
    return res.values?.[0]?.total || 0;
  }
};
