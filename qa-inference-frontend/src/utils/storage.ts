import type { ChatMessage } from '../types/chat';
import { type AppSettings, DEFAULT_SETTINGS } from '../types/settings';

const STORAGE_KEYS = {
  MESSAGES: 'qa_inference_messages_v1',
  SETTINGS: 'qa_inference_settings_v1',
  THEME: 'qa_inference_theme_v1',
};

export function loadStoredMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to load messages from localStorage:', e);
    return [];
  }
}

export function saveStoredMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages to localStorage:', e);
  }
}

export function clearStoredMessages(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  } catch (e) {
    console.error('Failed to clear messages from localStorage:', e);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to load settings from localStorage:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}
