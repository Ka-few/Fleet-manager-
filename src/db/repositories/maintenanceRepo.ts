import { getDB, isWeb, webStore } from '../database';
import { MaintenanceLog } from '../../types';

export const maintenanceRepo = {
  async getAll(): Promise<MaintenanceLog[]> {
    if (isWeb) {
      const logs = webStore.getMaintenanceLogs();
      const vehicles = webStore.getVehicles();
      return logs.map((log: any) => ({
        ...log,
        vehicle: vehicles.find((v: any) => v.id === log.vehicle_id)
      })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const db = getDB();
    const result = await db.query(`
      SELECT m.*, 
        v.id as v_id, v.reg_number as v_reg_number, v.type as v_type
      FROM maintenance_logs m
      JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.date DESC
    `);
    
    return (result.values || []).map(row => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      service_type: row.service_type,
      garage: row.garage,
      cost: row.cost,
      date: row.date,
      next_service_date: row.next_service_date,
      odometer: row.odometer,
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

  async create(log: Omit<MaintenanceLog, 'vehicle'>): Promise<void> {
    if (isWeb) {
      webStore.insertMaintenanceLog(log);
      return;
    }

    const db = getDB();
    await db.run(
      `INSERT INTO maintenance_logs (id, vehicle_id, service_type, garage, cost, date, next_service_date, odometer, notes, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [log.id, log.vehicle_id, log.service_type, log.garage, log.cost, log.date, log.next_service_date, log.odometer, log.notes, log.created_at, log.updated_at]
    );
  },

  async update(id: string, changes: Partial<MaintenanceLog>): Promise<void> {
    if (isWeb) {
      webStore.updateMaintenanceLog(id, changes);
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
    await db.run(`UPDATE maintenance_logs SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    if (isWeb) {
      webStore.deleteMaintenanceLog(id);
      return;
    }

    const db = getDB();
    await db.run(`DELETE FROM maintenance_logs WHERE id = ?`, [id]);
  }
};
