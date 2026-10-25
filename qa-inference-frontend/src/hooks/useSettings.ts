import { useEffect, useState } from 'react';
import { type AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { loadStoredSettings, saveStoredSettings } from '../utils/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    setSettings,
  };
}
