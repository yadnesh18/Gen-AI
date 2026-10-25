import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useHealth } from '../hooks/useHealth';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { ChatInput } from './ChatInput';
import { Header } from './Header';
import { MessageList } from './MessageList';
import { MockBanner } from './MockBanner';
import { SettingsDrawer } from './SettingsDrawer';

export const ChatWindow: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { settings, updateSetting, resetSettings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Health poll against backend
  const {
    status: healthStatus,
    isChecking: isCheckingHealth,
    lastChecked: lastCheckedHealth,
    checkNow: refreshHealth,
  } = useHealth(settings.apiBaseUrl, settings.mockApi, 30000);

  // Chat management hook
  const {
    messages,
    isLoading,
    sendMessage,
    retryMessage,
    cancelRequest,
    clearChat,
  } = useChat(settings);

  // Auto-switch to mock mode recommendation if backend is offline on startup
  const handleEnableMock = () => {
    updateSetting('mockApi', true);
  };

  const handleSelectSamplePrompt = (prompt: string, context?: string) => {
    sendMessage(prompt, context);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <Header
        healthStatus={healthStatus}
        isCheckingHealth={isCheckingHealth}
        lastCheckedHealth={lastCheckedHealth}
        onRefreshHealth={refreshHealth}
        onNewChat={clearChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isMockMode={settings.mockApi}
        messageCount={messages.length}
      />

      {/* Mock or Offline Banner */}
      <MockBanner
        isMockMode={settings.mockApi}
        healthStatus={healthStatus}
        onEnableMock={handleEnableMock}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Centered Chat Main Column (max-w ~768px) */}
      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto overflow-hidden px-2 sm:px-4">
        {/* Messages */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onRetry={retryMessage}
          onSelectSamplePrompt={handleSelectSamplePrompt}
        />

        {/* Bottom Input Area */}
        <div className="py-3 px-1 sm:px-0">
          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            onCancelRequest={cancelRequest}
          />
        </div>
      </main>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onResetSettings={resetSettings}
        isBackendHealthy={healthStatus === 'UP'}
      />
    </div>
  );
};
