/**
 * Web Store — localStorage adapter used ONLY in the browser (web platform).
 * On Android, the real SQLite is used instead.
 * This allows full UI testing without needing WASM or Android Studio.
 */

const PREFIX = 'fleet_mgr_';

function getTable<T>(table: string): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + table);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setTable<T>(table: string, rows: T[]): void {
  localStorage.setItem(PREFIX + table, JSON.stringify(rows));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const webStore = {
  // ------- VEHICLES -------
  getVehicles() {
    return getTable<any>('vehicles');
  },
  insertVehicle(data: any) {
    const rows = getTable<any>('vehicles');
    const row = { ...data, id: generateId(), created_at: new Date().toISOString() };
    rows.push(row);
    setTable('vehicles', rows);
    return row;
  },
  updateVehicle(id: string, changes: any) {
    const rows = getTable<any>('vehicles');
    const idx = rows.findIndex(r => r.id === id);
    if (idx !== -1) rows[idx] = { ...rows[idx], ...changes };
    setTable('vehicles', rows);
    return rows[idx];
  },
  deleteVehicle(id: string) {
    const rows = getTable<any>('vehicles').filter(r => r.id !== id);
    setTable('vehicles', rows);
  },

  // ------- REVENUE -------
  getRevenue() {
    return getTable<any>('revenue');
  },
  insertRevenue(data: any) {
    const rows = getTable<any>('revenue');
    const row = { ...data, id: generateId(), created_at: new Date().toISOString() };
    rows.push(row);
    setTable('revenue', rows);
    return row;
  },
  updateRevenue(id: string, changes: any) {
    const rows = getTable<any>('revenue');
    const idx = rows.findIndex(r => r.id === id);
    if (idx !== -1) rows[idx] = { ...rows[idx], ...changes };
    setTable('revenue', rows);
    return rows[idx];
  },
  deleteRevenue(id: string) {
    const rows = getTable<any>('revenue').filter(r => r.id !== id);
    setTable('revenue', rows);
  },

  // ------- EXPENSES -------
  getExpenses() {
    return getTable<any>('expenses');
  },
  insertExpense(data: any) {
    const rows = getTable<any>('expenses');
    const row = { ...data, id: generateId(), created_at: new Date().toISOString() };
    rows.push(row);
    setTable('expenses', rows);
    return row;
  },
  updateExpense(id: string, changes: any) {
    const rows = getTable<any>('expenses');
    const idx = rows.findIndex(r => r.id === id);
    if (idx !== -1) rows[idx] = { ...rows[idx], ...changes };
    setTable('expenses', rows);
    return rows[idx];
  },
  deleteExpense(id: string) {
    const rows = getTable<any>('expenses').filter(r => r.id !== id);
    setTable('expenses', rows);
  },

  // ------- FUEL -------
  getFuelLogs() {
    return getTable<any>('fuel_logs');
  },
  insertFuelLog(data: any) {
    const rows = getTable<any>('fuel_logs');
    const row = { ...data, id: generateId(), created_at: new Date().toISOString() };
    rows.push(row);
    setTable('fuel_logs', rows);
    return row;
  },
  updateFuelLog(id: string, changes: any) {
    const rows = getTable<any>('fuel_logs');
    const idx = rows.findIndex(r => r.id === id);
    if (idx !== -1) rows[idx] = { ...rows[idx], ...changes };
    setTable('fuel_logs', rows);
    return rows[idx];
  },
  deleteFuelLog(id: string) {
    const rows = getTable<any>('fuel_logs').filter(r => r.id !== id);
    setTable('fuel_logs', rows);
  },

  // ------- MAINTENANCE -------
  getMaintenanceLogs() {
    return getTable<any>('maintenance_logs');
  },
  insertMaintenanceLog(data: any) {
    const rows = getTable<any>('maintenance_logs');
    const row = { ...data, id: generateId(), created_at: new Date().toISOString() };
    rows.push(row);
    setTable('maintenance_logs', rows);
    return row;
  },
  updateMaintenanceLog(id: string, changes: any) {
    const rows = getTable<any>('maintenance_logs');
    const idx = rows.findIndex(r => r.id === id);
    if (idx !== -1) rows[idx] = { ...rows[idx], ...changes };
    setTable('maintenance_logs', rows);
    return rows[idx];
  },
  deleteMaintenanceLog(id: string) {
    const rows = getTable<any>('maintenance_logs').filter(r => r.id !== id);
    setTable('maintenance_logs', rows);
  },

  // ------- REMINDERS -------
  getReminders() {
    return getTable<any>('reminders');
  },
  insertReminder(data: any) {
    const rows = getTable<any>('reminders');
    const row = { ...data, id: data.id || generateId(), created_at: new Date().toISOString() };
    rows.push(row);
    setTable('reminders', rows);
    return row;
  },
  updateReminder(id: string, changes: any) {
    const rows = getTable<any>('reminders');
    const idx = rows.findIndex(r => r.id === id);
    if (idx !== -1) rows[idx] = { ...rows[idx], ...changes };
    setTable('reminders', rows);
    return rows[idx];
  },
  deleteReminder(id: string) {
    const rows = getTable<any>('reminders').filter(r => r.id !== id);
    setTable('reminders', rows);
  },
};
