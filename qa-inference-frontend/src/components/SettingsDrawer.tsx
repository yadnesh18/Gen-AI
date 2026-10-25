import React, { useEffect } from 'react';
import {
  RotateCcw,
  Sliders,
  X,
  History,
  Server,
  Zap,
  Clock,
  HelpCircle,
} from 'lucide-react';
import type { AppSettings } from '../types/settings';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetSettings: () => void;
  isBackendHealthy: boolean;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  onResetSettings,
  isBackendHealthy,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-drawer-title"
    >
      {/* Click-outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col z-10 border-l border-gray-200 dark:border-gray-700 animate-slide-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 id="settings-drawer-title" className="text-base font-bold text-gray-900 dark:text-gray-100">
              Inference Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Section: Conversation Context Memory */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label
                  htmlFor="includeHistoryToggle"
                  className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <History className="w-4 h-4 text-blue-500" />
                  <span>Include previous messages as context</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                  Since the Spring Boot service is stateless, the frontend prepends prior turns formatted as <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[11px]">User: ... / Assistant: ...</code>.
                </p>
              </div>

              <input
                id="includeHistoryToggle"
                type="checkbox"
                checked={settings.includeHistory}
                onChange={(e) => onUpdateSetting('includeHistory', e.target.checked)}
                className="w-5 h-5 mt-1 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </div>

            {/* Max Turns Slider */}
            {settings.includeHistory && (
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Max history turns to include:
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                    {settings.maxHistoryTurns} turns
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={settings.maxHistoryTurns}
                  onChange={(e) => onUpdateSetting('maxHistoryTurns', Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                  aria-label="Max history turns"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>1 turn</span>
                  <span>Default (6 turns)</span>
                  <span>20 turns</span>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Section: Backend & API Base URL */}
          <div className="space-y-3">
            <label
              htmlFor="apiBaseUrlInput"
              className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5"
            >
              <Server className="w-4 h-4 text-emerald-500" />
              <span>API Base URL Override</span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
              Leave empty to use the default Vite dev proxy (<code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[11px]">/api/v1/chat</code> forwarding to <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[11px]">http://localhost:8080</code>).
            </p>

            <div className="relative">
              <input
                id="apiBaseUrlInput"
                type="text"
                value={settings.apiBaseUrl}
                onChange={(e) => onUpdateSetting('apiBaseUrl', e.target.value)}
                placeholder="e.g. http://localhost:8080 (or empty for proxy)"
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {settings.apiBaseUrl && (
                <button
                  type="button"
                  onClick={() => onUpdateSetting('apiBaseUrl', '')}
                  className="absolute right-2 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title="Clear override"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Section: Client Timeout */}
          <div className="space-y-2">
            <label
              htmlFor="timeoutInput"
              className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Client-side Timeout (Seconds)</span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
              AbortController abort threshold. Set slightly higher than server timeout (default 30s) to give server room to return 504.
            </p>
            <input
              id="timeoutInput"
              type="number"
              min="5"
              max="120"
              value={settings.clientTimeoutSeconds}
              onChange={(e) => onUpdateSetting('clientTimeoutSeconds', Math.max(5, Number(e.target.value)))}
              className="w-32 text-xs font-mono p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Section: Mock Mode */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label
                  htmlFor="mockApiToggle"
                  className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span>Mock API Mode</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                  Simulate model responses locally when the Spring Boot backend is offline.
                </p>
              </div>

              <input
                id="mockApiToggle"
                type="checkbox"
                checked={settings.mockApi}
                onChange={(e) => onUpdateSetting('mockApi', e.target.checked)}
                className="w-5 h-5 mt-1 rounded text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
              />
            </div>

            {!isBackendHealthy && !settings.mockApi && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong>Backend is not responding.</strong> You can toggle Mock API Mode ON to test the interface with full Markdown formatting and RAG capabilities immediately.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetSettings}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
