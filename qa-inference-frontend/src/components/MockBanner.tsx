import { ServerOff, Zap } from 'lucide-react';

interface MockBannerProps {
  isMockMode: boolean;
  healthStatus: 'UP' | 'DOWN' | 'UNKNOWN';
  onEnableMock: () => void;
  onOpenSettings: () => void;
}

export const MockBanner: React.FC<MockBannerProps> = ({
  isMockMode,
  healthStatus,
  onEnableMock,
  onOpenSettings,
}) => {
  if (healthStatus === 'UP' && !isMockMode) {
    return null;
  }

  if (isMockMode) {
    return (
      <div className="w-full bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-900/60 px-4 py-2 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-2xl">
          <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <span>
            <strong>Mock Mode Active:</strong> Generating realistic simulated responses locally. All chat, RAG context, and history features are interactive.
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="underline font-semibold hover:text-purple-700 dark:hover:text-purple-100 flex-shrink-0 ml-2"
        >
          Configure
        </button>
      </div>
    );
  }

  if (healthStatus === 'DOWN') {
    return (
      <div className="w-full bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-2xl">
          <ServerOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>
            <strong>Backend Unreachable:</strong> The Spring Boot service at <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded text-[11px]">localhost:8080</code> is not running.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEnableMock}
            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors cursor-pointer text-[11px]"
          >
            Enable Mock API Mode
          </button>
        </div>
      </div>
    );
  }

  return null;
};
