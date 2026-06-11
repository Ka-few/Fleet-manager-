import { getDB, isWeb, webStore } from '../database';
import { FuelLog } from '../../types';

export const fuelRepo = {
  async getAll(): Promise<FuelLog[]> {
    if (isWeb) {
      const logs = webStore.getFuelLogs();
      const vehicles = webStore.getVehicles();
      return logs.map((log: any) => ({
        ...log,
        vehicle: vehicles.find((v: any) => v.id === log.vehicle_id)
      })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const db = getDB();
    const result = await db.query(`
      SELECT f.*, 
        v.id as v_id, v.reg_number as v_reg_number, v.type as v_type
      FROM fuel_logs f
      JOIN vehicles v ON f.vehicle_id = v.id
      ORDER BY f.date DESC
    `);
    
    return (result.values || []).map(row => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      liters: row.liters,
      cost_per_liter: row.cost_per_liter,
      total_cost: row.total_cost,
      fuel_station: row.fuel_station,
      odometer: row.odometer,
      date: row.date,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      vehicle: {
        id: row.v_id,
        reg_number: row.v_reg_number,
        type: row.v_type,
      } as any
    }));
  },

  async create(log: Omit<FuelLog, 'vehicle'>): Promise<void> {
    if (isWeb) {
      webStore.insertFuelLog(log);
      return;
    }

    const db = getDB();
    await db.run(
      `INSERT INTO fuel_logs (id, vehicle_id, liters, cost_per_liter, total_cost, fuel_station, odometer, date, notes, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [log.id, log.vehicle_id, log.liters, log.cost_per_liter, log.total_cost, log.fuel_station, log.odometer, log.date, log.notes, log.created_at, log.updated_at]
    );
  },

  async update(id: string, changes: Partial<FuelLog>): Promise<void> {
    if (isWeb) {
      webStore.updateFuelLog(id, changes);
      return;
    }

    const db = getDB();
    const sets: string[] = [];
    const values: any[] = [];
    
    for (const [k, v] of Object.entries(changes)) {
      if (k !== 'id' && k !== 'vehicle') {
        sets.push(`${k} = ?`);
        values.push(v);
      }
    }
    
    if (sets.length === 0) return;
    
    values.push(id);
    await db.run(`UPDATE fuel_logs SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    if (isWeb) {
      webStore.deleteFuelLog(id);
      return;
    }

    const db = getDB();
    await db.run(`DELETE FROM fuel_logs WHERE id = ?`, [id]);
  }
};
