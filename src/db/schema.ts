// SQLite Schema — Fleet Manager Kenya
// All migrations are versioned. Current: v1

export const SCHEMA_SQL = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version     INTEGER PRIMARY KEY,
  applied_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id               TEXT PRIMARY KEY,
  type             TEXT NOT NULL CHECK(type IN ('matatu','truck','pickup','bus')),
  reg_number       TEXT NOT NULL UNIQUE,
  nickname         TEXT,
  make             TEXT,
  model            TEXT,
  year             INTEGER,
  capacity         INTEGER,
  status           TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','in_service','sold','suspended')),
  insurance_expiry TEXT,
  license_expiry   TEXT,
  notes            TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS revenue_logs (
  id                   TEXT PRIMARY KEY,
  vehicle_id           TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  revenue_type         TEXT NOT NULL CHECK(revenue_type IN ('daily_collection','trip')),
  amount               REAL NOT NULL,
  route                TEXT,
  driver_remittance    REAL,
  conductor_remittance REAL,
  client               TEXT,
  origin               TEXT,
  destination          TEXT,
  cargo_type           TEXT,
  payment_status       TEXT NOT NULL DEFAULT 'paid' CHECK(payment_status IN ('paid','pending','partial')),
  date                 TEXT NOT NULL,
  notes                TEXT,
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expense_logs (
  id         TEXT PRIMARY KEY,
  vehicle_id TEXT REFERENCES vehicles(id) ON DELETE SET NULL,
  category   TEXT NOT NULL CHECK(category IN ('fuel','repairs','maintenance','salaries','insurance','parking','fines','licenses','route_fees','misc')),
  amount     REAL NOT NULL,
  date       TEXT NOT NULL,
  notes      TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id             TEXT PRIMARY KEY,
  vehicle_id     TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  liters         REAL NOT NULL,
  cost_per_liter REAL,
  total_cost     REAL NOT NULL,
  fuel_station   TEXT,
  odometer       REAL,
  date           TEXT NOT NULL,
  notes          TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id                TEXT PRIMARY KEY,
  vehicle_id        TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type      TEXT NOT NULL CHECK(service_type IN ('oil_change','tyres','brakes','engine','suspension','insurance','inspection','other')),
  garage            TEXT,
  cost              REAL,
  date              TEXT NOT NULL,
  next_service_date TEXT,
  odometer          REAL,
  notes             TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id         TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK(type IN ('service','insurance','license','custom')),
  title      TEXT NOT NULL,
  due_date   TEXT NOT NULL,
  is_done    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revenue_vehicle   ON revenue_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_revenue_date      ON revenue_logs(date);
CREATE INDEX IF NOT EXISTS idx_expense_vehicle   ON expense_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expense_date      ON expense_logs(date);
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle      ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_date         ON fuel_logs(date);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reminders_vehicle  ON reminders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due      ON reminders(due_date);
`;

export const SCHEMA_VERSION = 1;
