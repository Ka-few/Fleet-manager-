import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { SCHEMA_SQL, SCHEMA_VERSION } from './schema';

export { webStore } from './webStore';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;

export const DB_NAME = 'fleet_manager_db';
export const isWeb = Capacitor.getPlatform() === 'web';

export const initDB = async (): Promise<void> => {
  // On web, skip SQLite entirely — webStore uses localStorage
  if (isWeb) {
    console.log('Web platform: using localStorage webStore instead of SQLite.');
    return;
  }

  try {
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

    if (isConn) {
      db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    }

    await db.open();
    await runMigrations(db);

    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Splits a SQL script into individual statements and executes each one.
 * Uses query() for PRAGMA/SELECT statements (required on Android),
 * and run() for DDL/DML statements (CREATE, INSERT, CREATE INDEX, etc.).
 */
const executeSchema = async (database: SQLiteDBConnection, sql: string) => {
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    const upperStmt = stmt.toUpperCase().trimStart();
    if (upperStmt.startsWith('PRAGMA') || upperStmt.startsWith('SELECT')) {
      // Use query() for read-type statements on Android
      await database.query(stmt + ';');
    } else {
      // Use run() for CREATE TABLE, CREATE INDEX, INSERT, etc.
      await database.run(stmt + ';');
    }
  }
};

const runMigrations = async (database: SQLiteDBConnection) => {
  // Use query() for SELECT — required on Android (execSQL cannot run queries)
  const res = await database.query(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations';`
  );

  if (!res.values || res.values.length === 0) {
    // First-time setup: run the full schema statement by statement
    await executeSchema(database, SCHEMA_SQL);
    await database.run(
      `INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)`,
      [SCHEMA_VERSION, new Date().toISOString()]
    );
    console.log('Schema created at version', SCHEMA_VERSION);
  } else {
    const currentVersionRes = await database.query(
      `SELECT MAX(version) as version FROM schema_migrations;`
    );
    const currentVersion = currentVersionRes.values?.[0]?.version || 0;

    if (currentVersion < SCHEMA_VERSION) {
      console.log(`Migrating database from ${currentVersion} to ${SCHEMA_VERSION}`);
      await database.run(
        `INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)`,
        [SCHEMA_VERSION, new Date().toISOString()]
      );
    } else {
      console.log('Database schema is up to date at version', currentVersion);
    }
  }
};

export const getDB = (): SQLiteDBConnection => {
  if (!db) {
    throw new Error('Database not initialized. Call initDB first.');
  }
  return db;
};
