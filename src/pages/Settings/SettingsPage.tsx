import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { AppSettings } from '../../types';
import { defaultSettings, settingsRepo } from '../../db/repositories/settingsRepo';
import { CheckCircle2, Database, Smartphone } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsRepo.get().then(setSettings);
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(current => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await settingsRepo.save(settings);
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <Header title="Settings" showBack />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <form onSubmit={save}>
            <Input
              label="Business Name"
              value={settings.businessName}
              onChange={(event) => updateSetting('businessName', event.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Default Reminder Days"
                type="number"
                min="1"
                value={settings.defaultReminderDays}
                onChange={(event) => updateSetting('defaultReminderDays', Math.max(1, Number(event.target.value) || 1))}
              />
              <Select
                label="Week Starts"
                value={settings.weekStartsOn}
                onChange={(event) => updateSetting('weekStartsOn', event.target.value as AppSettings['weekStartsOn'])}
                options={[
                  { value: 'monday', label: 'Monday' },
                  { value: 'sunday', label: 'Sunday' },
                ]}
              />
            </div>
            <Select
              label="Currency"
              value={settings.currency}
              onChange={(event) => updateSetting('currency', event.target.value as AppSettings['currency'])}
              options={[{ value: 'KES', label: 'Kenyan Shilling (KES)' }]}
            />

            <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] p-3 mb-4">
              <span>
                <span className="block font-medium">In-app reminder badges</span>
                <span className="block text-xs text-[var(--text-muted)]">Show reminder counts inside the app only.</span>
              </span>
              <input
                type="checkbox"
                checked={settings.enableInAppReminderBadges}
                onChange={(event) => updateSetting('enableInAppReminderBadges', event.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
            </label>

            <Button type="submit" fullWidth isLoading={isSaving}>Save Settings</Button>
            {saved && (
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-[var(--success)]">
                <CheckCircle2 size={16} />
                Settings saved on this device.
              </p>
            )}
          </form>
        </Card>

        <Card className="space-y-4">
          <div className="flex gap-3">
            <Smartphone className="text-[var(--primary)] shrink-0" size={22} />
            <div>
              <h3 className="text-base font-semibold">Offline App Data</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Vehicles, reminders, maintenance, income, and expenses are stored locally for in-app use.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Database className="text-[var(--warning)] shrink-0" size={22} />
            <div>
              <h3 className="text-base font-semibold">Backup Status</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Cloud sync is not enabled. Export and backup controls can be added here when needed.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
