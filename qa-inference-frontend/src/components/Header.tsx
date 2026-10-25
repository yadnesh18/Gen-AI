import React, { useState } from 'react';
import {
  Bot,
  Moon,
  PlusCircle,
  RefreshCw,
  Settings,
  Sun,
} from 'lucide-react';

interface HeaderProps {
  healthStatus: 'UP' | 'DOWN' | 'UNKNOWN';
  isCheckingHealth: boolean;
  lastCheckedHealth: Date | null;
  onRefreshHealth: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMockMode: boolean;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  healthStatus,
  isCheckingHealth,
  lastCheckedHealth,
  onRefreshHealth,
  onNewChat,
  onOpenSettings,
  isDark,
  onToggleTheme,
  isMockMode,
  messageCount,
}) => {
  const [showHealthTooltip, setShowHealthTooltip] = useState(false);

  const getStatusColor = () => {
    if (isMockMode) return 'bg-purple-500 shadow-purple-500/50';
    if (healthStatus === 'UP') return 'bg-emerald-500 shadow-emerald-500/50';
    if (healthStatus === 'DOWN') return 'bg-red-500 shadow-red-500/50';
    return 'bg-amber-500 shadow-amber-500/50';
  };

  const getStatusText = () => {
    if (isMockMode) return 'Mock API Mode Active';
    if (healthStatus === 'UP') return 'Backend Online (Port 8080)';
    if (healthStatus === 'DOWN') return 'Backend Offline (Port 8080)';
    return 'Checking backend...';
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                QA Inference Service
              </h1>

              {/* Status Dot with Hover Popover */}
              <div className="relative flex items-center">
                <button
                  type="button"
                  onMouseEnter={() => setShowHealthTooltip(true)}
                  onMouseLeave={() => setShowHealthTooltip(false)}
                  onClick={onRefreshHealth}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                  aria-label="Backend status"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${getStatusColor()} ${
                      healthStatus === 'UP' || isMockMode ? 'animate-pulse' : ''
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {isMockMode ? 'Mock Mode' : healthStatus === 'UP' ? 'Connected' : 'Offline'}
                  </span>
                </button>

                {/* Tooltip */}
                {showHealthTooltip && (
                  <div className="absolute top-7 left-0 w-64 p-2.5 rounded-xl bg-gray-900 text-white text-xs shadow-xl z-50 animate-fade-in border border-gray-700">
                    <div className="font-semibold mb-1 flex items-center justify-between">
                      <span>{getStatusText()}</span>
                      <button
                        onClick={onRefreshHealth}
                        className="p-1 hover:text-blue-400 cursor-pointer"
                        title="Recheck now"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-300 mb-1">
                      Endpoint:{' '}
                      <code className="text-blue-300 font-mono">/actuator/health</code>
                    </p>
                    {lastCheckedHealth && (
                      <p className="text-[10px] text-gray-400">
                        Last poll: {lastCheckedHealth.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions: New Chat, Dark/Light, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={onNewChat}
            disabled={messageCount === 0}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              messageCount > 0
                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
            title="Start new conversation (clears history)"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark/light theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Settings (history memory, API base URL, mock mode)"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
