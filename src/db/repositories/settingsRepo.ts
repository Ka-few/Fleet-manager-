import { getDB, isWeb } from '../database';
import { AppSettings } from '../../types';

const STORAGE_KEY = 'fleet_mgr_app_settings';

export const defaultSettings: AppSettings = {
  businessName: 'Fleet Manager Kenya',
  defaultReminderDays: 14,
  currency: 'KES',
  weekStartsOn: 'monday',
  enableInAppReminderBadges: true,
};

export const settingsRepo = {
  async get(): Promise<AppSettings> {
    if (isWeb) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
      } catch {
        return defaultSettings;
      }
    }

    const db = getDB();
    const res = await db.query("SELECT value FROM app_settings WHERE key = 'preferences'");
    const raw = res.values?.[0]?.value;
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  },

  async save(settings: AppSettings): Promise<void> {
    const value = JSON.stringify(settings);
    if (isWeb) {
      localStorage.setItem(STORAGE_KEY, value);
      return;
    }

    const db = getDB();
    await db.run(
      `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)`,
      ['preferences', value, new Date().toISOString()]
    );
  },
};
