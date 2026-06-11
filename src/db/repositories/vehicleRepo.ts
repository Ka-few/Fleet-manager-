import { getDB, isWeb, webStore } from '../database';
import { Vehicle } from '../../types';

export const vehicleRepo = {
  async getAll(): Promise<Vehicle[]> {
    if (isWeb) return webStore.getVehicles() as Vehicle[];
    const db = getDB();
    const res = await db.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    return (res.values || []) as Vehicle[];
  },

  async getById(id: string): Promise<Vehicle | null> {
    if (isWeb) {
      const all = webStore.getVehicles() as Vehicle[];
      return all.find(v => v.id === id) || null;
    }
    const db = getDB();
    const res = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    return res.values && res.values.length > 0 ? (res.values[0] as Vehicle) : null;
  },

  async create(vehicle: Vehicle): Promise<void> {
    if (isWeb) { webStore.insertVehicle(vehicle); return; }
    const db = getDB();
    await db.run(
      `INSERT INTO vehicles (id, type, reg_number, nickname, make, model, year, capacity, status, insurance_expiry, license_expiry, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle.id, vehicle.type, vehicle.reg_number, vehicle.nickname || null,
        vehicle.make || null, vehicle.model || null, vehicle.year || null,
        vehicle.capacity || null, vehicle.status, vehicle.insurance_expiry || null,
        vehicle.license_expiry || null, vehicle.notes || null,
        vehicle.created_at, vehicle.updated_at,
      ]
    );
  },

  async update(id: string, updates: Partial<Vehicle>): Promise<void> {
    if (isWeb) { webStore.updateVehicle(id, updates); return; }
    const db = getDB();
    const sets: string[] = [];
    const values: any[] = [];
    updates.updated_at = new Date().toISOString();
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id') { sets.push(`${key} = ?`); values.push(value); }
    });
    if (sets.length === 0) return;
    values.push(id);
    await db.run(`UPDATE vehicles SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    if (isWeb) { webStore.deleteVehicle(id); return; }
    const db = getDB();
    await db.run('DELETE FROM vehicles WHERE id = ?', [id]);
  },

  async countAll(): Promise<number> {
    if (isWeb) return webStore.getVehicles().length;
    const db = getDB();
    const res = await db.query('SELECT COUNT(*) as count FROM vehicles');
    return res.values?.[0]?.count || 0;
  },

  async countActive(): Promise<number> {
    if (isWeb) return webStore.getVehicles().filter((v: any) => v.status === 'active').length;
    const db = getDB();
    const res = await db.query("SELECT COUNT(*) as count FROM vehicles WHERE status = 'active'");
    return res.values?.[0]?.count || 0;
  },

  async countInService(): Promise<number> {
    if (isWeb) return webStore.getVehicles().filter((v: any) => v.status === 'in_service').length;
    const db = getDB();
    const res = await db.query("SELECT COUNT(*) as count FROM vehicles WHERE status = 'in_service'");
    return res.values?.[0]?.count || 0;
  }
};
