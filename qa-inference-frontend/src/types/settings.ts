export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  includeHistory: boolean;
  maxHistoryTurns: number;
  apiBaseUrl: string;
  mockApi: boolean;
  theme: ThemeMode;
  clientTimeoutSeconds: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  includeHistory: true,
  maxHistoryTurns: 6,
  apiBaseUrl: '',
  mockApi: false,
  theme: 'system',
  clientTimeoutSeconds: 35,
};
